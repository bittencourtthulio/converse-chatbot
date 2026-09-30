/**
 * T-01.02 (FT-06, PR-58): normalização, casamento de origem e cabeçalho
 * `frame-ancestors` a partir da lista de domínios permitidos.
 */
import { describe, it, expect } from 'vitest'
import {
  LIMITE_DE_DOMINIOS,
  FRAME_ANCESTORS_SOMENTE_EU,
  cabecalhoFrameAncestors,
  normalizarDominio,
  normalizarLista,
  origemPermitida,
} from '@/lib/dominios-permitidos'

describe('normalizarDominio', () => {
  it.each([
    ['exemplo.com', 'exemplo.com'],
    ['  Exemplo.COM  ', 'exemplo.com'],
    ['https://Exemplo.com/pagina?a=1#x', 'exemplo.com'],
    ['http://exemplo.com', 'exemplo.com'],
    ['*.exemplo.com', '*.exemplo.com'],
    ['localhost:3000', 'localhost:3000'],
    ['localhost', 'localhost'],
    ['127.0.0.1:8080', '127.0.0.1:8080'],
    ['app.exemplo.com.br', 'app.exemplo.com.br'],
    ['*.exemplo.com:8443', '*.exemplo.com:8443'],
  ])('%s vira %s', (entrada, esperado) => {
    expect(normalizarDominio(entrada)).toBe(esperado)
  })

  it.each([
    '',
    '   ',
    '*',
    '*.com',
    'exemplo.*',
    'ex*mplo.com',
    '.exemplo.com',
    'exemplo..com',
    '-exemplo.com',
    'exemplo-.com',
    'exemplo.com:0',
    'exemplo.com:70000',
    'exemplo.com:abc',
    'ex emplo.com',
    'javascript:alert(1)',
    "exemplo.com; script-src 'unsafe-inline'",
    'exemplo.com\nfoo.com',
  ])('recusa %j', (entrada) => {
    expect(normalizarDominio(entrada)).toBeNull()
  })

  it('recusa entrada que não é texto', () => {
    expect(normalizarDominio(42 as unknown as string)).toBeNull()
  })
})

describe('normalizarLista', () => {
  it('normaliza, tira repetidos e mantém a ordem', () => {
    const r = normalizarLista(['Exemplo.com', 'https://exemplo.com/', '*.outro.com'])
    expect(r.lista).toEqual(['exemplo.com', '*.outro.com'])
    expect(r.invalidas).toEqual([])
  })

  it('separa as entradas inválidas sem descartar as boas', () => {
    const r = normalizarLista(['exemplo.com', 'nao valido', '*'])
    expect(r.lista).toEqual(['exemplo.com'])
    expect(r.invalidas).toEqual(['nao valido', '*'])
  })

  it('ignora linhas vazias', () => {
    expect(normalizarLista(['', '  ', 'a.com']).lista).toEqual(['a.com'])
  })

  it(`aceita até ${LIMITE_DE_DOMINIOS} domínios e recusa mais`, () => {
    const muitos = Array.from({ length: LIMITE_DE_DOMINIOS + 1 }, (_, i) => `site${i}.com`)
    expect(normalizarLista(muitos.slice(0, LIMITE_DE_DOMINIOS)).excedeu).toBe(false)
    expect(normalizarLista(muitos).excedeu).toBe(true)
  })

  it('lista que não é lista vira vazia', () => {
    expect(normalizarLista('exemplo.com' as unknown).lista).toEqual([])
  })
})

describe('origemPermitida', () => {
  it('lista vazia libera qualquer origem', () => {
    expect(origemPermitida('https://qualquer.com', [])).toBe(true)
  })

  it('host exato, em http e https, só na porta padrão', () => {
    const lista = ['exemplo.com']
    expect(origemPermitida('https://exemplo.com', lista)).toBe(true)
    expect(origemPermitida('http://exemplo.com', lista)).toBe(true)
    expect(origemPermitida('https://exemplo.com:443', lista)).toBe(true)
    expect(origemPermitida('https://exemplo.com:8443', lista)).toBe(false)
  })

  it('o domínio puro não libera os subdomínios', () => {
    expect(origemPermitida('https://app.exemplo.com', ['exemplo.com'])).toBe(false)
  })

  it('o curinga libera subdomínios de qualquer profundidade, mas não o domínio puro', () => {
    const lista = ['*.exemplo.com']
    expect(origemPermitida('https://app.exemplo.com', lista)).toBe(true)
    expect(origemPermitida('https://a.b.exemplo.com', lista)).toBe(true)
    expect(origemPermitida('https://exemplo.com', lista)).toBe(false)
  })

  it('não confunde sufixo de texto com subdomínio', () => {
    expect(origemPermitida('https://malexemplo.com', ['exemplo.com'])).toBe(false)
    expect(origemPermitida('https://malexemplo.com', ['*.exemplo.com'])).toBe(false)
    expect(origemPermitida('https://exemplo.com.atacante.com', ['exemplo.com'])).toBe(false)
  })

  it('com porta na entrada, exige a porta', () => {
    const lista = ['localhost:3000']
    expect(origemPermitida('http://localhost:3000', lista)).toBe(true)
    expect(origemPermitida('http://localhost:4000', lista)).toBe(false)
    expect(origemPermitida('http://localhost', lista)).toBe(false)
  })

  it('ignora maiúsculas na origem', () => {
    expect(origemPermitida('https://EXEMPLO.com', ['exemplo.com'])).toBe(true)
  })

  it('recusa origem ilegível, sem esquema http(s) ou "null", se há lista', () => {
    const lista = ['exemplo.com']
    expect(origemPermitida('null', lista)).toBe(false)
    expect(origemPermitida('', lista)).toBe(false)
    expect(origemPermitida('file:///x', lista)).toBe(false)
    expect(origemPermitida('exemplo.com', lista)).toBe(false)
  })
})

describe('cabecalhoFrameAncestors', () => {
  it('lista vazia libera qualquer site', () => {
    expect(cabecalhoFrameAncestors([])).toBe('frame-ancestors *')
  })

  it("com domínios, começa em 'self' e os lista", () => {
    expect(cabecalhoFrameAncestors(['exemplo.com', '*.outro.com', 'localhost:3000'])).toBe(
      "frame-ancestors 'self' exemplo.com *.outro.com localhost:3000",
    )
  })

  it("agente inexistente ou inativo: só 'self'", () => {
    expect(FRAME_ANCESTORS_SOMENTE_EU).toBe("frame-ancestors 'self'")
  })

  it('só emite entradas normalizadas, nunca texto solto que feche a diretiva', () => {
    expect(cabecalhoFrameAncestors(["a.com; script-src *"])).toBe("frame-ancestors 'self'")
  })
})
