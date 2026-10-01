/**
 * Prova no servidor de produção (FT-10, PR-19, PR-86, T-07.01): os ouvintes da auditoria, ligados
 * pela subida (`instrumentation.ts`), gravam o registro quando a conversa é apagada pelo painel
 * (uma e em lote) e pelo visitante, e a tela de Auditoria do admin os mostra. Prova que o
 * conjunto de ouvintes em `globalThis` é visto pelas rotas, que rodam no mesmo servidor.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { salvarConfiguracao } from '@/servicos/chat-publico-config'
import { limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarConversaDeTeste } from './apoio/historico'
import { cookieDe, esperar, subirServidor, type Servidor } from './apoio/servidor'

const SENHA = 'senha-de-rota-123'
const VISITANTE = 'visitante-fim-a-fim-0123456789abcdef'
let servidor: Servidor
let cookieAdmin: string
let agenteId: string
let admin: { id: string; nome: string; email: string }

const registros = (acao = 'conversa_apagada') => prisma.registroDeAuditoria.findMany({ where: { acao }, orderBy: { quando: 'asc' } })
const msgs = [{ papel: 'user' as const, conteudo: 'texto privado da conversa' }, { papel: 'assistant' as const, conteudo: 'resposta' }]

beforeAll(async () => {
  await limparBanco()
  const senhaHash = await hashDeSenha(SENHA)
  admin = await prisma.usuario.create({ data: { nome: 'Ana Admin', email: 'admin.fim@teste.local', senhaHash, papel: 'admin' } })
  agenteId = (await criarAgenteDeTeste({ criadoPorId: admin.id })).id
  await salvarConfiguracao({ id: admin.id, nome: admin.nome, email: admin.email, papel: 'admin' }, agenteId, { ativo: true })
  cookieAdmin = await cookieDe('admin.fim@teste.local', SENHA)
  servidor = await subirServidor(3210, { TRUST_PROXY: '1' }, { capturarLogs: true })
}, 180_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

describe('auditoria pelos ouvintes ligados na subida do servidor', () => {
  it('apagar uma conversa pelo painel grava conversa_apagada com o rótulo do admin e a contagem, sem o texto', async () => {
    const c = await criarConversaDeTeste({ agenteId, canal: 'widget', identificadorExterno: 'visitante-xyz-0123456789abcdef', mensagens: msgs })
    const r = await fetch(`${servidor.base}/api/conversas/${c.id}`, { method: 'DELETE', headers: { cookie: cookieAdmin } })
    expect(r.status).toBe(200)
    const [registro] = await esperar(async () => {
      const lista = await registros()
      return lista.length === 1 ? lista : false
    })
    expect(registro).toMatchObject({ acao: 'conversa_apagada', alvoId: c.id, usuarioId: admin.id, usuarioRotulo: `${admin.nome} <${admin.email}>` })
    expect(JSON.parse(registro!.detalhes)).toMatchObject({ agenteId, canal: 'widget', mensagens: 2 })
    expect(registro!.detalhes).not.toMatch(/texto privado|visitante-xyz/)
  })

  it('apagar em lote grava um registro por conversa', async () => {
    await prisma.registroDeAuditoria.deleteMany()
    const a = await criarConversaDeTeste({ agenteId, canal: 'telegram', mensagens: msgs })
    const b = await criarConversaDeTeste({ agenteId, canal: 'painel', mensagens: msgs })
    const r = await fetch(`${servidor.base}/api/conversas/apagar`, {
      method: 'POST',
      headers: { cookie: cookieAdmin, 'content-type': 'application/json' },
      body: JSON.stringify({ ids: [a.id, b.id] }),
    })
    expect(r.status).toBe(200)
    const lista = await esperar(async () => {
      const l = await registros()
      return l.length === 2 ? l : false
    })
    expect(lista.map((x) => x.alvoId).sort()).toEqual([a.id, b.id].sort())
  })

  it('o visitante apagando a própria conversa grava conversa_apagada sem usuário e sem o id dele', async () => {
    await prisma.registroDeAuditoria.deleteMany()
    await criarConversaDeTeste({ agenteId, canal: 'widget', identificadorExterno: VISITANTE, mensagens: msgs })
    const r = await fetch(`${servidor.base}/api/publico/agentes/${agenteId}/conversa`, {
      method: 'DELETE',
      headers: { 'X-Visitante-Id': VISITANTE, 'X-Forwarded-For': '10.7.7.7' },
    })
    expect(r.status).toBe(200)
    const [registro] = await esperar(async () => {
      const l = await registros()
      return l.length === 1 ? l : false
    })
    expect(registro).toMatchObject({ usuarioId: null, usuarioRotulo: 'Visitante (chat embutido)' })
    expect(registro!.detalhes).not.toContain(VISITANTE)
  })

  it('a tela de Auditoria do admin mostra as ações pelo servidor de produção', async () => {
    const r = await fetch(`${servidor.base}/configuracoes/auditoria`, { headers: { cookie: cookieAdmin } })
    expect(r.status).toBe(200)
    const html = await r.text()
    expect(html).toContain('Conversa apagada')
    expect(html).toContain('O visitante apagou a própria conversa do chat embutido (2 mensagens).')
    expect(html).not.toContain(VISITANTE)
    expect(html).not.toContain('texto privado')
  })

  it('exclusão sem sessão não grava registro, e o log do servidor nunca tem falha de auditoria nem conteúdo', async () => {
    const antes = await prisma.registroDeAuditoria.count()
    const c = await criarConversaDeTeste({ agenteId, canal: 'widget', mensagens: msgs })
    expect((await fetch(`${servidor.base}/api/conversas/${c.id}`, { method: 'DELETE' })).status).toBe(401)
    expect(await prisma.registroDeAuditoria.count()).toBe(antes)
    expect(servidor.logs()).not.toContain('auditoria_falhou')
    expect(servidor.logs()).not.toContain('texto privado')
  })
})
