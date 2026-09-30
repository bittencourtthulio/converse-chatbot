// Lógica das fontes da resposta na tela (FT-05), sem React nem rede: separar as
// citadas das apenas consultadas, achar a fonte de um [n] e alternar o que está
// expandido. O componente só liga isto ao DOM.
import type { FonteDaResposta } from '@/componentes/leitor-de-sse'

export function separarFontes(fontes: FonteDaResposta[]): {
  citadas: FonteDaResposta[]
  consultadas: FonteDaResposta[]
} {
  return {
    citadas: fontes.filter((f) => f.citada),
    consultadas: fontes.filter((f) => !f.citada),
  }
}

/** Todos os números [n] que o texto pode referenciar. */
export function numerosDeReferencia(fontes: FonteDaResposta[]): number[] {
  return fontes.flatMap((f) => f.trechos.map((t) => t.n))
}

/** O id da fonte que tem o trecho [n], se houver. */
export function fonteDoNumero(fontes: FonteDaResposta[], n: number): string | undefined {
  return fontes.find((f) => f.trechos.some((t) => t.n === n))?.fonteId
}

export function alternarAberta(abertas: string[], fonteId: string): string[] {
  return abertas.includes(fonteId) ? abertas.filter((id) => id !== fonteId) : [...abertas, fonteId]
}

export function abrirFonte(abertas: string[], fonteId: string): string[] {
  return abertas.includes(fonteId) ? abertas : [...abertas, fonteId]
}

export const resumoDasConsultadas = (quantas: number): string =>
  `${quantas === 1 ? 'Consultada' : 'Consultadas'}, sem citação (${quantas})`

export const idDoChip = (idBase: string, fonteId: string): string => `${idBase}-fonte-${fonteId}`
export const idDosTrechos = (idBase: string, fonteId: string): string => `${idDoChip(idBase, fonteId)}-trechos`
