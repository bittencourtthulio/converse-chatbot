// Áudio e vídeo com ffmpeg e ffprobe (FT-08, PR-72): o único ponto do sistema
// que roda processo externo. Sempre `spawn` com vetor de argumentos e nunca por
// shell, só com caminhos absolutos gerados pelo servidor (nunca o nome que o
// usuário enviou, PR-13). Cada processo tem prazo; a saída de erro é lida com
// teto e nunca chega ao usuário; binário ausente tem mensagem própria. Os
// caminhos dos binários vêm de `FFMPEG_PATH` e `FFPROBE_PATH` (`ambiente.ts`).
import { spawn } from 'node:child_process'
import path from 'node:path'
import { ambiente } from '@/lib/ambiente'
import { ErroDeAplicacao } from '@/lib/erros'

export const MENSAGEM_SEM_FFMPEG =
  'Não encontrei o ffmpeg neste servidor. Instale o ffmpeg ou use a imagem de contêiner do projeto.'

export const PRAZO_DA_SONDA_MS = 30_000

const TETO_DE_SAIDA_BYTES = 1024 * 1024

export const erroSemFfmpeg = () => new ErroDeAplicacao(MENSAGEM_SEM_FFMPEG, 500, 'ffmpeg_ausente')

const erroDeMidiaInvalida = () =>
  new ErroDeAplicacao(
    'Não foi possível ler este arquivo de áudio ou vídeo. Ele pode estar corrompido.',
    422,
    'midia_invalida',
  )

const erroDePrazo = () =>
  new ErroDeAplicacao('O processamento do áudio ou vídeo demorou demais e foi interrompido.', 504, 'midia_tempo_esgotado')

export interface OpcoesDoProcesso {
  /** O processo é morto (SIGKILL) depois deste prazo. */
  prazoMs: number
  /** Teto, em bytes, de stdout e de stderr guardados (o excedente é descartado). */
  tetoDeSaida?: number
}

export interface SaidaDoProcesso {
  stdout: string
  stderr: string
}

/**
 * Roda um binário e espera o fim. Falhas viram `ErroDeAplicacao`: binário que
 * não existe (`ffmpeg_ausente`), prazo estourado (`midia_tempo_esgotado`) e
 * código de saída diferente de zero (`midia_invalida`). A saída de erro do
 * processo nunca entra na mensagem.
 */
export function executar(binario: string, args: string[], opcoes: OpcoesDoProcesso): Promise<SaidaDoProcesso> {
  const teto = opcoes.tetoDeSaida ?? TETO_DE_SAIDA_BYTES
  return new Promise((resolver, rejeitar) => {
    let terminou = false
    const concluir = (acao: () => void) => {
      if (terminou) return
      terminou = true
      clearTimeout(relogio)
      acao()
    }
    const filho = spawn(binario, args, { stdio: ['ignore', 'pipe', 'pipe'], shell: false })
    const partes = { stdout: [] as Buffer[], stderr: [] as Buffer[] }
    const tamanhos = { stdout: 0, stderr: 0 }
    const guardar = (canal: 'stdout' | 'stderr') => (parte: Buffer) => {
      if (tamanhos[canal] >= teto) return
      partes[canal].push(parte.subarray(0, teto - tamanhos[canal]))
      tamanhos[canal] += parte.length
    }
    filho.stdout.on('data', guardar('stdout'))
    filho.stderr.on('data', guardar('stderr'))
    const relogio = setTimeout(() => {
      filho.kill('SIGKILL')
      concluir(() => rejeitar(erroDePrazo()))
    }, opcoes.prazoMs)
    filho.on('error', (erro: NodeJS.ErrnoException) => {
      concluir(() => rejeitar(erro.code === 'ENOENT' || erro.code === 'EACCES' ? erroSemFfmpeg() : erroDeMidiaInvalida()))
    })
    filho.on('close', (codigo) => {
      concluir(() => {
        if (codigo === 0) {
          resolver({
            stdout: Buffer.concat(partes.stdout).toString('utf8'),
            stderr: Buffer.concat(partes.stderr).toString('utf8'),
          })
        } else {
          rejeitar(erroDeMidiaInvalida())
        }
      })
    })
  })
}

/** Só caminhos absolutos que não começam por hífen vão para o binário (PR-13). */
export function exigirCaminhoInterno(caminho: string): void {
  if (typeof caminho !== 'string' || !path.isAbsolute(caminho) || path.basename(caminho).startsWith('-')) {
    throw new ErroDeAplicacao('Caminho de mídia inválido.', 500, 'caminho_invalido')
  }
}

export interface DisponibilidadeDaMidia {
  ffmpeg: boolean
  ffprobe: boolean
  /** Primeira linha de `ffmpeg -version`, ou `null` se ele não respondeu. */
  versao: string | null
}

/** Os dois binários respondem? Serve ao health check da FT-11 e a quem precisa avisar antes de aceitar vídeo. */
export async function verificarMidia(): Promise<DisponibilidadeDaMidia> {
  const responde = async (binario: string) => {
    try {
      return (await executar(binario, ['-version'], { prazoMs: 10_000 })).stdout
    } catch {
      return null
    }
  }
  const [ffmpeg, ffprobe] = await Promise.all([responde(ambiente.ffmpegPath), responde(ambiente.ffprobePath)])
  return { ffmpeg: ffmpeg !== null, ffprobe: ffprobe !== null, versao: ffmpeg ? (ffmpeg.split('\n')[0] ?? null) : null }
}

export interface Sonda {
  duracaoSegundos: number
  temAudio: boolean
}

export interface OpcoesDaSonda {
  /** Padrão: `MAX_VIDEO_MINUTOS`. */
  maxMinutos?: number
  prazoMs?: number
}

function minutosEmTexto(minutos: number): string {
  const arredondado = Math.round(minutos * 10) / 10
  return `${Number.isInteger(arredondado) ? arredondado : String(arredondado).replace('.', ',')} min`
}

/**
 * Duração e presença de faixa de áudio, por `ffprobe`. Duração acima do limite
 * de minutos é erro claro (`midia_longa_demais`); arquivo ilegível é
 * `midia_invalida`. Sem faixa de áudio devolve `temAudio: false` (quem usa
 * decide, ver `exigirAudio`).
 */
export async function sondar(caminho: string, opcoes: OpcoesDaSonda = {}): Promise<Sonda> {
  exigirCaminhoInterno(caminho)
  const { stdout } = await executar(
    ambiente.ffprobePath,
    ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type', '-of', 'json', '-i', caminho],
    { prazoMs: opcoes.prazoMs ?? PRAZO_DA_SONDA_MS },
  )
  let dados: { format?: { duration?: string }; streams?: Array<{ codec_type?: string }> }
  try {
    dados = JSON.parse(stdout)
  } catch {
    throw erroDeMidiaInvalida()
  }
  const duracao = Number(dados.format?.duration)
  if (!Number.isFinite(duracao) || duracao <= 0) throw erroDeMidiaInvalida()
  const limite = opcoes.maxMinutos ?? ambiente.maxVideoMinutos
  if (duracao > limite * 60) {
    throw new ErroDeAplicacao(
      `O arquivo tem ${minutosEmTexto(duracao / 60)} e o limite é de ${minutosEmTexto(limite)}.`,
      422,
      'midia_longa_demais',
    )
  }
  return { duracaoSegundos: duracao, temAudio: (dados.streams ?? []).some((s) => s.codec_type === 'audio') }
}

/** Arquivo sem faixa de áudio não tem o que transcrever. */
export function exigirAudio(sonda: Sonda): void {
  if (!sonda.temAudio) {
    throw new ErroDeAplicacao('Este arquivo não tem faixa de áudio para transcrever.', 422, 'sem_audio')
  }
}
