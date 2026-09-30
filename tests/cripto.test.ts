import { describe, it, expect, afterEach } from 'vitest'
import { randomBytes } from 'node:crypto'
import { cifrar, decifrar, mascararSegredo } from '@/lib/cripto'
import { ErroDeAplicacao } from '@/lib/erros'

const chaveDeTeste = process.env.ENCRYPTION_KEY
afterEach(() => {
  process.env.ENCRYPTION_KEY = chaveDeTeste
})

describe('ida e volta', () => {
  it('decifrar devolve o texto original, inclusive com acentos', () => {
    const texto = 'sk-or-v1-ação-çãé-1234567890'
    expect(decifrar(cifrar(texto))).toBe(texto)
  })

  it('usa o formato versionado v1 com quatro partes', () => {
    const partes = cifrar('segredo').split(':')
    expect(partes).toHaveLength(4)
    expect(partes[0]).toBe('v1')
  })

  it('o texto cifrado não contém o segredo', () => {
    expect(cifrar('sk-or-v1-abcdef1234')).not.toContain('abcdef1234')
  })

  it('dois cifrar do mesmo texto dão saídas diferentes (IV aleatório)', () => {
    expect(cifrar('igual')).not.toBe(cifrar('igual'))
  })
})

describe('adulteração e chave errada', () => {
  it('texto cifrado alterado é detectado', () => {
    const [v, iv, etiqueta, cifrado] = cifrar('segredo').split(':') as [
      string,
      string,
      string,
      string,
    ]
    const trocado = (cifrado[0] === 'A' ? 'B' : 'A') + cifrado.slice(1)
    expect(() => decifrar([v, iv, etiqueta, trocado].join(':'))).toThrow(
      ErroDeAplicacao,
    )
  })

  it('etiqueta de autenticação alterada é detectada', () => {
    const [v, iv, etiqueta, cifrado] = cifrar('segredo').split(':') as [
      string,
      string,
      string,
      string,
    ]
    const trocada = (etiqueta[0] === 'A' ? 'B' : 'A') + etiqueta.slice(1)
    expect(() => decifrar([v, iv, trocada, cifrado].join(':'))).toThrow(
      ErroDeAplicacao,
    )
  })

  it('prefixo de versão desconhecido é recusado', () => {
    const [, iv, etiqueta, cifrado] = cifrar('segredo').split(':') as [
      string,
      string,
      string,
      string,
    ]
    expect(() => decifrar(['v9', iv, etiqueta, cifrado].join(':'))).toThrow(
      /versão/i,
    )
  })

  it('texto fora do formato é recusado', () => {
    expect(() => decifrar('qualquer coisa')).toThrow(ErroDeAplicacao)
  })

  it('chave diferente não decifra', () => {
    const cifrado = cifrar('segredo')
    process.env.ENCRYPTION_KEY = randomBytes(32).toString('hex')
    expect(() => decifrar(cifrado)).toThrow(ErroDeAplicacao)
  })

  it('a mensagem de erro não carrega o segredo nem o texto cifrado', () => {
    const cifrado = cifrar('sk-or-v1-muito-secreto')
    process.env.ENCRYPTION_KEY = randomBytes(32).toString('hex')
    try {
      decifrar(cifrado)
      throw new Error('deveria falhar')
    } catch (erro) {
      const mensagem = (erro as Error).message
      expect(mensagem).not.toContain('muito-secreto')
      expect(mensagem).not.toContain(cifrado)
    }
  })
})

describe('ENCRYPTION_KEY', () => {
  it('aceita 32 bytes em base64', () => {
    process.env.ENCRYPTION_KEY = randomBytes(32).toString('base64')
    expect(decifrar(cifrar('segredo'))).toBe('segredo')
  })

  it('ausente falha só ao cifrar, com mensagem clara', () => {
    delete process.env.ENCRYPTION_KEY
    expect(() => cifrar('x')).toThrow(/ENCRYPTION_KEY/)
    try {
      cifrar('x')
    } catch (erro) {
      expect(erro).toBeInstanceOf(ErroDeAplicacao)
      expect((erro as ErroDeAplicacao).status).toBe(500)
    }
  })

  it('curta demais é recusada ao decifrar também', () => {
    const cifrado = cifrar('segredo')
    process.env.ENCRYPTION_KEY = 'abc123'
    expect(() => decifrar(cifrado)).toThrow(/ENCRYPTION_KEY/)
  })

  it('a mensagem de chave inválida não repete o valor da chave', () => {
    process.env.ENCRYPTION_KEY = 'valor-secreto-curto'
    try {
      cifrar('x')
    } catch (erro) {
      expect((erro as Error).message).not.toContain('valor-secreto-curto')
    }
  })
})

describe('máscara', () => {
  it('mostra os 6 primeiros e os 4 últimos caracteres', () => {
    expect(mascararSegredo('sk-or-v1-abcdef1234')).toBe('sk-or-…1234')
  })

  it('segredo curto não revela o começo', () => {
    expect(mascararSegredo('abcdefghij')).toBe('…ghij')
    expect(mascararSegredo('ab')).toBe('…')
  })
})
