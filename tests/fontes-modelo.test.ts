/**
 * Modelo de dados da base de conhecimento (FT-04): tabelas `fontes` e
 * `trechos` da migration versionada, com exclusão em cascata a partir do
 * agente e da fonte, e o usuário criador saindo por SET NULL.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { criarAdmin, limparBanco } from './ajuda'

async function agenteDeTeste() {
  const dono = await criarAdmin()
  const agente = await prisma.agente.create({
    data: { nome: 'Agente', modelo: 'openai/gpt-4o-mini', criadoPorId: dono.id },
  })
  return { dono, agente }
}

beforeEach(async () => {
  await limparBanco()
})
afterAll(async () => {
  await limparBanco()
})

describe('fontes e trechos', () => {
  it('excluir o agente apaga as fontes e os trechos dele', async () => {
    const { agente } = await agenteDeTeste()
    const fonte = await prisma.fonte.create({
      data: { agenteId: agente.id, tipo: 'texto', titulo: 'Política', tamanhoBytes: 10 },
    })
    await prisma.trecho.createMany({
      data: [
        { fonteId: fonte.id, agenteId: agente.id, indice: 0, texto: 'a', caracteres: 1 },
        { fonteId: fonte.id, agenteId: agente.id, indice: 1, texto: 'b', caracteres: 1 },
      ],
    })

    await prisma.agente.delete({ where: { id: agente.id } })

    expect(await prisma.fonte.count()).toBe(0)
    expect(await prisma.trecho.count()).toBe(0)
  })

  it('excluir a fonte apaga só os trechos dela', async () => {
    const { agente } = await agenteDeTeste()
    const a = await prisma.fonte.create({
      data: { agenteId: agente.id, tipo: 'texto', titulo: 'A', tamanhoBytes: 1 },
    })
    const b = await prisma.fonte.create({
      data: { agenteId: agente.id, tipo: 'arquivo', titulo: 'B', tamanhoBytes: 1 },
    })
    await prisma.trecho.create({
      data: { fonteId: a.id, agenteId: agente.id, indice: 0, texto: 'a', caracteres: 1 },
    })
    await prisma.trecho.create({
      data: { fonteId: b.id, agenteId: agente.id, indice: 0, texto: 'b', caracteres: 1 },
    })

    await prisma.fonte.delete({ where: { id: a.id } })

    const restantes = await prisma.trecho.findMany()
    expect(restantes).toHaveLength(1)
    expect(restantes[0]!.fonteId).toBe(b.id)
  })

  it('uma fonte criada só com o mínimo nasce pendente e zerada', async () => {
    const { agente } = await agenteDeTeste()
    const fonte = await prisma.fonte.create({
      data: { agenteId: agente.id, tipo: 'arquivo', titulo: 'Manual', tamanhoBytes: 2048 },
    })
    expect(fonte.status).toBe('pendente')
    expect(fonte.totalTrechos).toBe(0)
    expect(fonte.caracteres).toBe(0)
    expect(fonte.mensagemErro).toBeNull()
    expect(fonte.caminhoArquivo).toBeNull()
    expect(fonte.processadoEm).toBeNull()
    expect(fonte.criadoPorId).toBeNull()
    expect(fonte.id).toMatch(/^[a-z0-9]{20,}$/)
  })

  it('o usuário criador some sem apagar a fonte (SET NULL)', async () => {
    const { dono, agente } = await agenteDeTeste()
    const outro = await criarAdmin()
    const fonte = await prisma.fonte.create({
      data: { agenteId: agente.id, tipo: 'texto', titulo: 'T', tamanhoBytes: 1, criadoPorId: outro.id },
    })
    await prisma.usuario.delete({ where: { id: outro.id } })
    const depois = await prisma.fonte.findUniqueOrThrow({ where: { id: fonte.id } })
    expect(depois.criadoPorId).toBeNull()
    expect(dono.id).toBeTruthy()
  })
})

describe('migration das fontes', () => {
  it('só acrescenta: cria fontes e trechos com índices, sem apagar nada', () => {
    const raiz = path.resolve(process.cwd(), 'prisma/migrations')
    const pasta = readdirSync(raiz).find((d) => d.endsWith('_fontes'))
    expect(pasta).toBeDefined()
    const sql = readFileSync(path.join(raiz, pasta!, 'migration.sql'), 'utf8')
    expect(sql).toContain('CREATE TABLE "fontes"')
    expect(sql).toContain('CREATE TABLE "trechos"')
    expect(sql).toContain('ON DELETE CASCADE')
    expect(sql).toMatch(/CREATE INDEX "fontes_agenteId_idx"/)
    expect(sql).toMatch(/CREATE INDEX "trechos_fonteId_indice_idx"/)
    expect(sql).toMatch(/CREATE INDEX "trechos_agenteId_idx"/)
    expect(sql).not.toMatch(/DROP\s/i)
  })
})
