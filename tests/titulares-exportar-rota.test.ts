/**
 * POST /api/titulares/exportar contra o servidor de produção (FT-10, PR-90): só admin, origem
 * da plataforma, download seguro e nome de arquivo sem o identificador do titular.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarConversaDeTeste } from './apoio/historico'
import { cookieDe, subirServidor, type Servidor } from './apoio/servidor'

const SENHA = 'senha-de-rota-123'
const VISITANTE = 'visitante-titular-rota-123456789'
let servidor: Servidor
let cookieAdmin: string
let cookieComum: string

function exportar(corpo: unknown, cabecalhos: Record<string, string> = {}, metodo = 'POST') {
  return fetch(`${servidor.base}/api/titulares/exportar`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...cabecalhos },
    ...(metodo === 'POST' && { body: JSON.stringify(corpo) }),
  })
}

beforeAll(async () => {
  await limparBanco()
  const senhaHash = await hashDeSenha(SENHA)
  const admin = await prisma.usuario.create({ data: { nome: 'Admin', email: 'admin.titular@teste.local', senhaHash, papel: 'admin' } })
  await prisma.usuario.create({ data: { nome: 'Comum', email: 'comum.titular@teste.local', senhaHash, papel: 'usuario' } })
  const agente = await criarAgenteDeTeste({ nome: 'Vendas', criadoPorId: admin.id })
  await criarConversaDeTeste({
    agenteId: agente.id,
    canal: 'widget',
    identificadorExterno: VISITANTE,
    mensagens: [
      { papel: 'user', conteudo: 'Qual o prazo de entrega? Meu CPF é de teste.' },
      { papel: 'assistant', conteudo: 'Cinco dias.' },
    ],
  })
  await criarConversaDeTeste({ agenteId: agente.id, canal: 'widget', identificadorExterno: 'outro-visitante-0000000000', mensagens: [{ papel: 'user', conteudo: 'conversa alheia' }] })
  cookieAdmin = await cookieDe('admin.titular@teste.local', SENHA)
  cookieComum = await cookieDe('comum.titular@teste.local', SENHA)
  servidor = await subirServidor(3206)
}, 120_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

describe('exportar titular (integração com o servidor)', () => {
  it('sem sessão dá 401 e não devolve conteúdo', async () => {
    const r = await exportar({ canal: 'widget', identificador: VISITANTE, formato: 'json' })
    expect(r.status).toBe(401)
    expect(await r.text()).not.toContain('prazo de entrega')
  })

  it('usuário comum recebe 403 e nada é gravado na auditoria', async () => {
    const r = await exportar({ canal: 'widget', identificador: VISITANTE, formato: 'json' }, { cookie: cookieComum })
    expect(r.status).toBe(403)
    expect(await r.text()).not.toContain('prazo de entrega')
    expect(await prisma.registroDeAuditoria.count()).toBe(0)
  })

  it('canal inválido dá 422, titular inexistente dá 404 e GET não existe', async () => {
    expect((await exportar({ canal: 'painel', identificador: VISITANTE, formato: 'json' }, { cookie: cookieAdmin })).status).toBe(422)
    expect((await exportar({ canal: 'widget', identificador: 'naoexiste-123456', formato: 'json' }, { cookie: cookieAdmin })).status).toBe(404)
    expect((await exportar(null, { cookie: cookieAdmin }, 'GET')).status).toBe(405)
  })

  it('Origin de outro site é recusada com 403 mesmo com a sessão do admin', async () => {
    const r = await exportar({ canal: 'widget', identificador: VISITANTE, formato: 'json' }, { cookie: cookieAdmin, origin: 'https://site-malicioso.example' })
    expect(r.status).toBe(403)
    expect(await r.text()).not.toContain('prazo de entrega')
  })
})

describe('exportar titular (funcional: o arquivo)', () => {
  it('JSON como anexo seguro, com as mensagens do titular certo e nome sem o identificador', async () => {
    const r = await exportar({ canal: 'widget', identificador: VISITANTE.slice(0, 12), formato: 'json' }, { cookie: cookieAdmin })
    expect(r.status).toBe(200)
    expect(r.headers.get('content-type')).toMatch(/^application\/json/)
    expect(r.headers.get('content-disposition')).toMatch(/^attachment; filename="titular-widget-\d{4}-\d{2}-\d{2}\.json"$/)
    expect(r.headers.get('cache-control')).toBe('no-store')
    expect(r.headers.get('x-content-type-options')).toBe('nosniff')
    const texto = await r.text()
    expect(JSON.parse(texto).conversas).toHaveLength(1)
    expect(texto).toContain('Qual o prazo de entrega?')
    expect(texto).not.toContain('conversa alheia')
    expect(texto).not.toContain(VISITANTE)
    expect(r.headers.get('content-disposition')).not.toContain(VISITANTE.slice(0, 8))
  })

  it('TXT e envio como formulário (urlencoded) também funcionam, e a exportação fica na auditoria', async () => {
    const r = await fetch(`${servidor.base}/api/titulares/exportar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', cookie: cookieAdmin },
      body: new URLSearchParams({ canal: 'widget', identificador: VISITANTE, formato: 'txt' }),
    })
    expect(r.status).toBe(200)
    expect(r.headers.get('content-type')).toMatch(/^text\/plain/)
    expect(await r.text()).toContain('Cinco dias.')
    const registros = await prisma.registroDeAuditoria.findMany({ where: { acao: 'dados_do_titular_exportados' } })
    expect(registros.length).toBeGreaterThanOrEqual(1)
    expect(JSON.stringify(registros)).not.toContain(VISITANTE)
  })
})
