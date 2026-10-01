/**
 * T-02.01 (FT-12, PR-101, PR-103): o esquema da sessão revogável. O banco de teste é criado por
 * `prisma migrate deploy` do zero (tests/setup.ts), então o que se lê aqui é o que a migration entrega.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { criarUsuario, limparBanco } from './ajuda'

beforeEach(limparBanco)

interface Coluna {
  name: string
  type: string
  notnull: number | bigint
  dflt_value: string | null
  pk: number | bigint
}

const colunas = (tabela: string) => prisma.$queryRawUnsafe<Coluna[]>(`PRAGMA table_info("${tabela}")`)

describe('esquema da sessão revogável (integração)', () => {
  it('a tabela sessoes_revogadas tem jti como chave, usuarioId, revogadaEm e expiraEm', async () => {
    const cs = await colunas('sessoes_revogadas')
    expect(cs.map((c) => c.name).sort()).toEqual(['expiraEm', 'jti', 'revogadaEm', 'usuarioId'])
    expect(Number(cs.find((c) => c.name === 'jti')?.pk)).toBe(1)
    expect(cs.every((c) => Number(c.notnull) === 1)).toBe(true)
  })

  it('há índice em expiraEm para o expurgo e nenhuma chave estrangeira para usuarios', async () => {
    const indices = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA index_list("sessoes_revogadas")`)
    const colunasDosIndices: string[] = []
    for (const { name } of indices) {
      const info = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA index_info("${name}")`)
      colunasDosIndices.push(...info.map((i) => i.name))
    }
    expect(colunasDosIndices).toContain('expiraEm')
    expect(await prisma.$queryRawUnsafe<unknown[]>(`PRAGMA foreign_key_list("sessoes_revogadas")`)).toEqual([])
  })

  it('a coluna usuarios.versaoDaSessao é inteira, obrigatória e tem padrão 0', async () => {
    const c = (await colunas('usuarios')).find((x) => x.name === 'versaoDaSessao')
    expect(c).toMatchObject({ type: 'INTEGER', dflt_value: '0' })
    expect(Number(c?.notnull)).toBe(1)
  })
})

describe('dados da sessão revogável (funcional)', () => {
  it('um usuário inserido por SQL sem a coluna nova lê versaoDaSessao 0 pelo Prisma', async () => {
    await prisma.$executeRawUnsafe(
      `INSERT INTO usuarios (id, nome, email, senhaHash, papel, ativo, sessoesValidasDesde, criadoEm, atualizadoEm)
       VALUES ('u-antigo', 'Antigo', 'antigo@teste.local', 'hash', 'usuario', 1, datetime('now'), datetime('now'), datetime('now'))`,
    )
    const u = await prisma.usuario.findUniqueOrThrow({ where: { id: 'u-antigo' } })
    expect(u.versaoDaSessao).toBe(0)
  })

  it('um usuário criado pelo helper também começa na versão 0', async () => {
    const criado = await criarUsuario()
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: criado.id } })).versaoDaSessao).toBe(0)
  })

  it('dois registros com o mesmo jti violam a unicidade e o jti guarda a data de expiração', async () => {
    const expiraEm = new Date('2026-10-02T00:00:00Z')
    await prisma.sessaoRevogada.create({ data: { jti: 'jti-1', usuarioId: 'u1', expiraEm } })
    await expect(prisma.sessaoRevogada.create({ data: { jti: 'jti-1', usuarioId: 'u1', expiraEm } })).rejects.toThrow()
    const linha = await prisma.sessaoRevogada.findUniqueOrThrow({ where: { jti: 'jti-1' } })
    expect(linha.expiraEm.toISOString()).toBe(expiraEm.toISOString())
    expect(linha.revogadaEm.getTime()).toBeGreaterThan(0)
  })

  it('limparBanco apaga as revogações', async () => {
    await prisma.sessaoRevogada.create({ data: { jti: 'jti-2', usuarioId: 'u1', expiraEm: new Date() } })
    await limparBanco()
    expect(await prisma.sessaoRevogada.count()).toBe(0)
  })
})
