/**
 * Servidor Telegram simulado (PR-26, PR-70: nenhum teste chama a rede real).
 *
 * Uso:
 *   const falso = await iniciarTelegramFalso()
 *   process.env.TELEGRAM_API_BASE = falso.url        // http://127.0.0.1:<porta>
 *   ... teste ...
 *   await falso.fechar()                             // em afterEach
 *
 * Imita `/bot<token>/<método>` para getMe, setWebhook, deleteWebhook,
 * getWebhookInfo, sendMessage e sendChatAction. Token fora de `bots` dá
 * `401 {ok:false}`; método desconhecido, 404; webhook sem HTTPS, 400 (como o
 * Telegram real, a menos que `exigirHttps` seja false); texto de mensagem vazio
 * ou acima de 4096 caracteres, 400.
 *
 * `OpcoesDoTelegramFalso` (`configurar(parcial)` muda no meio do teste):
 *   bots         token -> dados do bot (padrão: TOKEN_VALIDO e TOKEN_OUTRO)
 *   falhas       método -> { status, retryAfter?, vezes? } falha as próximas `vezes`
 *                chamadas (sem `vezes`, todas) e depois volta ao normal
 *   latenciaMs   atraso antes de qualquer resposta
 *   jsonInvalido responde 200 com corpo que não é JSON
 *   derrubar     fecha a conexão sem responder (erro de rede)
 *   exigirHttps  setWebhook recusa url sem HTTPS (padrão true)
 *   webhookInfo  sobrescreve campos do getWebhookInfo (por exemplo `url`)
 *
 * Estado observável: `requisicoes` (método da API, token, corpo JSON),
 * `mensagensEnviadas()` (só as aceitas) e `webhook` (o que o `setWebhook` registrou).
 * Este arquivo não importa nada de src.
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'

/** Formato real: `<dígitos>:<35 caracteres [A-Za-z0-9_-]>`. Valores fictícios. */
export const TOKEN_VALIDO = '123456789:AAHteste_token-000000000000000000000'
export const TOKEN_OUTRO = '987654321:AAHoutro_token-000000000000000000000'
/** Bem formado, mas o simulado não o conhece: 401. */
export const TOKEN_DESCONHECIDO = '555555555:AAHdesconhecido_0000000000000000000'

export interface BotFalso {
  id: number
  first_name: string
  username: string
}

export const BOT_PADRAO: BotFalso = { id: 123456789, first_name: 'Bot de Teste', username: 'bot_de_teste_bot' }
export const BOT_OUTRO: BotFalso = { id: 987654321, first_name: 'Outro Bot', username: 'outro_bot' }

export interface FalhaFalsa {
  status: number
  retryAfter?: number
  vezes?: number
}

export interface OpcoesDoTelegramFalso {
  bots?: Record<string, BotFalso>
  falhas?: Record<string, FalhaFalsa>
  latenciaMs?: number
  jsonInvalido?: boolean
  derrubar?: boolean
  exigirHttps?: boolean
  webhookInfo?: Record<string, unknown>
}

export interface RequisicaoDoTelegram {
  metodo: string
  token: string
  corpo: Record<string, unknown>
}

export interface TelegramFalso {
  /** URL base para TELEGRAM_API_BASE, sem barra final. */
  url: string
  requisicoes: RequisicaoDoTelegram[]
  webhook: { url: string; secret_token?: string; allowed_updates?: string[] } | null
  mensagensEnviadas(): Array<{ chat_id: number | string; text: string }>
  configurar(parcial: OpcoesDoTelegramFalso): void
  fechar(): Promise<void>
}

const DESCRICOES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden: bot was blocked by the user',
  404: 'Not Found',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
}

const dormir = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function iniciarTelegramFalso(inicial: OpcoesDoTelegramFalso = {}): Promise<TelegramFalso> {
  const opcoes: OpcoesDoTelegramFalso = {
    bots: { [TOKEN_VALIDO]: BOT_PADRAO, [TOKEN_OUTRO]: BOT_OUTRO },
    falhas: {},
    latenciaMs: 0,
    jsonInvalido: false,
    derrubar: false,
    exigirHttps: true,
    webhookInfo: {},
    ...inicial,
  }
  const requisicoes: RequisicaoDoTelegram[] = []
  let proximaMensagem = 1000
  const enviadas: Array<{ chat_id: number | string; text: string }> = []
  const estado: { webhook: TelegramFalso['webhook'] } = { webhook: null }

  const responder = (res: ServerResponse, status: number, corpo: unknown) => {
    res.writeHead(status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(corpo))
  }
  const erro = (res: ServerResponse, status: number, descricao?: string, extra: Record<string, unknown> = {}) =>
    responder(res, status, {
      ok: false,
      error_code: status,
      description: descricao ?? DESCRICOES[status] ?? 'Error',
      ...extra,
    })

  async function lerCorpo(req: IncomingMessage): Promise<Record<string, unknown>> {
    const partes: Buffer[] = []
    for await (const parte of req) partes.push(parte as Buffer)
    const texto = Buffer.concat(partes).toString('utf8')
    if (!texto) return {}
    try {
      const json = JSON.parse(texto)
      return typeof json === 'object' && json !== null ? (json as Record<string, unknown>) : {}
    } catch {
      return {}
    }
  }

  async function tratar(req: IncomingMessage, res: ServerResponse) {
    const caminho = (req.url ?? '').split('?')[0] ?? ''
    const casou = /^\/bot([^/]+)\/([A-Za-z]+)$/.exec(caminho)
    const corpo = await lerCorpo(req)
    if (!casou) return erro(res, 404)
    const token = casou[1] as string
    const metodo = casou[2] as string
    requisicoes.push({ metodo, token, corpo })

    if (opcoes.latenciaMs) await dormir(opcoes.latenciaMs)
    if (opcoes.derrubar) {
      req.socket.destroy()
      return
    }
    const bot = opcoes.bots?.[token]
    if (!bot) return erro(res, 401)

    const falha = opcoes.falhas?.[metodo]
    if (falha && (falha.vezes === undefined || falha.vezes > 0)) {
      if (falha.vezes !== undefined) falha.vezes -= 1
      return erro(res, falha.status, undefined, falha.retryAfter !== undefined ? { parameters: { retry_after: falha.retryAfter } } : {})
    }
    if (opcoes.jsonInvalido) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end('<html>não é json')
      return
    }

    switch (metodo) {
      case 'getMe':
        return responder(res, 200, { ok: true, result: { ...bot, is_bot: true, can_join_groups: true } })
      case 'setWebhook': {
        const url = String(corpo.url ?? '')
        if (opcoes.exigirHttps && !url.startsWith('https://')) {
          return erro(res, 400, 'Bad Request: bad webhook: An HTTPS URL must be provided for webhook')
        }
        estado.webhook = {
          url,
          secret_token: typeof corpo.secret_token === 'string' ? corpo.secret_token : undefined,
          allowed_updates: Array.isArray(corpo.allowed_updates) ? (corpo.allowed_updates as string[]) : undefined,
        }
        return responder(res, 200, { ok: true, result: true, description: 'Webhook was set' })
      }
      case 'deleteWebhook':
        estado.webhook = null
        return responder(res, 200, { ok: true, result: true, description: 'Webhook was deleted' })
      case 'getWebhookInfo':
        return responder(res, 200, {
          ok: true,
          result: {
            url: estado.webhook?.url ?? '',
            has_custom_certificate: false,
            pending_update_count: 0,
            max_connections: 40,
            ...opcoes.webhookInfo,
          },
        })
      case 'sendMessage': {
        const texto = corpo.text
        if (typeof texto !== 'string' || texto.length < 1 || texto.length > 4096 || corpo.chat_id === undefined) {
          return erro(res, 400, 'Bad Request: message text is empty or too long')
        }
        proximaMensagem += 1
        enviadas.push({ chat_id: corpo.chat_id as number | string, text: texto })
        return responder(res, 200, {
          ok: true,
          result: { message_id: proximaMensagem, date: 1, chat: { id: corpo.chat_id }, text: texto },
        })
      }
      case 'sendChatAction':
        return responder(res, 200, { ok: true, result: true })
      default:
        return erro(res, 404)
    }
  }

  const servidor: Server = createServer((req, res) => {
    tratar(req, res).catch(() => {
      if (!res.headersSent) erro(res, 500)
      else res.end()
    })
  })
  await new Promise<void>((resolve) => servidor.listen(0, '127.0.0.1', resolve))
  const { port } = servidor.address() as AddressInfo

  return {
    url: `http://127.0.0.1:${port}`,
    requisicoes,
    get webhook() {
      return estado.webhook
    },
    mensagensEnviadas() {
      return [...enviadas]
    },
    configurar(parcial) {
      Object.assign(opcoes, parcial)
    },
    async fechar() {
      servidor.closeAllConnections()
      await new Promise<void>((resolve) => servidor.close(() => resolve()))
    },
  }
}

export interface UpdateDeTextoOpcoes {
  updateId: number
  chatId: number
  texto?: string
  nome?: string
  sobrenome?: string
  /** Padrão `private`. */
  tipoDoChat?: 'private' | 'group' | 'supergroup' | 'channel'
  /** Corpo extra no `message` (por exemplo `photo`), sem `text`. */
  semTexto?: boolean
  extra?: Record<string, unknown>
}

/** Um update de mensagem no formato do Telegram. */
export function updateDeTexto(o: UpdateDeTextoOpcoes) {
  return {
    update_id: o.updateId,
    message: {
      message_id: o.updateId,
      date: 1,
      chat: { id: o.chatId, type: o.tipoDoChat ?? 'private', first_name: o.nome ?? 'Maria' },
      from: { id: o.chatId, is_bot: false, first_name: o.nome ?? 'Maria', ...(o.sobrenome ? { last_name: o.sobrenome } : {}), username: 'maria_usuaria' },
      ...(o.semTexto ? {} : { text: o.texto ?? 'oi' }),
      ...o.extra,
    },
  }
}

/** Dispara um update ao webhook do app, com o cabeçalho do segredo (ou sem ele, com `null`). */
export async function dispararUpdate(entrada: {
  url: string
  segredo: string | null
  update: unknown
  cabecalhos?: Record<string, string>
}): Promise<Response> {
  return fetch(entrada.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(entrada.segredo === null ? {} : { 'X-Telegram-Bot-Api-Secret-Token': entrada.segredo }),
      ...entrada.cabecalhos,
    },
    body: typeof entrada.update === 'string' ? entrada.update : JSON.stringify(entrada.update),
  })
}
