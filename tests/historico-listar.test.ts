// T-02.02: listarConversas com paginação, filtros por agente, canal e período e ordenação.
import { describe, it, expect, beforeEach } from 'vitest'
import { ErroDeAplicacao } from '@/lib/erros'
import { listarConversas } from '@/servicos/historico'
import { criarAdmin, limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarConversaDeTeste } from './apoio/historico'

beforeEach(limparBanco)

const CANAIS = ['painel', 'widget', 'telegram'] as const

/** 30 conversas do mesmo agente, a de índice maior é a mais recente. */
async function trintaConversas() {
  const admin = await criarAdmin()
  const agente = await criarAgenteDeTeste({ nome: 'Vendas', criadoPorId: admin.id })
  const base = new Date('2026-03-01T12:00:00.000Z').getTime()
  for (let i = 0; i < 30; i += 1) {
    const canal = CANAIS[i % 3] as (typeof CANAIS)[number]
    await criarConversaDeTeste({
      agenteId: agente.id,
      canal,
      criadoPorId: canal === 'painel' ? admin.id : null,
      atualizadoEm: new Date(base + i * 3_600_000),
      mensagens: [
        { papel: 'user', conteudo: `pergunta ${i}` },
        { papel: 'assistant', conteudo: `resposta ${i}` },
      ],
    })
  }
  return { admin, agente }
}

describe('listarConversas (integração com o banco de teste)', () => {
  it('devolve itens com agente, canal, rótulo, mensagens, atividade e prévia da última mensagem', async () => {
    const { agente } = await trintaConversas()
    const pagina = await listarConversas({})
    const primeiro = pagina.itens[0]
    expect(primeiro).toMatchObject({
      agenteId: agente.id,
      agenteNome: 'Vendas',
      totalDeMensagens: 2,
      previa: 'resposta 29',
    })
    expect(primeiro?.atualizadoEm).toBeInstanceOf(Date)
    expect(primeiro?.id).toEqual(expect.any(String))
    expect(['painel', 'widget', 'telegram']).toContain(primeiro?.canal)
  })

  it('ordena pela atividade mais recente primeiro', async () => {
    await trintaConversas()
    const { itens } = await listarConversas({})
    const tempos = itens.map((i) => i.atualizadoEm.getTime())
    expect(tempos).toEqual([...tempos].sort((a, b) => b - a))
    expect(itens[0]?.previa).toBe('resposta 29')
  })

  it('o rótulo mascara o interlocutor de cada canal', async () => {
    const admin = await criarAdmin()
    const agente = await criarAgenteDeTeste({ criadoPorId: admin.id })
    await criarConversaDeTeste({ agenteId: agente.id, canal: 'painel', criadoPorId: admin.id, mensagens: [{ papel: 'user', conteudo: 'a' }] })
    await criarConversaDeTeste({ agenteId: agente.id, canal: 'widget', identificadorExterno: 'abcdef123456789012', mensagens: [{ papel: 'user', conteudo: 'b' }] })
    await criarConversaDeTeste({ agenteId: agente.id, canal: 'telegram', identificadorExterno: '555444333', titulo: 'Telegram: Maria', mensagens: [{ papel: 'user', conteudo: 'c' }] })
    const pagina = await listarConversas({})
    const rotulos = Object.fromEntries(pagina.itens.map((i) => [i.canal, i.rotulo]))
    expect(rotulos).toEqual({ painel: admin.nome, widget: 'Visitante abcdef', telegram: 'Telegram: Maria' })
    const texto = JSON.stringify(pagina)
    expect(texto).not.toContain('abcdef123456789012')
    expect(texto).not.toContain('555444333')
  })

  it('conversa sem mensagens aparece com zero mensagens e prévia vazia', async () => {
    const agente = await criarAgenteDeTeste()
    await criarConversaDeTeste({ agenteId: agente.id, canal: 'widget', mensagens: [] })
    const { itens } = await listarConversas({})
    expect(itens[0]).toMatchObject({ totalDeMensagens: 0, previa: '' })
  })
})

describe('listarConversas (funcional)', () => {
  it('tamanho 25 devolve 25 itens e total 30; a página 2 devolve 5', async () => {
    await trintaConversas()
    const p1 = await listarConversas({ tamanho: 25 })
    expect(p1.itens).toHaveLength(25)
    expect(p1).toMatchObject({ total: 30, pagina: 1, tamanho: 25, totalDePaginas: 2 })
    const p2 = await listarConversas({ pagina: 2 })
    expect(p2.itens).toHaveLength(5)
    expect(new Set([...p1.itens, ...p2.itens].map((i) => i.id)).size).toBe(30)
    const alem = await listarConversas({ pagina: 3 })
    expect(alem.itens).toEqual([])
    expect(alem.total).toBe(30)
  })

  it('sem conversas devolve lista vazia, total 0 e uma página', async () => {
    expect(await listarConversas({})).toMatchObject({ itens: [], total: 0, totalDePaginas: 1 })
  })

  it('filtrar por agente e canal reduz o total', async () => {
    await trintaConversas()
    const outro = await criarAgenteDeTeste({ nome: 'Suporte' })
    await criarConversaDeTeste({ agenteId: outro.id, canal: 'widget', mensagens: [{ papel: 'user', conteudo: 'oi' }] })
    expect((await listarConversas({ agenteId: outro.id })).total).toBe(1)
    const widgets = await listarConversas({ canal: 'widget' })
    expect(widgets.total).toBe(11)
    expect(widgets.itens.every((i) => i.canal === 'widget')).toBe(true)
    const ambos = await listarConversas({ agenteId: outro.id, canal: 'telegram' })
    expect(ambos.total).toBe(0)
  })

  it('o período vai da meia-noite local de "de" até o fim do dia "ate"', async () => {
    const agente = await criarAgenteDeTeste()
    const meiaNoite = new Date(2026, 2, 10, 0, 0, 0, 0).getTime()
    const horarios = [meiaNoite - 60_000, meiaNoite, meiaNoite + 12 * 3_600_000, meiaNoite + 24 * 3_600_000]
    for (const t of horarios) {
      await criarConversaDeTeste({ agenteId: agente.id, canal: 'widget', atualizadoEm: new Date(t), mensagens: [{ papel: 'user', conteudo: 'x' }] })
    }
    expect((await listarConversas({ de: '2026-03-10', ate: '2026-03-10' })).total).toBe(2)
    expect((await listarConversas({ de: '2026-03-10' })).total).toBe(3)
    expect((await listarConversas({ ate: '2026-03-09' })).total).toBe(1)
  })

  it('filtro inválido é 422', async () => {
    for (const entrada of [{ pagina: 0 }, { tamanho: 101 }, { canal: 'email' }]) {
      await expect(listarConversas(entrada)).rejects.toSatisfy((e) => e instanceof ErroDeAplicacao && e.status === 422)
    }
  })
})
