/**
 * T-02.08 (FT-12, PR-101): o expurgo apaga as revogações de sessão que já venceram, na mesma rodada
 * das conversas e da auditoria, com o relógio injetado.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { executarExpurgo } from '@/servicos/expurgo'
import { limparBanco } from './ajuda'

beforeEach(limparBanco)

const AGORA = new Date('2026-10-01T12:00:00Z')
const em = (segundos: number) => new Date(AGORA.getTime() + segundos * 1000)
const jtis = async () => (await prisma.sessaoRevogada.findMany({ orderBy: { jti: 'asc' } })).map((s) => s.jti)

describe('expurgo das revogações vencidas (integração)', () => {
  it('apaga as com expiraEm anterior a agora e mantém as demais, inclusive a que vence exatamente agora', async () => {
    await prisma.sessaoRevogada.createMany({
      data: [
        { jti: 'a-vencida-ha-1h', usuarioId: 'u1', expiraEm: em(-3600) },
        { jti: 'b-vencida-ha-1s', usuarioId: 'u1', expiraEm: em(-1) },
        { jti: 'c-vence-agora', usuarioId: 'u1', expiraEm: AGORA },
        { jti: 'd-vence-em-1h', usuarioId: 'u2', expiraEm: em(3600) },
      ],
    })
    const r = await executarExpurgo({ agora: AGORA })
    expect(r.sessoesRevogadas).toBe(2)
    expect(await jtis()).toEqual(['c-vence-agora', 'd-vence-em-1h'])
  })
})

describe('contagem e auditoria (funcional)', () => {
  it('uma segunda rodada apaga zero e revogações sozinhas não geram a auditoria expurgo_automatico', async () => {
    await prisma.sessaoRevogada.create({ data: { jti: 'vencida', usuarioId: 'u1', expiraEm: em(-60) } })
    expect((await executarExpurgo({ agora: AGORA })).sessoesRevogadas).toBe(1)
    expect((await executarExpurgo({ agora: AGORA })).sessoesRevogadas).toBe(0)
    expect(await prisma.registroDeAuditoria.count({ where: { acao: 'expurgo_automatico' } })).toBe(0)
  })

  it('sem nenhuma revogação o resultado traz sessoesRevogadas 0', async () => {
    expect((await executarExpurgo({ agora: AGORA })).sessoesRevogadas).toBe(0)
  })
})
