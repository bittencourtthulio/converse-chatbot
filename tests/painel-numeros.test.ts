// T-05.01: os números do painel inicial (FT-09, PR-81): agregação em SQL parametrizado.
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { numerosDoPainel } from '@/servicos/painel'
import { criarAdmin, limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarConversaDeTeste } from './apoio/historico'

beforeEach(limparBanco)

// Meio-dia local de 15/03/2026: a janela de 7 dias vai da meia-noite local de 09/03 ao fim de 15/03.
const agora = new Date(2026, 2, 15, 12, 0, 0)
const local = (dia: number, h: number, min = 0) => new Date(2026, 2, dia, h, min, 0)

async function fonte(agenteId: string, status: string) {
  await prisma.fonte.create({ data: { agenteId, tipo: 'texto', titulo: `Fonte ${status}`, tamanhoBytes: 1, status } })
}

describe('numerosDoPainel (integração com o banco de teste)', () => {
  it('sem dados tudo é zero e os três canais aparecem com zero', async () => {
    const n = await numerosDoPainel(agora)
    expect(n).toEqual({
      agentes: 0,
      fontesProntas: 0,
      fontesComErro: 0,
      conversas: 0,
      mensagens: 0,
      porCanal: [
        { canal: 'painel', conversas: 0, mensagens: 0 },
        { canal: 'widget', conversas: 0, mensagens: 0 },
        { canal: 'telegram', conversas: 0, mensagens: 0 },
      ],
    })
  })

  it('conta agentes e fontes por situação (só pronta e erro entram nos cartões)', async () => {
    const a1 = await criarAgenteDeTeste()
    const a2 = await criarAgenteDeTeste()
    for (const s of ['pronto', 'pronto', 'erro', 'processando', 'pendente']) await fonte(a1.id, s)
    await fonte(a2.id, 'pronto')
    const n = await numerosDoPainel(agora)
    expect(n).toMatchObject({ agentes: 2, fontesProntas: 3, fontesComErro: 1 })
  })

  it('conversas e mensagens dos últimos 7 dias, com a quebra por canal', async () => {
    const admin = await criarAdmin()
    const ag = await criarAgenteDeTeste({ criadoPorId: admin.id })
    await criarConversaDeTeste({ agenteId: ag.id, canal: 'widget', mensagens: [
      { papel: 'user', conteudo: 'a', criadoEm: local(15, 9) },
      { papel: 'assistant', conteudo: 'b', criadoEm: local(15, 9, 1) },
    ] })
    await criarConversaDeTeste({ agenteId: ag.id, canal: 'telegram', mensagens: [{ papel: 'user', conteudo: 'c', criadoEm: local(10, 8) }] })
    await criarConversaDeTeste({ agenteId: ag.id, canal: 'painel', criadoPorId: admin.id, mensagens: [
      { papel: 'user', conteudo: 'd', criadoEm: local(12, 8) },
      { papel: 'assistant', conteudo: 'e', criadoEm: local(12, 8, 1) },
      { papel: 'user', conteudo: 'f', criadoEm: local(13, 8) },
    ] })
    const n = await numerosDoPainel(agora)
    expect(n.conversas).toBe(3)
    expect(n.mensagens).toBe(6)
    expect(n.porCanal).toEqual([
      { canal: 'painel', conversas: 1, mensagens: 3 },
      { canal: 'widget', conversas: 1, mensagens: 2 },
      { canal: 'telegram', conversas: 1, mensagens: 1 },
    ])
  })
})

describe('numerosDoPainel (funcional: bordas da janela)', () => {
  it('a janela começa na meia-noite local de há 6 dias e vai até o fim de hoje', async () => {
    const ag = await criarAgenteDeTeste()
    await criarConversaDeTeste({ agenteId: ag.id, canal: 'widget', mensagens: [
      { papel: 'user', conteudo: 'fora, 08/03 23:59', criadoEm: local(8, 23, 59) },
      { papel: 'user', conteudo: 'dentro, 09/03 00:00', criadoEm: local(9, 0, 0) },
      { papel: 'user', conteudo: 'dentro, hoje 23:59', criadoEm: local(15, 23, 59) },
      { papel: 'user', conteudo: 'fora, amanhã 00:00', criadoEm: local(16, 0, 0) },
    ] })
    const n = await numerosDoPainel(agora)
    expect(n.mensagens).toBe(2)
    expect(n.conversas).toBe(1)
  })

  it('uma conversa só com mensagens antigas não conta, e uma com mensagens dentro e fora conta uma vez', async () => {
    const ag = await criarAgenteDeTeste()
    await criarConversaDeTeste({ agenteId: ag.id, canal: 'telegram', mensagens: [{ papel: 'user', conteudo: 'velha', criadoEm: local(1, 10) }] })
    await criarConversaDeTeste({ agenteId: ag.id, canal: 'telegram', mensagens: [
      { papel: 'user', conteudo: 'antes', criadoEm: local(2, 10) },
      { papel: 'user', conteudo: 'depois 1', criadoEm: local(14, 10) },
      { papel: 'user', conteudo: 'depois 2', criadoEm: local(14, 11) },
    ] })
    const n = await numerosDoPainel(agora)
    expect(n.conversas).toBe(1)
    expect(n.mensagens).toBe(2)
  })

  it('usa SQL parametrizado: o instante não é concatenado e o módulo não usa as variantes inseguras', async () => {
    const { readFileSync } = await import('node:fs')
    const fonteDoServico = readFileSync('src/servicos/painel.ts', 'utf8')
    expect(fonteDoServico).not.toMatch(/queryRawUnsafe|executeRawUnsafe/)
    expect(fonteDoServico).toContain('$queryRaw')
  })
})
