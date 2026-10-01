/**
 * T-03.02 (FT-12, PR-27, PR-31, achado A-02 do B6): a ação `salvarSenha` sem simular `gravarCookieDeSessao`.
 * O cookie que ela grava (lido do jar simulado do Next) leva o token da versão nova e os atributos certos.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { COOKIE_SESSAO, lerSessao, opcoesDoCookie } from '@/lib/sessao'
import { entrar, usuarioDaSessao } from '@/servicos/autenticacao'
import { criarUsuario, limparBanco, SENHA_PADRAO } from './ajuda'
import { definirCookie, gravados, reiniciarNextFalso, valorDoCookie } from './apoio/next-falso'

vi.mock('next/headers', async () => (await import('./apoio/next-falso')).moduloNextHeaders())
vi.mock('next/navigation', async () => (await import('./apoio/next-falso')).moduloNextNavigation())
vi.mock('next/cache', () => ({ revalidatePath: () => undefined }))

const { salvarSenha } = await import('@/app/acoes')

const formulario = (campos: Record<string, string>) => {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) f.set(k, v)
  return f
}
const NOVA = 'senha-nova-456'

beforeEach(async () => {
  await limparBanco()
  reiniciarNextFalso()
})

describe('salvarSenha grava o cookie real (integração)', () => {
  it('o cookie gravado tem os atributos de sempre e um token que vale, enquanto o anterior é recusado', async () => {
    const u = await criarUsuario()
    const { token: antigo } = await entrar({ email: u.email, senha: SENHA_PADRAO })
    definirCookie(COOKIE_SESSAO, antigo)

    const r = await salvarSenha({}, formulario({ senhaAtual: SENHA_PADRAO, senhaNova: NOVA, confirmacao: NOVA }))
    expect(r.sucesso).toContain('Senha alterada')

    expect(gravados).toHaveLength(1)
    expect(gravados[0]).toMatchObject({ nome: COOKIE_SESSAO, opcoes: opcoesDoCookie() })
    expect(gravados[0]!.opcoes).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/', maxAge: 900 })
    const novo = valorDoCookie(COOKIE_SESSAO)!
    expect(novo).not.toBe(antigo)
    expect(await usuarioDaSessao(novo)).toMatchObject({ id: u.id })
    expect((await lerSessao(novo)).versao).toBe(1)
    await expect(usuarioDaSessao(antigo)).rejects.toMatchObject({ status: 401 })
  })
})

describe('troca recusada (funcional)', () => {
  it('com a senha atual errada devolve o erro, não grava cookie e a sessão segue valendo', async () => {
    const u = await criarUsuario()
    const { token } = await entrar({ email: u.email, senha: SENHA_PADRAO })
    definirCookie(COOKIE_SESSAO, token)

    const r = await salvarSenha({}, formulario({ senhaAtual: 'senha-errada-000', senhaNova: NOVA, confirmacao: NOVA }))

    expect(r.erro).toContain('incorreta')
    expect(gravados).toEqual([])
    expect(await usuarioDaSessao(token)).toMatchObject({ id: u.id })
  })
})
