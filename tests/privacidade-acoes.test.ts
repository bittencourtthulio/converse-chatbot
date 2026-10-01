/**
 * T-06.04 (FT-10, PR-89, PR-91): as ações de servidor de retenção e de aviso padrão. Só as
 * bordas do framework são trocadas; o serviço e o banco são os reais.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { aguardarGravacoesPendentes } from '@/servicos/auditoria'
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

const { salvarRetencaoDasConversas, salvarAvisoPadraoDoWorkspace } = await import('@/app/acoes')

const formulario = (campos: Record<string, string>) => {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) f.set(k, v)
  return f
}

beforeEach(async () => {
  await limparBanco()
  sessao = await criarAdmin()
})

describe('salvarRetencaoDasConversas', () => {
  it('com dias válidos grava, audita retencao_alterada e devolve a mensagem de sucesso', async () => {
    const r = await salvarRetencaoDasConversas({}, formulario({ modo: 'dias', dias: '30' }))
    expect(r.sucesso).toMatch(/30 dias/)
    expect((await prisma.configuracaoDoWorkspace.findUniqueOrThrow({ where: { id: 'unica' } })).retencaoDiasConversas).toBe(30)
    await aguardarGravacoesPendentes()
    const reg = await prisma.registroDeAuditoria.findFirstOrThrow()
    expect(reg).toMatchObject({ acao: 'retencao_alterada', usuarioId: sessao!.id })
  })

  it('dias fora da faixa devolve o erro em português e não grava', async () => {
    const r = await salvarRetencaoDasConversas({}, formulario({ modo: 'dias', dias: '3' }))
    expect(r.erro).toMatch(/7 a 3650/)
    expect(await prisma.configuracaoDoWorkspace.count()).toBe(0)
  })

  it('sem expurgo exige a confirmação do risco e, confirmada, grava nulo', async () => {
    const sem = await salvarRetencaoDasConversas({}, formulario({ modo: 'sem_expurgo' }))
    expect(sem.erro).toMatch(/risco/i)
    const com = await salvarRetencaoDasConversas({}, formulario({ modo: 'sem_expurgo', confirmarRisco: 'on' }))
    expect(com.sucesso).toMatch(/sem expurgo/i)
    expect((await prisma.configuracaoDoWorkspace.findUniqueOrThrow({ where: { id: 'unica' } })).retencaoDiasConversas).toBeNull()
  })

  it('quem não é admin não chega ao serviço e nada é gravado', async () => {
    sessao = await criarUsuario()
    const r = await salvarRetencaoDasConversas({}, formulario({ modo: 'dias', dias: '30' }))
    expect(r.erro).toBeDefined()
    expect(await prisma.configuracaoDoWorkspace.count()).toBe(0)
  })
})

describe('salvarAvisoPadraoDoWorkspace', () => {
  it('grava o texto e o link e avisa do sucesso', async () => {
    const r = await salvarAvisoPadraoDoWorkspace({}, formulario({ texto: 'Aviso da empresa', url: 'https://exemplo.com.br/p' }))
    expect(r.sucesso).toMatch(/aviso/i)
    const linha = await prisma.configuracaoDoWorkspace.findUniqueOrThrow({ where: { id: 'unica' } })
    expect(linha.avisoDePrivacidadePadrao).toBe('Aviso da empresa')
    expect(linha.avisoDePrivacidadePadraoUrl).toBe('https://exemplo.com.br/p')
  })

  it('link que não é http ou https devolve erro e não grava', async () => {
    const r = await salvarAvisoPadraoDoWorkspace({}, formulario({ texto: 'Aviso', url: 'javascript:alert(1)' }))
    expect(r.erro).toMatch(/http/)
    expect(await prisma.configuracaoDoWorkspace.count()).toBe(0)
  })
})
