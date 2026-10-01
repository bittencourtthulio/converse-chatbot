/**
 * T-03.01 (FT-12, PR-101): a ação `sair` real, com cookies simulados e o `sessao-servidor` real. Sair revoga
 * o jti do token do cookie, apaga o cookie e manda para /entrar; outras sessões do mesmo usuário continuam.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { COOKIE_SESSAO, lerSessao } from '@/lib/sessao'
import { entrar, usuarioDaSessao } from '@/servicos/autenticacao'
import { prisma } from '@/lib/prisma'
import { criarUsuario, limparBanco, SENHA_PADRAO } from './ajuda'
import { apagados, definirCookie, destinoDoRedirecionamento, reiniciarNextFalso } from './apoio/next-falso'

vi.mock('next/headers', async () => (await import('./apoio/next-falso')).moduloNextHeaders())
vi.mock('next/navigation', async () => (await import('./apoio/next-falso')).moduloNextNavigation())
vi.mock('next/cache', () => ({ revalidatePath: () => undefined }))

// A falha da gravação é provocada no serviço, o resto do módulo é o real.
const falha = { ativa: false }
vi.mock('@/servicos/autenticacao', async (importarOriginal) => {
  const real = await importarOriginal<typeof import('@/servicos/autenticacao')>()
  return {
    ...real,
    revogarSessao: async (...args: Parameters<typeof real.revogarSessao>) => {
      if (falha.ativa) throw Object.assign(new Error('mensagem-que-nao-pode-vazar'), { name: 'ErroDoBancoDeTeste' })
      return real.revogarSessao(...args)
    },
  }
})

const { sair } = await import('@/app/acoes')

beforeEach(async () => {
  await limparBanco()
  reiniciarNextFalso()
  falha.ativa = false
})
afterEach(() => vi.restoreAllMocks())

describe('a ação sair (integração)', () => {
  it('revoga o jti do cookie, apaga o cookie e redireciona para /entrar; o token roubado passa a receber 401', async () => {
    const u = await criarUsuario()
    const { token } = await entrar({ email: u.email, senha: SENHA_PADRAO })
    definirCookie(COOKIE_SESSAO, token)

    expect(await destinoDoRedirecionamento(() => sair())).toBe('/entrar')

    const linhas = await prisma.sessaoRevogada.findMany()
    expect(linhas.map((l) => l.jti)).toEqual([(await lerSessao(token)).jti])
    expect(apagados).toEqual([COOKIE_SESSAO])
    await expect(usuarioDaSessao(token)).rejects.toMatchObject({ status: 401 })
  })

  it('outra sessão do mesmo usuário continua valendo', async () => {
    const u = await criarUsuario()
    const { token: desta } = await entrar({ email: u.email, senha: SENHA_PADRAO })
    const { token: doOutroAparelho } = await entrar({ email: u.email, senha: SENHA_PADRAO })
    definirCookie(COOKIE_SESSAO, desta)

    await destinoDoRedirecionamento(() => sair())

    expect(await usuarioDaSessao(doOutroAparelho)).toMatchObject({ id: u.id })
  })
})

describe('casos de borda (funcional)', () => {
  it('sem cookie só apaga o cookie e redireciona, sem gravar revogação', async () => {
    expect(await destinoDoRedirecionamento(() => sair())).toBe('/entrar')
    expect(await prisma.sessaoRevogada.count()).toBe(0)
    expect(apagados).toEqual([COOKIE_SESSAO])
  })

  it('cookie com lixo é ignorado: sem revogação, cookie apagado', async () => {
    definirCookie(COOKIE_SESSAO, 'isto-nao-e-um-token')
    expect(await destinoDoRedirecionamento(() => sair())).toBe('/entrar')
    expect(await prisma.sessaoRevogada.count()).toBe(0)
    expect(apagados).toEqual([COOKIE_SESSAO])
  })

  it('falha ao gravar a revogação ainda apaga o cookie e o log leva só o nome do erro', async () => {
    const u = await criarUsuario()
    const { token } = await entrar({ email: u.email, senha: SENHA_PADRAO })
    definirCookie(COOKIE_SESSAO, token)
    falha.ativa = true
    const erro = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(await destinoDoRedirecionamento(() => sair())).toBe('/entrar')

    expect(apagados).toEqual([COOKIE_SESSAO])
    const saida = erro.mock.calls.map((c) => String(c[0])).join('\n')
    expect(saida).toContain('sessao_revogacao_falhou')
    expect(saida).toContain('ErroDoBancoDeTeste')
    expect(saida).not.toContain('mensagem-que-nao-pode-vazar')
    expect(saida).not.toContain(token)
  })
})
