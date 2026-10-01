// T-03.01 (FT-10, PR-18, PR-88): exclusão definitiva de usuário pelo admin. O conteúdo da
// empresa (agentes, conversas, fontes) permanece; os vínculos são desfeitos; a sessão cai; a
// auditoria guarda o rótulo de quem foi excluído.
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { assinarSessao } from '@/lib/sessao'
import { usuarioDaSessao } from '@/servicos/autenticacao'
import { excluirDefinitivamente } from '@/servicos/usuarios'
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

async function usuarioComConteudo() {
  const alvo = await criarUsuario({ email: 'saindo@teste.local' })
  const a1 = await prisma.agente.create({ data: { nome: 'Agente 1', modelo: 'm', criadoPorId: alvo.id } })
  const a2 = await prisma.agente.create({ data: { nome: 'Agente 2', modelo: 'm', criadoPorId: alvo.id } })
  for (let i = 0; i < 3; i += 1) {
    await prisma.conversa.create({ data: { agenteId: a1.id, canal: 'painel', criadoPorId: alvo.id, mensagens: { create: { papel: 'user', conteudo: `oi ${i}` } } } })
  }
  const fonte = await prisma.fonte.create({ data: { agenteId: a2.id, tipo: 'texto', titulo: 'Manual', tamanhoBytes: 5, criadoPorId: alvo.id } })
  await prisma.configuracaoDoWorkspace.create({ data: { id: 'unica', atualizadoPor: alvo.id } })
  return { alvo, a1, a2, fonte }
}

describe('excluirDefinitivamente (integração com o banco de teste)', () => {
  it('passa os agentes ao admin, anula o criador de conversas e fontes, limpa atualizadoPor e apaga o usuário', async () => {
    const admin = await criarAdmin()
    const { alvo, a1, a2, fonte } = await usuarioComConteudo()

    const r = await excluirDefinitivamente(alvo.id, admin.id)

    expect(r).toEqual({ agentesTransferidos: 2 })
    expect(await prisma.usuario.findUnique({ where: { id: alvo.id } })).toBeNull()
    for (const id of [a1.id, a2.id]) {
      expect((await prisma.agente.findUniqueOrThrow({ where: { id } })).criadoPorId).toBe(admin.id)
    }
    expect(await prisma.conversa.count()).toBe(3)
    expect(await prisma.mensagem.count()).toBe(3)
    expect(await prisma.conversa.count({ where: { criadoPorId: { not: null } } })).toBe(0)
    expect((await prisma.fonte.findUniqueOrThrow({ where: { id: fonte.id } })).criadoPorId).toBeNull()
    expect((await prisma.configuracaoDoWorkspace.findUniqueOrThrow({ where: { id: 'unica' } })).atualizadoPor).toBeNull()
  })

  it('grava usuario_excluido com o rótulo do excluído e o do admin, na mesma transação', async () => {
    const admin = await criarAdmin()
    const { alvo } = await usuarioComConteudo()
    await excluirDefinitivamente(alvo.id, admin.id)
    const [r] = await prisma.registroDeAuditoria.findMany()
    expect(r).toMatchObject({
      acao: 'usuario_excluido',
      alvoTipo: 'usuario',
      alvoId: alvo.id,
      usuarioId: admin.id,
      usuarioRotulo: `${admin.nome} <${admin.email}>`,
    })
    expect(JSON.parse(r!.detalhes)).toEqual({ rotulo: `${alvo.nome} <${alvo.email}>`, papel: 'usuario', agentesTransferidos: 2 })
  })

  it('com a auditoria falhando nada muda: o usuário, os agentes e os vínculos ficam', async () => {
    const admin = await criarAdmin()
    const { alvo, a1 } = await usuarioComConteudo()
    falha.ligada = true
    await expect(excluirDefinitivamente(alvo.id, admin.id)).rejects.toThrow('auditoria fora do ar')
    expect(await prisma.usuario.findUnique({ where: { id: alvo.id } })).not.toBeNull()
    expect((await prisma.agente.findUniqueOrThrow({ where: { id: a1.id } })).criadoPorId).toBe(alvo.id)
    expect(await prisma.conversa.count({ where: { criadoPorId: alvo.id } })).toBe(3)
  })

  it('a sessão do usuário excluído deixa de valer', async () => {
    const admin = await criarAdmin()
    const alvo = await criarUsuario()
    const token = await assinarSessao(alvo.id, alvo.papel)
    expect((await usuarioDaSessao(token)).id).toBe(alvo.id)
    await excluirDefinitivamente(alvo.id, admin.id)
    await expect(usuarioDaSessao(token)).rejects.toMatchObject({ status: 401 })
  })
})

describe('excluirDefinitivamente (funcional: as recusas)', () => {
  it('excluir a si mesmo dá 409, e sendo o último admin ativo a mensagem diz isso', async () => {
    const admin = await criarAdmin()
    await expect(excluirDefinitivamente(admin.id, admin.id)).rejects.toMatchObject({ status: 409, message: expect.stringMatching(/último administrador/) })
    const outro = await criarAdmin()
    await expect(excluirDefinitivamente(admin.id, admin.id)).rejects.toMatchObject({ status: 409, message: expect.stringMatching(/própria conta/) })
    expect(await prisma.usuario.count({ where: { id: { in: [admin.id, outro.id] } } })).toBe(2)
  })

  it('quem não é admin ativo recebe 403 e nada é apagado', async () => {
    const comum = await criarUsuario()
    const alvo = await criarUsuario()
    const adminInativo = await criarUsuario({ papel: 'admin', ativo: false })
    await expect(excluirDefinitivamente(alvo.id, comum.id)).rejects.toMatchObject({ status: 403 })
    await expect(excluirDefinitivamente(alvo.id, adminInativo.id)).rejects.toMatchObject({ status: 403 })
    await expect(excluirDefinitivamente(alvo.id, 'nao-existe')).rejects.toMatchObject({ status: 403 })
    expect(await prisma.usuario.findUnique({ where: { id: alvo.id } })).not.toBeNull()
  })

  it('usuário inexistente dá 404 e não grava registro', async () => {
    const admin = await criarAdmin()
    await expect(excluirDefinitivamente('nao-existe', admin.id)).rejects.toMatchObject({ status: 404 })
    expect(await prisma.registroDeAuditoria.count()).toBe(0)
  })

  it('um admin pode excluir outro admin enquanto restar admin ativo', async () => {
    const a = await criarAdmin()
    const b = await criarAdmin()
    await excluirDefinitivamente(b.id, a.id)
    expect(await prisma.usuario.count({ where: { papel: 'admin' } })).toBe(1)
  })
})
