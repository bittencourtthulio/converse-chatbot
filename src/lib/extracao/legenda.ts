// Legendas SRT e VTT (PR-45): só as falas. Saem o cabeçalho WEBVTT, os blocos
// NOTE, STYLE e REGION, a numeração, os identificadores de cue, as linhas de
// tempo e as marcas <...>; as falas são unidas por espaço.
import { decodificarTexto } from './conteudo'

const ENTIDADES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': ' ',
  '&quot;': '"',
  '&#39;': "'",
}

function limparFala(linha: string): string {
  return linha
    .replace(/<[^>]*>/g, '')
    .replace(/&(amp|lt|gt|nbsp|quot|#39);/g, (e) => ENTIDADES[e] ?? e)
    .trim()
}

export function extrairLegenda(bytes: Uint8Array, formato: 'srt' | 'vtt'): string {
  const texto = decodificarTexto(bytes).replace(/\r\n?/g, '\n')
  const blocos = texto.split(/\n{2,}/)
  const falas: string[] = []

  blocos.forEach((bloco, indice) => {
    const linhas = bloco.split('\n').map((l) => l.trimEnd())
    if (formato === 'vtt' && indice === 0 && /^WEBVTT/.test(linhas[0] ?? '')) return
    if (/^(NOTE|STYLE|REGION)(\s|$)/.test(linhas[0] ?? '')) return
    // Falas são as linhas depois da linha de tempo; tudo antes dela
    // (numeração, identificador de cue) é cabeçalho do bloco.
    const tempo = linhas.findIndex((l) => l.includes('-->'))
    if (tempo < 0) return
    const fala = linhas
      .slice(tempo + 1)
      .map(limparFala)
      .filter((l) => l !== '')
    if (fala.length > 0) falas.push(fala.join(' '))
  })
  return falas.join(' ')
}
