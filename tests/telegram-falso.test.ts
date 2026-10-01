/**
 * T-01.03 (FT-07): o servidor simulado do Telegram (PR-70) imita os seis métodos,
 * registra o que recebe e dispara updates ao webhook do app com o cabeçalho certo.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { createServer, type IncomingMessage, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import {
  iniciarTelegramFalso,
  dispararUpdate,
  updateDeTexto,
  TOKEN_VALIDO,
  TOKEN_DESCONHECIDO,
  type TelegramFalso,
} from './apoio/telegram-falso'

let falso: TelegramFalso | undefined
afterEach(async () => {
  await falso?.fechar()
  falso = undefined
})

async function chamar(url: string, token: string, metodo: string, corpo?: unknown) {
  const r = await fetch(`${url}/bot${token}/${metodo}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo ?? {}),
  })
  return { status: r.status, json: (await r.json()) as Record<string, unknown> }
}

describe('telegram falso', () => {
  it('responde aos seis métodos para o token válido e registra cada requisição', async () => {
    falso = await iniciarTelegramFalso()
    const me = await chamar(falso.url, TOKEN_VALIDO, 'getMe')
    expect(me.json).toMatchObject({ ok: true, result: { is_bot: true, username: expect.any(String) } })
    expect((await chamar(falso.url, TOKEN_VALIDO, 'setWebhook', { url: 'https://x.com/h', secret_token: 'abc' })).json).toEqual({ ok: true, result: true, description: 'Webhook was set' })
    expect((await chamar(falso.url, TOKEN_VALIDO, 'getWebhookInfo')).json).toMatchObject({ ok: true, result: { url: 'https://x.com/h', pending_update_count: 0 } })
    const envio = await chamar(falso.url, TOKEN_VALIDO, 'sendMessage', { chat_id: 42, text: 'olá' })
    expect(envio.json).toMatchObject({ ok: true, result: { message_id: expect.any(Number) } })
    expect((await chamar(falso.url, TOKEN_VALIDO, 'sendChatAction', { chat_id: 42, action: 'typing' })).json.ok).toBe(true)
    expect((await chamar(falso.url, TOKEN_VALIDO, 'deleteWebhook')).json.ok).toBe(true)
    expect(falso.requisicoes.map((r) => r.metodo)).toEqual([
      'getMe', 'setWebhook', 'getWebhookInfo', 'sendMessage', 'sendChatAction', 'deleteWebhook',
    ])
    expect(falso.mensagensEnviadas()).toEqual([{ chat_id: 42, text: 'olá' }])
    expect(falso.requisicoes.find((r) => r.metodo === 'setWebhook')?.corpo).toMatchObject({ secret_token: 'abc' })
  })

  it('token desconhecido dá 401 com ok false, método desconhecido 404 e webhook sem HTTPS 400', async () => {
    falso = await iniciarTelegramFalso()
    const r = await chamar(falso.url, TOKEN_DESCONHECIDO, 'getMe')
    expect(r.status).toBe(401)
    expect(r.json).toEqual({ ok: false, error_code: 401, description: 'Unauthorized' })
    expect((await chamar(falso.url, TOKEN_VALIDO, 'naoExiste')).status).toBe(404)
    const http = await chamar(falso.url, TOKEN_VALIDO, 'setWebhook', { url: 'http://x.com/h' })
    expect(http.status).toBe(400)
    expect(http.json.ok).toBe(false)
  })

  it('falhas e latência configuráveis: 429 com retry_after por N vezes, depois volta ao normal', async () => {
    falso = await iniciarTelegramFalso()
    falso.configurar({ falhas: { sendMessage: { status: 429, retryAfter: 1, vezes: 1 } } })
    const primeira = await chamar(falso.url, TOKEN_VALIDO, 'sendMessage', { chat_id: 1, text: 'a' })
    expect(primeira.status).toBe(429)
    expect(primeira.json).toMatchObject({ ok: false, error_code: 429, parameters: { retry_after: 1 } })
    expect((await chamar(falso.url, TOKEN_VALIDO, 'sendMessage', { chat_id: 1, text: 'a' })).status).toBe(200)
    falso.configurar({ latenciaMs: 80 })
    const t0 = Date.now()
    await chamar(falso.url, TOKEN_VALIDO, 'getMe')
    expect(Date.now() - t0).toBeGreaterThanOrEqual(70)
  })

  it('recusa texto vazio ou acima de 4096 caracteres no sendMessage', async () => {
    falso = await iniciarTelegramFalso()
    expect((await chamar(falso.url, TOKEN_VALIDO, 'sendMessage', { chat_id: 1, text: '' })).status).toBe(400)
    expect((await chamar(falso.url, TOKEN_VALIDO, 'sendMessage', { chat_id: 1, text: 'x'.repeat(4097) })).status).toBe(400)
    expect(falso.mensagensEnviadas()).toEqual([])
  })

  it('dispararUpdate envia o corpo e o cabeçalho do segredo ao endereço dado, ou nenhum cabeçalho', async () => {
    const recebidas: Array<{ cabecalho: string | undefined; corpo: unknown }> = []
    const app: Server = createServer(async (req: IncomingMessage, res) => {
      const partes: Buffer[] = []
      for await (const p of req) partes.push(p as Buffer)
      recebidas.push({
        cabecalho: req.headers['x-telegram-bot-api-secret-token'] as string | undefined,
        corpo: JSON.parse(Buffer.concat(partes).toString('utf8')),
      })
      res.writeHead(200).end()
    })
    await new Promise<void>((r) => app.listen(0, '127.0.0.1', r))
    const url = `http://127.0.0.1:${(app.address() as AddressInfo).port}/api/telegram/x/webhook`
    try {
      const update = updateDeTexto({ updateId: 7, chatId: 99, texto: 'oi', nome: 'Maria' })
      const r = await dispararUpdate({ url, segredo: 'segredo-certo', update })
      expect(r.status).toBe(200)
      await dispararUpdate({ url, segredo: null, update })
      expect(recebidas[0]).toMatchObject({ cabecalho: 'segredo-certo', corpo: { update_id: 7, message: { text: 'oi', chat: { id: 99, type: 'private' } } } })
      expect(recebidas[1]?.cabecalho).toBeUndefined()
    } finally {
      app.closeAllConnections()
      await new Promise<void>((r) => app.close(() => r()))
    }
  })

  it('o simulado não importa nada de src', async () => {
    const { readFileSync } = await import('node:fs')
    const fonte = readFileSync('tests/apoio/telegram-falso.ts', 'utf8')
    expect(fonte).not.toMatch(/from ['"](\.\.\/\.\.\/src|@\/)/)
  })
})
