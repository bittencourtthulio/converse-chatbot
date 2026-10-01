/**
 * A rota /configuracoes/sistema (FT-11, PR-95) contra o servidor de produção (exige `npm run build`):
 * a guarda de admin no servidor (sem sessão vai ao login, usuário comum recebe 307 antes de qualquer
 * trecho da página), o título e o estado geral, e que nenhum valor de segredo chega ao HTML.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { limparBanco } from './ajuda'
import { cookieDe, subirServidor, type Servidor } from './apoio/servidor'

const SENHA = 'senha-de-rota-123'
let servidor: Servidor
let cookieAdmin: string
let cookieComum: string

const pegar = (cookie?: string) =>
  fetch(`${servidor.base}/configuracoes/sistema`, { redirect: 'manual', headers: cookie ? { cookie } : {} })

beforeAll(async () => {
  await limparBanco()
  const senhaHash = await hashDeSenha(SENHA)
  await prisma.usuario.create({ data: { nome: 'Ana Admin', email: 'admin.sistema@teste.local', senhaHash, papel: 'admin' } })
  await prisma.usuario.create({ data: { nome: 'Maria', email: 'maria.sistema@teste.local', senhaHash, papel: 'usuario' } })
  cookieAdmin = await cookieDe('admin.sistema@teste.local', SENHA)
  cookieComum = await cookieDe('maria.sistema@teste.local', SENHA)
  servidor = await subirServidor(3229)
}, 180_000)
afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

describe('guarda de admin no servidor', () => {
  it('sem sessão redireciona ao login', async () => {
    const r = await pegar()
    expect(r.status).toBe(307)
    expect(r.headers.get('location')).toContain('/entrar')
  })

  it('usuário comum recebe 307 para o painel, antes de qualquer trecho da página', async () => {
    const r = await pegar(cookieComum)
    expect(r.status).toBe(307)
    expect(new URL(r.headers.get('location')!, servidor.base).pathname).toBe('/')
    expect(await r.text()).not.toContain('Estado geral')
  })
})

describe('página para o admin', () => {
  it('abre com o título Sistema, o estado geral e nenhum valor de segredo', async () => {
    const r = await pegar(cookieAdmin)
    expect(r.status).toBe(200)
    const html = await r.text()
    expect(html).toContain('<h1 class="titulo-da-pagina">Sistema</h1>')
    expect(html).toContain('Estado geral')
    expect(html).toMatch(/Tudo em ordem|Funcionando com limitações|Com falha/)
    expect(html).not.toContain(process.env.ENCRYPTION_KEY!)
    expect(html).not.toContain(process.env.JWT_SECRET!)
  })

  it('o item Sistema aparece no menu do admin e não no do usuário comum', async () => {
    const admin = await (await fetch(`${servidor.base}/`, { headers: { cookie: cookieAdmin } })).text()
    const comum = await (await fetch(`${servidor.base}/`, { headers: { cookie: cookieComum } })).text()
    expect(admin).toContain('href="/configuracoes/sistema"')
    expect(comum).not.toContain('href="/configuracoes/sistema"')
  })
})
