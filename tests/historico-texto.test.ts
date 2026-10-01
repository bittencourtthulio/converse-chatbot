// T-02.03: filtro por texto (LIKE escapado, teto de 200 conversas casadas, PR-79).
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { listarConversas } from '@/servicos/historico'
import { limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarConversaDeTeste } from './apoio/historico'

beforeEach(limparBanco)

async function conversa(agenteId: string, ...conteudos: string[]) {
  return criarConversaDeTeste({
    agenteId,
    canal: 'widget',
    mensagens: conteudos.map((conteudo, i) => ({ papel: i % 2 === 0 ? ('user' as const) : ('assistant' as const), conteudo })),
  })
}

describe('filtro por texto (integração com o banco de teste)', () => {
  it('casa o conteúdo de qualquer mensagem da conversa, sem diferenciar maiúsculas', async () => {
    const agente = await criarAgenteDeTeste()
    const a = await conversa(agente.id, 'Qual o prazo de ENTREGA?', 'Cinco dias.')
    await conversa(agente.id, 'Quais as formas de pagamento?', 'Pix e cartão.')
    const r = await listarConversas({ texto: 'entrega' })
    expect(r.itens.map((i) => i.id)).toEqual([a.id])
    expect(r.total).toBe(1)
    // O texto está na primeira mensagem, não na última (a prévia mostra a última).
    expect(r.itens[0]?.previa).toBe('Cinco dias.')
  })

  it('uma conversa com duas mensagens casadas aparece uma vez só', async () => {
    const agente = await criarAgenteDeTeste()
    await conversa(agente.id, 'troca aqui', 'troca ali', 'troca acolá')
    const r = await listarConversas({ texto: 'troca' })
    expect(r.total).toBe(1)
    expect(r.itens).toHaveLength(1)
  })

  it('combina com os outros filtros', async () => {
    const a1 = await criarAgenteDeTeste({ nome: 'A' })
    const a2 = await criarAgenteDeTeste({ nome: 'B' })
    await conversa(a1.id, 'frete grátis')
    const alvo = await conversa(a2.id, 'frete grátis')
    const r = await listarConversas({ texto: 'frete', agenteId: a2.id })
    expect(r.itens.map((i) => i.id)).toEqual([alvo.id])
  })
})

describe('filtro por texto (funcional)', () => {
  it('buscar 50% acha só o texto literal e não vira curinga', async () => {
    const agente = await criarAgenteDeTeste()
    const com = await conversa(agente.id, 'desconto de 50% hoje')
    await conversa(agente.id, 'desconto de 50 reais')
    await conversa(agente.id, 'nada a ver')
    const r = await listarConversas({ texto: '50%' })
    expect(r.itens.map((i) => i.id)).toEqual([com.id])
  })

  it('sublinhado e barra invertida também são literais', async () => {
    const agente = await criarAgenteDeTeste()
    const sub = await conversa(agente.id, 'código a_b')
    await conversa(agente.id, 'código axb')
    const barra = await conversa(agente.id, 'pasta C:\\temp')
    expect((await listarConversas({ texto: 'a_b' })).itens.map((i) => i.id)).toEqual([sub.id])
    expect((await listarConversas({ texto: 'C:\\temp' })).itens.map((i) => i.id)).toEqual([barra.id])
  })

  it('aspas e ponto e vírgula são só texto e não quebram nem apagam nada', async () => {
    const agente = await criarAgenteDeTeste()
    await conversa(agente.id, "x'; DROP TABLE mensagens; --")
    const r = await listarConversas({ texto: "'; DROP TABLE mensagens" })
    expect(r.total).toBe(1)
    expect(await prisma.mensagem.count()).toBe(1)
  })

  it('250 conversas casadas devolvem no máximo 200, as mais recentes', async () => {
    const agente = await criarAgenteDeTeste()
    const base = Date.parse('2026-01-01T00:00:00.000Z')
    for (let i = 0; i < 250; i += 1) {
      await criarConversaDeTeste({
        agenteId: agente.id,
        canal: 'widget',
        atualizadoEm: new Date(base + i * 60_000),
        mensagens: [{ papel: 'user', conteudo: `palavra-comum ${i}` }],
      })
    }
    const p1 = await listarConversas({ texto: 'palavra-comum', tamanho: 100 })
    const p2 = await listarConversas({ texto: 'palavra-comum', tamanho: 100, pagina: 2 })
    const p3 = await listarConversas({ texto: 'palavra-comum', tamanho: 100, pagina: 3 })
    expect(p1.total).toBe(200)
    expect(p1.itens).toHaveLength(100)
    expect(p2.itens).toHaveLength(100)
    expect(p3.itens).toHaveLength(0)
    expect(p1.itens[0]?.previa).toBe('palavra-comum 249')
    expect(p2.itens.at(-1)?.previa).toBe('palavra-comum 50')
    // Sem texto o teto não vale.
    expect((await listarConversas({})).total).toBe(250)
  })
})
