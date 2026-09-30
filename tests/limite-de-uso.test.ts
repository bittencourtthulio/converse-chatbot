import { describe, it, expect } from 'vitest'
import { criarLimitador, verificarLimite } from '@/lib/limite-de-uso'

/** Relógio controlado pelo teste: nada de timers reais. */
function relogioFalso(inicio = 1_000_000) {
  let agora = inicio
  return {
    agora: () => agora,
    avancar: (ms: number) => {
      agora += ms
    },
  }
}

const regra = { max: 3, janelaMs: 1000 }

describe('limite de uso (janela deslizante)', () => {
  it('permite até o máximo e conta o que resta', () => {
    const r = relogioFalso()
    const l = criarLimitador(r.agora)
    expect(l.verificarLimite('a', regra)).toEqual({ permitido: true, restante: 2, reiniciaEmMs: 1000 })
    expect(l.verificarLimite('a', regra).restante).toBe(1)
    expect(l.verificarLimite('a', regra).restante).toBe(0)
  })

  it('recusa a chamada seguinte e diz em quanto tempo libera', () => {
    const r = relogioFalso()
    const l = criarLimitador(r.agora)
    l.verificarLimite('a', regra)
    r.avancar(300)
    l.verificarLimite('a', regra)
    l.verificarLimite('a', regra)
    r.avancar(200)
    const barrada = l.verificarLimite('a', regra)
    expect(barrada).toEqual({ permitido: false, restante: 0, reiniciaEmMs: 500 })
  })

  it('a janela desliza: só a chamada mais antiga sai primeiro', () => {
    const r = relogioFalso()
    const l = criarLimitador(r.agora)
    l.verificarLimite('a', regra) // t=0
    r.avancar(600)
    l.verificarLimite('a', regra) // t=600
    l.verificarLimite('a', regra) // t=600
    r.avancar(401) // t=1001: a de t=0 saiu, as de 600 ficam
    const liberada = l.verificarLimite('a', regra)
    expect(liberada.permitido).toBe(true)
    expect(liberada.restante).toBe(0)
    expect(l.verificarLimite('a', regra).permitido).toBe(false)
  })

  it('volta a permitir quando a janela inteira passa', () => {
    const r = relogioFalso()
    const l = criarLimitador(r.agora)
    for (let i = 0; i < 3; i += 1) l.verificarLimite('a', regra)
    expect(l.verificarLimite('a', regra).permitido).toBe(false)
    r.avancar(1000)
    expect(l.verificarLimite('a', regra)).toEqual({ permitido: true, restante: 2, reiniciaEmMs: 1000 })
  })

  it('a chamada recusada não estende o bloqueio', () => {
    const r = relogioFalso()
    const l = criarLimitador(r.agora)
    for (let i = 0; i < 3; i += 1) l.verificarLimite('a', regra)
    r.avancar(900)
    expect(l.verificarLimite('a', regra).permitido).toBe(false)
    r.avancar(100)
    expect(l.verificarLimite('a', regra).permitido).toBe(true)
  })

  it('chaves diferentes não se afetam', () => {
    const l = criarLimitador(relogioFalso().agora)
    for (let i = 0; i < 3; i += 1) l.verificarLimite('a', regra)
    expect(l.verificarLimite('a', regra).permitido).toBe(false)
    expect(l.verificarLimite('b', regra).permitido).toBe(true)
  })

  it('apaga da memória as chaves cuja janela já venceu', () => {
    const r = relogioFalso()
    const l = criarLimitador(r.agora)
    for (let i = 0; i < 50; i += 1) l.verificarLimite(`ip-${i}`, regra)
    expect(l.tamanho()).toBe(50)
    r.avancar(5000)
    l.limparVencidas()
    expect(l.tamanho()).toBe(0)
  })

  it('a limpeza automática impede o crescimento sem fim', () => {
    const r = relogioFalso()
    const l = criarLimitador(r.agora)
    for (let i = 0; i < 5000; i += 1) {
      l.verificarLimite(`ip-${i}`, regra)
      r.avancar(10)
    }
    expect(l.tamanho()).toBeLessThan(1500)
  })

  it('reiniciar zera uma chave', () => {
    const l = criarLimitador(relogioFalso().agora)
    for (let i = 0; i < 3; i += 1) l.verificarLimite('a', regra)
    l.reiniciar('a')
    expect(l.verificarLimite('a', regra).permitido).toBe(true)
  })

  it('recusa configuração inválida', () => {
    const l = criarLimitador(relogioFalso().agora)
    expect(() => l.verificarLimite('a', { max: 0, janelaMs: 1000 })).toThrow()
    expect(() => l.verificarLimite('a', { max: 3, janelaMs: 0 })).toThrow()
  })

  it('a instância padrão usa o relógio real', () => {
    const chave = `padrao-${Math.random()}`
    expect(verificarLimite(chave, { max: 1, janelaMs: 60_000 }).permitido).toBe(true)
    expect(verificarLimite(chave, { max: 1, janelaMs: 60_000 }).permitido).toBe(false)
  })
})
