/**
 * Apoio `criarBase` (FT-05): monta agente, fonte e trechos como a seed e a fila
 * fazem (createMany), para os testes de recuperação e de chat.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { limparBanco } from './ajuda'
import { criarBase } from './apoio/conhecimento'

async function achados(termo: string): Promise<string[]> {
  const linhas = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT t.id FROM trechos_fts JOIN trechos t ON t.rowid = trechos_fts.rowid
    WHERE trechos_fts MATCH ${`"${termo}"`}`
  return linhas.map((l) => l.id)
}

beforeEach(async () => {
  await limparBanco()
})
afterAll(async () => {
  await limparBanco()
})

describe('criarBase', () => {
  it('grava agente, fonte pronta e trechos numerados, e o índice os acha', async () => {
    const base = await criarBase({ textos: ['Horário das nove às dezoito.', 'Troca em sete dias.'], titulo: 'Política' })

    const fonte = await prisma.fonte.findUniqueOrThrow({ where: { id: base.fonteId } })
    expect(fonte).toMatchObject({ agenteId: base.agenteId, titulo: 'Política', status: 'pronto', totalTrechos: 2 })
    const trechos = await prisma.trecho.findMany({ where: { fonteId: base.fonteId }, orderBy: { indice: 'asc' } })
    expect(trechos.map((t) => t.indice)).toEqual([0, 1])
    expect(base.trechoIds).toEqual(trechos.map((t) => t.id))
    expect(await achados('horario')).toEqual([base.trechoIds[0]])
  })

  it('uma segunda fonte entra no mesmo agente e o status pedido é respeitado', async () => {
    const primeira = await criarBase({ textos: ['Frete grátis.'] })
    const segunda = await criarBase({ agenteId: primeira.agenteId, textos: ['Frete pago.'], status: 'erro', titulo: 'B' })

    expect(segunda.agenteId).toBe(primeira.agenteId)
    const fonte = await prisma.fonte.findUniqueOrThrow({ where: { id: segunda.fonteId } })
    expect(fonte.status).toBe('erro')
    expect(await prisma.fonte.count({ where: { agenteId: primeira.agenteId } })).toBe(2)
  })
})
