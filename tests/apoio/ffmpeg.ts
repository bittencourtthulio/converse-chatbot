/**
 * Apoio dos testes que dependem do ffmpeg (FT-08, PR-72). A mídia é gerada
 * pelo próprio ffmpeg com `lavfi` (nenhum arquivo binário em fixture).
 *
 *   ffmpegDisponivel          os dois binários respondem (FFMPEG_PATH e FFPROBE_PATH valem)
 *   descreverComFfmpeg(...)   `describe` que pula sem ffmpeg; com EXIGIR_FFMPEG=1 (CI) a
 *                             ausência vira um teste vermelho em vez de um pulo
 *   gerarMidia({...})         cria um arquivo de áudio ou vídeo pequeno e devolve o caminho
 *
 * `ruido: true` gera áudio diferente a cada chamada (ruído rosa): é o que faz
 * partes de um mesmo arquivo serem áudios distintos para o OpenRouter simulado.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { describe, it } from 'vitest'

const caminhoDoFfmpeg = () => process.env.FFMPEG_PATH?.trim() || 'ffmpeg'
const caminhoDoFfprobe = () => process.env.FFPROBE_PATH?.trim() || 'ffprobe'

export function detectarFfmpeg(ffmpeg = caminhoDoFfmpeg(), ffprobe = caminhoDoFfprobe()): boolean {
  for (const binario of [ffmpeg, ffprobe]) {
    const r = spawnSync(binario, ['-version'], { stdio: 'ignore' })
    if (r.error || r.status !== 0) return false
  }
  return true
}

export const ffmpegDisponivel = detectarFfmpeg()

/** No CI (`EXIGIR_FFMPEG=1`) o ffmpeg ausente é falha, nunca pulo silencioso. */
export function verificarExigenciaDeFfmpeg(o: { exigir: boolean; disponivel: boolean }): void {
  if (o.exigir && !o.disponivel) {
    throw new Error('EXIGIR_FFMPEG=1, mas o ffmpeg ou o ffprobe não respondem. Instale o ffmpeg (CI: sudo apt-get install -y ffmpeg).')
  }
}

export const exigirFfmpeg = process.env.EXIGIR_FFMPEG === '1'

/** `describe` dos testes que rodam o ffmpeg: pula sem ele, ou falha se o CI o exige. */
export function descreverComFfmpeg(nome: string, corpo: () => void): void {
  if (exigirFfmpeg && !ffmpegDisponivel) {
    describe(nome, () => {
      it('o ffmpeg está instalado (EXIGIR_FFMPEG=1)', () => {
        verificarExigenciaDeFfmpeg({ exigir: true, disponivel: false })
      })
    })
    return
  }
  describe.skipIf(!ffmpegDisponivel)(nome, corpo)
}

export type FormatoGerado =
  | 'mp3' | 'wav' | 'm4a' | 'ogg' | 'flac' | 'aac' | 'webm'
  | 'mp4' | 'mkv' | 'mov' | 'm4v' | 'avi'

export interface OpcoesDeMidia {
  formato: FormatoGerado
  segundos?: number
  diretorio: string
  /** Nome do arquivo sem extensão; o padrão é `midia-<formato>`. */
  nome?: string
  /** Áudio de ruído (diferente a cada chamada) em vez de senoide de 440 Hz. */
  ruido?: boolean
  /** Só para os formatos de vídeo: gera o arquivo sem faixa de áudio. */
  semAudio?: boolean
}

const SO_AUDIO: Record<string, string[]> = {
  mp3: ['-c:a', 'libmp3lame', '-b:a', '32k'],
  wav: ['-c:a', 'pcm_s16le'],
  m4a: ['-c:a', 'aac'],
  ogg: ['-c:a', 'libopus'],
  flac: ['-c:a', 'flac'],
  aac: ['-c:a', 'aac'],
  webm: ['-c:a', 'libopus', '-f', 'webm'],
}
const COM_VIDEO: Record<string, string[]> = {
  mp4: ['-c:v', 'mpeg4', '-c:a', 'aac'],
  mov: ['-c:v', 'mpeg4', '-c:a', 'aac'],
  m4v: ['-c:v', 'mpeg4', '-c:a', 'aac', '-f', 'mp4'],
  mkv: ['-c:v', 'mpeg4', '-c:a', 'aac'],
  avi: ['-c:v', 'mpeg4', '-c:a', 'libmp3lame'],
}

export function gerarMidia(o: OpcoesDeMidia): string {
  const segundos = o.segundos ?? 3
  const saida = path.join(o.diretorio, `${o.nome ?? `midia-${o.formato}`}.${o.formato}`)
  const audio = o.ruido
    ? `anoisesrc=color=pink:amplitude=0.3:duration=${segundos}:sample_rate=16000`
    : `sine=frequency=440:duration=${segundos}`
  const ehVideo = o.formato in COM_VIDEO
  const entradas = ['-f', 'lavfi', '-i', audio]
  if (ehVideo) entradas.push('-f', 'lavfi', '-i', `color=c=blue:size=64x64:rate=10:duration=${segundos}`)
  const codecs = ehVideo ? [...COM_VIDEO[o.formato]!] : [...SO_AUDIO[o.formato]!]
  if (ehVideo && o.semAudio) {
    // Só a imagem: tira a entrada de áudio e o codec de áudio.
    entradas.splice(0, 4)
    codecs.splice(codecs.indexOf('-c:a'), 2)
  }
  const r = spawnSync(
    caminhoDoFfmpeg(),
    ['-v', 'error', '-y', ...entradas, ...codecs, '-shortest', saida],
    { encoding: 'utf8' },
  )
  if (r.error || r.status !== 0) {
    throw new Error(`O ffmpeg não gerou ${o.formato}: ${r.stderr || r.error?.message}`)
  }
  return saida
}
