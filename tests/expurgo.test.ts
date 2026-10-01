// T-04.01 (FT-10, PR-18, PR-86, PR-89): o expurgo automático. Conversas vencidas (com as
// mensagens em cascata) em lotes, atualizações antigas do Telegram e registros de auditoria
// antigos; só contagens vão ao registro. Relógio injetado; idempotente.
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { executarExpurgo, TAMANHO_DO_LOTE } from '@/servicos/expurgo'
import { limparBanco } from './ajuda'
import { criarAgenteDeTeste } from './apoio/historico'
import { criarConversasEmLote, criarRegistroDeTeste } from './apoio/privacidade'

const AGORA = new Date('2026-06-30T12:00:00.000Z')
const DIA = 24 * 3600 * 1000
const corteDe = (dias: number) => new Date(AGORA.getTime() - dias * DIA)

beforeEach(limparBanco)
afterAll(limparBanco)

async function definirRetencao(dias: number | null) {
  await prisma.configuracaoDoWorkspace.upsert({
    where: { id: 'unica' },
    create: { id: 'unica', retencaoDiasConversas: dias },
    update: { retencaoDiasConversas: dias },
  })
}

async function conversaEm(agenteId: string, atualizadoEm: Date, canal: 'widget' | 'telegram' = 'widget') {
  const [id] = await criarConversasEmLote({ agenteId, canal, quantidade: 1, atualizadoEm: () => atualizadoEm })
  return id as string
}

async function canalDeTeste() {
  const agente = await criarAgenteDeTeste()
  const canal = await prisma.canalTelegram.create({
    data: {
      agenteId: agente.id,
      tokenCifrado: 'v1:x',
      botId: `bot${Math.random()}`,
      botUsername: 'bot_de_teste_bot',
      botNome: 'Bot',
      segredoDoWebhookHash: 'hash',
      webhookUrl: 'https://exemplo.com/webhook',
    },
  })
  return canal
}

describe('executarExpurgo: fronteira da retenção (integração com o banco de teste)', () => {
  it('com 90 dias a conversa exatamente no corte fica, um milissegundo antes sai, um dia antes sai e um dia depois fica', async () => {
    await definirRetencao(90)
    const agente = await criarAgenteDeTeste()
    const corte = corteDe(90)
    const noCorte = await conversaEm(agente.id, corte)
    const umMsAntes = await conversaEm(agente.id, new Date(corte.getTime() - 1))
    const umDiaAntes = await conversaEm(agente.id, new Date(corte.getTime() - DIA))
    const umDiaDepois = await conversaEm(agente.id, new Date(corte.getTime() + DIA))
    const recente = await conversaEm(agente.id, AGORA)

    const r = await executarExpurgo({ agora: AGORA })

    const restantes = (await prisma.conversa.findMany({ select: { id: true } })).map((c) => c.id).sort()
    expect(restantes).toEqual([noCorte, umDiaDepois, recente].sort())
    expect(r).toMatchObject({ conversas: 2, mensagens: 4, retencaoDias: 90 })
    expect(await prisma.mensagem.count({ where: { conversaId: { in: [umMsAntes, umDiaAntes] } } })).toBe(0)
    expect(await prisma.mensagem.count()).toBe(6)
  })

  it('sem configuração vale 90 dias', async () => {
    const agente = await criarAgenteDeTeste()
    await conversaEm(agente.id, corteDe(91))
    await conversaEm(agente.id, corteDe(89))
    const r = await executarExpurgo({ agora: AGORA })
    expect(r.conversas).toBe(1)
    expect(r.retencaoDias).toBe(90)
  })

  it('a retenção de 7 dias vale o que o admin configurou', async () => {
    await definirRetencao(7)
    const agente = await criarAgenteDeTeste()
    await conversaEm(agente.id, corteDe(8))
    await conversaEm(agente.id, corteDe(6))
    expect((await executarExpurgo({ agora: AGORA })).conversas).toBe(1)
    expect(await prisma.conversa.count()).toBe(1)
  })

  it('o corte é por atualizadoEm: conversa antiga de criação mas com atividade recente fica', async () => {
    await definirRetencao(30)
    const agente = await criarAgenteDeTeste()
    const [id] = await criarConversasEmLote({ agenteId: agente.id, canal: 'widget', quantidade: 1, atualizadoEm: () => corteDe(200) })
    await prisma.conversa.update({ where: { id: id as string }, data: { atualizadoEm: corteDe(2) } })
    expect((await executarExpurgo({ agora: AGORA })).conversas).toBe(0)
    expect(await prisma.conversa.count()).toBe(1)
  })
})

describe('executarExpurgo: lotes (funcional)', () => {
  it('1230 conversas saem em lotes de 500, 500 e 230 e as mensagens vão em cascata', async () => {
    expect(TAMANHO_DO_LOTE).toBe(500)
    await definirRetencao(30)
    const agente = await criarAgenteDeTeste()
    await criarConversasEmLote({ agenteId: agente.id, canal: 'widget', quantidade: 1230, atualizadoEm: (i) => new Date(corteDe(60).getTime() + i * 1000), mensagensPorConversa: 1 })
    await criarConversasEmLote({ agenteId: agente.id, canal: 'widget', quantidade: 3, atualizadoEm: () => AGORA })

    const r = await executarExpurgo({ agora: AGORA })

    expect(r.lotesDeConversas).toEqual([500, 500, 230])
    expect(r.conversas).toBe(1230)
    expect(r.mensagens).toBe(1230)
    expect(await prisma.conversa.count()).toBe(3)
    expect(await prisma.mensagem.count()).toBe(6)
  })

  it('o tamanho do lote é injetável', async () => {
    await definirRetencao(30)
    const agente = await criarAgenteDeTeste()
    await criarConversasEmLote({ agenteId: agente.id, canal: 'telegram', quantidade: 7, atualizadoEm: () => corteDe(60) })
    expect((await executarExpurgo({ agora: AGORA, tamanhoDoLote: 3 })).lotesDeConversas).toEqual([3, 3, 1])
  })
})

describe('executarExpurgo: sem expurgo de conversas e o resto (funcional)', () => {
  it('a retenção sem expurgo preserva as conversas, mas apaga o dedupe do Telegram e a auditoria antigos', async () => {
    await definirRetencao(null)
    const agente = await criarAgenteDeTeste()
    await conversaEm(agente.id, corteDe(2000))
    const canal = await canalDeTeste()
    await prisma.atualizacaoTelegram.create({ data: { canalId: canal.id, updateId: '1', criadoEm: corteDe(8) } })
    await prisma.atualizacaoTelegram.create({ data: { canalId: canal.id, updateId: '2', criadoEm: corteDe(6) } })
    await criarRegistroDeTeste({ quando: corteDe(366) })
    await criarRegistroDeTeste({ quando: corteDe(364) })

    const r = await executarExpurgo({ agora: AGORA })

    expect(r).toMatchObject({ conversas: 0, mensagens: 0, atualizacoesDoTelegram: 1, registrosDeAuditoria: 1, retencaoDias: null })
    expect(await prisma.conversa.count()).toBe(1)
    expect(await prisma.atualizacaoTelegram.count()).toBe(1)
    // O registro de 364 dias fica; o de 366 saiu; entra o do próprio expurgo.
    expect(await prisma.registroDeAuditoria.count({ where: { acao: 'usuario_criado' } })).toBe(1)
  })

  it('o limite da auditoria é o de AUDITORIA_RETENCAO_DIAS', async () => {
    process.env.AUDITORIA_RETENCAO_DIAS = '30'
    try {
      await criarRegistroDeTeste({ quando: corteDe(31) })
      await criarRegistroDeTeste({ quando: corteDe(29) })
      expect((await executarExpurgo({ agora: AGORA })).registrosDeAuditoria).toBe(1)
    } finally {
      delete process.env.AUDITORIA_RETENCAO_DIAS
    }
  })
})

describe('executarExpurgo: o registro e a idempotência (funcional)', () => {
  it('grava expurgo_automatico como Sistema, só com contagens, sem texto nem identificador', async () => {
    await definirRetencao(30)
    const agente = await criarAgenteDeTeste()
    await criarConversasEmLote({ agenteId: agente.id, canal: 'widget', quantidade: 3, atualizadoEm: () => corteDe(60), identificador: () => 'visitante-secreto-abcdef123456' })
    await executarExpurgo({ agora: AGORA })
    const registros = await prisma.registroDeAuditoria.findMany()
    expect(registros).toHaveLength(1)
    expect(registros[0]).toMatchObject({ acao: 'expurgo_automatico', alvoTipo: 'sistema', usuarioId: null, usuarioRotulo: 'Sistema' })
    expect(JSON.parse(registros[0]!.detalhes)).toEqual({ conversas: 3, mensagens: 6, atualizacoesDoTelegram: 0, registrosDeAuditoria: 0, retencaoDias: 30 })
    expect(registros[0]!.detalhes).not.toMatch(/visitante|Pergunta|Resposta/)
  })

  it('a segunda rodada apaga 0, não grava registro e devolve zeros', async () => {
    await definirRetencao(30)
    const agente = await criarAgenteDeTeste()
    await criarConversasEmLote({ agenteId: agente.id, canal: 'widget', quantidade: 2, atualizadoEm: () => corteDe(60) })
    await executarExpurgo({ agora: AGORA })
    const segunda = await executarExpurgo({ agora: AGORA })
    expect(segunda).toMatchObject({ conversas: 0, mensagens: 0, atualizacoesDoTelegram: 0, registrosDeAuditoria: 0, lotesDeConversas: [] })
    expect(await prisma.registroDeAuditoria.count()).toBe(1)
  })

  it('banco sem nada a expurgar não grava registro', async () => {
    await executarExpurgo({ agora: AGORA })
    expect(await prisma.registroDeAuditoria.count()).toBe(0)
  })
})
