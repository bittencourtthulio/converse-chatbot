// O protocolo de `postMessage` do chat embutido (FT-06, PR-60, PR-61), sem React.
//
// iframe -> página que o hospeda (o `widget.js`): `fechar` e `redimensionar`.
// Não levam dado nenhum, então o destino pode ser `*` quando o navegador não
// informa a origem de quem emoldura. O `widget.js` só aceita a mensagem se
// `event.origin` for a da plataforma e `event.source` o iframe dele.
//
// painel -> iframe da prévia: `previa`, com a configuração ainda não salva. Só
// vale vinda da mesma origem (o painel e o iframe são a própria plataforma).
import { normalizarCor } from '@/lib/cor'
import type { ConfiguracaoDoEmbed } from '@/componentes/ChatEmbutido'

export const ORIGEM_DAS_MENSAGENS = 'converse'

export type MensagemDoIframe =
  | { origem: typeof ORIGEM_DAS_MENSAGENS; tipo: 'fechar' }
  | { origem: typeof ORIGEM_DAS_MENSAGENS; tipo: 'redimensionar'; expandido: boolean }

export function mensagemDeFechar(): MensagemDoIframe {
  return { origem: ORIGEM_DAS_MENSAGENS, tipo: 'fechar' }
}

export function mensagemDeRedimensionar(expandido: boolean): MensagemDoIframe {
  return { origem: ORIGEM_DAS_MENSAGENS, tipo: 'redimensionar', expandido }
}

/** A janela que emoldura, quando há uma e não é a própria. */
interface JanelaComPai {
  parent: { postMessage(mensagem: unknown, alvo: string): void } | null
  location: { ancestorOrigins?: { [indice: number]: string; length: number } }
}

/**
 * Avisa a página que hospeda o iframe. Sem moldura (página aberta direto) não
 * faz nada. O destino é a origem de quem emoldura quando o navegador a informa
 * (`ancestorOrigins`), senão `*`: a mensagem não leva dado.
 */
export function avisarOPai(mensagem: MensagemDoIframe, janela: JanelaComPai & object): boolean {
  const pai = janela.parent
  if (!pai || (pai as unknown) === (janela as unknown)) return false
  const origens = janela.location.ancestorOrigins
  const alvo = origens && origens.length > 0 && /^https?:\/\//.test(origens[0] ?? '') ? (origens[0] as string) : '*'
  pai.postMessage(mensagem, alvo)
  return true
}

const POSICOES = ['direita', 'esquerda']
const AVATARES = ['iniciais', 'chat', 'robo', 'estrela', 'fone']

export function mensagemDePrevia(configuracao: Partial<ConfiguracaoDoEmbed>) {
  return { origem: ORIGEM_DAS_MENSAGENS, tipo: 'previa' as const, configuracao }
}

function urlHttp(v: unknown): string | null {
  if (typeof v !== 'string' || v.length > 500) return null
  try {
    const u = new URL(v)
    return u.protocol === 'http:' || u.protocol === 'https:' ? v : null
  } catch {
    return null
  }
}

/**
 * A mensagem de prévia do painel, se ela é legítima: mesma origem, formato
 * certo. Devolve só os campos válidos, já saneados; o resto é descartado, então
 * uma mensagem mal formada nunca quebra nem injeta nada na tela.
 */
export function lerMensagemDePrevia(
  evento: { origin: string; data: unknown },
  origemLocal: string,
): Partial<ConfiguracaoDoEmbed> | null {
  if (evento.origin !== origemLocal) return null
  const d = evento.data as { origem?: unknown; tipo?: unknown; configuracao?: unknown } | null
  if (typeof d !== 'object' || d === null || d.origem !== ORIGEM_DAS_MENSAGENS || d.tipo !== 'previa') return null
  if (typeof d.configuracao !== 'object' || d.configuracao === null) return null
  const c = d.configuracao as Record<string, unknown>
  const r: Partial<ConfiguracaoDoEmbed> = {}
  if (typeof c.titulo === 'string' && c.titulo.trim() !== '' && c.titulo.length <= 60) r.titulo = c.titulo
  if (typeof c.cor === 'string') {
    const cor = normalizarCor(c.cor)
    if (cor) r.cor = cor
  }
  if (typeof c.posicao === 'string' && POSICOES.includes(c.posicao)) r.posicao = c.posicao as 'direita' | 'esquerda'
  if (typeof c.avatar === 'string' && AVATARES.includes(c.avatar)) r.avatar = c.avatar as ConfiguracaoDoEmbed['avatar']
  if (typeof c.mensagemInicial === 'string' && c.mensagemInicial.length <= 500) r.mensagemInicial = c.mensagemInicial
  if (c.avisoDePrivacidade === null) r.avisoDePrivacidade = null
  else if (typeof c.avisoDePrivacidade === 'object') {
    const a = c.avisoDePrivacidade as { texto?: unknown; url?: unknown }
    if (typeof a.texto === 'string' && a.texto.trim() !== '' && a.texto.length <= 300) {
      r.avisoDePrivacidade = { texto: a.texto, url: urlHttp(a.url) }
    }
  }
  if (Array.isArray(c.sugestoes)) {
    const s = c.sugestoes.filter((x): x is string => typeof x === 'string' && x.trim() !== '' && x.length <= 80)
    r.sugestoes = s.slice(0, 3)
  }
  return r
}
