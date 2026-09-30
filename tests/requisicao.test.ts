import { describe, it, expect } from 'vitest'
import { ipDeCabecalhos } from '@/lib/requisicao'

function cabecalhos(valores: Record<string, string>) {
  return { get: (nome: string) => valores[nome.toLowerCase()] ?? null }
}

describe('IP do cliente', () => {
  it('confiando no proxy, usa o primeiro valor de X-Forwarded-For', () => {
    const h = cabecalhos({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' })
    expect(ipDeCabecalhos(h, true)).toBe('203.0.113.9')
  })

  it('sem confiar no proxy, o cabeçalho é ignorado', () => {
    const h = cabecalhos({ 'x-forwarded-for': '203.0.113.9' })
    expect(ipDeCabecalhos(h, false)).toBe('desconhecido')
  })

  it('sem o cabeçalho, devolve desconhecido', () => {
    expect(ipDeCabecalhos(cabecalhos({}), true)).toBe('desconhecido')
  })

  it('cabeçalho vazio ou só com espaços vira desconhecido', () => {
    expect(ipDeCabecalhos(cabecalhos({ 'x-forwarded-for': '  ' }), true)).toBe(
      'desconhecido',
    )
  })

  it('limita o tamanho do valor, para a chave do limite não crescer sem fim', () => {
    const h = cabecalhos({ 'x-forwarded-for': 'a'.repeat(500) })
    expect(ipDeCabecalhos(h, true).length).toBeLessThanOrEqual(64)
  })
})
