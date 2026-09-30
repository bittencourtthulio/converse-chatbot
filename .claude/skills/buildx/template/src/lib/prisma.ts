import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@/gerado/prisma/client'

// Prisma 7: a conexão vem por adapter, e a URL é lida aqui — configuração
// por ambiente (L20), não valor fixo no código.
function novoClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'Variável de ambiente obrigatória ausente: DATABASE_URL. Veja o .env.example.',
    )
  }
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) })
}

// Uma instância só. Em desenvolvimento o Next recarrega o módulo a cada
// mudança, e sem o cache global cada recarga abriria outra conexão.
const global_ = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = global_.prisma ?? novoClient()

if (process.env.NODE_ENV !== 'production') global_.prisma = prisma
