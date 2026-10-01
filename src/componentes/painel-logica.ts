// Lógica do gráfico de mensagens por dia (FT-09), sem React: a escala das barras, os rótulos
// de data e a frase que resume o gráfico para o leitor de tela.
export const ALTURA_MAXIMA_DA_BARRA = 110
const ALTURA_MINIMA_DE_BARRA_COM_VALOR = 2

export interface PontoDaSerie {
  /** `AAAA-MM-DD`. */
  dia: string
  mensagens: number
}

export interface Barra extends PontoDaSerie {
  altura: number
  /** O que o leitor de tela diz da barra: o dia completo e o valor. */
  rotulo: string
}

/** `10/03` a partir de `2026-03-10`, sem fuso (o dia já vem do servidor). */
export function diaCurto(dia: string): string {
  const [, mes, d] = dia.split('-')
  return `${d}/${mes}`
}

/** `10/03/2026` a partir de `2026-03-10`. */
export function diaCompleto(dia: string): string {
  const [ano, mes, d] = dia.split('-')
  return `${d}/${mes}/${ano}`
}

export const quantidade = (n: number): string => (n === 0 ? 'nenhuma mensagem' : n === 1 ? '1 mensagem' : `${n} mensagens`)

/** A altura de cada barra: zero é zero, a maior vale o máximo e qualquer valor positivo aparece. */
export function escalaDasBarras(serie: PontoDaSerie[]): Barra[] {
  const maior = Math.max(0, ...serie.map((p) => p.mensagens))
  return serie.map((p) => ({
    ...p,
    altura:
      p.mensagens === 0 || maior === 0
        ? 0
        : Math.max(ALTURA_MINIMA_DE_BARRA_COM_VALOR, Math.round((p.mensagens / maior) * ALTURA_MAXIMA_DA_BARRA)),
    rotulo: `${diaCompleto(p.dia)}: ${quantidade(p.mensagens)}`,
  }))
}

export const totalDaSerie = (serie: PontoDaSerie[]): number => serie.reduce((s, p) => s + p.mensagens, 0)

/** O dia de mais mensagens (o mais recente, em empate); `null` se não houve nenhuma. */
export function picoDaSerie(serie: PontoDaSerie[]): PontoDaSerie | null {
  let pico: PontoDaSerie | null = null
  for (const p of serie) if (p.mensagens > 0 && (pico === null || p.mensagens >= pico.mensagens)) pico = p
  return pico
}

export function descricaoDoGrafico(serie: PontoDaSerie[]): string {
  const total = totalDaSerie(serie)
  const base = `Mensagens por dia nos últimos ${serie.length} dias`
  if (total === 0) return `${base}: nenhuma mensagem.`
  const pico = picoDaSerie(serie)
  return `${base}: ${quantidade(total)} no total${pico ? `, o maior dia foi ${diaCurto(pico.dia)} com ${pico.mensagens}` : ''}.`
}
