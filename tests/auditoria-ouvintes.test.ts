// T-02.03 (FT-10, PR-19, PR-86, PR-87): aoAlterarCanal e aoApagarConversa ligados à auditoria
// por ligarAuditoria, com os ouvintes em globalThis (valem mesmo com o módulo recarregado).
import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { aguardarGravacoesPendentes, registrar } from '@/servicos/auditoria'
import { desligarAuditoria, ligarAuditoria, tratarConversaApagada } from '@/servicos/auditoria-ouvintes'
import { apagarConversas } from '@/servicos/historico'
import { conectar, definirLimiteDiario, desconectar, pausar, retomar } from '@/servicos/canal-telegram'
import { criarAdmin, limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarConversaDeTeste } from './apoio/historico'
import { iniciarTelegramFalso, TOKEN_VALIDO, type TelegramFalso } from './apoio/telegram-falso'

const original = { ...process.env }
let falso: TelegramFalso | null = null

beforeEach(async () => {
  await limparBanco()
  desligarAuditoria()
})
afterEach(async () => {
  desligarAuditoria()
  vi.restoreAllMocks()
  vi.resetModules()
  if (falso) await falso.fechar()
  falso = null
  for (const chave of ['TELEGRAM_API_BASE', 'APP_URL']) {
    if (original[chave] === undefined) delete process.env[chave]
    else process.env[chave] = original[chave]
  }
})
afterAll(limparBanco)

const registros = () => prisma.registroDeAuditoria.findMany({ orderBy: [{ quando: 'asc' }, { id: 'asc' }] })

describe('registrar com o ator por referência de usuário (integração)', () => {
  it('resolve o rótulo na hora de gravar e, se o usuário não existe mais, grava sem usuário e com rótulo próprio', async () => {
    const admin = await criarAdmin()
    const a = await registrar({ ator: { usuarioId: admin.id }, acao: 'retencao_alterada', alvoTipo: 'configuracao' })
    const b = await registrar({ ator: { usuarioId: 'nao-existe' }, acao: 'retencao_alterada', alvoTipo: 'configuracao' })
    const la = await prisma.registroDeAuditoria.findUniqueOrThrow({ where: { id: a.id } })
    const lb = await prisma.registroDeAuditoria.findUniqueOrThrow({ where: { id: b.id } })
    expect(la.usuarioId).toBe(admin.id)
    expect(la.usuarioRotulo).toBe(`${admin.nome} <${admin.email}>`)
    expect(lb.usuarioId).toBeNull()
    expect(lb.usuarioRotulo).toBe('Usuário removido')
  })
})

describe('ligarAuditoria: conversas apagadas (integração)', () => {
  it('apagar duas conversas de três mensagens grava dois conversa_apagada com a contagem e sem texto nem identificador', async () => {
    ligarAuditoria()
    const admin = await criarAdmin()
    const agente = await criarAgenteDeTeste()
    const msgs = [
      { papel: 'user' as const, conteudo: 'segredo da conversa um' },
      { papel: 'assistant' as const, conteudo: 'resposta' },
      { papel: 'user' as const, conteudo: 'mais um' },
    ]
    const a = await criarConversaDeTeste({ agenteId: agente.id, canal: 'widget', identificadorExterno: 'visitante-secreto-123456', mensagens: msgs })
    const b = await criarConversaDeTeste({ agenteId: agente.id, canal: 'telegram', identificadorExterno: '4455667788', mensagens: msgs })
    await apagarConversas([a.id, b.id], admin.id)
    await aguardarGravacoesPendentes()
    const lista = await registros()
    expect(lista).toHaveLength(2)
    for (const r of lista) {
      expect(r.acao).toBe('conversa_apagada')
      expect(r.alvoTipo).toBe('conversa')
      expect(r.usuarioId).toBe(admin.id)
      expect(JSON.parse(r.detalhes)).toMatchObject({ agenteId: agente.id, mensagens: 3 })
      expect(r.detalhes).not.toMatch(/segredo|visitante-secreto|4455667788/)
    }
    expect(lista.map((r) => r.alvoId).sort()).toEqual([a.id, b.id].sort())
  })

  it('ligarAuditoria chamada duas vezes, mesmo com os módulos recarregados, mantém um único registro por exclusão', async () => {
    ligarAuditoria()
    vi.resetModules()
    const novoOuvintes = await import('@/servicos/auditoria-ouvintes')
    novoOuvintes.ligarAuditoria()
    const novoHistorico = await import('@/servicos/historico')
    const admin = await criarAdmin()
    const agente = await criarAgenteDeTeste()
    const c = await criarConversaDeTeste({ agenteId: agente.id, canal: 'widget', mensagens: [{ papel: 'user', conteudo: 'x' }] })
    await novoHistorico.apagarConversas([c.id], admin.id)
    const novaAuditoria = await import('@/servicos/auditoria')
    await novaAuditoria.aguardarGravacoesPendentes()
    expect(await prisma.registroDeAuditoria.count()).toBe(1)
  })

  it('a exclusão com origem titular não grava conversa_apagada (o resumo do titular a cobre)', async () => {
    ligarAuditoria()
    tratarConversaApagada({ conversaId: 'c1', agenteId: 'a1', canal: 'widget', usuarioId: null, quantidadeDeMensagens: 2, origem: 'titular' })
    await aguardarGravacoesPendentes()
    expect(await prisma.registroDeAuditoria.count()).toBe(0)
  })

  it('a exclusão pelo visitante grava conversa_apagada sem usuário e com o rótulo do visitante', async () => {
    ligarAuditoria()
    tratarConversaApagada({ conversaId: 'c1', agenteId: 'a1', canal: 'widget', usuarioId: null, quantidadeDeMensagens: 4, origem: 'visitante' })
    await aguardarGravacoesPendentes()
    const [r] = await registros()
    expect(r?.usuarioId).toBeNull()
    expect(r?.usuarioRotulo).toBe('Visitante (chat embutido)')
    expect(JSON.parse(r?.detalhes ?? '{}')).toMatchObject({ mensagens: 4, origem: 'visitante' })
  })

  it('se a gravação falha, o log recebe auditoria_falhou e a exclusão já confirmada não é derrubada', async () => {
    ligarAuditoria()
    const admin = await criarAdmin()
    const agente = await criarAgenteDeTeste()
    const c = await criarConversaDeTeste({ agenteId: agente.id, canal: 'widget', mensagens: [{ papel: 'user', conteudo: 'x' }] })
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(prisma.registroDeAuditoria, 'create').mockRejectedValue(new Error('banco bloqueado'))
    await expect(apagarConversas([c.id], admin.id)).resolves.toBe(1)
    await aguardarGravacoesPendentes()
    expect(await prisma.conversa.count()).toBe(0)
    const linhas = log.mock.calls.map((c0) => String(c0[0]))
    expect(linhas.some((l) => l.includes('auditoria_falhou') && l.includes('conversa_apagada'))).toBe(true)
    expect(linhas.join('\n')).not.toContain('banco bloqueado')
  })
})

describe('ligarAuditoria: canal Telegram (integração com o simulado)', () => {
  it('conectar, pausar, retomar, mudar o limite e desconectar gravam um registro cada, com o nome do agente', async () => {
    ligarAuditoria()
    falso = await iniciarTelegramFalso()
    process.env.TELEGRAM_API_BASE = falso.url
    process.env.APP_URL = 'https://converse.exemplo.com'
    const admin = await criarAdmin()
    const agente = await prisma.agente.create({ data: { nome: 'Atendimento Loja', modelo: 'openai/gpt-4o-mini', criadoPorId: admin.id } })
    await conectar(admin, agente.id, TOKEN_VALIDO)
    await pausar(admin, agente.id)
    await retomar(admin, agente.id)
    await definirLimiteDiario(admin, agente.id, '300')
    await desconectar(admin, agente.id)
    await aguardarGravacoesPendentes()
    const lista = await registros()
    expect(lista.map((r) => r.acao)).toEqual([
      'canal_conectado',
      'canal_pausado',
      'canal_retomado',
      'canal_limite_alterado',
      'canal_desconectado',
    ])
    for (const r of lista) {
      expect(r.alvoTipo).toBe('canal')
      expect(r.alvoId).toBe(agente.id)
      expect(r.usuarioId).toBe(admin.id)
      expect(JSON.parse(r.detalhes)).toEqual({ agente: 'Atendimento Loja' })
      expect(r.detalhes).not.toContain(TOKEN_VALIDO)
    }
  })
})
