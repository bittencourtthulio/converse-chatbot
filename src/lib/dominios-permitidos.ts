// Domínios permitidos no embed (FT-06, PR-58): normalização, casamento de
// origem e o cabeçalho `frame-ancestors`. Módulo puro, sem dependência, porque
// quem o usa é o serviço (validação), o CORS do `config` e o `src/proxy.ts`.
//
// Forma de uma entrada: host em minúsculas, sem esquema nem caminho, com
// curinga `*.` só no início e porta opcional: `exemplo.com`, `*.exemplo.com`,
// `localhost:3000`. Sem porta vale só a porta padrão do esquema (80 ou 443),
// como a sintaxe de host do CSP.

export const LIMITE_DE_DOMINIOS = 20

/** Página do iframe de agente inexistente ou inativo: só a própria plataforma a emoldura. */
export const FRAME_ANCESTORS_SOMENTE_EU = "frame-ancestors 'self'"

const ROTULO = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/

interface EntradaAnalisada {
  curinga: boolean
  host: string
  porta: number | null
}

function analisar(entrada: unknown): EntradaAnalisada | null {
  if (typeof entrada !== 'string') return null
  let texto = entrada.trim().toLowerCase()
  if (texto === '' || /[\s;,'"<>\\]/.test(texto)) return null
  texto = texto.replace(/^https?:\/\//, '')
  texto = texto.split(/[/?#]/)[0] ?? ''
  if (texto === '') return null

  let porta: number | null = null
  const dois = texto.lastIndexOf(':')
  if (dois !== -1) {
    const bruto = texto.slice(dois + 1)
    if (!/^\d{1,5}$/.test(bruto)) return null
    porta = Number(bruto)
    if (porta < 1 || porta > 65535) return null
    texto = texto.slice(0, dois)
  }

  const curinga = texto.startsWith('*.')
  const host = curinga ? texto.slice(2) : texto
  const rotulos = host.split('.')
  if (!rotulos.every((r) => ROTULO.test(r))) return null
  // `*.com` liberaria um domínio de topo inteiro.
  if (curinga && rotulos.length < 2) return null
  return { curinga, host, porta }
}

/** O texto normalizado da entrada, ou `null` se ela não é um domínio válido. */
export function normalizarDominio(entrada: string): string | null {
  const a = analisar(entrada)
  if (!a) return null
  return `${a.curinga ? '*.' : ''}${a.host}${a.porta === null ? '' : `:${a.porta}`}`
}

export interface ListaNormalizada {
  /** Entradas válidas, sem repetição, na ordem digitada. */
  lista: string[]
  /** Entradas não vazias que não são domínio válido, como digitadas. */
  invalidas: string[]
  /** Há mais que `LIMITE_DE_DOMINIOS` entradas válidas. */
  excedeu: boolean
}

export function normalizarLista(entradas: unknown): ListaNormalizada {
  const lista: string[] = []
  const invalidas: string[] = []
  if (Array.isArray(entradas)) {
    for (const bruta of entradas) {
      if (typeof bruta === 'string' && bruta.trim() === '') continue
      const n = typeof bruta === 'string' ? normalizarDominio(bruta) : null
      if (n === null) invalidas.push(String(bruta))
      else if (!lista.includes(n)) lista.push(n)
    }
  }
  return { lista, invalidas, excedeu: lista.length > LIMITE_DE_DOMINIOS }
}

/**
 * A origem (`https://app.exemplo.com`) está na lista? Lista vazia libera tudo.
 * Origem que não é http(s) legível (inclusive `null`) não casa com lista nenhuma.
 */
export function origemPermitida(origem: string, lista: string[]): boolean {
  if (lista.length === 0) return true
  let url: URL
  try {
    url = new URL(origem)
  } catch {
    return false
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
  const padrao = url.protocol === 'https:' ? 443 : 80
  const porta = url.port === '' ? padrao : Number(url.port)
  const host = url.hostname.toLowerCase()
  return lista.some((entrada) => {
    const a = analisar(entrada)
    if (!a) return false
    const hostCasa = a.curinga ? host.endsWith(`.${a.host}`) : host === a.host
    return hostCasa && porta === (a.porta ?? padrao)
  })
}

/**
 * O valor da `Content-Security-Policy` da página do iframe. Lista vazia libera
 * qualquer site; com lista, só a plataforma e os domínios dela. Entrada que não
 * é domínio válido nunca entra no cabeçalho (falha fechando).
 */
export function cabecalhoFrameAncestors(lista: string[]): string {
  if (lista.length === 0) return 'frame-ancestors *'
  const validas = lista.map((e) => normalizarDominio(e)).filter((e): e is string => e !== null)
  return validas.length === 0 ? FRAME_ANCESTORS_SOMENTE_EU : `frame-ancestors 'self' ${validas.join(' ')}`
}
