// T-02.05 (FT-10, PR-19, PR-87): criar e editar usuário gravam a auditoria na MESMA
// transação; só os nomes dos campos alterados (e papel e situação), nunca e-mail, nome ou senha.
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { criar, desativar, editar } from '@/servicos/usuarios'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

const falha = vi.hoisted(() => ({ ligada: false }))
vi.mock('@/servicos/auditoria', async (original) => {
  const real = await original<typeof import('@/servicos/auditoria')>()
  return {
    ...real,
    registrar: (...argumentos: Parameters<typeof real.registrar>) =>
      falha.ligada ? Promise.reject(new Error('auditoria fora do ar')) : real.registrar(...argumentos),
  }
})

beforeEach(async () => {
  falha.ligada = false
  await limparBanco()
})
afterAll(limparBanco)

const registros = () => prisma.registroDeAuditoria.findMany({ orderBy: { quando: 'asc' } })

describe('criar usuário (integração: mesma transação)', () => {
  it('grava usuario_criado com o papel, o alvo e o rótulo do admin', async () => {
    const admin = await criarAdmin()
    const novo = await criar(admin, { nome: 'Maria', email: 'maria@teste.local', senha: 'senha-boa-123', papel: 'admin' })
    const [r] = await registros()
    expect(await registros()).toHaveLength(1)
    expect(r).toMatchObject({
      acao: 'usuario_criado',
      alvoTipo: 'usuario',
      alvoId: novo.id,
      usuarioId: admin.id,
      usuarioRotulo: `${admin.nome} <${admin.email}>`,
    })
    expect(JSON.parse(r!.detalhes)).toEqual({ papel: 'admin' })
  })

  it('com a auditoria falhando o usuário não é criado', async () => {
    const admin = await criarAdmin()
    falha.ligada = true
    await expect(criar(admin, { nome: 'Maria', email: 'maria@teste.local', senha: 'senha-boa-123' })).rejects.toThrow('auditoria fora do ar')
    expect(await prisma.usuario.count({ where: { email: 'maria@teste.local' } })).toBe(0)
    expect(await prisma.registroDeAuditoria.count()).toBe(0)
  })
})

describe('editar usuário (integração: mesma transação)', () => {
  it('com a auditoria falhando o usuário não é alterado', async () => {
    const admin = await criarAdmin()
    const alvo = await criarUsuario()
    falha.ligada = true
    await expect(editar(admin, alvo.id, { papel: 'admin' })).rejects.toThrow('auditoria fora do ar')
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: alvo.id } })).papel).toBe('usuario')
  })
})

describe('editar usuário (funcional: só nomes de campo)', () => {
  it('mudar só o papel de usuario para admin grava campos papel com o papel anterior e o novo', async () => {
    const admin = await criarAdmin()
    const alvo = await criarUsuario()
    await editar(admin, alvo.id, { papel: 'admin' })
    const [r] = await registros()
    expect(r?.acao).toBe('usuario_editado')
    expect(r?.alvoId).toBe(alvo.id)
    expect(JSON.parse(r!.detalhes)).toEqual({ campos: ['papel'], papelAnterior: 'usuario', papelNovo: 'admin' })
  })

  it('mudar nome e e-mail grava só os nomes dos campos, sem os valores', async () => {
    const admin = await criarAdmin()
    const alvo = await criarUsuario({ email: 'antigo@teste.local' })
    await editar(admin, alvo.id, { nome: 'Nome Novo Secreto', email: 'novo@teste.local' })
    const [r] = await registros()
    expect(JSON.parse(r!.detalhes)).toEqual({ campos: ['nome', 'email'] })
    expect(r!.detalhes).not.toMatch(/Secreto|antigo@|novo@/)
  })

  it('desativar grava ativo falso e a senha nunca aparece', async () => {
    const admin = await criarAdmin()
    const alvo = await criarUsuario()
    await desativar(admin, alvo.id)
    const [r] = await registros()
    expect(JSON.parse(r!.detalhes)).toEqual({ campos: ['ativo'], ativo: false })
    expect(JSON.stringify(await registros())).not.toContain('senha')
  })

  it('editar sem mudança real não grava registro, e a falha de validação não grava nada', async () => {
    const admin = await criarAdmin()
    const alvo = await criarUsuario()
    await editar(admin, alvo.id, { papel: 'usuario', ativo: true })
    await expect(editar(admin, alvo.id, { email: 'invalido' })).rejects.toMatchObject({ status: 422 })
    expect(await prisma.registroDeAuditoria.count()).toBe(0)
  })
})
