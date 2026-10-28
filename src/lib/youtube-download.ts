// yt-dlp isola as mudanças de extração do YouTube. Nunca usa shell, configurações
// locais, plugins ou URLs fornecidas pelo usuário: só o link canônico validado.
import { execFile } from 'node:child_process'
import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { ambiente } from '@/lib/ambiente'
import { ErroDeAplicacao } from '@/lib/erros'
import { exigirCaminhoInterno } from '@/lib/midia'
import { extrairIdDoYoutube, urlDeOrigem, type FaixaDeLegenda } from '@/lib/youtube'

export const PRAZO_DO_DOWNLOAD_MS = 10 * 60_000
const ARGUMENTOS = [
  '--ignore-config', '--no-plugin-dirs', '--no-playlist', '--no-progress',
  '--no-js-runtimes', '--js-runtimes', `node:${process.execPath}`,
  '--socket-timeout', '15', '--retries', '1', '--fragment-retries', '1',
]

export function executarYtdlp(args: string[], prazoMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(ambiente.ytdlpPath, [...ARGUMENTOS, ...args], {
      timeout: prazoMs, killSignal: 'SIGKILL', maxBuffer: 5 * 1024 * 1024, shell: false,
    }, (erro, stdout) => {
      if (!erro) return resolve(stdout)
      if (erro.code === 'ENOENT' || erro.code === 'EACCES') {
        return reject(new ErroDeAplicacao('Não encontrei o yt-dlp neste servidor. Instale-o para recuperar legendas e transcrever vídeos do YouTube.', 503, 'ytdlp_ausente'))
      }
      if (erro.killed) {
        return reject(new ErroDeAplicacao('O YouTube demorou demais para responder. Tente reprocessar mais tarde.', 504, 'youtube_tempo_esgotado'))
      }
      // Não expõe stderr, URLs assinadas nem detalhes internos do processo.
      reject(new ErroDeAplicacao('Não foi possível obter este vídeo do YouTube. Ele pode estar restrito ou o YouTube pode ter bloqueado o acesso do servidor. Tente reprocessar ou envie o arquivo do vídeo.', 502, 'youtube_download_falhou'))
    })
  })
}

export interface VideoParaDownload {
  id: string
  titulo: string
  duracaoSegundos: number | null
  aoVivo: boolean
  faixas: FaixaDeLegenda[]
}

type Legenda = { ext?: string; url?: string; name?: string }

export async function inspecionarVideo(url: string): Promise<VideoParaDownload> {
  const id = extrairIdDoYoutube(url)
  const saida = await executarYtdlp(['--skip-download', '--dump-single-json', '--', urlDeOrigem(id)], 60_000)
  let dados: {
    id?: string; title?: string; duration?: number; is_live?: boolean; live_status?: string
    subtitles?: Record<string, Legenda[]>; automatic_captions?: Record<string, Legenda[]>
  }
  try {
    dados = JSON.parse(saida)
    if (!dados || dados.id !== id) throw new Error()
  } catch {
    throw new ErroDeAplicacao('Não foi possível ler as informações deste vídeo pelo yt-dlp.', 502, 'youtube_formato')
  }
  const faixas: FaixaDeLegenda[] = []
  for (const [grupo, automatica] of [[dados.subtitles, false], [dados.automatic_captions, true]] as const) {
    for (const [idioma, formatos] of Object.entries(grupo ?? {})) {
      if (!Array.isArray(formatos)) continue
      const faixa = formatos.find((f) => f && f.ext === 'json3' && typeof f.url === 'string')
      if (faixa) faixas.push({ idioma, automatica, baseUrl: faixa.url!, nome: faixa.name ?? idioma })
    }
  }
  return {
    id, titulo: typeof dados.title === 'string' && dados.title.trim() ? dados.title.trim() : 'Vídeo do YouTube',
    duracaoSegundos: typeof dados.duration === 'number' && Number.isFinite(dados.duration) && dados.duration > 0 ? Math.ceil(dados.duration) : null,
    aoVivo: dados.is_live === true || dados.live_status === 'is_upcoming', faixas,
  }
}

/** Somente áudio; limites antes de baixar e novamente no disco/ffprobe. */
export async function baixarAudioDoYoutube(video: VideoParaDownload, destino: string): Promise<void> {
  exigirCaminhoInterno(destino)
  if (video.aoVivo || video.duracaoSegundos === null) {
    throw new ErroDeAplicacao('Não é possível transcrever transmissões ao vivo ou vídeos sem duração conhecida. Aguarde o vídeo terminar ou envie o arquivo.', 422, 'youtube_sem_duracao')
  }
  if (video.duracaoSegundos > ambiente.maxVideoMinutos * 60) {
    throw new ErroDeAplicacao(`O vídeo ultrapassa o limite de ${ambiente.maxVideoMinutos} minutos para transcrição.`, 422, 'midia_longa_demais')
  }
  await mkdir(path.dirname(destino), { recursive: true, mode: 0o700 })
  await executarYtdlp([
    '--format', 'bestaudio/best', '--max-filesize', String(ambiente.maxVideoBytes),
    '--match-filters', `!is_live & duration <= ${ambiente.maxVideoMinutos * 60}`,
    '--no-part', '--no-mtime', '--output', destino, '--', urlDeOrigem(video.id),
  ], PRAZO_DO_DOWNLOAD_MS)
  const arquivo = await stat(destino).catch(() => null)
  if (!arquivo || !arquivo.isFile() || arquivo.size === 0 || arquivo.size > ambiente.maxVideoBytes) {
    throw new ErroDeAplicacao('Não foi possível baixar o áudio dentro do limite de tamanho configurado.', 422, 'youtube_audio_invalido')
  }
}
