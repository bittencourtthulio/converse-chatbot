/**
 * Termos e expressão MATCH da recuperação (FT-05, PR-51, PR-13): a pergunta do
 * usuário vira termos limpos, e só termos limpos entram na expressão do FTS5.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import {
  LIMITE_DE_TERMOS,
  extrairTermos,
  montarExpressaoMatch,
} from '@/servicos/recuperacao-termos'
import { limparBanco } from './ajuda'

beforeEach(async () => {
  await limparBanco()
})
afterAll(async () => {
  await limparBanco()
})

describe('extrairTermos', () => {
  it('põe em minúsculas, tira acento e stopwords', () => {
    expect(extrairTermos('Qual o HORÁRIO de atendimento?')).toEqual(['horario', 'atendimento'])
  })

  it('saudação e pergunta só de stopwords não deixam termo', () => {
    expect(extrairTermos('olá')).toEqual([])
    expect(extrairTermos('Oi, bom dia!')).toEqual([])
    expect(extrairTermos('Obrigado')).toEqual([])
    expect(extrairTermos('e o que é isso?')).toEqual([])
    expect(extrairTermos('   ')).toEqual([])
    expect(extrairTermos('')).toEqual([])
  })

  it('remove pontuação e operadores do FTS5', () => {
    expect(extrairTermos('troca" OR 1=1 -- NEAR(a b) col:x *')).toEqual(['troca', 'col'])
  })

  it('tira repetições e termos de um caractere', () => {
    expect(extrairTermos('frete frete FRETE 7 a x')).toEqual(['frete'])
  })

  it('números com dois dígitos ou mais ficam', () => {
    expect(extrairTermos('devolução em 30 dias')).toEqual(['devolucao', '30', 'dias'])
  })

  it('limita a 12 termos e descarta palavra gigante', () => {
    const muitas = Array.from({ length: 30 }, (_, i) => `palavra${i}`).join(' ')
    expect(extrairTermos(muitas)).toHaveLength(LIMITE_DE_TERMOS)
    expect(LIMITE_DE_TERMOS).toBe(12)
    expect(extrairTermos('a'.repeat(41))).toEqual([])
  })

  it('não quebra com emoji, CJK e texto que não é string útil', () => {
    expect(extrairTermos('preço 💸 価格')).toEqual(['preco'])
  })
})

describe('montarExpressaoMatch', () => {
  it('põe cada termo entre aspas, liga por OR e dá prefixo aos de 4 ou mais caracteres', () => {
    expect(montarExpressaoMatch(['horario', 'de', 'dia'])).toBe('"horario"* OR "de" OR "dia"')
  })

  it('o plural longo vira prefixo do singular', () => {
    expect(montarExpressaoMatch(['trocas'])).toBe('"troca"*')
  })

  it('sem termos, expressão vazia', () => {
    expect(montarExpressaoMatch([])).toBe('')
  })
})

describe('a expressão é aceita pelo FTS5 real', () => {
  const HOSTIS = [
    'troca" OR "x',
    '"" OR ""',
    'NEAR(troca frete, 3)',
    'troca AND NOT frete',
    'col:troca',
    '* * *',
    '(((',
    "'; DROP TABLE trechos; --",
    'a OR b OR c',
    '^troca',
    'troca*',
    'frete\u0000troca',
  ]

  it.each(HOSTIS)('pergunta hostil %j não derruba a consulta', async (pergunta) => {
    const expressao = montarExpressaoMatch(extrairTermos(pergunta))
    if (expressao === '') return
    const linhas = await prisma.$queryRaw<unknown[]>`
      SELECT rowid FROM trechos_fts WHERE trechos_fts MATCH ${expressao}`
    expect(Array.isArray(linhas)).toBe(true)
  })
})
