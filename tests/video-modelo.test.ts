/**
 * T-01.01 (FT-08): os campos de vídeo de `Fonte` (progresso, etapa, duração e
 * URL de origem) e o modelo de transcrição da configuração do workspace nascem
 * de migration aditiva (PR-74, PR-73).
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { criarAgenteDeTeste } from './apoio/fontes'
import { limparBanco } from './ajuda'

describe('campos de vídeo da Fonte', () => {
  beforeEach(limparBanco)
  afterAll(limparBanco)

  it('uma fonte de vídeo guarda progresso, etapa, duração e URL de origem', async () => {
    const { agente } = await criarAgenteDeTeste()
    const fonte = await prisma.fonte.create({
      data: {
        agenteId: agente.id,
        tipo: 'video',
        titulo: 'Aula 1',
        tamanhoBytes: 10,
        progresso: 42,
        etapa: 'Transcrevendo parte 2 de 5',
        duracaoSegundos: 3725,
        urlOrigem: 'https://www.youtube.com/watch?v=abcdefghijk',
      },
    })
    const lida = await prisma.fonte.findUniqueOrThrow({ where: { id: fonte.id } })
    expect(lida).toMatchObject({
      progresso: 42,
      etapa: 'Transcrevendo parte 2 de 5',
      duracaoSegundos: 3725,
      urlOrigem: 'https://www.youtube.com/watch?v=abcdefghijk',
    })
  })

  it('a configuração do workspace aceita modeloDeTranscricao', async () => {
    const linha = await prisma.configuracaoDoWorkspace.create({
      data: { id: 'unica', modeloDeTranscricao: 'google/gemini-2.5-flash' },
    })
    expect(linha.modeloDeTranscricao).toBe('google/gemini-2.5-flash')
  })

  it('uma fonte criada sem os campos novos devolve os quatro como nulos', async () => {
    const { agente } = await criarAgenteDeTeste()
    const fonte = await prisma.fonte.create({
      data: { agenteId: agente.id, tipo: 'texto', titulo: 'Texto', tamanhoBytes: 1 },
    })
    expect(fonte).toMatchObject({ progresso: null, etapa: null, duracaoSegundos: null, urlOrigem: null })
  })

  it('o modeloDeTranscricao da configuração nasce nulo', async () => {
    const linha = await prisma.configuracaoDoWorkspace.create({ data: { id: 'unica' } })
    expect(linha.modeloDeTranscricao).toBeNull()
  })

  it('a migration só acrescenta colunas (sem DROP)', () => {
    const pasta = path.join(process.cwd(), 'prisma/migrations')
    const nome = readdirSync(pasta).find((n) => n.endsWith('_conhecimento_em_video'))
    expect(nome).toBeTruthy()
    const sql = readFileSync(path.join(pasta, nome!, 'migration.sql'), 'utf8')
    expect(sql).toMatch(/ALTER TABLE "fontes" ADD COLUMN "progresso"/)
    expect(sql).toMatch(/ALTER TABLE "configuracao_do_workspace" ADD COLUMN "modeloDeTranscricao"/)
    expect(sql).not.toMatch(/\bDROP\b/i)
  })
})
