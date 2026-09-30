/**
 * T-03.04 (FT-06, PR-17, PR-37, PR-59): os cabeçalhos da rota do iframe contra o
 * servidor de produção. O `frame-ancestors` sai do `src/proxy.ts` conforme a
 * lista do agente; o `X-Frame-Options: DENY` sai só de /embed e continua no resto.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { salvarConfiguracao } from '@/servicos/chat-publico-config'
import { criarAdmin, limparBanco } from './ajuda'
import { subirServidor, type Servidor } from './apoio/servidor'

let servidor: Servidor
let livre: string
let restrito: string
let inativo: string

const pegar = (caminho: string) => fetch(`${servidor.base}${caminho}`, { redirect: 'manual' })
const csp = (r: Response) => r.headers.get('content-security-policy')

beforeAll(async () => {
  await limparBanco()
  const admin = await criarAdmin()
  const criar = async (nome: string) => (await prisma.agente.create({ data: { nome, modelo: 'm', criadoPorId: admin.id } })).id
  livre = await criar('Livre')
  restrito = await criar('Restrito')
  inativo = await criar('Inativo')
  await salvarConfiguracao(admin, livre, { ativo: true })
  await salvarConfiguracao(admin, restrito, {
    ativo: true,
    dominiosPermitidos: ['exemplo.com', '*.parceiro.com', 'localhost:4321'],
  })
  await salvarConfiguracao(admin, inativo, { ativo: false, dominiosPermitidos: ['exemplo.com'] })
  servidor = await subirServidor(3193)
}, 180_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

describe('/embed: frame-ancestors por agente', () => {
  it('lista vazia libera qualquer site: frame-ancestors * e nenhum X-Frame-Options', async () => {
    const r = await pegar(`/embed/${livre}`)
    expect(csp(r)).toBe('frame-ancestors *')
    expect(r.headers.get('x-frame-options')).toBeNull()
  })

  it("com domínios: 'self' mais a lista normalizada, sem X-Frame-Options", async () => {
    const r = await pegar(`/embed/${restrito}`)
    expect(csp(r)).toBe("frame-ancestors 'self' exemplo.com *.parceiro.com localhost:4321")
    expect(r.headers.get('x-frame-options')).toBeNull()
  })

  it("agente inativo e agente inexistente: só 'self', e os cabeçalhos são idênticos", async () => {
    const a = await pegar(`/embed/${inativo}`)
    const b = await pegar('/embed/nao-existe-0123')
    expect(csp(a)).toBe("frame-ancestors 'self'")
    expect(csp(b)).toBe("frame-ancestors 'self'")
    expect(a.headers.get('x-frame-options')).toBeNull()
    expect(b.headers.get('x-frame-options')).toBeNull()
    expect(a.status).toBe(b.status)
  })

  it('o domínio do agente inativo não vaza no cabeçalho', async () => {
    expect(csp(await pegar(`/embed/${inativo}`))).not.toContain('exemplo.com')
  })

  it('nosniff, Referrer-Policy e Permissions-Policy seguem valendo no iframe', async () => {
    const r = await pegar(`/embed/${livre}`)
    expect(r.headers.get('x-content-type-options')).toBe('nosniff')
    expect(r.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin')
    expect(r.headers.get('permissions-policy')).toMatch(/camera=\(\)/)
  })

  it('subcaminhos de /embed também levam o frame-ancestors do agente', async () => {
    const r = await pegar(`/embed/${restrito}/qualquer`)
    expect(csp(r)).toBe("frame-ancestors 'self' exemplo.com *.parceiro.com localhost:4321")
  })

  it('a configuração muda o cabeçalho na próxima requisição (sem cache)', async () => {
    const admin = await criarAdmin()
    await salvarConfiguracao(admin, livre, { dominiosPermitidos: ['novo.com'] })
    expect(csp(await pegar(`/embed/${livre}`))).toBe("frame-ancestors 'self' novo.com")
    await salvarConfiguracao(admin, livre, { dominiosPermitidos: [] })
    expect(csp(await pegar(`/embed/${livre}`))).toBe('frame-ancestors *')
  })
})

describe('fora de /embed o X-Frame-Options: DENY continua', () => {
  it.each([
    ['/entrar', 'a tela de login'],
    ['/', 'o painel (redireciona)'],
    [`/api/publico/agentes/${livre ?? 'x'}/config`, 'a API pública'],
    ['/embedded', 'um caminho que só começa com a palavra embed'],
    ['/nao-existe', 'uma página inexistente'],
  ])('%s (%s)', async (caminho) => {
    const r = await pegar(caminho)
    expect(r.headers.get('x-frame-options')).toBe('DENY')
    expect(csp(r)).toBeNull()
    expect(r.headers.get('x-content-type-options')).toBe('nosniff')
  })
})
