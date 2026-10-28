/**
 * T-05.02 (FT-07, PR-14, PR-65, PR-69): as ações de servidor do canal Telegram.
 * Só as bordas do framework são trocadas (sessão, redirecionamento, revalidação);
 * o serviço, o banco e o Telegram simulado são os reais. Nenhum retorno leva o
 * token, o texto cifrado, o segredo nem o hash.
 */
import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { criarUsuario, limparBanco } from './ajuda'
import { iniciarTelegramFalso, TOKEN_VALIDO, TOKEN_DESCONHECIDO, type TelegramFalso } from './apoio/telegram-falso'

let usuarioDaSessao: Awaited<ReturnType<typeof criarUsuario>> | null = null
const revalidatePath = vi.fn()

vi.mock('@/app/sessao-servidor', () => ({
  exigirUsuario: async () => {
    if (!usuarioDaSessao) throw new Error('sem sessão')
    return usuarioDaSessao
  },
  exigirUsuarioAdmin: async () => usuarioDaSessao,
  gravarCookieDeSessao: async () => undefined,
  apagarCookieDeSessao: async () => undefined,
}))
vi.mock('next/navigation', () => ({
  redirect: (destino: string) => {
    throw Object.assign(new Error('NEXT_REDIRECT'), { destino })
  },
}))
vi.mock('next/cache', () => ({ revalidatePath: (caminho: string) => revalidatePath(caminho) }))

const {
  conectarTelegram,
  desconectarTelegram,
  pausarTelegram,
  retomarTelegram,
  verificarTelegram,
  salvarLimiteTelegram,
} = await import('@/app/acoes')

let falso: TelegramFalso
let agenteId: string
const original = { ...process.env }

const formulario = (campos: Record<string, string>) => {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) f.set(k, v)
  return f
}
const vazio = {}

beforeEach(async () => {
  revalidatePath.mockClear()
  await limparBanco()
  usuarioDaSessao = await criarUsuario()
  agenteId = (await prisma.agente.create({ data: { nome: 'Agente', modelo: 'm', criadoPorId: usuarioDaSessao.id } })).id
  falso = await iniciarTelegramFalso()
  process.env.TELEGRAM_API_BASE = falso.url
  process.env.APP_URL = 'https://converse.exemplo.com'
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

async function segredosDoCanal(): Promise<string[]> {
  const c = await prisma.canalTelegram.findFirst()
  return c ? [TOKEN_VALIDO, TOKEN_VALIDO.split(':')[1] as string, c.tokenCifrado, c.segredoDoWebhookHash, falso.webhook?.secret_token ?? ''] : [TOKEN_VALIDO]
}

describe('conectarTelegram', () => {
  it('conecta, revalida a aba e devolve só uma frase, sem nenhum segredo', async () => {
    const r = await conectarTelegram(vazio, formulario({ id: agenteId, token: `  ${TOKEN_VALIDO}  ` }))
    expect(r.erro).toBeUndefined()
    expect(r.sucesso).toMatch(/@bot_de_teste_bot/)
    expect(revalidatePath).toHaveBeenCalledWith(`/agentes/${agenteId}/canais`)
    expect((await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })).botUsername).toBe('bot_de_teste_bot')
    for (const segredo of await segredosDoCanal()) expect(JSON.stringify(r)).not.toContain(segredo)
  })

  it('token que o Telegram recusa volta em português sem repetir o token digitado', async () => {
    const r = await conectarTelegram(vazio, formulario({ id: agenteId, token: TOKEN_DESCONHECIDO }))
    expect(r.erro).toMatch(/token/i)
    expect(JSON.stringify(r)).not.toContain(TOKEN_DESCONHECIDO)
    expect(JSON.stringify(r)).not.toContain(TOKEN_DESCONHECIDO.split(':')[1] as string)
    expect(await prisma.canalTelegram.count()).toBe(0)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('token malformado e campo ausente dão erro sem repetir o que foi digitado', async () => {
    const r = await conectarTelegram(vazio, formulario({ id: agenteId, token: 'meu-segredo-qualquer' }))
    expect(r.erro).toBeTruthy()
    expect(JSON.stringify(r)).not.toContain('meu-segredo-qualquer')
    expect((await conectarTelegram(vazio, formulario({ id: agenteId }))).erro).toBeTruthy()
  })

  it('sem APP_URL HTTPS conecta diretamente sem exigir túnel', async () => {
    delete process.env.APP_URL
    const r = await conectarTelegram(vazio, formulario({ id: agenteId, token: TOKEN_VALIDO }))
    expect(r.erro).toBeUndefined()
    expect(r.sucesso).toBeTruthy()
    expect((await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })).webhookUrl).toBe('')
  })

  it('sem sessão recusa, não muda nada e o que vai ao console não leva o token', async () => {
    usuarioDaSessao = null
    const console_ = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const r = await conectarTelegram(vazio, formulario({ id: agenteId, token: TOKEN_VALIDO }))
    expect(r.erro).toBeTruthy()
    expect(await prisma.canalTelegram.count()).toBe(0)
    expect(falso.requisicoes).toHaveLength(0)
    expect(JSON.stringify(console_.mock.calls)).not.toContain(TOKEN_VALIDO)
  })
})

describe('pausar, retomar e desconectar', () => {
  beforeEach(async () => {
    await conectarTelegram(vazio, formulario({ id: agenteId, token: TOKEN_VALIDO }))
    revalidatePath.mockClear()
  })

  it('pausar e retomar mudam o canal e revalidam a aba', async () => {
    expect((await pausarTelegram(vazio, formulario({ id: agenteId }))).sucesso).toMatch(/paus/i)
    expect((await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })).ativo).toBe(false)
    expect((await retomarTelegram(vazio, formulario({ id: agenteId }))).sucesso).toMatch(/retom/i)
    expect((await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })).ativo).toBe(true)
    expect(revalidatePath).toHaveBeenCalledWith(`/agentes/${agenteId}/canais`)
  })

  it('desconectar apaga o canal; se o Telegram não confirmar, avisa sem deixar de apagar', async () => {
    falso.configurar({ falhas: { deleteWebhook: { status: 500 } } })
    const r = await desconectarTelegram(vazio, formulario({ id: agenteId }))
    expect(r.sucesso).toMatch(/desconectado/i)
    expect(r.sucesso).toMatch(/não confirmou|Telegram/i)
    expect(await prisma.canalTelegram.count()).toBe(0)
  })

  it('desconectar agente sem canal devolve erro', async () => {
    await desconectarTelegram(vazio, formulario({ id: agenteId }))
    expect((await desconectarTelegram(vazio, formulario({ id: agenteId }))).erro).toMatch(/conectado/i)
  })
})

describe('verificarTelegram', () => {
  beforeEach(async () => {
    await conectarTelegram(vazio, formulario({ id: agenteId, token: TOKEN_VALIDO }))
  })

  it('webhook correto dá sucesso', async () => {
    const r = await verificarTelegram(vazio, formulario({ id: agenteId }))
    expect(r.erro).toBeUndefined()
    expect(r.sucesso).toMatch(/correto|em ordem|confere/i)
  })

  it('endereço registrado diferente dá erro com a orientação de reconectar, e pendentes aparecem', async () => {
    falso.configurar({ webhookInfo: { url: 'https://outro.exemplo.com/h', pending_update_count: 4 } })
    const r = await verificarTelegram(vazio, formulario({ id: agenteId }))
    expect(r.erro).toMatch(/diferente/i)
    expect(r.erro).toMatch(/reconect/i)
    expect(r.erro).toMatch(/4/)
  })

  it('o último erro de entrega que o Telegram reporta aparece, sem token', async () => {
    falso.configurar({ webhookInfo: { last_error_message: 'Wrong response from the webhook: 500' } })
    const r = await verificarTelegram(vazio, formulario({ id: agenteId }))
    expect(`${r.sucesso ?? ''}${r.erro ?? ''}`).toContain('Wrong response from the webhook: 500')
  })
})

describe('salvarLimiteTelegram', () => {
  beforeEach(async () => {
    await conectarTelegram(vazio, formulario({ id: agenteId, token: TOKEN_VALIDO }))
  })

  it('salva um limite válido e recusa o inválido com a frase do serviço', async () => {
    expect((await salvarLimiteTelegram(vazio, formulario({ id: agenteId, limiteDiario: '250' }))).sucesso).toMatch(/limite/i)
    expect((await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })).limiteDiario).toBe(250)
    const ruim = await salvarLimiteTelegram(vazio, formulario({ id: agenteId, limiteDiario: '0' }))
    expect(ruim.erro).toMatch(/inteiro/)
    expect((await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })).limiteDiario).toBe(250)
  })
})

describe('nenhuma ação devolve segredo', () => {
  it('todos os retornos, em sucesso e em erro, ficam livres de token, cifrado, segredo e hash', async () => {
    const retornos = [
      await conectarTelegram(vazio, formulario({ id: agenteId, token: TOKEN_VALIDO })),
      await verificarTelegram(vazio, formulario({ id: agenteId })),
      await pausarTelegram(vazio, formulario({ id: agenteId })),
      await retomarTelegram(vazio, formulario({ id: agenteId })),
      await salvarLimiteTelegram(vazio, formulario({ id: agenteId, limiteDiario: '9' })),
    ]
    const segredos = await segredosDoCanal()
    falso.configurar({ falhas: { getWebhookInfo: { status: 401 } } })
    retornos.push(await verificarTelegram(vazio, formulario({ id: agenteId })))
    retornos.push(await desconectarTelegram(vazio, formulario({ id: agenteId })))
    for (const r of retornos) for (const segredo of segredos) expect(JSON.stringify(r)).not.toContain(segredo)
  })
})
