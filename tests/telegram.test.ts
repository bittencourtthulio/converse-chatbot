/**
 * T-02.01 (FT-07): o adaptador do Telegram (PR-64) fala só com o endereço de
 * `TELEGRAM_API_BASE`, lê o resultado e traduz falhas em erro de aplicação em
 * português, sem repassar o texto do Telegram.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { iniciarTelegramFalso, TOKEN_VALIDO, TOKEN_DESCONHECIDO, type TelegramFalso } from './apoio/telegram-falso'
import { ErroDeAplicacao } from '@/lib/erros'
import {
  getMe,
  setWebhook,
  deleteWebhook,
  getWebhookInfo,
  tokenTemFormatoValido,
} from '@/lib/telegram'

let falso: TelegramFalso
const baseOriginal = process.env.TELEGRAM_API_BASE

beforeEach(async () => {
  falso = await iniciarTelegramFalso()
  process.env.TELEGRAM_API_BASE = falso.url
})
afterEach(async () => {
  await falso.fechar()
  if (baseOriginal === undefined) delete process.env.TELEGRAM_API_BASE
  else process.env.TELEGRAM_API_BASE = baseOriginal
})

async function falha(promessa: Promise<unknown>): Promise<ErroDeAplicacao> {
  try {
    await promessa
  } catch (e) {
    expect(e).toBeInstanceOf(ErroDeAplicacao)
    return e as ErroDeAplicacao
  }
  throw new Error('esperava falha')
}

describe('formato do token', () => {
  it('aceita dígitos, dois-pontos e 35 caracteres do alfabeto do token', () => {
    expect(tokenTemFormatoValido(TOKEN_VALIDO)).toBe(true)
    expect(tokenTemFormatoValido('abc')).toBe(false)
    expect(tokenTemFormatoValido('123456789:curto')).toBe(false)
    expect(tokenTemFormatoValido(' ' + TOKEN_VALIDO)).toBe(false)
    expect(tokenTemFormatoValido('123456789:' + 'a'.repeat(35) + ' x')).toBe(false)
  })
})

describe('getMe', () => {
  it('devolve id, usuário e nome do bot', async () => {
    expect(await getMe(TOKEN_VALIDO)).toEqual({ id: '123456789', username: 'bot_de_teste_bot', nome: 'Bot de Teste' })
    expect(falso.requisicoes[0]).toMatchObject({ metodo: 'getMe', token: TOKEN_VALIDO })
  })

  it('token que o Telegram não conhece vira telegram_token_invalido, em português e sem o texto do Telegram', async () => {
    const e = await falha(getMe(TOKEN_DESCONHECIDO))
    expect(e.codigo).toBe('telegram_token_invalido')
    expect(e.status).toBe(422)
    expect(e.message).toMatch(/token/i)
    expect(e.message).not.toMatch(/Unauthorized/)
  })

  it('resultado que não é um bot com usuário vira token inválido', async () => {
    falso.configurar({ bots: { [TOKEN_VALIDO]: { id: 1, first_name: 'Sem usuário', username: '' } } })
    const e = await falha(getMe(TOKEN_VALIDO))
    expect(e.codigo).toBe('telegram_token_invalido')
  })
})

describe('setWebhook, deleteWebhook e getWebhookInfo', () => {
  it('setWebhook envia a url, o secret_token e só allowed_updates message', async () => {
    await setWebhook(TOKEN_VALIDO, { url: 'https://app.exemplo.com/api/telegram/x/webhook', secretToken: 'abc123_-' })
    expect(falso.requisicoes[0]?.corpo).toEqual({
      url: 'https://app.exemplo.com/api/telegram/x/webhook',
      secret_token: 'abc123_-',
      allowed_updates: ['message'],
    })
    expect(falso.webhook?.url).toBe('https://app.exemplo.com/api/telegram/x/webhook')
  })

  it('URL que o Telegram recusa vira telegram_webhook_recusado, sem repassar a descrição', async () => {
    const e = await falha(setWebhook(TOKEN_VALIDO, { url: 'http://app.exemplo.com/h', secretToken: 'abc' }))
    expect(e.codigo).toBe('telegram_webhook_recusado')
    expect(e.message).toMatch(/HTTPS/)
    expect(e.message).not.toMatch(/Bad Request|bad webhook/)
  })

  it('deleteWebhook remove o registro', async () => {
    await setWebhook(TOKEN_VALIDO, { url: 'https://a.com/h', secretToken: 'abc' })
    await deleteWebhook(TOKEN_VALIDO)
    expect(falso.webhook).toBeNull()
  })

  it('getWebhookInfo devolve url e pendentes, e o último erro do Telegram quando houver', async () => {
    await setWebhook(TOKEN_VALIDO, { url: 'https://a.com/h', secretToken: 'abc' })
    expect(await getWebhookInfo(TOKEN_VALIDO)).toEqual({ url: 'https://a.com/h', pendentes: 0, ultimoErro: null, ultimoErroEm: null })
    falso.configurar({ webhookInfo: { pending_update_count: 3, last_error_message: 'Wrong response from the webhook: 500', last_error_date: 1_700_000_000 } })
    const info = await getWebhookInfo(TOKEN_VALIDO)
    expect(info.pendentes).toBe(3)
    expect(info.ultimoErro).toBe('Wrong response from the webhook: 500')
    expect(info.ultimoErroEm).toEqual(new Date(1_700_000_000_000))
  })
})

describe('falhas de transporte', () => {
  it('tempo esgotado vira telegram_indisponivel com status 504', async () => {
    falso.configurar({ latenciaMs: 400 })
    const e = await falha(getMe(TOKEN_VALIDO, { tempoLimiteMs: 50 }))
    expect(e.codigo).toBe('telegram_indisponivel')
    expect(e.status).toBe(504)
  })

  it('erro 5xx, resposta que não é JSON e conexão derrubada viram telegram_indisponivel', async () => {
    falso.configurar({ falhas: { getMe: { status: 500 } } })
    expect((await falha(getMe(TOKEN_VALIDO))).codigo).toBe('telegram_indisponivel')
    falso.configurar({ falhas: {}, jsonInvalido: true })
    expect((await falha(getMe(TOKEN_VALIDO))).codigo).toBe('telegram_indisponivel')
    falso.configurar({ jsonInvalido: false, derrubar: true })
    expect((await falha(getMe(TOKEN_VALIDO))).codigo).toBe('telegram_indisponivel')
  })

  it('429 vira telegram_limite e 403 vira telegram_sem_acesso', async () => {
    falso.configurar({ falhas: { getMe: { status: 429, retryAfter: 2 } } })
    expect((await falha(getMe(TOKEN_VALIDO))).codigo).toBe('telegram_limite')
    falso.configurar({ falhas: { getMe: { status: 403 } } })
    expect((await falha(getMe(TOKEN_VALIDO))).codigo).toBe('telegram_sem_acesso')
  })
})
