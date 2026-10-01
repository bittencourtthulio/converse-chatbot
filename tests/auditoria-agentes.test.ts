// T-02.06 (FT-10, PR-19, PR-87): a exclusão de agente grava agente_excluido na MESMA
// transação, com o nome do agente e as contagens, nunca instrução nem texto de conversa.
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { excluir } from '@/servicos/agentes'
import { criarUsuario, limparBanco } from './ajuda'
import { criarConversaDeTeste } from './apoio/historico'

const falha = vi.hoisted(() => ({ ligada: false }))
vi.mock('@/servicos/auditoria', async (original) => {
  const real = await original<typeof import('@/servicos/auditoria')>()
  return {
    ...real,
    registrar: (...argumentos: Parameters<typeof real.registrar>) =>
      falha.ligada ? Promise.reject(new Error('auditoria fora do ar')) : real.registrar(...argumentos),
  }
})

beforeEach(async () => {
  falha.ligada = false
  await limparBanco()
})
afterAll(limparBanco)

async function agenteComConteudo(nome = 'Atendimento Loja') {
  const dono = await criarUsuario()
  const agente = await prisma.agente.create({
    data: { nome, modelo: 'openai/gpt-4o-mini', instrucoes: 'INSTRUCAO SECRETA DA EMPRESA', criadoPorId: dono.id },
  })
  await criarConversaDeTeste({ agenteId: agente.id, canal: 'widget', mensagens: [{ papel: 'user', conteudo: 'texto privado da conversa' }] })
  await criarConversaDeTeste({ agenteId: agente.id, canal: 'telegram', mensagens: [{ papel: 'user', conteudo: 'outro texto privado' }] })
  await prisma.fonte.create({ data: { agenteId: agente.id, tipo: 'texto', titulo: 'Manual', tamanhoBytes: 10 } })
  return { dono, agente }
}

describe('excluir agente (integração: mesma transação)', () => {
  it('grava agente_excluido com o rótulo de quem excluiu e o agente deixa de existir', async () => {
    const { agente } = await agenteComConteudo()
    const quem = await criarUsuario()
    await excluir(quem, agente.id)
    expect(await prisma.agente.count()).toBe(0)
    const [r] = await prisma.registroDeAuditoria.findMany()
    expect(r).toMatchObject({
      acao: 'agente_excluido',
      alvoTipo: 'agente',
      alvoId: agente.id,
      usuarioId: quem.id,
      usuarioRotulo: `${quem.nome} <${quem.email}>`,
    })
  })

  it('com a auditoria falhando o agente continua existindo, com as conversas e as fontes', async () => {
    const { agente } = await agenteComConteudo()
    const quem = await criarUsuario()
    falha.ligada = true
    await expect(excluir(quem, agente.id)).rejects.toThrow('auditoria fora do ar')
    expect(await prisma.agente.count()).toBe(1)
    expect(await prisma.conversa.count()).toBe(2)
    expect(await prisma.fonte.count()).toBe(1)
    expect(await prisma.registroDeAuditoria.count()).toBe(0)
  })

  it('agente inexistente continua dando 404 e não grava registro', async () => {
    const quem = await criarUsuario()
    await expect(excluir(quem, 'nao-existe')).rejects.toMatchObject({ status: 404 })
    expect(await prisma.registroDeAuditoria.count()).toBe(0)
  })
})

describe('excluir agente (funcional: o que vai à trilha)', () => {
  it('um agente com duas conversas e uma fonte grava o nome e as contagens 2 e 1, sem instrução nem texto', async () => {
    const { agente } = await agenteComConteudo('Atendimento Loja')
    await excluir(await criarUsuario(), agente.id)
    const [r] = await prisma.registroDeAuditoria.findMany()
    expect(JSON.parse(r!.detalhes)).toEqual({ nome: 'Atendimento Loja', conversas: 2, fontes: 1 })
    expect(r!.detalhes).not.toMatch(/SECRETA|privado/)
  })
})
