// Formatos de vídeo e áudio aceitos na base de conhecimento (FT-08, PR-71): a
// extensão diz o formato esperado e a assinatura dos primeiros bytes confirma
// que o arquivo é mesmo daquele formato (arquivo renomeado não passa, PR-13).
// Módulo puro: a tela também o importa, então nada de `node:` nem `next`.

export type FormatoDeMidia =
  | 'mp4' | 'mov' | 'm4v' | 'webm' | 'mkv' | 'avi'
  | 'mp3' | 'wav' | 'm4a' | 'ogg' | 'aac' | 'flac'

export const EXTENSOES_DE_MIDIA: string[] = [
  '.mp4', '.mov', '.m4v', '.webm', '.mkv', '.avi', '.mp3', '.wav', '.m4a', '.ogg', '.aac', '.flac',
]

/** Quantos bytes do começo do arquivo bastam para conferir qualquer assinatura. */
export const BYTES_DE_ASSINATURA = 12

/** O formato pela extensão do nome (sem diferenciar caixa), ou `null`. */
export function formatoDeMidia(nome: string): FormatoDeMidia | null {
  const ponto = nome.lastIndexOf('.')
  if (ponto < 0) return null
  const extensao = nome.slice(ponto).toLowerCase()
  return EXTENSOES_DE_MIDIA.includes(extensao) ? (extensao.slice(1) as FormatoDeMidia) : null
}

const texto = (b: Uint8Array, de: number, ate: number) => String.fromCharCode(...b.subarray(de, ate))
const temEbml = (b: Uint8Array) => b.length >= 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3
// `ID3` abre MP3 e AAC com tag; sem tag, o sincronismo MPEG (11 bits) ou ADTS (12 bits) abre o quadro.
const temMpegAudio = (b: Uint8Array) =>
  b.length >= 3 && (texto(b, 0, 3) === 'ID3' || (b[0] === 0xff && ((b[1] ?? 0) & 0xe0) === 0xe0))
const temFtyp = (b: Uint8Array) => b.length >= 8 && texto(b, 4, 8) === 'ftyp'
const temRiff = (b: Uint8Array, tipo: string) => b.length >= 12 && texto(b, 0, 4) === 'RIFF' && texto(b, 8, 12) === tipo

const CONFERIDORES: Record<FormatoDeMidia, (b: Uint8Array) => boolean> = {
  mp4: temFtyp,
  mov: temFtyp,
  m4v: temFtyp,
  m4a: temFtyp,
  webm: temEbml,
  mkv: temEbml,
  mp3: temMpegAudio,
  aac: temMpegAudio,
  wav: (b) => temRiff(b, 'WAVE'),
  avi: (b) => temRiff(b, 'AVI '),
  ogg: (b) => b.length >= 4 && texto(b, 0, 4) === 'OggS',
  flac: (b) => b.length >= 4 && texto(b, 0, 4) === 'fLaC',
}

/** Os primeiros bytes batem com o formato da extensão? Arquivo vazio nunca bate. */
export function conferirAssinaturaDeMidia(formato: FormatoDeMidia, primeirosBytes: Uint8Array): boolean {
  return CONFERIDORES[formato](primeirosBytes.subarray(0, BYTES_DE_ASSINATURA))
}
