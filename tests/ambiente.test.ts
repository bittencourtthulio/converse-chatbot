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

describe('chave de criptografia', () => {
  it('ler ambiente sem ENCRYPTION_KEY não lança: só o uso do segredo falha', () => {
    const guardada = process.env.ENCRYPTION_KEY
    delete process.env.ENCRYPTION_KEY
    try {
      expect(() => ambiente.nomeDoProduto).not.toThrow()
      expect(ambiente.chaveDeCriptografia).toBeUndefined()
    } finally {
      process.env.ENCRYPTION_KEY = guardada
    }
  })

  it('devolve o valor bruto quando definido', () => {
    expect(ambiente.chaveDeCriptografia).toBe(process.env.ENCRYPTION_KEY)
  })
})

describe('OpenRouter', () => {
  const guardadas = {
    base: process.env.OPENROUTER_BASE_URL,
    app: process.env.APP_URL,
  }
  afterEach(() => {
    for (const [nome, valor] of [
      ['OPENROUTER_BASE_URL', guardadas.base],
      ['APP_URL', guardadas.app],
    ] as const) {
      if (valor === undefined) delete process.env[nome]
      else process.env[nome] = valor
    }
  })

  it('a URL base tem o padrão do OpenRouter', () => {
    delete process.env.OPENROUTER_BASE_URL
    expect(ambiente.openrouterBaseUrl).toBe('https://openrouter.ai/api/v1')
  })

  it('lê OPENROUTER_BASE_URL e tira as barras finais', () => {
    process.env.OPENROUTER_BASE_URL = 'http://127.0.0.1:9999/api/v1//'
    expect(ambiente.openrouterBaseUrl).toBe('http://127.0.0.1:9999/api/v1')
  })

  it('OPENROUTER_BASE_URL só com espaços volta ao padrão', () => {
    process.env.OPENROUTER_BASE_URL = '  '
    expect(ambiente.openrouterBaseUrl).toBe('https://openrouter.ai/api/v1')
  })

  it('APP_URL tem padrão local e é lida sem barra final', () => {
    delete process.env.APP_URL
    expect(ambiente.appUrl).toBe('http://localhost:3000')
    process.env.APP_URL = 'https://converse.exemplo.com.br/'
    expect(ambiente.appUrl).toBe('https://converse.exemplo.com.br')
  })
})
