/**
 * Modelo de dados das conversas (FT-03): tabelas `conversas` e `mensagens`
 * criadas pela migration versionada, com exclusão em cascata a partir do
 * agente e da conversa.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { criarAdmin, limparBanco } from './ajuda'

async function agenteDeTeste() {
  const dono = await criarAdmin()
  return prisma.agente.create({
    data: { nome: 'Agente', modelo: 'openai/gpt-4o-mini', criadoPorId: dono.id },
  })
}

beforeEach(async () => {
  await limparBanco()
})
afterAll(async () => {
  await limparBanco()
})

describe('conversas e mensagens', () => {
  it('excluir o agente apaga as conversas e as mensagens dele', async () => {
    const agente = await agenteDeTeste()
    const conversa = await prisma.conversa.create({
      data: { agenteId: agente.id, canal: 'painel' },
    })
    await prisma.mensagem.createMany({
      data: [
        { conversaId: conversa.id, papel: 'user', conteudo: 'Oi' },
        { conversaId: conversa.id, papel: 'assistant', conteudo: 'Olá!' },
      ],
    })

    await prisma.agente.delete({ where: { id: agente.id } })

    expect(await prisma.conversa.count()).toBe(0)
    expect(await prisma.mensagem.count()).toBe(0)
  })

  it('excluir a conversa apaga só as mensagens dela', async () => {
    const agente = await agenteDeTeste()
    const a = await prisma.conversa.create({ data: { agenteId: agente.id, canal: 'painel' } })
    const b = await prisma.conversa.create({ data: { agenteId: agente.id, canal: 'widget' } })
    await prisma.mensagem.create({ data: { conversaId: a.id, papel: 'user', conteudo: 'a' } })
    await prisma.mensagem.create({ data: { conversaId: b.id, papel: 'user', conteudo: 'b' } })

    await prisma.conversa.delete({ where: { id: a.id } })

    const restantes = await prisma.mensagem.findMany()
    expect(restantes.map((m) => m.conteudo)).toEqual(['b'])
  })

  it('os campos opcionais ficam nulos e as datas são preenchidas', async () => {
    const agente = await agenteDeTeste()
    const conversa = await prisma.conversa.create({
      data: { agenteId: agente.id, canal: 'telegram', identificadorExterno: 'chat-1' },
    })
    expect(conversa.titulo).toBeNull()
    expect(conversa.criadoPorId).toBeNull()
    expect(conversa.identificadorExterno).toBe('chat-1')
    expect(conversa.criadoEm).toBeInstanceOf(Date)
    expect(conversa.atualizadoEm).toBeInstanceOf(Date)
    const mensagem = await prisma.mensagem.create({
      data: { conversaId: conversa.id, papel: 'assistant', conteudo: 'x' },
    })
    expect(mensagem.modelo).toBeNull()
    expect(mensagem.tokensEntrada).toBeNull()
    expect(mensagem.tokensSaida).toBeNull()
    expect(mensagem.fontes).toBeNull()
  })

  it('limparBanco apaga mensagens e conversas antes dos agentes', async () => {
    const agente = await agenteDeTeste()
    const conversa = await prisma.conversa.create({ data: { agenteId: agente.id, canal: 'painel' } })
    await prisma.mensagem.create({ data: { conversaId: conversa.id, papel: 'user', conteudo: 'x' } })
    await limparBanco()
    expect(await prisma.mensagem.count()).toBe(0)
    expect(await prisma.conversa.count()).toBe(0)
    expect(await prisma.agente.count()).toBe(0)
  })
})

describe('migration das conversas', () => {
  const pasta = path.join(process.cwd(), 'prisma/migrations')
  const nome = readdirSync(pasta).find((n) => n.endsWith('_conversas'))
  const sql = nome ? readFileSync(path.join(pasta, nome, 'migration.sql'), 'utf8') : ''

  it('existe, cria as duas tabelas e os dois índices pedidos', () => {
    expect(nome).toBeDefined()
    expect(sql).toContain('CREATE TABLE "conversas"')
    expect(sql).toContain('CREATE TABLE "mensagens"')
    expect(sql).toMatch(/CREATE INDEX[^\n]*"conversaId", "criadoEm"/)
    expect(sql).toMatch(/CREATE INDEX[^\n]*"agenteId", "atualizadoEm"/)
  })

  it('declara a cascata do agente e da conversa', () => {
    expect(sql).toMatch(/"conversas_agenteId_fkey"[^\n]*ON DELETE CASCADE/)
    expect(sql).toMatch(/"mensagens_conversaId_fkey"[^\n]*ON DELETE CASCADE/)
  })
})
