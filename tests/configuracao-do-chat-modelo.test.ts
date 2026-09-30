/**
 * T-01.01 (FT-06): a tabela `configuracao_do_chat`, 1:1 com o agente (PR-55),
 * nasce de migration aditiva e vale os padrões quando só o agente é informado.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { criarAdmin, limparBanco } from './ajuda'

async function criarAgente() {
  const admin = await criarAdmin()
  return prisma.agente.create({
    data: { nome: 'Agente do chat', modelo: 'openai/gpt-4o-mini', criadoPorId: admin.id },
  })
}

describe('modelo ConfiguracaoDoChat', () => {
  beforeEach(limparBanco)
  afterAll(limparBanco)

  it('criada só com o agente, vale os padrões do PR-55', async () => {
    const agente = await criarAgente()
    const c = await prisma.configuracaoDoChat.create({ data: { agenteId: agente.id } })
    expect(c).toMatchObject({
      agenteId: agente.id,
      ativo: false,
      titulo: '',
      posicao: 'direita',
      avatar: 'iniciais',
      avisoDePrivacidade: '',
      avisoDePrivacidadeUrl: '',
      dominiosPermitidos: '[]',
      limiteDiario: 500,
      sugestoes: '[]',
    })
    expect(c.cor).toMatch(/^#[0-9a-f]{6}$/)
    expect(c.atualizadoEm).toBeInstanceOf(Date)
  })

  it('é 1:1 com o agente: uma segunda linha do mesmo agente é recusada', async () => {
    const agente = await criarAgente()
    await prisma.configuracaoDoChat.create({ data: { agenteId: agente.id } })
    await expect(prisma.configuracaoDoChat.create({ data: { agenteId: agente.id } })).rejects.toThrow()
  })

  it('some em cascata quando o agente é excluído', async () => {
    const agente = await criarAgente()
    await prisma.configuracaoDoChat.create({ data: { agenteId: agente.id } })
    await prisma.agente.delete({ where: { id: agente.id } })
    expect(await prisma.configuracaoDoChat.count()).toBe(0)
  })

  it('não aceita configuração de agente inexistente', async () => {
    await expect(prisma.configuracaoDoChat.create({ data: { agenteId: 'nao-existe' } })).rejects.toThrow()
  })
})

describe('migration da configuração do chat', () => {
  const pasta = path.join(process.cwd(), 'prisma/migrations')
  const nome = readdirSync(pasta).find((n) => n.endsWith('_configuracao_do_chat'))

  it('existe e só acrescenta (sem DROP)', () => {
    expect(nome).toBeDefined()
    const sql = readFileSync(path.join(pasta, nome as string, 'migration.sql'), 'utf8')
    expect(sql).toContain('CREATE TABLE "configuracao_do_chat"')
    expect(sql).not.toMatch(/\bDROP\b/i)
  })
})
