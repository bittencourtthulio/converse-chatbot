/**
 * T-02.03 (FT-07, PR-14, PR-64): o token vai no caminho da URL do Telegram, então
 * nenhum erro, pilha, causa ou saída de console do adaptador pode conter o token,
 * em qualquer método e em qualquer falha.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { iniciarTelegramFalso, TOKEN_VALIDO, type TelegramFalso, type OpcoesDoTelegramFalso } from './apoio/telegram-falso'
import { ErroDeAplicacao } from '@/lib/erros'
import {
  getMe,
  setWebhook,
  deleteWebhook,
  getWebhookInfo,
  sendMessage,
  sendChatAction,
  redigirToken,
} from '@/lib/telegram'

let falso: TelegramFalso
const baseOriginal = process.env.TELEGRAM_API_BASE
const SEGREDO_DO_TOKEN = TOKEN_VALIDO.split(':')[1] as string

beforeEach(async () => {
  falso = await iniciarTelegramFalso()
  process.env.TELEGRAM_API_BASE = falso.url
})
afterEach(async () => {
  vi.restoreAllMocks()
  await falso.fechar()
  if (baseOriginal === undefined) delete process.env.TELEGRAM_API_BASE
  else process.env.TELEGRAM_API_BASE = baseOriginal
})

const METODOS: Record<string, () => Promise<unknown>> = {
  getMe: () => getMe(TOKEN_VALIDO),
  setWebhook: () => setWebhook(TOKEN_VALIDO, { url: 'https://a.com/h', secretToken: 'abc' }),
  deleteWebhook: () => deleteWebhook(TOKEN_VALIDO),
  getWebhookInfo: () => getWebhookInfo(TOKEN_VALIDO),
  sendMessage: () => sendMessage(TOKEN_VALIDO, 1, 'olá', { esperar: async () => undefined }),
  sendChatAction: () => sendChatAction(TOKEN_VALIDO, 1),
}

const FALHAS: Record<string, (metodo: string) => OpcoesDoTelegramFalso> = {
  '401': (m) => ({ falhas: { [m]: { status: 401 } } }),
  '403': (m) => ({ falhas: { [m]: { status: 403 } } }),
  '404': (m) => ({ falhas: { [m]: { status: 404 } } }),
  '429': (m) => ({ falhas: { [m]: { status: 429, retryAfter: 1 } } }),
  '400': (m) => ({ falhas: { [m]: { status: 400 } } }),
  '500': (m) => ({ falhas: { [m]: { status: 500 } } }),
  'json inválido': () => ({ jsonInvalido: true }),
  'conexão derrubada': () => ({ derrubar: true }),
}

function tudoQueOErroCarrega(erro: unknown): string {
  const e = erro as Error & { cause?: unknown }
  return [
    e.message,
    e.stack ?? '',
    String(e.cause ?? ''),
    JSON.stringify(e, Object.getOwnPropertyNames(e)),
    String(e),
  ].join('\n')
}

describe('o token nunca aparece em erro, pilha, causa nem console', () => {
  for (const [metodo, chamar] of Object.entries(METODOS)) {
    for (const [nome, configurar] of Object.entries(FALHAS)) {
      it(`${metodo} com falha ${nome}`, async () => {
        const saidas: string[] = []
        for (const canal of ['error', 'info', 'warn', 'log'] as const) {
          vi.spyOn(console, canal).mockImplementation((...args: unknown[]) => void saidas.push(args.map(String).join(' ')))
        }
        falso.configurar(configurar(metodo))
        const erro = await chamar().then(
          () => null,
          (e: unknown) => e,
        )
        expect(erro).toBeInstanceOf(ErroDeAplicacao)
        const texto = tudoQueOErroCarrega(erro) + '\n' + saidas.join('\n')
        expect(texto).not.toContain(TOKEN_VALIDO)
        expect(texto).not.toContain(SEGREDO_DO_TOKEN)
        expect(texto).not.toMatch(/bot\d{5,}:/)
        expect((erro as ErroDeAplicacao).message).toMatch(/[A-Za-zÀ-ú]/)
        expect((erro as ErroDeAplicacao).codigo).toMatch(/^telegram_/)
      })
    }
  }

  it('com o servidor fora do ar (conexão recusada) o erro é telegram_indisponivel, com mensagem fixa e sem o endereço', async () => {
    const fechado = falso.url
    await falso.fechar()
    process.env.TELEGRAM_API_BASE = fechado
    falso = await iniciarTelegramFalso()
    await falso.fechar()
    process.env.TELEGRAM_API_BASE = fechado
    const erro = (await getMe(TOKEN_VALIDO).catch((e) => e)) as ErroDeAplicacao
    expect(erro.codigo).toBe('telegram_indisponivel')
    expect(erro.message).toBe('O Telegram está indisponível no momento. Tente de novo em instantes.')
    expect(tudoQueOErroCarrega(erro)).not.toMatch(/127\.0\.0\.1|ECONNREFUSED|fetch failed/)
  })
})

describe('redigirToken', () => {
  it('troca o token dado e qualquer bot dois-pontos segredo por bot oculto', () => {
    const url = 'POST https://api.telegram.org/bot' + TOKEN_VALIDO + '/getMe falhou'
    expect(redigirToken(url, TOKEN_VALIDO)).not.toContain(SEGREDO_DO_TOKEN)
    expect(redigirToken(url)).toBe('POST https://api.telegram.org/bot<oculto>/getMe falhou')
    expect(redigirToken('sem token aqui', TOKEN_VALIDO)).toBe('sem token aqui')
    expect(redigirToken('token solto ' + TOKEN_VALIDO, TOKEN_VALIDO)).toBe('token solto <oculto>')
  })
})
