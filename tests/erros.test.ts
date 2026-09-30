import { describe, it, expect } from 'vitest'
import { ErroDeAplicacao, erroDoProvedor } from '@/lib/erros'

describe('erroDoProvedor', () => {
  const casos: Array<[number | 'timeout' | 'rede', number, string]> = [
    [401, 502, 'provedor_chave_invalida'],
    [402, 502, 'provedor_sem_saldo'],
    [400, 502, 'provedor_modelo_invalido'],
    [404, 502, 'provedor_modelo_invalido'],
    [429, 502, 'provedor_limite'],
    [500, 502, 'provedor_indisponivel'],
    [503, 502, 'provedor_indisponivel'],
    ['rede', 502, 'provedor_indisponivel'],
    ['timeout', 504, 'provedor_tempo_esgotado'],
    [408, 504, 'provedor_tempo_esgotado'],
  ]

  it.each(casos)('%s vira status %i e código %s', (causa, status, codigo) => {
    const erro = erroDoProvedor(causa)
    expect(erro).toBeInstanceOf(ErroDeAplicacao)
    expect(erro.status).toBe(status)
    expect(erro.codigo).toBe(codigo)
  })

  it('a mensagem é em português e diz o que o operador faz', () => {
    expect(erroDoProvedor(401).message).toMatch(/chave/i)
    expect(erroDoProvedor(402).message).toMatch(/saldo|crédito/i)
    expect(erroDoProvedor(404).message).toMatch(/modelo/i)
    expect(erroDoProvedor(429).message).toMatch(/limite/i)
  })

  it('as mensagens não repetem código HTTP nem corpo do provedor', () => {
    for (const [causa] of casos) {
      expect(erroDoProvedor(causa).message).not.toMatch(/\b(40\d|50\d|429)\b/)
    }
  })
})
