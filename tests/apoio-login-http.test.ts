/**
 * T-01.03 (FT-12): o apoio que envia formulários de Server Action a um servidor de produção, provado
 * com o login real em `next start` na porta 3250. Exige `npm run build` antes.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { COOKIE_SESSAO } from '@/lib/sessao'
import { criarUsuario, limparBanco } from './ajuda'
import { entrarPorFormulario, camposOcultosDoFormulario } from './apoio/login-http'
import { subirServidor, type Servidor } from './apoio/servidor'

let servidor: Servidor
let usuario: Awaited<ReturnType<typeof criarUsuario>>

beforeAll(async () => {
  await limparBanco()
  usuario = await criarUsuario({ email: 'login.http@teste.local' })
  servidor = await subirServidor(3250)
}, 180_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

describe('login pelo formulário real contra o servidor de produção (integração)', () => {
  it('com a senha certa: 303 para / e Set-Cookie de expx_sessao', async () => {
    const r = await entrarPorFormulario(servidor.base, usuario.email, usuario.senha)
    expect(r.status).toBe(303)
    expect(r.location).toBe('/')
    expect(r.cookie).toMatch(new RegExp(`^${COOKIE_SESSAO}=[\\w-]+\\.[\\w-]+\\.[\\w-]+$`))
    const logado = await fetch(`${servidor.base}/perfil`, { headers: { cookie: r.cookie! }, redirect: 'manual' })
    expect(logado.status).toBe(200)
  })

  it('o formulário de login traz os campos ocultos da ação', async () => {
    const html = await (await fetch(`${servidor.base}/entrar`)).text()
    const nomes = camposOcultosDoFormulario(html, 'name="senha"').map(([nome]) => nome)
    expect(nomes.some((n) => n.startsWith('$ACTION_'))).toBe(true)
  })
})

describe('login recusado (funcional)', () => {
  it('com a senha errada: 200 com a mensagem E-mail ou senha incorretos e sem Set-Cookie', async () => {
    const r = await entrarPorFormulario(servidor.base, usuario.email, 'senha-errada-123')
    expect(r.status).toBe(200)
    expect(r.corpo).toContain('E-mail ou senha incorretos')
    expect(r.setCookies).toEqual([])
    expect(r.cookie).toBeNull()
  })
})
