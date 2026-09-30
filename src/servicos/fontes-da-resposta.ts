// Fontes da resposta (FT-05, PR-53): o que o turno mostra e grava sobre de onde
// veio a resposta. Funções puras: agrupam os trechos consultados por fonte,
// marcam as citadas e leem com segurança o JSON de `Mensagem.fontes`.
import type { TrechoIncluido } from '@/servicos/chat-prompt'

/** Tamanho máximo do texto de um trecho na lista de fontes. */
export const LIMITE_DO_RESUMO = 300

export interface TrechoDaFonte {
  /** O número [n] do trecho no prompt. */
  n: number
  /** Posição do trecho na fonte, a partir de 1. */
  posicao: number
  trechoTexto: string
}

export interface FonteDaResposta {
  fonteId: string
  titulo: string
  trechos: TrechoDaFonte[]
  /** Algum trecho desta fonte foi citado com [n] na resposta. */
  citada: boolean
}

const CITACAO = /\[(\d{1,2})\]/g

/** Os números [n] que a resposta cita (um ou dois dígitos). */
export function citacoesNaResposta(resposta: string): Set<number> {
  const citados = new Set<number>()
  for (const m of resposta.matchAll(CITACAO)) {
    // `[1](https://...)` é link de texto, não citação.
    const depois = resposta[(m.index ?? 0) + m[0].length]
    if (depois === '(') continue
    citados.add(Number(m[1]))
  }
  return citados
}

function resumir(texto: string): string {
  const limpo = texto.replace(/\s+/g, ' ').trim()
  return limpo.length <= LIMITE_DO_RESUMO ? limpo : `${limpo.slice(0, LIMITE_DO_RESUMO - 1).trimEnd()}…`
}

/** Uma entrada por fonte, na ordem do primeiro trecho consultado. */
export function montarFontes(incluidos: TrechoIncluido[], resposta: string): FonteDaResposta[] {
  const citados = citacoesNaResposta(resposta)
  const porFonte = new Map<string, FonteDaResposta>()
  for (const { n, trecho } of incluidos) {
    let fonte = porFonte.get(trecho.fonteId)
    if (!fonte) {
      fonte = { fonteId: trecho.fonteId, titulo: trecho.titulo, trechos: [], citada: false }
      porFonte.set(trecho.fonteId, fonte)
    }
    fonte.trechos.push({ n, posicao: trecho.posicao, trechoTexto: resumir(trecho.texto) })
    if (citados.has(n)) fonte.citada = true
  }
  return [...porFonte.values()]
}

export const serializarFontes = (fontes: FonteDaResposta[]): string => JSON.stringify(fontes)

function trechoValido(t: unknown): t is TrechoDaFonte {
  if (typeof t !== 'object' || t === null) return false
  const o = t as Record<string, unknown>
  return typeof o.n === 'number' && typeof o.posicao === 'number' && typeof o.trechoTexto === 'string'
}

function fonteValida(f: unknown): f is FonteDaResposta {
  if (typeof f !== 'object' || f === null) return false
  const o = f as Record<string, unknown>
  return (
    typeof o.fonteId === 'string' &&
    typeof o.titulo === 'string' &&
    typeof o.citada === 'boolean' &&
    Array.isArray(o.trechos) &&
    o.trechos.every(trechoValido)
  )
}

/** As fontes gravadas em `Mensagem.fontes`; JSON ausente, inválido ou de outra forma vira lista vazia. */
export function lerFontesGravadas(json: string | null | undefined): FonteDaResposta[] {
  if (!json) return []
  try {
    const lido: unknown = JSON.parse(json)
    return Array.isArray(lido) ? lido.filter(fonteValida) : []
  } catch {
    return []
  }
}
