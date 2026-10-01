// T-02.04 (FT-10, PR-19, PR-87): a troca e a remoção da chave do OpenRouter gravam a
// auditoria na MESMA transação da gravação; o modelo de transcrição grava logo depois.
// Nunca a chave, a máscara nem o texto cifrado.
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import {
  removerChaveDoOpenrouter,
  salvarChaveDoOpenrouter,
  salvarModeloDeTranscricao,
} from '@/servicos/integracoes'
import { aguardarGravacoesPendentes } from '@/servicos/auditoria'
import { criarAdmin, limparBanco } from './ajuda'

const falha = vi.hoisted(() => ({ ligada: false }))
vi.mock('@/servicos/auditoria', async (original) => {
  const real = await original<typeof import('@/servicos/auditoria')>()
  return {
    ...real,
    registrar: (...argumentos: Parameters<typeof real.registrar>) =>
      falha.ligada ? Promise.reject(new Error('auditoria fora do ar')) : real.registrar(...argumentos),
  }
})

const CHAVE = 'sk-or-v1-abcdef0123456789-a1b2'

beforeEach(async () => {
  falha.ligada = false
  await limparBanco()
})
afterAll(limparBanco)

const registros = () => prisma.registroDeAuditoria.findMany({ orderBy: { quando: 'asc' } })

describe('chave do OpenRouter (integração: mesma transação)', () => {
  it('salvar grava a configuração e o registro, e o registro só tem o rótulo e o alvo', async () => {
    const admin = await criarAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: CHAVE })
    const [r] = await registros()
    expect(await registros()).toHaveLength(1)
    expect(r).toMatchObject({
      acao: 'chave_openrouter_alterada',
      alvoTipo: 'configuracao',
      alvoId: 'unica',
      usuarioId: admin.id,
      usuarioRotulo: `${admin.nome} <${admin.email}>`,
      detalhes: '{}',
    })
  })

  it('com a auditoria falhando a chave não é gravada: a ação desfaz junto', async () => {
    const admin = await criarAdmin()
    falha.ligada = true
    await expect(salvarChaveDoOpenrouter(admin, { chave: CHAVE })).rejects.toThrow('auditoria fora do ar')
    expect(await prisma.configuracaoDoWorkspace.count()).toBe(0)
    expect(await prisma.registroDeAuditoria.count()).toBe(0)
  })

  it('remover a chave grava chave_openrouter_removida e, com a auditoria falhando, a chave continua', async () => {
    const admin = await criarAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: CHAVE })
    falha.ligada = true
    await expect(removerChaveDoOpenrouter(admin)).rejects.toThrow('auditoria fora do ar')
    expect((await prisma.configuracaoDoWorkspace.findUniqueOrThrow({ where: { id: 'unica' } })).openrouterChaveCifrada).toBeTruthy()
    falha.ligada = false
    await removerChaveDoOpenrouter(admin)
    expect((await prisma.configuracaoDoWorkspace.findUniqueOrThrow({ where: { id: 'unica' } })).openrouterChaveCifrada).toBeNull()
    expect((await registros()).map((r) => r.acao)).toEqual(['chave_openrouter_alterada', 'chave_openrouter_removida'])
  })

  it('remover quando não há chave não grava registro', async () => {
    const admin = await criarAdmin()
    await removerChaveDoOpenrouter(admin)
    expect(await prisma.registroDeAuditoria.count()).toBe(0)
  })
})

describe('chave do OpenRouter (funcional: nenhum segredo na trilha)', () => {
  it('depois de salvar sk-or-v1-abcdef..., nenhum registro contém a chave, a máscara nem o texto cifrado', async () => {
    const admin = await criarAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: CHAVE })
    const linha = await prisma.configuracaoDoWorkspace.findUniqueOrThrow({ where: { id: 'unica' } })
    const tudo = JSON.stringify(await registros())
    expect(tudo).not.toContain(CHAVE)
    expect(tudo).not.toContain('abcdef0123456789')
    expect(tudo).not.toContain('a1b2')
    expect(tudo).not.toContain(linha.openrouterChaveCifrada as string)
    expect(tudo).toContain(admin.email)
  })
})

describe('modelo de transcrição (melhor esforço)', () => {
  it('salvar grava modelo_transcricao_alterado e restaurar grava com restaurado verdadeiro', async () => {
    const admin = await criarAdmin()
    await salvarModeloDeTranscricao(admin, { modelo: 'google/gemini-2.5-pro' })
    await salvarModeloDeTranscricao(admin, { modelo: '' })
    await aguardarGravacoesPendentes()
    const lista = await registros()
    expect(lista.map((r) => r.acao)).toEqual(['modelo_transcricao_alterado', 'modelo_transcricao_alterado'])
    expect(JSON.parse(lista[0]!.detalhes)).toEqual({ modelo: 'google/gemini-2.5-pro', restaurado: false })
    expect(JSON.parse(lista[1]!.detalhes)).toEqual({ modelo: null, restaurado: true })
  })

  it('salvar o mesmo modelo de novo não grava outro registro', async () => {
    const admin = await criarAdmin()
    await salvarModeloDeTranscricao(admin, { modelo: 'google/gemini-2.5-pro' })
    await salvarModeloDeTranscricao(admin, { modelo: 'google/gemini-2.5-pro' })
    await aguardarGravacoesPendentes()
    expect(await prisma.registroDeAuditoria.count()).toBe(1)
  })

  it('com a auditoria falhando o modelo é salvo mesmo assim e o log recebe auditoria_falhou', async () => {
    const admin = await criarAdmin()
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const quebra = vi.spyOn(prisma.registroDeAuditoria, 'create').mockRejectedValue(new Error('banco bloqueado'))
    await expect(salvarModeloDeTranscricao(admin, { modelo: 'google/gemini-2.5-pro' })).resolves.toMatchObject({ salvo: 'google/gemini-2.5-pro' })
    await aguardarGravacoesPendentes()
    expect(log.mock.calls.some((c) => String(c[0]).includes('auditoria_falhou'))).toBe(true)
    quebra.mockRestore()
    log.mockRestore()
  })
})
