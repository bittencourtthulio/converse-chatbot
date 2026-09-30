/**
 * T-06.04 (FT-06, PR-62): a aba Publicar contra o servidor de produção: sessão
 * obrigatória, formulário preenchido, código para incorporar com a origem certa,
 * prévia e avisos.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { salvarConfiguracao } from '@/servicos/chat-publico-config'
import { criarUsuario, limparBanco } from './ajuda'
import { cookieDe, subirServidor, type Servidor } from './apoio/servidor'

let comum: Servidor
let configurado: Servidor
let agenteId: string
let cookie: string

const pegar = (base: string, caminho: string, comCookie = true) =>
  fetch(`${base}${caminho}`, { redirect: 'manual', headers: comCookie ? { cookie } : {} })

beforeAll(async () => {
  await limparBanco()
  const dono = await criarUsuario()
  const outro = await criarUsuario()
  agenteId = (
    await prisma.agente.create({ data: { nome: 'Assistente da Loja', modelo: 'm', criadoPorId: dono.id } })
  ).id
  await salvarConfiguracao(dono, agenteId, { ativo: true, titulo: 'Fale com a Ana', cor: '#2563eb' })
  // A aba é de qualquer usuário autenticado (PR-12): entra com quem não é o dono do agente.
  cookie = await cookieDe(outro.email, outro.senha)
  comum = await subirServidor(3196)
  configurado = await subirServidor(3197, { APP_URL: 'https://converse.exemplo.com.br', TRUST_PROXY: '1' })
}, 240_000)

afterAll(async () => {
  comum?.parar()
  configurado?.parar()
  await limparBanco()
})

describe('aba Publicar', () => {
  it('sem sessão manda para o login', async () => {
    const r = await pegar(comum.base, `/agentes/${agenteId}/publicar`, false)
    expect(r.status).toBe(307)
    expect(r.headers.get('location')).toContain('/entrar')
  })

  it('agente inexistente responde 404', async () => {
    expect((await pegar(comum.base, '/agentes/nao-existe-0123/publicar')).status).toBe(404)
  })

  it('abre para qualquer usuário autenticado, com a aba Publicar marcada entre as quatro', async () => {
    const r = await pegar(comum.base, `/agentes/${agenteId}/publicar`)
    expect(r.status).toBe(200)
    const html = await r.text()
    const abas = html.match(/<nav class="abas"[\s\S]*?<\/nav>/)?.[0] ?? ''
    expect((abas.match(/<a /g) ?? []).length).toBe(4)
    const marcada = abas.match(/<a [^>]*aria-current="page"[^>]*>/g) ?? []
    expect(marcada).toHaveLength(1)
    expect(marcada[0]).toContain(`href="/agentes/${agenteId}/publicar"`)
  })

  it('traz o formulário preenchido com o que foi salvo', async () => {
    const html = await (await pegar(comum.base, `/agentes/${agenteId}/publicar`)).text()
    expect(html).toContain('Publicar chat')
    expect(html).toContain('value="Fale com a Ana"')
    expect(html).toContain('value="#2563eb"')
    expect(html).toContain('Domínios permitidos')
    expect(html).toContain('Limite diário de mensagens')
  })

  it('o código para incorporar usa a origem da requisição sem APP_URL, com o id do agente', async () => {
    const html = await (await pegar(comum.base, `/agentes/${agenteId}/publicar`)).text()
    expect(html).toContain(`&lt;script src=&quot;${comum.base}/widget.js&quot; data-agent=&quot;${agenteId}&quot; async&gt;&lt;/script&gt;`)
    expect(html).toContain('Copiar código')
  })

  it('com APP_URL o código usa a URL pública configurada', async () => {
    const html = await (await pegar(configurado.base, `/agentes/${agenteId}/publicar`)).text()
    expect(html).toContain('src=&quot;https://converse.exemplo.com.br/widget.js&quot;')
    expect(html).not.toContain(`src=&quot;${configurado.base}/widget.js`)
  })

  it('a prévia é o iframe do próprio chat no modo prévia', async () => {
    const html = await (await pegar(comum.base, `/agentes/${agenteId}/publicar`)).text()
    expect(html).toMatch(new RegExp(`<iframe[^>]*src="/embed/${agenteId}\\?previa=1"`))
    expect(html).toContain('Pré-visualização')
  })

  it('os avisos dependem do ambiente: sem proxy e sem chave de um lado, proxy do outro', async () => {
    const a = await (await pegar(comum.base, `/agentes/${agenteId}/publicar`)).text()
    expect(a).toContain('TRUST_PROXY=1')
    expect(a).toContain('mensagem genérica')
    expect(a).toContain('só com as instruções')
    const b = await (await pegar(configurado.base, `/agentes/${agenteId}/publicar`)).text()
    expect(b).not.toContain('TRUST_PROXY=1')
  })

  it('nunca mostra chave do OpenRouter, segredo nem configuração interna', async () => {
    const html = await (await pegar(comum.base, `/agentes/${agenteId}/publicar`)).text()
    expect(html).not.toMatch(/sk-or|JWT_SECRET|ENCRYPTION_KEY|cifrada/)
  })

  it('a página do chat publicado abre no próprio iframe da prévia (mesma origem), com sessão', async () => {
    const r = await pegar(comum.base, `/embed/${agenteId}?previa=1`)
    expect(r.status).toBe(200)
    expect(r.headers.get('content-security-policy')).toMatch(/^frame-ancestors /)
    expect(r.headers.get('x-frame-options')).toBeNull()
  })
})
