// Contador de consultas ao banco de teste (FT-09, T-01.01). Serve para provar que uma
// função não faz uma consulta por item (N+1). O `prisma` do projeto é um singleton de
// módulo, então o teste o troca por um cliente com log de consultas:
//
//   vi.mock('@/lib/prisma', async () => {
//     const { criarClienteContador } = await import('./apoio/contador-de-consultas')
//     return { prisma: criarClienteContador() }
//   })
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../../src/gerado/prisma/client'

let consultas = 0

/** Um cliente igual ao do projeto, que também conta cada consulta enviada ao SQLite. */
export function criarClienteContador(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL ausente: o setup de teste a define.')
  const cliente = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url }),
    log: [{ emit: 'event', level: 'query' }],
  })
  cliente.$on('query', () => {
    consultas += 1
  })
  return cliente
}

/** Quantas consultas ao banco a função fez enquanto rodava. */
export async function contarConsultas(fn: () => Promise<unknown>): Promise<number> {
  const antes = consultas
  await fn()
  return consultas - antes
}
