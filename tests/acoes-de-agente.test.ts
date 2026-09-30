/**
 * As ações de servidor de agente. Só as bordas do framework são trocadas
 * (cookie da sessão, redirecionamento e revalidação); o serviço e o banco são
 * os reais.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { criarUsuario, limparBanco } from './ajuda'

let usuarioDaSessao: Awaited<ReturnType<typeof criarUsuario>> | null = null

vi.mock('@/app/sessao-servidor', () => ({
  exigirUsuario: async () => {
    if (!usuarioDaSessao) throw new Error('sem sessão')
    return usuarioDaSessao
  },
  exigirUsuarioAdmin: async () => usuarioDaSessao,
  gravarCookieDeSessao: async () => undefined,
  apagarCookieDeSessao: async () => undefined,
}))
vi.mock('next/navigation', () => ({
  redirect: (destino: string) => {
    throw Object.assign(new Error('NEXT_REDIRECT'), { destino })
  },
}))
vi.mock('next/cache', () => ({ revalidatePath: () => undefined }))

const { criarAgente, editarAgente, excluirAgente } = await import('@/app/acoes')

function formulario(campos: Record<string, string>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) f.set(k, v)
  return f
}
const campos = {
  nome: 'Suporte',
  instrucoes: 'Ajude o cliente.',
  modelo: 'openai/gpt-4o-mini',
  temperatura: '0,9',
  mensagemInicial: 'Oi!',
}

beforeEach(async () => {
  await limparBanco()
  usuarioDaSessao = await criarUsuario()
})

describe('criarAgente', () => {
  it('grava e redireciona para a página do agente novo', async () => {
    const resultado = await criarAgente({}, formulario(campos)).catch((e) => e)
    const agente = await prisma.agente.findFirstOrThrow()
    expect(agente).toMatchObject({ nome: 'Suporte', criadoPorId: usuarioDaSessao!.id })
    expect(agente.temperatura).toBeCloseTo(0.9)
    expect(resultado).toMatchObject({ destino: `/agentes/${agente.id}` })
  })

  it('erro de validação volta como mensagem, sem gravar nem redirecionar', async () => {
    const resultado = await criarAgente({}, formulario({ ...campos, nome: '' }))
    expect(resultado.erro).toMatch(/nome/i)
    expect(await prisma.agente.count()).toBe(0)
  })

  it('sem sessão não grava nada', async () => {
    usuarioDaSessao = null
    const resultado = await criarAgente({}, formulario(campos))
    expect(resultado.erro).toBeTruthy()
    expect(await prisma.agente.count()).toBe(0)
  })
})

describe('editarAgente', () => {
  it('altera e confirma na própria tela', async () => {
    const agente = await prisma.agente.create({
      data: { nome: 'Antigo', modelo: 'a/b', criadoPorId: usuarioDaSessao!.id },
    })
    const resultado = await editarAgente({}, formulario({ ...campos, id: agente.id }))
    expect(resultado.sucesso).toMatch(/salv/i)
    expect((await prisma.agente.findUniqueOrThrow({ where: { id: agente.id } })).nome).toBe('Suporte')
  })

  it('agente inexistente devolve mensagem', async () => {
    const resultado = await editarAgente({}, formulario({ ...campos, id: 'nao-existe' }))
    expect(resultado.erro).toMatch(/não encontrado/i)
  })
})

describe('excluirAgente', () => {
  it('apaga e volta para a lista', async () => {
    const agente = await prisma.agente.create({
      data: { nome: 'X', modelo: 'a/b', criadoPorId: usuarioDaSessao!.id },
    })
    const resultado = await excluirAgente({}, formulario({ id: agente.id })).catch((e) => e)
    expect(resultado).toMatchObject({ destino: '/agentes' })
    expect(await prisma.agente.count()).toBe(0)
  })
})
