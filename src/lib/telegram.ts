// Adaptador do Telegram (PR-07, PR-14, PR-64): o único ponto do sistema que fala
// com a Bot API. O endereço vem de `TELEGRAM_API_BASE` (lido em `ambiente.ts`),
// o que deixa os testes apontarem para `tests/apoio/telegram-falso.ts`.
//
// O token vai no CAMINHO da URL (`/bot<token>/<método>`). Por isso este módulo
// nunca repassa mensagem de exceção, `cause`, pilha nem a `description` do
// Telegram: todo erro nasce de um texto fixo em português mais o status, e
// `chamar` descarta o erro original. `redigirToken` existe para qualquer texto
// que um chamador ainda precise manter.
import { ambiente } from '@/lib/ambiente'
import { ErroDeAplicacao } from '@/lib/erros'

export const TEMPO_PADRAO_MS = 10_000

const FORMATO_DO_TOKEN = /^\d{5,}:[A-Za-z0-9_-]{30,120}$/

/** `<dígitos>:<segredo>`: o formato que o BotFather entrega. */
export function tokenTemFormatoValido(token: string): boolean {
  return FORMATO_DO_TOKEN.test(token)
}

/** Troca o token (e qualquer `bot<dígitos>:<segredo>`) por `bot<oculto>` em um texto. */
export function redigirToken(texto: string, token?: string): string {
  let saida = texto
  if (token) saida = saida.split(token).join('<oculto>')
  return saida.replace(/bot\d{5,}:[A-Za-z0-9_-]+/g, 'bot<oculto>')
}

/** Erro do Telegram, com o `retry_after` do 429 quando ele veio. */
export class ErroDoTelegram extends ErroDeAplicacao {
  constructor(
    mensagem: string,
    status: number,
    codigo: string,
    readonly retryAfterSegundos?: number,
  ) {
    super(mensagem, status, codigo)
  }
}

type Causa = number | 'timeout' | 'rede' | 'resposta'

/** A mensagem é para o operador, em português, e nunca repete o que o Telegram disse. */
export function erroDoTelegram(causa: Causa, metodo?: string, retryAfter?: number): ErroDoTelegram {
  if (causa === 'timeout') {
    return new ErroDoTelegram('O Telegram demorou demais para responder. Tente de novo em instantes.', 504, 'telegram_indisponivel')
  }
  if (causa === 401 || causa === 404) {
    return new ErroDoTelegram(
      'O Telegram recusou o token. Confira se copiou o token inteiro que o @BotFather mostrou.',
      422,
      'telegram_token_invalido',
    )
  }
  if (causa === 403) {
    return new ErroDoTelegram(
      'O bot não tem acesso a este chat (a pessoa pode ter bloqueado o bot).',
      502,
      'telegram_sem_acesso',
    )
  }
  if (causa === 400) {
    if (metodo === 'setWebhook') {
      return new ErroDoTelegram(
        'O Telegram recusou o endereço do webhook. Ele precisa ser HTTPS, público e alcançável pela internet.',
        422,
        'telegram_webhook_recusado',
      )
    }
    return new ErroDoTelegram('O Telegram recusou o pedido.', 502, 'telegram_pedido_invalido')
  }
  if (causa === 429) {
    return new ErroDoTelegram(
      'O Telegram pediu para esperar um pouco. Tente de novo em instantes.',
      502,
      'telegram_limite',
      retryAfter,
    )
  }
  return new ErroDoTelegram('O Telegram está indisponível no momento. Tente de novo em instantes.', 502, 'telegram_indisponivel')
}

interface CorpoDoTelegram {
  ok?: unknown
  result?: unknown
  parameters?: { retry_after?: unknown }
}

async function lerCorpo(resposta: Response): Promise<CorpoDoTelegram | null> {
  try {
    return (await resposta.json()) as CorpoDoTelegram
  } catch {
    return null
  }
}

export interface OpcoesDeChamada {
  tempoLimiteMs?: number
  sinal?: AbortSignal
}

/**
 * Chamada à Bot API. Devolve o `result`. Qualquer falha (rede, prazo, status,
 * corpo ilegível) vira `ErroDoTelegram` fixo; o erro original é descartado
 * porque a URL dele leva o token.
 */
export async function chamar(
  token: string,
  metodo: string,
  corpo: Record<string, unknown> = {},
  opcoes: OpcoesDeChamada = {},
): Promise<unknown> {
  const prazo = new AbortController()
  const temporizador = setTimeout(() => prazo.abort(), opcoes.tempoLimiteMs ?? TEMPO_PADRAO_MS)
  const sinais = [prazo.signal, ...(opcoes.sinal ? [opcoes.sinal] : [])]
  try {
    const resposta = await fetch(`${ambiente.telegramApiBase}/bot${token}/${metodo}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
      signal: AbortSignal.any(sinais),
    })
    const json = await lerCorpo(resposta)
    if (resposta.ok && json !== null && json.ok === true) return json.result
    if (!resposta.ok) {
      const retry = json?.parameters?.retry_after
      throw erroDoTelegram(resposta.status, metodo, typeof retry === 'number' ? retry : undefined)
    }
    throw erroDoTelegram('resposta', metodo)
  } catch (erro) {
    if (erro instanceof ErroDoTelegram) throw erro
    if (opcoes.sinal?.aborted) throw erroDoTelegram('rede', metodo)
    if (prazo.signal.aborted) throw erroDoTelegram('timeout', metodo)
    throw erroDoTelegram('rede', metodo)
  } finally {
    clearTimeout(temporizador)
  }
}

export interface BotDoTelegram {
  /** Texto decimal: o id é público no `getMe` e identifica o bot. */
  id: string
  username: string
  nome: string
}

/** Confere o token: devolve o bot, que precisa ser um bot com usuário. */
export async function getMe(token: string, opcoes?: OpcoesDeChamada): Promise<BotDoTelegram> {
  const r = (await chamar(token, 'getMe', {}, opcoes)) as { id?: unknown; is_bot?: unknown; first_name?: unknown; username?: unknown } | null
  if (
    !r ||
    r.is_bot !== true ||
    (typeof r.id !== 'number' && typeof r.id !== 'string') ||
    typeof r.username !== 'string' ||
    r.username === ''
  ) {
    throw erroDoTelegram(401, 'getMe')
  }
  return { id: String(r.id), username: r.username, nome: typeof r.first_name === 'string' ? r.first_name : r.username }
}

/** Registra o webhook. Só pede `message`; o segredo vem no cabeçalho de cada entrega. */
export async function setWebhook(
  token: string,
  entrada: { url: string; secretToken: string },
  opcoes?: OpcoesDeChamada,
): Promise<void> {
  await chamar(
    token,
    'setWebhook',
    { url: entrada.url, secret_token: entrada.secretToken, allowed_updates: ['message'] },
    opcoes,
  )
}

export async function deleteWebhook(token: string, opcoes?: OpcoesDeChamada): Promise<void> {
  await chamar(token, 'deleteWebhook', {}, opcoes)
}

export interface InfoDoWebhook {
  url: string
  pendentes: number
  ultimoErro: string | null
  ultimoErroEm: Date | null
}

export async function getWebhookInfo(token: string, opcoes?: OpcoesDeChamada): Promise<InfoDoWebhook> {
  const r = ((await chamar(token, 'getWebhookInfo', {}, opcoes)) ?? {}) as {
    url?: unknown
    pending_update_count?: unknown
    last_error_message?: unknown
    last_error_date?: unknown
  }
  return {
    url: typeof r.url === 'string' ? r.url : '',
    pendentes: typeof r.pending_update_count === 'number' ? r.pending_update_count : 0,
    ultimoErro: typeof r.last_error_message === 'string' && r.last_error_message !== '' ? r.last_error_message : null,
    ultimoErroEm: typeof r.last_error_date === 'number' ? new Date(r.last_error_date * 1000) : null,
  }
}
