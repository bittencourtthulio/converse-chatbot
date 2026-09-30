// Formatos aceitos na base de conhecimento (PR-10). O tipo vem da extensão do
// nome e o MIME gravado vem do formato, nunca do que o navegador enviou
// (PR-45). Módulo puro: a tela também o importa.
import { LIMITES } from './limites'

export type Formato = 'pdf' | 'docx' | 'txt' | 'md' | 'csv' | 'html' | 'json' | 'srt' | 'vtt'

export interface InfoDoFormato {
  mime: string
  rotulo: string
  /** PDF e DOCX são binários; o resto é texto e passa pela decodificação. */
  binario: boolean
  extensoes: string[]
}

export const FORMATOS: Record<Formato, InfoDoFormato> = {
  pdf: { mime: 'application/pdf', rotulo: 'PDF', binario: true, extensoes: ['.pdf'] },
  docx: {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    rotulo: 'Word',
    binario: true,
    extensoes: ['.docx'],
  },
  txt: { mime: 'text/plain', rotulo: 'Texto', binario: false, extensoes: ['.txt'] },
  md: { mime: 'text/markdown', rotulo: 'Markdown', binario: false, extensoes: ['.md'] },
  csv: { mime: 'text/csv', rotulo: 'Planilha CSV', binario: false, extensoes: ['.csv'] },
  html: { mime: 'text/html', rotulo: 'HTML', binario: false, extensoes: ['.html', '.htm'] },
  json: { mime: 'application/json', rotulo: 'JSON', binario: false, extensoes: ['.json'] },
  srt: { mime: 'application/x-subrip', rotulo: 'Legenda SRT', binario: false, extensoes: ['.srt'] },
  vtt: { mime: 'text/vtt', rotulo: 'Legenda VTT', binario: false, extensoes: ['.vtt'] },
}

export const EXTENSOES_ACEITAS: string[] = Object.values(FORMATOS).flatMap((f) => f.extensoes)

/** O formato pela extensão do nome (sem diferenciar caixa), ou `null`. */
export function formatoDoNome(nome: string): Formato | null {
  const ponto = nome.lastIndexOf('.')
  if (ponto < 0) return null
  const extensao = nome.slice(ponto).toLowerCase()
  for (const [formato, info] of Object.entries(FORMATOS) as Array<[Formato, InfoDoFormato]>) {
    if (info.extensoes.includes(extensao)) return formato
  }
  return null
}

export function mimeDoFormato(formato: Formato): string {
  return FORMATOS[formato].mime
}

// Controle C0 e C1, e as marcas de direção de texto que disfarçam extensão
// (fatura‮fdp.exe).
const INDESEJADOS = /[\u0000-\u001f\u007f-\u009f\u200e\u200f\u202a-\u202e\u2066-\u2069]/g

/**
 * O nome que o usuário enviou, só para exibição: nunca entra em caminho
 * (PR-13). Último segmento, sem caracteres de controle, espaços colapsados,
 * até 200 caracteres (mantendo a extensão) e "arquivo" se sobrar nada.
 */
export function sanitizarNome(nome: string): string {
  const ultimo = nome.split(/[\\/]/).pop() ?? ''
  const limpo = ultimo.replace(/\s/g, ' ').replace(INDESEJADOS, '').replace(/ +/g, ' ').trim()
  if (limpo === '' || /^\.+$/.test(limpo)) return 'arquivo'
  const maximo = LIMITES.nomeDoArquivo
  if (limpo.length <= maximo) return limpo
  const ponto = limpo.lastIndexOf('.')
  const extensao = ponto > 0 && limpo.length - ponto <= 10 ? limpo.slice(ponto) : ''
  return limpo.slice(0, maximo - extensao.length) + extensao
}
