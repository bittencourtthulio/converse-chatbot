/**
 * buscarTrechos (FT-05, PR-51): recuperação por FTS5 e BM25, só do agente e de
 * fontes prontas, com limite de 6, sem acento, sem caixa e sem nunca deixar o
 * texto da pergunta virar SQL.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { buscarTrechos, LIMITE_DE_TRECHOS } from '@/servicos/recuperacao'
import { limparBanco } from './ajuda'
import { criarBase } from './apoio/conhecimento'

beforeEach(async () => {
  await limparBanco()
})
afterAll(async () => {
  await limparBanco()
})

describe('filtros', () => {
  it('só devolve trechos de fontes prontas do agente, com título, posição, texto e pontuação', async () => {
    const meu = await criarBase({
      titulo: 'Política de troca',
      textos: ['Aceitamos a troca em sete dias.', 'A devolução do valor volta pelo mesmo meio.'],
    })
    await criarBase({ agenteId: meu.agenteId, titulo: 'Rascunho', status: 'erro', textos: ['Troca em trinta dias (rascunho).'] })
    await criarBase({ agenteId: meu.agenteId, titulo: 'Fila', status: 'pendente', textos: ['Troca sem prazo (fila).'] })
    await criarBase({ titulo: 'De outro agente', textos: ['Troca em um dia, regra de outro agente.'] })

    const achados = await buscarTrechos(meu.agenteId, 'Como funciona a troca?')

    expect(achados).toHaveLength(1)
    expect(achados[0]).toMatchObject({
      trechoId: meu.trechoIds[0],
      fonteId: meu.fonteId,
      titulo: 'Política de troca',
      posicao: 1,
      texto: 'Aceitamos a troca em sete dias.',
    })
    expect(achados[0]!.pontuacao).toBeGreaterThan(0)
  })

  it('agente sem nada na base recebe lista vazia', async () => {
    const outro = await criarBase({ textos: ['Qualquer coisa sobre troca.'] })
    const { criarAgenteDeTeste } = await import('./apoio/fontes')
    const vazio = await criarAgenteDeTeste('Vazio')
    expect(await buscarTrechos(vazio.agente.id, 'troca')).toEqual([])
    expect(outro.agenteId).not.toBe(vazio.agente.id)
  })

  it('a posição é o índice do trecho mais um', async () => {
    const base = await criarBase({ textos: ['Primeiro assunto: pagamento.', 'Segundo assunto: entrega rápida.'] })
    const [achado] = await buscarTrechos(base.agenteId, 'entrega')
    expect(achado!.posicao).toBe(2)
  })
})

describe('busca textual', () => {
  it('ignora acento e caixa na pergunta e no texto', async () => {
    const base = await criarBase({ textos: ['Política de DEVOLUÇÃO e garantia.'] })
    for (const pergunta of ['politica devolucao', 'POLÍTICA', 'devolução?']) {
      expect(await buscarTrechos(base.agenteId, pergunta)).toHaveLength(1)
    }
  })

  it('o plural da pergunta acha o singular do texto e vice-versa (prefixo)', async () => {
    const base = await criarBase({ textos: ['Nossas entregas saem em três dias.', 'O cupom vale uma vez.'] })
    expect((await buscarTrechos(base.agenteId, 'como é a entrega'))[0]!.texto).toContain('entregas')
    expect((await buscarTrechos(base.agenteId, 'quais cupons existem'))[0]!.texto).toContain('cupom')
  })

  it('ordena por relevância: o trecho que mais fala do termo vem primeiro', async () => {
    const base = await criarBase({
      textos: [
        'Falamos de muitas coisas neste parágrafo longo, e de passagem citamos o frete uma vez entre vários outros assuntos sem relação.',
        'Frete grátis. Frete rápido. Frete para todo o país.',
      ],
    })
    const achados = await buscarTrechos(base.agenteId, 'frete')
    expect(achados.map((a) => a.posicao)).toEqual([2, 1])
    expect(achados[0]!.pontuacao).toBeGreaterThan(achados[1]!.pontuacao)
  })

  it('devolve no máximo 6 trechos, mesmo com limite maior', async () => {
    const base = await criarBase({ textos: Array.from({ length: 10 }, (_, i) => `Item ${i} do catálogo de canetas.`) })
    expect(LIMITE_DE_TRECHOS).toBe(6)
    expect(await buscarTrechos(base.agenteId, 'canetas')).toHaveLength(6)
    expect(await buscarTrechos(base.agenteId, 'canetas', { limite: 50 })).toHaveLength(6)
    expect(await buscarTrechos(base.agenteId, 'canetas', { limite: 2 })).toHaveLength(2)
  })
})

describe('limiar de relevância', () => {
  it('saudação, pergunta vazia e só stopwords devolvem lista vazia', async () => {
    const base = await criarBase({ textos: ['Olá! Bem-vindo à loja. Bom dia e boa tarde a todos.'] })
    for (const pergunta of ['olá', 'Oi, bom dia!', '', '   ', 'e o que é isso?', 'obrigado']) {
      expect(await buscarTrechos(base.agenteId, pergunta)).toEqual([])
    }
  })

  it('pergunta sem nenhum termo na base devolve lista vazia', async () => {
    const base = await criarBase({ textos: ['Vendemos cadernos e canetas.'] })
    expect(await buscarTrechos(base.agenteId, 'Qual a capital da Austrália?')).toEqual([])
  })
})

describe('segurança da consulta', () => {
  const HOSTIS = [
    'troca" OR "x',
    'NEAR(troca frete, 3)',
    'troca AND NOT frete',
    'col:troca',
    '* * *',
    '(((',
    "'; DROP TABLE trechos; --",
    "1' OR '1'='1",
    'troca\u0000frete',
  ]

  it.each(HOSTIS)('pergunta hostil %j não lança e não altera a base', async (pergunta) => {
    const base = await criarBase({ textos: ['Troca e frete em sete dias.'] })
    await expect(buscarTrechos(base.agenteId, pergunta)).resolves.toBeInstanceOf(Array)
    const { prisma } = await import('@/lib/prisma')
    expect(await prisma.trecho.count()).toBe(1)
  })

  it('agenteId com aspas ou SQL não quebra nem vaza outro agente', async () => {
    await criarBase({ textos: ['Troca em sete dias.'] })
    expect(await buscarTrechos("x' OR '1'='1", 'troca')).toEqual([])
  })

  it('o módulo não usa SQL sem parâmetros nem concatena a pergunta', () => {
    const fonte = readFileSync(path.join(process.cwd(), 'src/servicos/recuperacao.ts'), 'utf8')
    expect(fonte).not.toMatch(/\$queryRawUnsafe|\$executeRawUnsafe/)
    expect(fonte).toMatch(/\$queryRaw</)
    expect(fonte).not.toMatch(/\$queryRaw[^`]*\(\s*[`'"][^`]*\$\{/)
  })
})

describe('pergunta de continuação', () => {
  it('"e o preço?" junta os termos da pergunta anterior', async () => {
    const base = await criarBase({
      textos: ['O preço do caderno universitário é R$ 25,00.', 'O preço da caneta azul é R$ 3,00.'],
    })
    const sozinha = await buscarTrechos(base.agenteId, 'e o preço?')
    expect(sozinha).toHaveLength(2)

    const comAnterior = await buscarTrechos(base.agenteId, 'e o preço?', { perguntaAnterior: 'Vocês vendem canetas?' })
    expect(comAnterior[0]!.texto).toContain('caneta')
    expect(comAnterior[0]!.pontuacao).toBeGreaterThan(comAnterior[1]!.pontuacao)
  })

  it('pergunta longa não ganha os termos da anterior', async () => {
    const base = await criarBase({ textos: ['Caneta azul vendida em caixa.', 'Caderno universitário grande.'] })
    const achados = await buscarTrechos(base.agenteId, 'quanto custa o caderno universitário grande', {
      perguntaAnterior: 'caneta',
    })
    expect(achados.map((a) => a.texto).join(' ')).not.toContain('Caneta azul')
  })

  it('a pergunta anterior sozinha não recupera nada quando a atual é só saudação', async () => {
    const base = await criarBase({ textos: ['Caneta azul custa três reais.'] })
    expect(await buscarTrechos(base.agenteId, 'obrigado', { perguntaAnterior: 'caneta' })).toEqual([])
  })
})
