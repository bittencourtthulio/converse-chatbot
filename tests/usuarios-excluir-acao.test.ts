/**
 * T-03.02 (FT-10, PR-88): a ação de servidor excluirUsuario. Só as bordas do framework são
 * trocadas (sessão, redirecionamento e revalidação); o serviço e o banco são os reais.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

let sessao: Awaited<ReturnType<typeof criarUsuario>> | null = null
vi.mock('@/app/sessao-servidor', () => ({
  exigirUsuario: async () => sessao,
  exigirUsuarioAdmin: async () => {
    if (!sessao || sessao.papel !== 'admin') throw Object.assign(new Error('NEXT_REDIRECT'), { destino: '/' })
    return sessao
  },
  gravarCookieDeSessao: async () => undefined,
  apagarCookieDeSessao: async () => undefined,
}))
vi.mock('next/navigation', () => ({ redirect: (d: string) => { throw Object.assign(new Error('NEXT_REDIRECT'), { destino: d }) } }))
vi.mock('next/cache', () => ({ revalidatePath: () => undefined }))

const { excluirUsuario } = await import('@/app/acoes')

const formulario = (campos: Record<string, string>) => {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) f.set(k, v)
  return f
}

beforeEach(async () => {
  await limparBanco()
  sessao = await criarAdmin()
})

describe('excluirUsuario (ação de servidor)', () => {
  it('com o e-mail certo exclui o usuário e devolve a mensagem de sucesso', async () => {
    const alvo = await criarUsuario({ email: 'alvo@teste.local' })
    const r = await excluirUsuario({}, formulario({ id: alvo.id, confirmacao: ' ALVO@teste.local ' }))
    expect(r.sucesso).toMatch(/excluído/i)
    expect(await prisma.usuario.findUnique({ where: { id: alvo.id } })).toBeNull()
  })

  it('com o e-mail errado ou ausente devolve erro e não exclui', async () => {
    const alvo = await criarUsuario({ email: 'alvo@teste.local' })
    expect((await excluirUsuario({}, formulario({ id: alvo.id, confirmacao: 'outro@teste.local' }))).erro).toMatch(/e-mail/i)
    expect((await excluirUsuario({}, formulario({ id: alvo.id }))).erro).toMatch(/e-mail/i)
    expect(await prisma.usuario.findUnique({ where: { id: alvo.id } })).not.toBeNull()
  })

  it('excluir a própria conta devolve o erro 409 como mensagem', async () => {
    const r = await excluirUsuario({}, formulario({ id: sessao!.id, confirmacao: sessao!.email }))
    expect(r.erro).toMatch(/último administrador|própria conta/)
    expect(await prisma.usuario.findUnique({ where: { id: sessao!.id } })).not.toBeNull()
  })

  it('usuário comum não chega ao serviço: a guarda de admin barra antes e nada é excluído', async () => {
    const alvo = await criarUsuario()
    sessao = await criarUsuario()
    const r = await excluirUsuario({}, formulario({ id: alvo.id, confirmacao: alvo.email }))
    expect(r.erro).toBeDefined()
    expect(r.sucesso).toBeUndefined()
    expect(await prisma.usuario.findUnique({ where: { id: alvo.id } })).not.toBeNull()
  })
})
