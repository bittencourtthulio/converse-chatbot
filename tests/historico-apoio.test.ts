// T-01.02: as fixtures de conversas dos três canais, usadas por todos os testes do histórico.
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { lerFontesGravadas } from '@/servicos/fontes-da-resposta'
import { criarAdmin, limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarConversaDeTeste, fonteDeTeste } from './apoio/historico'

beforeEach(limparBanco)

describe('fixtures de conversa (integração)', () => {
  it('grava conversa, mensagens e fontes e a cascata do agente não deixa sobra', async () => {
    const agente = await criarAgenteDeTeste()
    const conversa = await criarConversaDeTeste({
      agenteId: agente.id,
      canal: 'painel',
      mensagens: [
        { papel: 'user', conteudo: 'oi' },
        { papel: 'assistant', conteudo: 'olá [1]', fontes: [fonteDeTeste('Política de troca', 1)] },
      ],
    })
    expect(await prisma.mensagem.count({ where: { conversaId: conversa.id } })).toBe(2)
    await prisma.agente.delete({ where: { id: agente.id } })
    expect(await prisma.conversa.count()).toBe(0)
    expect(await prisma.mensagem.count()).toBe(0)
  })

  it('aceita instante, agente, canal e mensagens por parâmetro', async () => {
    const agente = await criarAgenteDeTeste({ nome: 'Suporte' })
    const quando = new Date('2026-03-10T15:00:00.000Z')
    const c = await criarConversaDeTeste({
      agenteId: agente.id,
      canal: 'widget',
      atualizadoEm: quando,
      mensagens: [{ papel: 'user', conteudo: 'x', criadoEm: quando }],
    })
    expect(c.atualizadoEm.toISOString()).toBe(quando.toISOString())
    const [m] = await prisma.mensagem.findMany({ where: { conversaId: c.id } })
    expect(m?.criadoEm.toISOString()).toBe(quando.toISOString())
    expect(agente.nome).toBe('Suporte')
  })
})

describe('fixtures de conversa (funcional)', () => {
  it('cada canal sai com o identificador externo e o título do seu canal', async () => {
    const admin = await criarAdmin()
    const agente = await criarAgenteDeTeste({ criadoPorId: admin.id })
    const painel = await criarConversaDeTeste({ agenteId: agente.id, canal: 'painel', criadoPorId: admin.id })
    const widget = await criarConversaDeTeste({ agenteId: agente.id, canal: 'widget' })
    const telegram = await criarConversaDeTeste({ agenteId: agente.id, canal: 'telegram' })
    expect(painel.criadoPorId).toBe(admin.id)
    expect(painel.identificadorExterno).toBeNull()
    expect(widget.identificadorExterno).toMatch(/^[A-Za-z0-9_-]{16,64}$/)
    expect(widget.criadoPorId).toBeNull()
    expect(telegram.identificadorExterno).toMatch(/^\d+$/)
    expect(telegram.titulo).toMatch(/^Telegram: /)
  })

  it('a resposta com fontes volta por lerFontesGravadas', async () => {
    const agente = await criarAgenteDeTeste()
    const c = await criarConversaDeTeste({
      agenteId: agente.id,
      canal: 'widget',
      mensagens: [{ papel: 'assistant', conteudo: 'r [1]', fontes: [fonteDeTeste('Manual', 2)] }],
    })
    const [m] = await prisma.mensagem.findMany({ where: { conversaId: c.id } })
    const fontes = lerFontesGravadas(m?.fontes)
    expect(fontes).toHaveLength(1)
    expect(fontes[0]).toMatchObject({ titulo: 'Manual', citada: true })
    expect(fontes[0]?.trechos[0]?.posicao).toBe(2)
  })
})
