// T-05.03 (FT-10, PR-18, PR-90, D-14, D-23): o visitante do chat embutido apaga a PRÓPRIA
// conversa naquele agente. Só as conversas dele, só com o agente ativo, com limite de uso.
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { criarLimitador } from '@/lib/limite-de-uso'
import { apagarConversasDoVisitante } from '@/servicos/chat-publico'
import { salvarConfiguracao } from '@/servicos/chat-publico-config'
import { aguardarGravacoesPendentes } from '@/servicos/auditoria'
import { desligarAuditoria, ligarAuditoria } from '@/servicos/auditoria-ouvintes'
import { aoApagarConversa, type ConversaApagada } from '@/servicos/historico'
import { criarAdmin, limparBanco } from './ajuda'
import { criarConversaDeTeste } from './apoio/historico'

const A = 'visitante-a-0123456789abcdef'
const B = 'visitante-b-0123456789abcdef'

beforeEach(async () => {
  await limparBanco()
  desligarAuditoria()
})
afterEach(() => desligarAuditoria())
afterAll(limparBanco)

async function cenario() {
  const admin = await criarAdmin()
  const agente = await prisma.agente.create({ data: { nome: 'Loja', modelo: 'm', criadoPorId: admin.id } })
  const outro = await prisma.agente.create({ data: { nome: 'Outro', modelo: 'm', criadoPorId: admin.id } })
  await salvarConfiguracao(admin, agente.id, { ativo: true })
  await salvarConfiguracao(admin, outro.id, { ativo: true })
  const msgs = [{ papel: 'user' as const, conteudo: 'texto privado do visitante' }, { papel: 'assistant' as const, conteudo: 'resposta' }]
  const doA1 = await criarConversaDeTeste({ agenteId: agente.id, canal: 'widget', identificadorExterno: A, mensagens: msgs })
  const doA2 = await criarConversaDeTeste({ agenteId: agente.id, canal: 'widget', identificadorExterno: A, mensagens: msgs })
  const doAOutroAgente = await criarConversaDeTeste({ agenteId: outro.id, canal: 'widget', identificadorExterno: A, mensagens: msgs })
  const doB = await criarConversaDeTeste({ agenteId: agente.id, canal: 'widget', identificadorExterno: B, mensagens: msgs })
  return { admin, agente, outro, doA1, doA2, doAOutroAgente, doB }
}
const ip = (n = 1) => `10.0.0.${n}`

describe('apagarConversasDoVisitante (integração com o banco de teste)', () => {
  it('apaga só as conversas widget dele naquele agente, com as mensagens, e deixa as de outro visitante e de outro agente', async () => {
    const { agente, doA1, doA2, doAOutroAgente, doB } = await cenario()
    const r = await apagarConversasDoVisitante({ agenteId: agente.id, visitanteId: A, ip: ip(), limitador: criarLimitador() })
    expect(r).toEqual({ conversas: 2 })
    expect(await prisma.conversa.findMany({ where: { id: { in: [doA1.id, doA2.id] } } })).toHaveLength(0)
    expect(await prisma.conversa.findMany({ where: { id: { in: [doAOutroAgente.id, doB.id] } } })).toHaveLength(2)
    expect(await prisma.mensagem.count()).toBe(4)
  })

  it('um visitante não apaga a conversa de outro: o id do B só apaga as do B', async () => {
    const { agente, doA1, doA2, doB } = await cenario()
    await apagarConversasDoVisitante({ agenteId: agente.id, visitanteId: B, ip: ip(), limitador: criarLimitador() })
    expect(await prisma.conversa.findUnique({ where: { id: doB.id } })).toBeNull()
    expect(await prisma.conversa.findMany({ where: { id: { in: [doA1.id, doA2.id] } } })).toHaveLength(2)
  })

  it('conversa do Telegram ou do painel com o mesmo identificador não é tocada', async () => {
    const { agente } = await cenario()
    const tg = await criarConversaDeTeste({ agenteId: agente.id, canal: 'telegram', identificadorExterno: A, mensagens: [{ papel: 'user', conteudo: 'x' }] })
    await apagarConversasDoVisitante({ agenteId: agente.id, visitanteId: A, ip: ip(), limitador: criarLimitador() })
    expect(await prisma.conversa.findUnique({ where: { id: tg.id } })).not.toBeNull()
  })

  it('grava conversa_apagada sem usuário, com o rótulo do visitante, sem texto nem identificador', async () => {
    ligarAuditoria()
    const { agente } = await cenario()
    await apagarConversasDoVisitante({ agenteId: agente.id, visitanteId: A, ip: ip(), limitador: criarLimitador() })
    await aguardarGravacoesPendentes()
    const registros = await prisma.registroDeAuditoria.findMany()
    expect(registros).toHaveLength(2)
    for (const r of registros) {
      expect(r).toMatchObject({ acao: 'conversa_apagada', usuarioId: null, usuarioRotulo: 'Visitante (chat embutido)' })
      expect(JSON.parse(r.detalhes)).toMatchObject({ canal: 'widget', mensagens: 2, origem: 'visitante' })
      expect(r.detalhes).not.toMatch(/visitante-a|texto privado/)
    }
  })

  it('o ouvinte recebe origem visitante e usuário nulo', async () => {
    const eventos: ConversaApagada[] = []
    const remover = aoApagarConversa((e) => eventos.push(e))
    try {
      const { agente } = await cenario()
      await apagarConversasDoVisitante({ agenteId: agente.id, visitanteId: A, ip: ip(), limitador: criarLimitador() })
      expect(eventos).toHaveLength(2)
      expect(eventos.every((e) => e.usuarioId === null && e.origem === 'visitante')).toBe(true)
    } finally {
      remover()
    }
  })
})

describe('apagarConversasDoVisitante (funcional: recusas)', () => {
  it('agente inativo e agente inexistente dão o mesmo 404', async () => {
    const { admin, agente } = await cenario()
    await salvarConfiguracao(admin, agente.id, { ativo: false })
    const inativo = await apagarConversasDoVisitante({ agenteId: agente.id, visitanteId: A, ip: ip(), limitador: criarLimitador() }).catch((e) => e)
    const inexistente = await apagarConversasDoVisitante({ agenteId: 'nao-existe', visitanteId: A, ip: ip(), limitador: criarLimitador() }).catch((e) => e)
    expect(inativo).toMatchObject({ status: 404 })
    expect(inexistente).toMatchObject({ status: 404 })
    expect(inativo.message).toBe(inexistente.message)
    expect(await prisma.conversa.count()).toBe(4)
  })

  it('identificação do visitante inválida dá 422 e nada é apagado', async () => {
    const { agente } = await cenario()
    for (const ruim of [undefined, '', 'curto', 'x'.repeat(65), 'com espaco 0123456789abcdef', 123]) {
      await expect(apagarConversasDoVisitante({ agenteId: agente.id, visitanteId: ruim, ip: ip(), limitador: criarLimitador() })).rejects.toMatchObject({ status: 422 })
    }
    expect(await prisma.conversa.count()).toBe(4)
  })

  it('a 11a chamada no mesmo minuto, do mesmo IP e agente, dá 429 com Retry-After', async () => {
    const { agente } = await cenario()
    const limitador = criarLimitador(() => 1_000)
    for (let i = 0; i < 10; i += 1) {
      await apagarConversasDoVisitante({ agenteId: agente.id, visitanteId: B, ip: ip(), limitador })
    }
    await expect(apagarConversasDoVisitante({ agenteId: agente.id, visitanteId: B, ip: ip(), limitador })).rejects.toMatchObject({ status: 429, retryAfterSegundos: expect.any(Number) })
  })

  it('visitante sem conversa recebe zero apagadas, sem erro e sem registro', async () => {
    ligarAuditoria()
    const { agente } = await cenario()
    const r = await apagarConversasDoVisitante({ agenteId: agente.id, visitanteId: 'visitante-novo-0123456789abcdef', ip: ip(), limitador: criarLimitador() })
    expect(r).toEqual({ conversas: 0 })
    await aguardarGravacoesPendentes()
    expect(await prisma.registroDeAuditoria.count()).toBe(0)
  })
})
