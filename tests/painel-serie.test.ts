// T-05.01: a série de mensagens por dia nos últimos 14 dias (FT-09, PR-81): agrupada pelo dia
// local do servidor, com os dias sem mensagem preenchidos com zero.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { serieDeMensagens } from '@/servicos/painel'
import { limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarConversaDeTeste } from './apoio/historico'

const TZ_ORIGINAL = process.env.TZ
beforeEach(limparBanco)
afterEach(() => {
  if (TZ_ORIGINAL === undefined) delete process.env.TZ
  else process.env.TZ = TZ_ORIGINAL
})

async function mensagens(...instantes: Date[]) {
  const ag = await criarAgenteDeTeste()
  await criarConversaDeTeste({
    agenteId: ag.id,
    canal: 'widget',
    mensagens: instantes.map((criadoEm, i) => ({ papel: 'user' as const, conteudo: `m${i}`, criadoEm })),
  })
}

const dias = (serie: Array<{ dia: string }>) => serie.map((d) => d.dia)
const valorDo = (serie: Array<{ dia: string; mensagens: number }>, dia: string) => serie.find((d) => d.dia === dia)?.mensagens

describe('serieDeMensagens (integração com o banco de teste)', () => {
  it('sem dados devolve 14 dias em zero, do mais antigo a hoje', async () => {
    process.env.TZ = 'UTC'
    const serie = await serieDeMensagens(new Date('2026-03-15T12:00:00.000Z'))
    expect(serie).toHaveLength(14)
    expect(dias(serie)[0]).toBe('2026-03-02')
    expect(dias(serie)[13]).toBe('2026-03-15')
    expect(serie.every((d) => d.mensagens === 0)).toBe(true)
  })

  it('conta as mensagens de cada dia e preenche com zero os dias vazios', async () => {
    process.env.TZ = 'UTC'
    await mensagens(
      new Date('2026-03-15T08:00:00.000Z'),
      new Date('2026-03-15T09:00:00.000Z'),
      new Date('2026-03-12T10:00:00.000Z'),
      new Date('2026-03-02T00:00:00.000Z'),
    )
    const serie = await serieDeMensagens(new Date('2026-03-15T12:00:00.000Z'))
    expect(valorDo(serie, '2026-03-15')).toBe(2)
    expect(valorDo(serie, '2026-03-12')).toBe(1)
    expect(valorDo(serie, '2026-03-02')).toBe(1)
    expect(valorDo(serie, '2026-03-13')).toBe(0)
    expect(serie.reduce((s, d) => s + d.mensagens, 0)).toBe(4)
  })
})

describe('serieDeMensagens (funcional: bordas)', () => {
  it('virada de dia: 23:59 e 00:01 locais caem em dias diferentes', async () => {
    process.env.TZ = 'America/Sao_Paulo'
    await mensagens(new Date(2026, 2, 9, 23, 59, 0), new Date(2026, 2, 10, 0, 1, 0))
    const serie = await serieDeMensagens(new Date(2026, 2, 15, 12, 0, 0))
    expect(valorDo(serie, '2026-03-09')).toBe(1)
    expect(valorDo(serie, '2026-03-10')).toBe(1)
  })

  it('fuso: o mesmo instante cai em dias diferentes conforme o TZ do servidor', async () => {
    const instante = new Date('2026-03-10T01:30:00.000Z')
    const agora = new Date('2026-03-12T12:00:00.000Z')
    await mensagens(instante)
    process.env.TZ = 'UTC'
    expect(valorDo(await serieDeMensagens(agora), '2026-03-10')).toBe(1)
    process.env.TZ = 'America/Sao_Paulo'
    const sp = await serieDeMensagens(agora)
    expect(valorDo(sp, '2026-03-09')).toBe(1)
    expect(valorDo(sp, '2026-03-10')).toBe(0)
  })

  it('janela: 14 dias terminam hoje; 15 dias atrás e o futuro ficam fora', async () => {
    process.env.TZ = 'UTC'
    await mensagens(
      new Date('2026-03-01T23:59:00.000Z'),
      new Date('2026-03-02T00:00:00.000Z'),
      new Date('2026-03-16T00:00:00.000Z'),
    )
    const serie = await serieDeMensagens(new Date('2026-03-15T12:00:00.000Z'))
    expect(serie.reduce((s, d) => s + d.mensagens, 0)).toBe(1)
    expect(valorDo(serie, '2026-03-02')).toBe(1)
    expect(dias(serie)).not.toContain('2026-03-16')
  })

  it('horário de verão: a série atravessa a mudança sem repetir nem pular dia', async () => {
    process.env.TZ = 'America/New_York'
    await mensagens(new Date(2026, 2, 8, 12, 0, 0), new Date(2026, 2, 9, 12, 0, 0))
    const serie = await serieDeMensagens(new Date(2026, 2, 12, 12, 0, 0))
    const lista = dias(serie)
    expect(new Set(lista).size).toBe(14)
    expect(lista).toEqual([...lista].sort())
    expect(lista).toContain('2026-03-08')
    expect(lista).toContain('2026-03-09')
    expect(valorDo(serie, '2026-03-08')).toBe(1)
    expect(valorDo(serie, '2026-03-09')).toBe(1)
  })
})
