/**
 * O índice FTS5 acompanha as exclusões em cascata e o reprocessamento (FT-05,
 * PR-50): excluir fonte, excluir agente (serviços reais), reprocessar pela fila
 * e `limparBanco` não deixam linha órfã em `trechos_fts`.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { criarFila } from '@/servicos/fontes-fila'
import { excluir as excluirFonte } from '@/servicos/fontes'
import { excluir as excluirAgente } from '@/servicos/agentes'
import { criarAdmin, limparBanco } from './ajuda'
import { armazenamentoDeTeste, criarAgenteDeTeste, criarFonteDeTeste } from './apoio/fontes'

async function achar(termo: string): Promise<number> {
  const linhas = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT t.id FROM trechos_fts JOIN trechos t ON t.rowid = trechos_fts.rowid
    WHERE trechos_fts MATCH ${`"${termo}"`}`
  return linhas.length
}

/** Verifica o índice contra a tabela de conteúdo; lança se houver divergência. */
async function indiceConsistente(): Promise<void> {
  await prisma.$executeRawUnsafe(`INSERT INTO trechos_fts(trechos_fts, rank) VALUES('integrity-check', 1)`)
}

async function comTrechos(agenteId: string, texto: string, n = 3) {
  const fonte = await criarFonteDeTeste({ agenteId, tipo: 'texto', status: 'pronto' })
  await prisma.trecho.createMany({
    data: Array.from({ length: n }, (_, i) => ({
      fonteId: fonte.id,
      agenteId,
      indice: i,
      texto: `${texto} parte ${i}`,
      caracteres: texto.length,
    })),
  })
  return fonte
}

beforeEach(async () => {
  await limparBanco()
})
afterAll(async () => {
  await limparBanco()
})

describe('cascata e reprocessamento no índice', () => {
  it('excluir uma fonte pelo serviço tira só os trechos dela do índice', async () => {
    const { dono, agente } = await criarAgenteDeTeste()
    const a = await comTrechos(agente.id, 'garantia estendida')
    await comTrechos(agente.id, 'garantia legal', 2)
    expect(await achar('garantia')).toBe(5)

    await excluirFonte(dono, agente.id, a.id)

    expect(await achar('estendida')).toBe(0)
    expect(await achar('legal')).toBe(2)
    await indiceConsistente()
  })

  it('excluir um agente pelo serviço esvazia o índice dele e preserva o de outro', async () => {
    const um = await criarAgenteDeTeste('Um')
    const dois = await criarAgenteDeTeste('Dois')
    await comTrechos(um.agente.id, 'cupom de desconto')
    await comTrechos(dois.agente.id, 'cupom de frete', 2)

    await excluirAgente(await criarAdmin(), um.agente.id)

    expect(await achar('desconto')).toBe(0)
    expect(await achar('frete')).toBe(2)
    await indiceConsistente()
  })

  it('reprocessar pela fila substitui os trechos e o índice acha só o texto novo', async () => {
    const { agente } = await criarAgenteDeTeste()
    const fonte = await criarFonteDeTeste({ agenteId: agente.id, bytes: Buffer.from('Nova política de reembolso integral.') })
    await prisma.trecho.createMany({
      data: [0, 1].map((i) => ({ fonteId: fonte.id, agenteId: agente.id, indice: i, texto: 'regra antiga de cashback', caracteres: 24 })),
    })
    expect(await achar('cashback')).toBe(2)

    await criarFila({ armazenamento: armazenamentoDeTeste() }).processarUma(fonte.id)

    expect(await achar('cashback')).toBe(0)
    expect(await achar('reembolso')).toBe(1)
    await indiceConsistente()
  })

  it('limparBanco deixa o índice vazio', async () => {
    const { agente } = await criarAgenteDeTeste()
    await comTrechos(agente.id, 'inventário geral')
    await limparBanco()
    expect(await achar('inventario')).toBe(0)
    await indiceConsistente()
  })
})
