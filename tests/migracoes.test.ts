/**
 * Regra "migração só acrescenta" (docs/stack/CONVENCOES.md, seção 4): uma
 * migration com DROP TABLE ou DROP COLUMN precisa carregar a marca
 * `-- destrutiva-autorizada`, escrita por quem decidiu perder aquele dado.
 */
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const MARCA = '-- destrutiva-autorizada'
const REMOCAO = /\bDROP\s+(TABLE|COLUMN)\b/i

/** Comandos de remoção sem a marca. Linhas de comentário não contam como comando. */
export function remocoesSemMarca(sql: string): string[] {
  if (sql.includes(MARCA)) return []
  return sql
    .split('\n')
    .filter((linha) => !linha.trim().startsWith('--'))
    .filter((linha) => REMOCAO.test(linha))
    .map((linha) => linha.trim())
}

const pasta = path.join(process.cwd(), 'prisma/migrations')
const migrations = readdirSync(pasta).filter((nome) =>
  existsSync(path.join(pasta, nome, 'migration.sql')),
)

describe('verificador de migração destrutiva', () => {
  it('DROP TABLE sem a marca é apontado', () => {
    expect(remocoesSemMarca('CREATE TABLE a (x INT);\nDROP TABLE "a";')).toEqual([
      'DROP TABLE "a";',
    ])
  })

  it('DROP COLUMN sem a marca é apontado, em qualquer caixa', () => {
    expect(remocoesSemMarca('ALTER TABLE a\ndrop column b;')).toEqual(['drop column b;'])
  })

  it('com a marca passa', () => {
    expect(remocoesSemMarca(`${MARCA}\nDROP TABLE "a";`)).toEqual([])
  })

  it('a palavra DROP em comentário não conta', () => {
    expect(remocoesSemMarca('-- não faz DROP TABLE aqui\nCREATE TABLE b (x INT);')).toEqual([])
  })
})

describe('migrations do repositório', () => {
  it('existe ao menos uma migration', () => {
    expect(migrations.length).toBeGreaterThan(0)
  })

  it.each(migrations)('%s não remove tabela nem coluna sem a marca', (nome) => {
    const sql = readFileSync(path.join(pasta, nome, 'migration.sql'), 'utf8')
    expect(remocoesSemMarca(sql)).toEqual([])
  })
})
