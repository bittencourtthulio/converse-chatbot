/**
 * A página /conversas/[id] contra o servidor de produção (FT-09, T-04.04): conteúdo de
 * visitante como texto, fontes da resposta, metadados do canal, link para o agente, e 404.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarConversaDeTeste, fonteDeTeste } from './apoio/historico'
import { cookieDe, subirServidor, type Servidor } from './apoio/servidor'

const VISITANTE = 'detalhe-visitante-1234567890'
let servidor: Servidor
let cookie: string
let agenteId: string
let widgetId: string
let painelId: string

const pedir = (caminho: string, c: string | undefined = cookie) =>
  fetch(`${servidor.base}${caminho}`, { redirect: 'manual', headers: c ? { cookie: c } : {} })

beforeAll(async () => {
  await limparBanco()
  const u = await prisma.usuario.create({
    data: { nome: 'Ana Souza', email: 'ana.detalhe@teste.local', senhaHash: await hashDeSenha('senha-de-rota-123'), papel: 'usuario' },
  })
  agenteId = (await criarAgenteDeTeste({ nome: 'Vendas', criadoPorId: u.id })).id
  const w = await criarConversaDeTeste({
    agenteId,
    canal: 'widget',
    identificadorExterno: VISITANTE,
    mensagens: [
      { papel: 'user', conteudo: '<script>alert(1)</script><img src=x onerror=alert(2)> Qual o prazo?' },
      { papel: 'assistant', conteudo: 'Cinco dias [1].', fontes: [fonteDeTeste('Política de entrega', 2)] },
    ],
  })
  widgetId = w.id
  painelId = (await criarConversaDeTeste({ agenteId, canal: 'painel', criadoPorId: u.id, mensagens: [{ papel: 'user', conteudo: 'teste' }] })).id
  cookie = await cookieDe('ana.detalhe@teste.local', 'senha-de-rota-123')
  servidor = await subirServidor(3204)
}, 120_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

describe('detalhe da conversa (integração)', () => {
  it('sem sessão manda para o login', async () => {
    const r = await pedir(`/conversas/${widgetId}`, '')
    expect(r.status).toBe(307)
    expect(r.headers.get('location')).toContain('/entrar')
  })

  it('id inexistente é 404 de verdade', async () => {
    expect((await pedir('/conversas/nao-existe')).status).toBe(404)
  })

  it('mostra a transcrição, as fontes, os metadados do canal e o link para o agente', async () => {
    const r = await pedir(`/conversas/${widgetId}`)
    expect(r.status).toBe(200)
    const html = await r.text()
    expect(html).toContain('Visitante detalh')
    expect(html).toContain('Cinco dias')
    expect(html).toContain('Política de entrega')
    expect(html).toContain('Chat embutido')
    expect(html).toContain(`href="/agentes/${agenteId}"`)
    expect(html).toContain(`href="/api/conversas/${widgetId}/exportar"`)
    expect(html).toContain('Apagar')
    expect(html).toContain('href="/conversas"')
  })
})

describe('detalhe da conversa (funcional)', () => {
  it('script e img onerror do visitante aparecem como texto escapado, não como elementos', async () => {
    const html = await (await pedir(`/conversas/${widgetId}`)).text()
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).toContain('&lt;img src=x onerror=alert(2)&gt;')
    expect(html).not.toContain('<img src=x')
    expect(html).not.toContain('<script>alert(1)')
  })

  it('o identificador completo do visitante não chega à página', async () => {
    const html = await (await pedir(`/conversas/${widgetId}`)).text()
    expect(html).not.toContain(VISITANTE)
  })

  it('a conversa do painel mostra o nome do usuário', async () => {
    const html = await (await pedir(`/conversas/${painelId}`)).text()
    expect(html).toContain('Ana Souza')
    expect(html).toContain('Painel')
  })
})
