// T-01.02 (FT-10): as fixtures de conversa antiga e de registro de auditoria, usadas pelos
// testes de expurgo, titular e auditoria.
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { limparBanco } from './ajuda'
import { criarAgenteDeTeste } from './apoio/historico'
import { criarConversasEmLote, criarRegistroDeTeste } from './apoio/privacidade'

beforeEach(limparBanco)

describe('fixtures de conversa antiga (integração)', () => {
  it('grava o instante exato de atualização e de criação, sem o @updatedAt sobrescrever', async () => {
    const agente = await criarAgenteDeTeste()
    const instante = new Date('2025-01-02T03:04:05.678Z')
    const [id] = await criarConversasEmLote({
      agenteId: agente.id,
      canal: 'widget',
      quantidade: 1,
      atualizadoEm: () => instante,
    })
    const conversa = await prisma.conversa.findUniqueOrThrow({ where: { id: id as string } })
    expect(conversa.atualizadoEm.toISOString()).toBe(instante.toISOString())
    expect(conversa.criadoEm.toISOString()).toBe(instante.toISOString())
    const mensagens = await prisma.mensagem.findMany({ where: { conversaId: conversa.id } })
    expect(mensagens).toHaveLength(2)
  })

  it('a cascata do agente apaga conversas e mensagens do lote', async () => {
    const agente = await criarAgenteDeTeste()
    await criarConversasEmLote({ agenteId: agente.id, canal: 'telegram', quantidade: 5 })
    expect(await prisma.mensagem.count()).toBe(10)
    await prisma.agente.delete({ where: { id: agente.id } })
    expect(await prisma.conversa.count()).toBe(0)
    expect(await prisma.mensagem.count()).toBe(0)
  })

  it('grava um registro de auditoria com quando explícito e rótulo', async () => {
    const quando = new Date('2024-05-06T07:08:09.000Z')
    const r = await criarRegistroDeTeste({ acao: 'usuario_criado', quando })
    const lido = await prisma.registroDeAuditoria.findUniqueOrThrow({ where: { id: r.id } })
    expect(lido.quando.toISOString()).toBe(quando.toISOString())
    expect(lido.usuarioRotulo).toContain('<')
  })
})

describe('fixtures de conversa antiga (funcional)', () => {
  it('dez conversas de canais e identificadores distintos são contadas por canal e identificador', async () => {
    const agente = await criarAgenteDeTeste()
    await criarConversasEmLote({ agenteId: agente.id, canal: 'widget', quantidade: 4, identificador: () => 'visitanteAAAAAAAA0001' })
    await criarConversasEmLote({ agenteId: agente.id, canal: 'widget', quantidade: 3, identificador: () => 'visitanteBBBBBBBB0002' })
    await criarConversasEmLote({ agenteId: agente.id, canal: 'telegram', quantidade: 3, identificador: (i) => String(500 + i) })
    expect(await prisma.conversa.count()).toBe(10)
    expect(await prisma.conversa.count({ where: { canal: 'widget', identificadorExterno: 'visitanteAAAAAAAA0001' } })).toBe(4)
    expect(await prisma.conversa.count({ where: { canal: 'widget' } })).toBe(7)
    expect(await prisma.conversa.count({ where: { canal: 'telegram' } })).toBe(3)
    expect(await prisma.mensagem.count()).toBe(20)
  })

  it('aceita lote de 1230 conversas com datas distintas', async () => {
    const agente = await criarAgenteDeTeste()
    const base = Date.UTC(2025, 0, 1)
    const ids = await criarConversasEmLote({
      agenteId: agente.id,
      canal: 'widget',
      quantidade: 1230,
      atualizadoEm: (i) => new Date(base + i * 1000),
      mensagensPorConversa: 1,
    })
    expect(new Set(ids).size).toBe(1230)
    expect(await prisma.conversa.count()).toBe(1230)
    expect(await prisma.mensagem.count()).toBe(1230)
  })
})
