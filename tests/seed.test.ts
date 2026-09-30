/**
 * A seed de demonstração (PR-25): duas contas fictícias, idempotente, e que
 * se recusa a rodar em produção porque cria contas com senha conhecida.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { spawnSync } from 'node:child_process'
import { prisma } from '@/lib/prisma'
import { senhaConfere } from '@/lib/senha'
import { limparBanco } from './ajuda'

function semear(ambienteExtra: Record<string, string> = {}) {
  return spawnSync('npx', ['tsx', 'prisma/seed.ts'], {
    env: { ...process.env, ...ambienteExtra },
    encoding: 'utf8',
  })
}

describe('seed de demonstração', () => {
  beforeEach(limparBanco)

  it('cria as duas contas e é idempotente', async () => {
    expect(semear().status).toBe(0)
    expect(semear().status).toBe(0)

    const usuarios = await prisma.usuario.findMany({ orderBy: { email: 'asc' } })
    expect(usuarios.map((u) => [u.email, u.papel])).toEqual([
      ['admin@exemplo.local', 'admin'],
      ['usuario@exemplo.local', 'usuario'],
    ])
    for (const u of usuarios) {
      expect(await senhaConfere('demo1234', u.senhaHash)).toBe(true)
      expect(u.ativo).toBe(true)
    }
  })

  it('recusa rodar em produção e não grava nada', async () => {
    const r = semear({ NODE_ENV: 'production' })
    expect(r.status).not.toBe(0)
    expect(r.stderr).toContain('não roda em produção')
    expect(await prisma.usuario.count()).toBe(0)
  })
})
