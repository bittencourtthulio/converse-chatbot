/**
 * T-01.01 (FT-07): as tabelas `canais_telegram` e `atualizacoes_telegram` (PR-63)
 * nascem de migration aditiva; o canal é 1:1 com o agente, o bot é único e o
 * par (canal, updateId) é único para o dedupe.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { criarAdmin, limparBanco } from './ajuda'

async function criarAgente(nome = 'Agente do Telegram') {
  const admin = await criarAdmin()
  return prisma.agente.create({ data: { nome, modelo: 'openai/gpt-4o-mini', criadoPorId: admin.id } })
}

const dadosDoCanal = (agenteId: string, botId = '111') => ({
  agenteId,
  tokenCifrado: 'v1:a:b:c',
  botId,
  botUsername: 'meu_bot',
  botNome: 'Meu Bot',
  segredoDoWebhookHash: 'a'.repeat(64),
  webhookUrl: 'https://exemplo.com/api/telegram/x/webhook',
})

describe('modelo CanalTelegram', () => {
  beforeEach(limparBanco)
  afterAll(limparBanco)

  it('criado com os campos obrigatórios, vale os padrões do PR-63', async () => {
    const agente = await criarAgente()
    const canal = await prisma.canalTelegram.create({ data: dadosDoCanal(agente.id) })
    expect(canal).toMatchObject({
      agenteId: agente.id,
      ativo: true,
      limiteDiario: 500,
      ultimoErro: null,
      ultimoErroEm: null,
      ultimaMensagemEm: null,
    })
    expect(canal.conectadoEm).toBeInstanceOf(Date)
  })

  it('um agente só tem um canal e um bot só serve a um agente', async () => {
    const a = await criarAgente('A')
    const b = await criarAgente('B')
    await prisma.canalTelegram.create({ data: dadosDoCanal(a.id, '111') })
    await expect(prisma.canalTelegram.create({ data: dadosDoCanal(a.id, '222') })).rejects.toThrow()
    await expect(prisma.canalTelegram.create({ data: dadosDoCanal(b.id, '111') })).rejects.toThrow()
  })

  it('o par canal e updateId é único; outro canal pode repetir o updateId', async () => {
    const a = await criarAgente('A')
    const b = await criarAgente('B')
    const ca = await prisma.canalTelegram.create({ data: dadosDoCanal(a.id, '111') })
    const cb = await prisma.canalTelegram.create({ data: dadosDoCanal(b.id, '222') })
    await prisma.atualizacaoTelegram.create({ data: { canalId: ca.id, updateId: '900' } })
    await expect(prisma.atualizacaoTelegram.create({ data: { canalId: ca.id, updateId: '900' } })).rejects.toThrow()
    await expect(prisma.atualizacaoTelegram.create({ data: { canalId: cb.id, updateId: '900' } })).resolves.toBeTruthy()
  })

  it('as atualizações somem com o canal e o canal some com o agente', async () => {
    const agente = await criarAgente()
    const canal = await prisma.canalTelegram.create({ data: dadosDoCanal(agente.id) })
    await prisma.atualizacaoTelegram.create({ data: { canalId: canal.id, updateId: '1' } })
    await prisma.agente.delete({ where: { id: agente.id } })
    expect(await prisma.canalTelegram.count()).toBe(0)
    expect(await prisma.atualizacaoTelegram.count()).toBe(0)
  })

  it('a migration só acrescenta (sem DROP)', () => {
    const pasta = path.join(process.cwd(), 'prisma/migrations')
    const nome = readdirSync(pasta).find((n) => n.endsWith('_canal_telegram'))
    expect(nome).toBeDefined()
    const sql = readFileSync(path.join(pasta, nome as string, 'migration.sql'), 'utf8')
    expect(sql).not.toMatch(/\bDROP\b/i)
    expect(sql).toMatch(/CREATE TABLE "canais_telegram"/)
    expect(sql).toMatch(/CREATE TABLE "atualizacoes_telegram"/)
  })
})
