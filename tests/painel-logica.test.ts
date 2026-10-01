// T-05.03: lógica pura do gráfico de mensagens por dia (escala, rótulos e descrição).
import { describe, it, expect } from 'vitest'
import {
  ALTURA_MAXIMA_DA_BARRA,
  descricaoDoGrafico,
  diaCompleto,
  diaCurto,
  escalaDasBarras,
  picoDaSerie,
  totalDaSerie,
} from '@/componentes/painel-logica'

const serie = (...valores: number[]) =>
  valores.map((mensagens, i) => ({ dia: `2026-03-${String(i + 1).padStart(2, '0')}`, mensagens }))

describe('escalaDasBarras', () => {
  it('zero tem altura zero e a maior barra tem a altura máxima', () => {
    const e = escalaDasBarras(serie(0, 5, 10, 2))
    expect(e.map((b) => b.altura)).toEqual([0, ALTURA_MAXIMA_DA_BARRA / 2, ALTURA_MAXIMA_DA_BARRA, expect.any(Number)])
    expect(e[3]?.altura).toBeGreaterThan(0)
    expect(e[3]?.altura).toBeLessThan(ALTURA_MAXIMA_DA_BARRA / 2)
  })
  it('uma série toda zerada não divide por zero', () => {
    const e = escalaDasBarras(serie(0, 0, 0))
    expect(e.every((b) => b.altura === 0)).toBe(true)
    expect(e.every((b) => Number.isFinite(b.altura))).toBe(true)
  })
  it('um valor pequeno ao lado de um enorme ainda aparece (altura mínima de 2)', () => {
    const e = escalaDasBarras(serie(1, 10_000))
    expect(e[0]?.altura).toBeGreaterThanOrEqual(2)
  })
  it('cada barra leva o rótulo do dia e o valor, para o leitor de tela', () => {
    const [b] = escalaDasBarras([{ dia: '2026-03-10', mensagens: 1 }])
    expect(b).toMatchObject({ dia: '2026-03-10', mensagens: 1, rotulo: '10/03/2026: 1 mensagem' })
    expect(escalaDasBarras([{ dia: '2026-03-10', mensagens: 0 }])[0]?.rotulo).toBe('10/03/2026: nenhuma mensagem')
    expect(escalaDasBarras([{ dia: '2026-03-10', mensagens: 7 }])[0]?.rotulo).toBe('10/03/2026: 7 mensagens')
  })
})

describe('rótulos de data e resumo', () => {
  it('formata o dia em pt-BR sem depender do fuso', () => {
    expect(diaCurto('2026-03-10')).toBe('10/03')
    expect(diaCompleto('2026-03-10')).toBe('10/03/2026')
    expect(diaCompleto('2026-12-01')).toBe('01/12/2026')
  })
  it('soma a série e acha o maior dia (o mais recente em caso de empate)', () => {
    expect(totalDaSerie(serie(1, 5, 5, 2))).toBe(13)
    expect(picoDaSerie(serie(1, 5, 5, 2))).toEqual({ dia: '2026-03-03', mensagens: 5 })
    expect(picoDaSerie(serie(0, 0))).toBeNull()
  })
  it('descreve o gráfico inteiro numa frase', () => {
    const d = descricaoDoGrafico(serie(0, 2, 5, 0))
    expect(d).toContain('últimos 4 dias')
    expect(d).toContain('7 mensagens')
    expect(d).toContain('03/03')
    expect(d).toContain('5')
    expect(descricaoDoGrafico(serie(0, 0))).toContain('nenhuma mensagem')
  })
})
