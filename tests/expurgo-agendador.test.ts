// T-04.02 (FT-10, PR-89): o agendador do expurgo. Primeira rodada 1 minuto depois da subida e
// uma a cada 6 horas, sem sobreposição; falha vira log e não derruba nada. Temporizador e
// relógio injetados: nenhum teste espera tempo de verdade.
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  INTERVALO_DO_EXPURGO_MS,
  PRIMEIRA_RODADA_DO_EXPURGO_MS,
  criarAgendadorDoExpurgo,
  obterAgendadorDoExpurgo,
} from '@/servicos/expurgo'

interface Agendado {
  fn: () => void
  ms: number
  cancelado: boolean
}

function temporizadorFalso() {
  const agendados: Agendado[] = []
  return {
    agendados,
    agendar: (fn: () => void, ms: number) => {
      const a: Agendado = { fn, ms, cancelado: false }
      agendados.push(a)
      return a
    },
    cancelar: (h: unknown) => {
      ;(h as Agendado).cancelado = true
    },
  }
}

afterEach(() => vi.restoreAllMocks())

describe('agendador do expurgo (integração com temporizador injetado)', () => {
  it('a primeira rodada é aos 60 segundos e a seguinte 6 horas depois da anterior terminar', async () => {
    expect(PRIMEIRA_RODADA_DO_EXPURGO_MS).toBe(60_000)
    expect(INTERVALO_DO_EXPURGO_MS).toBe(6 * 3600 * 1000)
    const t = temporizadorFalso()
    const executar = vi.fn(async () => undefined)
    const a = criarAgendadorDoExpurgo({ executar, agendar: t.agendar, cancelar: t.cancelar })

    a.iniciar()
    expect(executar).not.toHaveBeenCalled()
    expect(t.agendados.map((x) => x.ms)).toEqual([60_000])

    t.agendados[0]!.fn()
    await a.ocioso()
    expect(executar).toHaveBeenCalledTimes(1)
    expect(t.agendados.map((x) => x.ms)).toEqual([60_000, 6 * 3600 * 1000])

    t.agendados[1]!.fn()
    await a.ocioso()
    expect(executar).toHaveBeenCalledTimes(2)
    expect(t.agendados).toHaveLength(3)
  })

  it('iniciar duas vezes mantém um só agendador, e parar cancela as rodadas', async () => {
    const t = temporizadorFalso()
    const executar = vi.fn(async () => undefined)
    const a = criarAgendadorDoExpurgo({ executar, agendar: t.agendar, cancelar: t.cancelar })
    a.iniciar()
    a.iniciar()
    expect(t.agendados).toHaveLength(1)
    expect(a.ativo()).toBe(true)

    a.parar()
    expect(t.agendados[0]!.cancelado).toBe(true)
    expect(a.ativo()).toBe(false)
    t.agendados[0]!.fn()
    await a.ocioso()
    expect(executar).not.toHaveBeenCalled()
    expect(t.agendados).toHaveLength(1)
  })

  it('depois de parado, pode iniciar de novo', () => {
    const t = temporizadorFalso()
    const a = criarAgendadorDoExpurgo({ executar: async () => undefined, agendar: t.agendar, cancelar: t.cancelar })
    a.iniciar()
    a.parar()
    a.iniciar()
    expect(t.agendados).toHaveLength(2)
    expect(a.ativo()).toBe(true)
  })
})

describe('agendador do expurgo (funcional)', () => {
  it('uma rodada longa não é sobreposta por outra, mesmo se o temporizador disparar de novo', async () => {
    const t = temporizadorFalso()
    let terminar: () => void = () => undefined
    const executar = vi.fn(() => new Promise<void>((r) => { terminar = r }))
    const a = criarAgendadorDoExpurgo({ executar, agendar: t.agendar, cancelar: t.cancelar })
    a.iniciar()
    t.agendados[0]!.fn()
    t.agendados[0]!.fn()
    expect(executar).toHaveBeenCalledTimes(1)
    terminar()
    await a.ocioso()
    expect(executar).toHaveBeenCalledTimes(1)
    expect(t.agendados).toHaveLength(2)
  })

  it('falha do banco numa rodada vira o log expurgo_falhou, sem a mensagem do erro, e a rodada seguinte é agendada', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const t = temporizadorFalso()
    const executar = vi.fn().mockRejectedValueOnce(new Error('database is locked /var/dados/segredo.db')).mockResolvedValue(undefined)
    const a = criarAgendadorDoExpurgo({ executar, agendar: t.agendar, cancelar: t.cancelar })
    a.iniciar()
    t.agendados[0]!.fn()
    await expect(a.ocioso()).resolves.toBeUndefined()
    expect(log).toHaveBeenCalledTimes(1)
    const linha = String(log.mock.calls[0]![0])
    expect(JSON.parse(linha)).toMatchObject({ evento: 'expurgo_falhou', erro: 'Error' })
    expect(linha).not.toMatch(/locked|segredo|\/var/)
    expect(t.agendados).toHaveLength(2)
    t.agendados[1]!.fn()
    await a.ocioso()
    expect(executar).toHaveBeenCalledTimes(2)
  })

  it('o singleton é um só no processo (globalThis) e começa parado', () => {
    const a = obterAgendadorDoExpurgo()
    expect(obterAgendadorDoExpurgo()).toBe(a)
    expect(a.ativo()).toBe(false)
  })
})
