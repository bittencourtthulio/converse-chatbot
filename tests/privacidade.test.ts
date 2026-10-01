// T-03.03 (FT-10, PR-18, PR-89, PR-91): retenção das conversas e aviso de privacidade padrão
// do workspace. Só admin; a retenção alterada é auditada (melhor esforço).
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import {
  RETENCAO_MAXIMA_DIAS,
  RETENCAO_MINIMA_DIAS,
  RETENCAO_PADRAO_DIAS,
  avisoPadraoDoWorkspace,
  obterConfiguracaoDePrivacidade,
  retencaoEfetivaDias,
  salvarAvisoPadrao,
  salvarRetencao,
} from '@/servicos/privacidade'
import { aguardarGravacoesPendentes } from '@/servicos/auditoria'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

beforeEach(limparBanco)
afterAll(limparBanco)

describe('retenção das conversas (integração com o banco de teste)', () => {
  it('sem linha de configuração vale 90 dias, e a leitura do admin mostra os padrões', async () => {
    const admin = await criarAdmin()
    expect(RETENCAO_PADRAO_DIAS).toBe(90)
    expect(await retencaoEfetivaDias()).toBe(90)
    expect(await obterConfiguracaoDePrivacidade(admin)).toMatchObject({ retencaoDias: 90, avisoPadrao: '', avisoPadraoUrl: '' })
  })

  it('salvar grava os dias, devolve a configuração e retencaoEfetivaDias os lê', async () => {
    const admin = await criarAdmin()
    const c = await salvarRetencao(admin, { modo: 'dias', dias: '30' })
    expect(c.retencaoDias).toBe(30)
    expect(await retencaoEfetivaDias()).toBe(30)
    const linha = await prisma.configuracaoDoWorkspace.findUniqueOrThrow({ where: { id: 'unica' } })
    expect(linha.retencaoDiasConversas).toBe(30)
    expect(linha.atualizadoPor).toBe(admin.id)
  })

  it('sem expurgo grava nulo, e retencaoEfetivaDias devolve nulo', async () => {
    const admin = await criarAdmin()
    await salvarRetencao(admin, { modo: 'sem_expurgo', confirmarRisco: 'on' })
    expect(await retencaoEfetivaDias()).toBeNull()
    expect((await obterConfiguracaoDePrivacidade(admin)).retencaoDias).toBeNull()
  })

  it('grava retencao_alterada com os dias anterior e novo, só quando muda', async () => {
    const admin = await criarAdmin()
    await salvarRetencao(admin, { modo: 'dias', dias: 30 })
    await salvarRetencao(admin, { modo: 'dias', dias: 30 })
    await salvarRetencao(admin, { modo: 'sem_expurgo', confirmarRisco: true })
    await aguardarGravacoesPendentes()
    const lista = await prisma.registroDeAuditoria.findMany({ orderBy: { quando: 'asc' } })
    expect(lista.map((r) => r.acao)).toEqual(['retencao_alterada', 'retencao_alterada'])
    expect(JSON.parse(lista[0]!.detalhes)).toEqual({ diasAnterior: 90, diasNovo: 30 })
    expect(JSON.parse(lista[1]!.detalhes)).toEqual({ diasAnterior: 30, diasNovo: null })
    expect(lista[0]!.usuarioId).toBe(admin.id)
  })
})

describe('retenção (funcional: faixa e confirmação)', () => {
  it('6 e 3651 dias são recusados com 422, 7 e 3650 são aceitos', async () => {
    const admin = await criarAdmin()
    expect(RETENCAO_MINIMA_DIAS).toBe(7)
    expect(RETENCAO_MAXIMA_DIAS).toBe(3650)
    for (const ruim of ['6', '3651', '0', '-1', '1,5', 'abc', '']) {
      await expect(salvarRetencao(admin, { modo: 'dias', dias: ruim })).rejects.toMatchObject({ status: 422 })
    }
    expect((await salvarRetencao(admin, { modo: 'dias', dias: '7' })).retencaoDias).toBe(7)
    expect((await salvarRetencao(admin, { modo: 'dias', dias: '3650' })).retencaoDias).toBe(3650)
  })

  it('sem expurgo exige a confirmação explícita do risco', async () => {
    const admin = await criarAdmin()
    await expect(salvarRetencao(admin, { modo: 'sem_expurgo' })).rejects.toMatchObject({ status: 422, message: expect.stringMatching(/risco/i) })
    await expect(salvarRetencao(admin, { modo: 'sem_expurgo', confirmarRisco: 'false' })).rejects.toMatchObject({ status: 422 })
    expect(await retencaoEfetivaDias()).toBe(90)
  })

  it('quem não é admin recebe 403 e nada é gravado', async () => {
    const comum = await criarUsuario()
    await expect(salvarRetencao(comum, { modo: 'dias', dias: '30' })).rejects.toMatchObject({ status: 403 })
    await expect(obterConfiguracaoDePrivacidade(comum)).rejects.toMatchObject({ status: 403 })
    await expect(salvarAvisoPadrao(comum, { texto: 'x', url: '' })).rejects.toMatchObject({ status: 403 })
    expect(await prisma.configuracaoDoWorkspace.count()).toBe(0)
  })
})

describe('aviso de privacidade padrão (funcional)', () => {
  it('salva o texto e a URL, e avisoPadraoDoWorkspace os devolve sem exigir sessão', async () => {
    const admin = await criarAdmin()
    expect(await avisoPadraoDoWorkspace()).toBeNull()
    await salvarAvisoPadrao(admin, { texto: '  Seus dados são usados só para atendimento.  ', url: ' https://exemplo.com.br/privacidade ' })
    expect(await avisoPadraoDoWorkspace()).toEqual({
      texto: 'Seus dados são usados só para atendimento.',
      url: 'https://exemplo.com.br/privacidade',
    })
  })

  it('texto vazio apaga o aviso, e sem URL o aviso vale sem link', async () => {
    const admin = await criarAdmin()
    await salvarAvisoPadrao(admin, { texto: 'Aviso', url: '' })
    expect(await avisoPadraoDoWorkspace()).toEqual({ texto: 'Aviso', url: null })
    await salvarAvisoPadrao(admin, { texto: '', url: '' })
    expect(await avisoPadraoDoWorkspace()).toBeNull()
  })

  it('texto acima de 300 caracteres, URL que não é http ou https e URL sem texto são recusados', async () => {
    const admin = await criarAdmin()
    await expect(salvarAvisoPadrao(admin, { texto: 'a'.repeat(301), url: '' })).rejects.toMatchObject({ status: 422 })
    await expect(salvarAvisoPadrao(admin, { texto: 'ok', url: 'javascript:alert(1)' })).rejects.toMatchObject({ status: 422 })
    await expect(salvarAvisoPadrao(admin, { texto: 'ok', url: 'ftp://x.com' })).rejects.toMatchObject({ status: 422 })
    await expect(salvarAvisoPadrao(admin, { texto: '', url: 'https://x.com' })).rejects.toMatchObject({ status: 422 })
    expect((await salvarAvisoPadrao(admin, { texto: 'a'.repeat(300), url: '' })).avisoPadrao).toHaveLength(300)
  })

  it('salvar o aviso não mexe na retenção nem apaga a chave do OpenRouter', async () => {
    const admin = await criarAdmin()
    await prisma.configuracaoDoWorkspace.create({ data: { id: 'unica', openrouterChaveCifrada: 'v1:x', retencaoDiasConversas: 45 } })
    await salvarAvisoPadrao(admin, { texto: 'Aviso', url: '' })
    const linha = await prisma.configuracaoDoWorkspace.findUniqueOrThrow({ where: { id: 'unica' } })
    expect(linha.retencaoDiasConversas).toBe(45)
    expect(linha.openrouterChaveCifrada).toBe('v1:x')
  })
})
