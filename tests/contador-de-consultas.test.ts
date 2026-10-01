// T-01.01: o contador de consultas prova a ausência de N+1 nos testes do histórico.
// O cliente do projeto é um singleton de módulo; o teste o troca por um cliente com
// log de consultas, apontado para o mesmo SQLite de teste.
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', async () => {
  const { criarClienteContador } = await import('./apoio/contador-de-consultas')
  return { prisma: criarClienteContador() }
})

import { prisma } from '@/lib/prisma'
import { contarConsultas } from './apoio/contador-de-consultas'
import { criarAdmin, limparBanco } from './ajuda'

beforeEach(limparBanco)

describe('contarConsultas (integração com o SQLite de teste)', () => {
  it('conta uma consulta para um findMany e duas para duas leituras em sequência', async () => {
    expect(await contarConsultas(() => prisma.usuario.findMany())).toBe(1)
    const duas = await contarConsultas(async () => {
      await prisma.usuario.findMany()
      await prisma.agente.findMany()
    })
    expect(duas).toBe(2)
  })

  it('não conta o que acontece fora da função medida', async () => {
    await prisma.usuario.findMany()
    expect(await contarConsultas(async () => undefined)).toBe(0)
  })
})

describe('contarConsultas (funcional)', () => {
  it('distingue uma consulta por item (N+1) de uma consulta agregada única', async () => {
    const admin = await criarAdmin()
    for (const nome of ['a', 'b', 'c']) {
      await prisma.agente.create({ data: { nome, modelo: 'm', criadoPorId: admin.id } })
    }
    const ids = (await prisma.agente.findMany()).map((a) => a.id)
    expect(ids).toHaveLength(3)

    const porItem = await contarConsultas(async () => {
      await prisma.agente.findMany()
      for (const id of ids) await prisma.conversa.count({ where: { agenteId: id } })
    })
    expect(porItem).toBe(4)

    const agregada = await contarConsultas(() =>
      prisma.$queryRaw`SELECT agenteId, COUNT(*) AS n FROM conversas GROUP BY agenteId`,
    )
    expect(agregada).toBe(1)
  })
})
