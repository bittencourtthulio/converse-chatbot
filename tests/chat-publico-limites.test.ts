/**
 * T-02.03 (FT-06, PR-57): limites de uso do chat público: por IP e agente, por
 * IP, por conversa e o teto diário contado no banco.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { criarLimitador } from '@/lib/limite-de-uso'
import {
  ErroDeLimite,
  LIMITES_DO_CHAT,
  exigirLimiteDaConversa,
  exigirLimiteDeIp,
  exigirTetoDiario,
} from '@/servicos/chat-publico-limites'
import { criarUsuario, limparBanco } from './ajuda'

async function agenteDe(nome = 'A') {
  const autor = await criarUsuario()
  return prisma.agente.create({ data: { nome, modelo: 'm', criadoPorId: autor.id } })
}

async function conversaComMensagens(
  agenteId: string,
  opcoes: { canal?: string; usuario?: number; assistente?: number; quando?: Date } = {},
) {
  const c = await prisma.conversa.create({
    data: { agenteId, canal: opcoes.canal ?? 'widget', identificadorExterno: 'visitante-de-teste-0001' },
  })
  const quando = opcoes.quando ?? new Date()
  const linhas = [
    ...Array.from({ length: opcoes.usuario ?? 0 }, () => ({ papel: 'user', conteudo: 'oi', conversaId: c.id, criadoEm: quando })),
    ...Array.from({ length: opcoes.assistente ?? 0 }, () => ({ papel: 'assistant', conteudo: 'olá', conversaId: c.id, criadoEm: quando })),
  ]
  if (linhas.length > 0) await prisma.mensagem.createMany({ data: linhas })
  return c
}

async function erroDe(f: () => unknown | Promise<unknown>): Promise<ErroDeLimite> {
  try {
    await f()
  } catch (e) {
    expect(e).toBeInstanceOf(ErroDeLimite)
    return e as ErroDeLimite
  }
  throw new Error('Era esperado um erro de limite.')
}

describe('limites por IP (memória, relógio injetado)', () => {
  it('os números do PR-57', () => {
    expect(LIMITES_DO_CHAT).toMatchObject({ ipEAgentePorMinuto: 10, ipPorMinuto: 30, mensagensPorConversa: 60 })
  })

  it('a 11ª chamada no minuto do mesmo IP e agente recusa com limite_excedido e Retry-After', () => {
    let t = 1_000_000
    const limitador = criarLimitador(() => t)
    for (let i = 0; i < 10; i += 1) exigirLimiteDeIp({ ip: '1.1.1.1', agenteId: 'a1' }, limitador)
    const erro = exigirLimiteDeIpCapturando({ ip: '1.1.1.1', agenteId: 'a1' }, limitador)
    expect(erro).toMatchObject({ status: 429, codigo: 'limite_excedido' })
    expect(erro.retryAfterSegundos).toBeGreaterThan(0)
    expect(erro.retryAfterSegundos).toBeLessThanOrEqual(60)
    // passado um minuto, libera
    t += 61_000
    expect(() => exigirLimiteDeIp({ ip: '1.1.1.1', agenteId: 'a1' }, limitador)).not.toThrow()
  })

  it('outro agente e outro IP têm balde próprio no limite por IP e agente', () => {
    const limitador = criarLimitador(() => 5)
    for (let i = 0; i < 10; i += 1) exigirLimiteDeIp({ ip: '1.1.1.1', agenteId: 'a1' }, limitador)
    expect(() => exigirLimiteDeIp({ ip: '1.1.1.1', agenteId: 'a2' }, limitador)).not.toThrow()
    expect(() => exigirLimiteDeIp({ ip: '2.2.2.2', agenteId: 'a1' }, limitador)).not.toThrow()
  })

  it('a 31ª chamada do mesmo IP no minuto recusa, mesmo espalhada entre agentes', () => {
    const limitador = criarLimitador(() => 5)
    for (let i = 0; i < 30; i += 1) exigirLimiteDeIp({ ip: '3.3.3.3', agenteId: `a${i % 5}` }, limitador)
    const erro = exigirLimiteDeIpCapturando({ ip: '3.3.3.3', agenteId: 'a9' }, limitador)
    expect(erro).toMatchObject({ status: 429, codigo: 'limite_excedido' })
  })

  it('sem TRUST_PROXY o IP é "desconhecido" e todos os visitantes dividem o balde (PR-36, PR-57)', () => {
    const limitador = criarLimitador(() => 5)
    for (let i = 0; i < 10; i += 1) exigirLimiteDeIp({ ip: 'desconhecido', agenteId: 'a1' }, limitador)
    expect(exigirLimiteDeIpCapturando({ ip: 'desconhecido', agenteId: 'a1' }, limitador).codigo).toBe('limite_excedido')
  })

  it('a chamada recusada não entra na janela: insistir não estende o bloqueio', () => {
    let t = 0
    const limitador = criarLimitador(() => t)
    for (let i = 0; i < 10; i += 1) exigirLimiteDeIp({ ip: '7.7.7.7', agenteId: 'a1' }, limitador)
    for (let i = 0; i < 5; i += 1) exigirLimiteDeIpCapturando({ ip: '7.7.7.7', agenteId: 'a1' }, limitador)
    t = 60_001
    expect(() => exigirLimiteDeIp({ ip: '7.7.7.7', agenteId: 'a1' }, limitador)).not.toThrow()
  })

  it('a mensagem ao visitante é amigável e sem número técnico', () => {
    const limitador = criarLimitador(() => 5)
    for (let i = 0; i < 10; i += 1) exigirLimiteDeIp({ ip: '4.4.4.4', agenteId: 'a1' }, limitador)
    const erro = exigirLimiteDeIpCapturando({ ip: '4.4.4.4', agenteId: 'a1' }, limitador)
    expect(erro.message).toMatch(/muitas mensagens|aguarde/i)
    expect(erro.message).not.toMatch(/429|limite_excedido|ip/i)
  })
})

function exigirLimiteDeIpCapturando(
  entrada: { ip: string; agenteId: string },
  limitador: ReturnType<typeof criarLimitador>,
): ErroDeLimite {
  try {
    exigirLimiteDeIp(entrada, limitador)
  } catch (e) {
    expect(e).toBeInstanceOf(ErroDeLimite)
    return e as ErroDeLimite
  }
  throw new Error('Era esperado um erro de limite.')
}

describe('limite por conversa (banco)', () => {
  beforeEach(limparBanco)
  afterAll(limparBanco)

  it('60 mensagens do visitante fecham a conversa: conversa_cheia, 429, sem Retry-After', async () => {
    const agente = await agenteDe()
    const c = await conversaComMensagens(agente.id, { usuario: 60, assistente: 60 })
    const erro = await erroDe(() => exigirLimiteDaConversa(c.id))
    expect(erro).toMatchObject({ status: 429, codigo: 'conversa_cheia', retryAfterSegundos: null })
    expect(erro.message).toMatch(/nova conversa/i)
  })

  it('59 mensagens do visitante ainda cabem; as respostas do agente não contam', async () => {
    const agente = await agenteDe()
    const c = await conversaComMensagens(agente.id, { usuario: 59, assistente: 80 })
    await expect(exigirLimiteDaConversa(c.id)).resolves.toBeUndefined()
  })
})

describe('teto diário por agente (banco)', () => {
  beforeEach(limparBanco)
  afterAll(limparBanco)

  const meioDia = () => {
    const d = new Date()
    d.setHours(12, 0, 0, 0)
    return d
  }

  it('mensagens user do canal widget do dia contam: no teto, recusa com limite_diario', async () => {
    const agente = await agenteDe()
    await conversaComMensagens(agente.id, { usuario: 3, quando: meioDia() })
    await expect(exigirTetoDiario(agente.id, 4, meioDia())).resolves.toBeUndefined()
    const erro = await erroDe(() => exigirTetoDiario(agente.id, 3, meioDia()))
    expect(erro).toMatchObject({ status: 429, codigo: 'limite_diario' })
    expect(erro.message).toMatch(/hoje|amanhã/i)
  })

  it('o Retry-After vai até a próxima meia-noite local', async () => {
    const agente = await agenteDe()
    await conversaComMensagens(agente.id, { usuario: 1, quando: meioDia() })
    const erro = await erroDe(() => exigirTetoDiario(agente.id, 1, meioDia()))
    // 12 h até a meia-noite; a folga de 1 h cobre o dia de troca do horário de verão.
    expect(erro.retryAfterSegundos).toBeGreaterThanOrEqual(11 * 3600)
    expect(erro.retryAfterSegundos).toBeLessThanOrEqual(13 * 3600)
  })

  it('não contam: ontem, outro agente, canal painel e respostas do assistente', async () => {
    const agente = await agenteDe('A')
    const outro = await agenteDe('B')
    const ontem = meioDia()
    ontem.setDate(ontem.getDate() - 1)
    await conversaComMensagens(agente.id, { usuario: 5, quando: ontem })
    await conversaComMensagens(outro.id, { usuario: 5, quando: meioDia() })
    await conversaComMensagens(agente.id, { canal: 'painel', usuario: 5, quando: meioDia() })
    await conversaComMensagens(agente.id, { assistente: 5, quando: meioDia() })
    await expect(exigirTetoDiario(agente.id, 1, meioDia())).resolves.toBeUndefined()
  })

  it('soma as conversas do agente no dia, não só uma', async () => {
    const agente = await agenteDe()
    await conversaComMensagens(agente.id, { usuario: 2, quando: meioDia() })
    await conversaComMensagens(agente.id, { usuario: 2, quando: meioDia() })
    await expect(exigirTetoDiario(agente.id, 4, meioDia())).rejects.toBeInstanceOf(ErroDeLimite)
    await expect(exigirTetoDiario(agente.id, 5, meioDia())).resolves.toBeUndefined()
  })

  it('o teto do canal telegram conta só conversas telegram do agente e o do widget não conta as dele (FT-07, PR-68)', async () => {
    const agente = await agenteDe()
    await conversaComMensagens(agente.id, { canal: 'telegram', usuario: 3, quando: meioDia() })
    const erro = await erroDe(() => exigirTetoDiario(agente.id, 3, meioDia(), 'telegram'))
    expect(erro).toMatchObject({ status: 429, codigo: 'limite_diario' })
    await expect(exigirTetoDiario(agente.id, 4, meioDia(), 'telegram')).resolves.toBeUndefined()
    // O mesmo agente, mesmas mensagens: o widget não as vê, e sem o parâmetro o padrão segue sendo widget.
    await expect(exigirTetoDiario(agente.id, 1, meioDia(), 'widget')).resolves.toBeUndefined()
    await expect(exigirTetoDiario(agente.id, 1, meioDia())).resolves.toBeUndefined()
  })

  it('o teto do canal telegram não conta o widget nem o painel', async () => {
    const agente = await agenteDe()
    await conversaComMensagens(agente.id, { canal: 'widget', usuario: 5, quando: meioDia() })
    await conversaComMensagens(agente.id, { canal: 'painel', usuario: 5, quando: meioDia() })
    await expect(exigirTetoDiario(agente.id, 1, meioDia(), 'telegram')).resolves.toBeUndefined()
  })
})
