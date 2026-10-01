// T-02.02: a listagem não faz uma consulta por conversa (sem N+1). O cliente do projeto é
// trocado por um cliente que conta as consultas enviadas ao SQLite de teste.
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', async () => {
  const { criarClienteContador } = await import('./apoio/contador-de-consultas')
  return { prisma: criarClienteContador() }
})

import { listarConversas } from '@/servicos/historico'
import { contarConsultas } from './apoio/contador-de-consultas'
import { limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarConversaDeTeste } from './apoio/historico'

beforeEach(limparBanco)

async function conversas(n: number) {
  const agente = await criarAgenteDeTeste()
  for (let i = 0; i < n; i += 1) {
    await criarConversaDeTeste({
      agenteId: agente.id,
      canal: i % 2 === 0 ? 'widget' : 'telegram',
      atualizadoEm: new Date(Date.now() - i * 60_000),
      mensagens: [
        { papel: 'user', conteudo: `p${i}` },
        { papel: 'assistant', conteudo: `r${i}` },
        { papel: 'user', conteudo: `s${i}` },
      ],
    })
  }
  return agente
}

describe('listarConversas: número de consultas', () => {
  it('30 conversas custam duas consultas (a página e o total), como 3 ou como 300', async () => {
    const agente = await conversas(30)
    const consultas = await contarConsultas(async () => {
      const pagina = await listarConversas({ tamanho: 30 })
      expect(pagina.itens).toHaveLength(30)
      expect(pagina.itens.every((i) => i.totalDeMensagens === 3)).toBe(true)
    })
    expect(consultas).toBe(2)

    const comFiltros = await contarConsultas(() => listarConversas({ agenteId: agente.id, canal: 'widget', de: '2020-01-01' }))
    expect(comFiltros).toBe(2)
  })

  it('o custo não cresce com o número de conversas', async () => {
    await conversas(5)
    const poucas = await contarConsultas(() => listarConversas({}))
    await conversas(20)
    const muitas = await contarConsultas(() => listarConversas({ tamanho: 25 }))
    expect(muitas).toBe(poucas)
  })
})
