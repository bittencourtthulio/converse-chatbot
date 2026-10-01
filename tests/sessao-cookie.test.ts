/**
 * T-02.04 (FT-12, PR-27, PR-31, achado A-02 do B6): os atributos do cookie de sessão provados. O que o
 * navegador recebe é `opcoesDoCookie()`: HttpOnly (JavaScript não lê), SameSite lax (não vai em POST de
 * outro site), Path /, Secure só em produção (em teste e desenvolvimento o HTTP puro precisa funcionar) e
 * Max-Age coerente com a vida do token.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { COOKIE_SESSAO, opcoesDoCookie } from '@/lib/sessao'

const original = { ...process.env }
afterEach(() => {
  for (const chave of ['NODE_ENV', 'JWT_TTL_SEGUNDOS']) {
    if (original[chave] === undefined) delete process.env[chave]
    else process.env[chave] = original[chave]
  }
})
const definirNodeEnv = (valor: string) => Object.assign(process.env, { NODE_ENV: valor })

describe('opcoesDoCookie (integração)', () => {
  it('em teste: HttpOnly, SameSite lax, Path / e Max-Age igual ao TTL, sem Secure', () => {
    definirNodeEnv('test')
    expect(opcoesDoCookie()).toEqual({ httpOnly: true, secure: false, sameSite: 'lax', path: '/', maxAge: 900 })
  })

  it('em produção: os mesmos atributos e Secure', () => {
    definirNodeEnv('production')
    expect(opcoesDoCookie()).toEqual({ httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 900 })
  })

  it('o nome do cookie é expx_sessao', () => {
    expect(COOKIE_SESSAO).toBe('expx_sessao')
  })
})

describe('Max-Age (funcional)', () => {
  it('segue JWT_TTL_SEGUNDOS quando nada é passado', () => {
    process.env.JWT_TTL_SEGUNDOS = '120'
    expect(opcoesDoCookie().maxAge).toBe(120)
  })

  it('usa o valor passado para o cookie renovado, que dura só o restante da vida do token', () => {
    expect(opcoesDoCookie(37).maxAge).toBe(37)
    expect(opcoesDoCookie(37)).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' })
  })
})
