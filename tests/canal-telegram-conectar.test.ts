/**
 * T-03.01 (FT-07): conectar o bot (PR-65) valida o token, confere o bot no
 * Telegram, registra o webhook com um segredo novo, grava o token cifrado e só o
 * hash do segredo, exige APP_URL HTTPS e nunca devolve segredo.
 */
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { createHash } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { decifrar } from '@/lib/cripto'
import { criarAdmin, limparBanco } from './ajuda'
import {
  iniciarTelegramFalso,
  TOKEN_VALIDO,
  TOKEN_OUTRO,
  TOKEN_DESCONHECIDO,
  type TelegramFalso,
} from './apoio/telegram-falso'
import { conectar, estado, urlDoWebhook } from '@/servicos/canal-telegram'
import type { UsuarioAutenticado } from '@/servicos/autenticacao'

let falso: TelegramFalso
let autor: UsuarioAutenticado
let agenteId: string
const ambienteOriginal = { ...process.env }

const sha256 = (texto: string) => createHash('sha256').update(texto).digest('hex')

async function novoAgente(nome = 'Agente do Telegram') {
  return (await prisma.agente.create({ data: { nome, modelo: 'openai/gpt-4o-mini', criadoPorId: autor.id } })).id
}

beforeEach(async () => {
  await limparBanco()
  autor = await criarAdmin()
  agenteId = await novoAgente()
  falso = await iniciarTelegramFalso()
  process.env.TELEGRAM_API_BASE = falso.url
  process.env.APP_URL = 'https://converse.exemplo.com'
})
afterEach(async () => {
  await falso.fechar()
  for (const chave of ['TELEGRAM_API_BASE', 'APP_URL', 'TELEGRAM_PERMITIR_URL_NAO_HTTPS', 'ENCRYPTION_KEY', 'NODE_ENV']) {
    if (ambienteOriginal[chave] === undefined) delete process.env[chave]
    else process.env[chave] = ambienteOriginal[chave]
  }
})
afterAll(limparBanco)

async function erroDe(promessa: Promise<unknown>) {
  return (await promessa.then(
    () => null,
    (e: unknown) => e,
  )) as { codigo: string; status: number; message: string } | null
}

describe('conectar', () => {
  it('grava o canal com token cifrado, hash do segredo que o Telegram recebeu e a URL certa do webhook', async () => {
    const r = await conectar(autor, agenteId, TOKEN_VALIDO)
    const canal = await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })

    expect(canal.tokenCifrado).toMatch(/^v1:/)
    expect(canal.tokenCifrado).not.toContain(TOKEN_VALIDO)
    expect(decifrar(canal.tokenCifrado)).toBe(TOKEN_VALIDO)

    const segredoEnviado = falso.webhook?.secret_token as string
    expect(segredoEnviado).toMatch(/^[0-9a-f]{64}$/)
    expect(canal.segredoDoWebhookHash).toBe(sha256(segredoEnviado))
    expect(canal.segredoDoWebhookHash).not.toBe(segredoEnviado)

    const url = `https://converse.exemplo.com/api/telegram/${agenteId}/webhook`
    expect(canal.webhookUrl).toBe(url)
    expect(urlDoWebhook(agenteId)).toBe(url)
    expect(falso.webhook).toMatchObject({ url, allowed_updates: ['message'] })
    expect(canal).toMatchObject({ botId: '123456789', botUsername: 'bot_de_teste_bot', botNome: 'Bot de Teste', ativo: true, limiteDiario: 500 })
    expect(r.estado).toBe('conectado')
  })

  it('o estado devolve o bot e nunca o token, o texto cifrado, o segredo nem o hash', async () => {
    await conectar(autor, agenteId, TOKEN_VALIDO)
    const canal = await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })
    const e = await estado(autor, agenteId)
    expect(e).toMatchObject({
      conectado: true,
      ativo: true,
      estado: 'conectado',
      bot: { username: 'bot_de_teste_bot', nome: 'Bot de Teste', url: 'https://t.me/bot_de_teste_bot' },
      limiteDiario: 500,
    })
    const texto = JSON.stringify(e)
    for (const proibido of [TOKEN_VALIDO, TOKEN_VALIDO.split(':')[1] as string, canal.tokenCifrado, canal.segredoDoWebhookHash, falso.webhook?.secret_token as string]) {
      expect(texto).not.toContain(proibido)
    }
  })

  it('agente sem canal tem estado nulo', async () => {
    expect(await estado(autor, agenteId)).toBeNull()
  })

  it('recusa token malformado sem chamar o Telegram e sem repetir o que foi digitado', async () => {
    for (const ruim of ['', '   ', 'abc', 'meu-token-secreto-errado', 123, null, undefined]) {
      const e = await erroDe(conectar(autor, agenteId, ruim))
      expect(e?.codigo).toBe('entrada_invalida')
      expect(e?.message).not.toContain('meu-token-secreto-errado')
    }
    expect(falso.requisicoes).toHaveLength(0)
    expect(await prisma.canalTelegram.count()).toBe(0)
  })

  it('token que o Telegram não conhece: telegram_token_invalido e nada gravado', async () => {
    const e = await erroDe(conectar(autor, agenteId, TOKEN_DESCONHECIDO))
    expect(e?.codigo).toBe('telegram_token_invalido')
    expect(await prisma.canalTelegram.count()).toBe(0)
    expect(falso.requisicoes.map((r) => r.metodo)).toEqual(['getMe'])
  })

  it('Telegram que recusa o webhook: telegram_webhook_recusado e nada gravado', async () => {
    falso.configurar({ falhas: { setWebhook: { status: 400 } } })
    const e = await erroDe(conectar(autor, agenteId, TOKEN_VALIDO))
    expect(e?.codigo).toBe('telegram_webhook_recusado')
    expect(await prisma.canalTelegram.count()).toBe(0)
  })

  it('exige APP_URL HTTPS: ausente e http dão telegram_url_nao_https, antes de qualquer chamada ao Telegram', async () => {
    delete process.env.APP_URL
    const sem = await erroDe(conectar(autor, agenteId, TOKEN_VALIDO))
    expect(sem?.codigo).toBe('telegram_url_nao_https')
    expect(sem?.message).toMatch(/HTTPS/)
    expect(sem?.message).toMatch(/túnel/i)
    expect(sem?.message).toMatch(/APP_URL/)

    process.env.APP_URL = 'http://localhost:3000'
    expect((await erroDe(conectar(autor, agenteId, TOKEN_VALIDO)))?.codigo).toBe('telegram_url_nao_https')
    process.env.APP_URL = 'isto não é url'
    expect((await erroDe(conectar(autor, agenteId, TOKEN_VALIDO)))?.codigo).toBe('telegram_url_nao_https')
    expect(falso.requisicoes).toHaveLength(0)
  })

  it('TELEGRAM_PERMITIR_URL_NAO_HTTPS=1 libera http fora de produção e é ignorada em produção', async () => {
    process.env.APP_URL = 'http://localhost:3000'
    process.env.TELEGRAM_PERMITIR_URL_NAO_HTTPS = '1'
    falso.configurar({ exigirHttps: false })
    await expect(conectar(autor, agenteId, TOKEN_VALIDO)).resolves.toBeTruthy()
    expect((await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })).webhookUrl).toBe(`http://localhost:3000/api/telegram/${agenteId}/webhook`)

    await prisma.canalTelegram.deleteMany()
    Object.assign(process.env, { NODE_ENV: 'production' })
    expect((await erroDe(conectar(autor, agenteId, TOKEN_VALIDO)))?.codigo).toBe('telegram_url_nao_https')
  })

  it('o mesmo bot em outro agente é recusado com telegram_bot_em_uso, dizendo qual agente o usa', async () => {
    await conectar(autor, agenteId, TOKEN_VALIDO)
    const outro = await novoAgente('Segundo agente')
    const e = await erroDe(conectar(autor, outro, TOKEN_VALIDO))
    expect(e?.codigo).toBe('telegram_bot_em_uso')
    expect(e?.status).toBe(409)
    expect(e?.message).toContain('Agente do Telegram')
    expect(await prisma.canalTelegram.count()).toBe(1)
  })

  it('reconectar o mesmo agente com outro token troca o bot, gira o segredo e solta o webhook do bot antigo', async () => {
    await conectar(autor, agenteId, TOKEN_VALIDO)
    const antes = await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })
    await prisma.canalTelegram.update({ where: { agenteId }, data: { ultimaMensagemEm: new Date(), limiteDiario: 77 } })
    falso.requisicoes.length = 0

    await conectar(autor, agenteId, TOKEN_OUTRO)
    const depois = await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })
    expect(depois.id).toBe(antes.id)
    expect(depois.botId).toBe('987654321')
    expect(depois.segredoDoWebhookHash).not.toBe(antes.segredoDoWebhookHash)
    expect(decifrar(depois.tokenCifrado)).toBe(TOKEN_OUTRO)
    expect(depois.ultimaMensagemEm).toBeNull()
    expect(depois.limiteDiario).toBe(77)
    expect(falso.requisicoes.some((r) => r.metodo === 'deleteWebhook' && r.token === TOKEN_VALIDO)).toBe(true)
  })

  it('reconectar o mesmo token gira o segredo e o hash acompanha o novo segredo', async () => {
    await conectar(autor, agenteId, TOKEN_VALIDO)
    const antes = await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })
    const segredoAntes = falso.webhook?.secret_token
    await conectar(autor, agenteId, TOKEN_VALIDO)
    const depois = await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })
    expect(falso.webhook?.secret_token).not.toBe(segredoAntes)
    expect(depois.segredoDoWebhookHash).toBe(sha256(falso.webhook?.secret_token as string))
    expect(depois.segredoDoWebhookHash).not.toBe(antes.segredoDoWebhookHash)
    expect(await prisma.canalTelegram.count()).toBe(1)
  })

  it('sem ENCRYPTION_KEY falha antes de registrar o webhook', async () => {
    delete process.env.ENCRYPTION_KEY
    const e = await erroDe(conectar(autor, agenteId, TOKEN_VALIDO))
    expect(e?.codigo).toBe('configuracao_invalida')
    expect(falso.webhook).toBeNull()
    expect(await prisma.canalTelegram.count()).toBe(0)
  })

  it('agente inexistente dá 404 e falta de autor dá 401', async () => {
    expect((await erroDe(conectar(autor, 'nao-existe', TOKEN_VALIDO)))?.status).toBe(404)
    expect((await erroDe(conectar(undefined as unknown as UsuarioAutenticado, agenteId, TOKEN_VALIDO)))?.status).toBe(401)
    expect(falso.requisicoes).toHaveLength(0)
  })
})
