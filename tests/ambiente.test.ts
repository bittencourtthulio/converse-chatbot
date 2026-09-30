import { describe, it, expect, afterEach } from 'vitest'
import { ambiente } from '@/lib/ambiente'

const original = { ...process.env }
afterEach(() => {
  for (const chave of ['APP_NAME', 'TRUST_PROXY']) {
    if (original[chave] === undefined) delete process.env[chave]
    else process.env[chave] = original[chave]
  }
})

describe('nome do produto', () => {
  it('sem APP_NAME, é Converse', () => {
    delete process.env.APP_NAME
    expect(ambiente.nomeDoProduto).toBe('Converse')
  })

  it('usa APP_NAME quando definido, sem espaços nas pontas', () => {
    process.env.APP_NAME = '  Acme Atende '
    expect(ambiente.nomeDoProduto).toBe('Acme Atende')
  })

  it('APP_NAME só com espaços volta ao padrão', () => {
    process.env.APP_NAME = '   '
    expect(ambiente.nomeDoProduto).toBe('Converse')
  })
})

describe('confiança no proxy', () => {
  it('só é verdadeira com TRUST_PROXY igual a 1', () => {
    delete process.env.TRUST_PROXY
    expect(ambiente.confiarNoProxy).toBe(false)
    process.env.TRUST_PROXY = '0'
    expect(ambiente.confiarNoProxy).toBe(false)
    process.env.TRUST_PROXY = 'true'
    expect(ambiente.confiarNoProxy).toBe(false)
    process.env.TRUST_PROXY = '1'
    expect(ambiente.confiarNoProxy).toBe(true)
  })
})
