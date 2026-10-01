// Apoio dos handlers públicos (FT-06, PR-56, PR-58): JSON sem cache, erro
// sempre sanitizado para o visitante, CORS pela lista de domínios e a conferência
// de `Origin` do POST. Camada de apresentação: só traduz o que o serviço decide.
import { ambiente } from '@/lib/ambiente'
import { origemPermitida } from '@/lib/dominios-permitidos'
import { ErroDeAplicacao } from '@/lib/erros'
import { camposDoErro, log } from '@/lib/log'
import { ErroDeLimite } from '@/servicos/chat-publico-limites'
import { erroParaVisitante } from '@/servicos/chat-publico'

export const semCache = { 'Cache-Control': 'no-store' }

/** Erro para o visitante em JSON, com o status certo e `Retry-After` no 429. */
export function erroPublico(erro: unknown): Response {
  // O visitante recebe sempre a frase única; o operador acha a causa pelo nome do erro no log.
  if (!(erro instanceof ErroDeAplicacao)) log.erro('erro_inesperado', { rota: 'publico', ...camposDoErro(erro) })
  const e = erroParaVisitante(erro)
  const cabecalhos: Record<string, string> = { ...semCache }
  if (erro instanceof ErroDeLimite && erro.retryAfterSegundos !== null) {
    cabecalhos['Retry-After'] = String(erro.retryAfterSegundos)
  }
  return Response.json({ codigo: e.codigo, mensagem: e.message }, { status: e.status, headers: cabecalhos })
}

export const CABECALHOS_DE_PREFLIGHT = {
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '600',
}

/**
 * Cabeçalhos de CORS do `config`: lista vazia libera qualquer site (`*`); com
 * lista, o `Origin` é ecoado só se casa. `Vary: Origin` sempre.
 */
export function cabecalhosDeCors(origem: string | null, dominios: string[]): Record<string, string> {
  const base: Record<string, string> = { Vary: 'Origin' }
  if (dominios.length === 0) return { ...base, 'Access-Control-Allow-Origin': '*' }
  if (origem !== null && origemPermitida(origem, dominios)) {
    return { ...base, 'Access-Control-Allow-Origin': origem }
  }
  return base
}

/**
 * A `Origin` da requisição é a da própria plataforma? A chamada legítima de
 * chat parte do iframe, que é da plataforma; navegador vindo de outro site manda
 * outra origem e é barrado (PR-58). Cliente que não é navegador pode forjar o
 * cabeçalho: isto não é o controle contra ele, o limite de uso é.
 */
export function origemEDaPlataforma(origem: string, request: Request): boolean {
  let host: string
  try {
    host = new URL(origem).host
  } catch {
    return false
  }
  if (host === request.headers.get('host')) return true
  const configurada = ambiente.appUrlPublica
  return configurada !== undefined && new URL(configurada).host === host
}
