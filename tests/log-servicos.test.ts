/**
 * Os eventos de log dos serviços do Telegram e do canal (FT-11, PR-92): saem pelo log estruturado,
 * com nível, nome do evento, identificadores e o código de correlação, sem a mensagem do erro, sem
 * token e sem texto da conversa.
 */
import { afterAll, afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { prisma } from '@/lib/prisma'
import { criarAdmin, limparBanco } from './ajuda'
import { iniciarTelegramFalso, TOKEN_VALIDO, updateDeTexto, type TelegramFalso } from './apoio/telegram-falso'
import { aoAlterarCanal, conectar, pausar } from '@/servicos/canal-telegram'
import { tratarWebhook } from '@/servicos/telegram-webhook'

vi.mock('@/servicos/telegram-atendimento', () => ({
  atenderUpdate: vi.fn(async () => {
    throw new Error(`falha com a conversa privada e o token ${'123456789:AAHteste_token-000000000000000000000'}`)
  }),
}))

let falso: TelegramFalso
let agenteId: string
let segredo: string
let autor: Awaited<ReturnType<typeof criarAdmin>>
let erro: MockInstance<typeof console.error>
let info: MockInstance<typeof console.info>
const original = { ...process.env }

beforeEach(async () => {
  await limparBanco()
  autor = await criarAdmin()
  agenteId = (await prisma.agente.create({ data: { nome: 'Agente', modelo: 'm', criadoPorId: autor.id } })).id
  falso = await iniciarTelegramFalso()
  process.env.TELEGRAM_API_BASE = falso.url
  process.env.APP_URL = 'https://converse.exemplo.com'
  await conectar(autor, agenteId, TOKEN_VALIDO)
  segredo = falso.webhook?.secret_token as string
  erro = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  info = vi.spyOn(console, 'info').mockImplementation(() => undefined)
})
afterEach(async () => {
  vi.restoreAllMocks()
  await falso.fechar()
  for (const chave of ['TELEGRAM_API_BASE', 'APP_URL']) {
    if (original[chave] === undefined) delete process.env[chave]
    else process.env[chave] = original[chave]
  }
})
afterAll(limparBanco)

const linhas = (espiao: MockInstance<(...args: never[]) => void>) =>
  espiao.mock.calls.map((c) => JSON.parse(String((c as unknown as [string])[0])) as Record<string, unknown>)

describe('webhook do Telegram', () => {
  it('update ilegível vira a linha info telegram_update_ilegivel com o agente e sem o corpo', async () => {
    const r = await tratarWebhook({ agenteId, segredo, lerCorpo: async () => '{"isto não é json com texto secreto' })
    expect(r.status).toBe(200)
    const l = linhas(info).find((x) => x.msg === 'telegram_update_ilegivel')!
    expect(l).toMatchObject({ nivel: 'info', agenteId, motivo: 'json' })
    expect(JSON.stringify(l)).not.toContain('texto secreto')
  })

  it('falha do atendimento vira a linha erro com correlação, o nome do erro e nada da mensagem', async () => {
    const r = await tratarWebhook({ agenteId, segredo, lerCorpo: async () => JSON.stringify(updateDeTexto({ updateId: 77, chatId: 5, texto: 'oi' })) })
    expect(r.status).toBe(200)
    await r.depois!()
    const l = linhas(erro).find((x) => x.msg === 'telegram_atendimento_falhou')!
    expect(l).toMatchObject({ nivel: 'erro', agenteId, erro: 'Error' })
    expect(l.correlacao).toMatch(/^[0-9a-f]{8}$/)
    const texto = JSON.stringify(l)
    expect(texto).not.toContain('conversa privada')
    expect(texto).not.toContain(TOKEN_VALIDO)
  })
})

describe('canal do Telegram', () => {
  it('ouvinte que lança vira a linha erro ouvinte_do_canal_falhou e a ação segue', async () => {
    const parar = aoAlterarCanal(() => {
      throw new Error('falha do ouvinte com dado sensível')
    })
    await pausar(autor, agenteId)
    parar()
    const l = linhas(erro).find((x) => x.msg === 'ouvinte_do_canal_falhou')!
    expect(l).toMatchObject({ nivel: 'erro', agenteId })
    expect(JSON.stringify(l)).not.toContain('dado sensível')
    expect((await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })).ativo).toBe(false)
  })
})
