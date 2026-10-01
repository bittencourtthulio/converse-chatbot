/**
 * T-01.02 (FT-12): o apoio que simula cookies(), headers() e redirect() do Next. Prova, com ele, o que
 * `gravarCookieDeSessao`, `apagarCookieDeSessao` e `ipDoCliente` reais fazem hoje.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { COOKIE_SESSAO, opcoesDoCookie } from '@/lib/sessao'
import {
  apagados,
  definirCabecalho,
  definirCookie,
  destinoDoRedirecionamento,
  gravados,
  reiniciarNextFalso,
  valorDoCookie,
} from './apoio/next-falso'

vi.mock('next/headers', async () => (await import('./apoio/next-falso')).moduloNextHeaders())
vi.mock('next/navigation', async () => (await import('./apoio/next-falso')).moduloNextNavigation())

const { apagarCookieDeSessao, gravarCookieDeSessao, usuarioAtual } = await import('@/app/sessao-servidor')
const { ipDoCliente } = await import('@/lib/requisicao')
const { redirect } = await import('next/navigation')

const original = process.env.TRUST_PROXY

beforeEach(reiniciarNextFalso)
afterEach(() => {
  if (original === undefined) delete process.env.TRUST_PROXY
  else process.env.TRUST_PROXY = original
})

describe('cookies simulados do Next (integração)', () => {
  it('gravarCookieDeSessao e apagarCookieDeSessao reais registram o set e o delete de expx_sessao', async () => {
    await gravarCookieDeSessao('token-de-teste')
    expect(gravados).toEqual([{ nome: COOKIE_SESSAO, valor: 'token-de-teste', opcoes: opcoesDoCookie() }])
    expect(valorDoCookie(COOKIE_SESSAO)).toBe('token-de-teste')

    await apagarCookieDeSessao()
    expect(apagados).toEqual([COOKIE_SESSAO])
    expect(valorDoCookie(COOKIE_SESSAO)).toBeUndefined()
  })

  it('sem cookie a sessão do servidor é nula; com cookie inválido também (o jar de entrada é lido)', async () => {
    expect(await usuarioAtual()).toBeNull()
    definirCookie(COOKIE_SESSAO, 'lixo')
    expect(await usuarioAtual()).toBeNull()
  })
})

describe('cabeçalhos e redirecionamento simulados (funcional)', () => {
  it('com TRUST_PROXY=1 o IP é o primeiro valor de x-forwarded-for; sem ele é "desconhecido"', async () => {
    definirCabecalho('X-Forwarded-For', '203.0.113.7, 10.0.0.1')
    process.env.TRUST_PROXY = '1'
    expect(await ipDoCliente()).toBe('203.0.113.7')
    delete process.env.TRUST_PROXY
    expect(await ipDoCliente()).toBe('desconhecido')
  })

  it('redirect lança o sinal com o destino e destinoDoRedirecionamento o devolve', async () => {
    expect(await destinoDoRedirecionamento(async () => redirect('/entrar'))).toBe('/entrar')
    expect(await destinoDoRedirecionamento(async () => undefined)).toBeNull()
  })
})
