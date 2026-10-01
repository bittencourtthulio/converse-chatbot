/**
 * T-02.06 (FT-12, PR-103, achado A-1 do B6): o contador de versão de sessão no lugar do corte por relógio.
 * Login feito logo depois da troca de senha (no mesmo segundo) vale; a sessão antiga cai; usuários
 * existentes, de versão 0, mantêm o token até a primeira troca.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { entrar, usuarioDaSessao } from '@/servicos/autenticacao'
import { trocarSenha } from '@/servicos/perfil'
import { lerSessao } from '@/lib/sessao'
import { prisma } from '@/lib/prisma'
import { criarUsuario, limparBanco, SENHA_PADRAO } from './ajuda'

beforeEach(limparBanco)

const NOVA = 'senha-nova-456'
const OUTRA = 'senha-outra-789'
const troca = (u: Awaited<ReturnType<typeof criarUsuario>>, de: string, para: string) =>
  trocarSenha(u, { senhaAtual: de, senhaNova: para, confirmacao: para })
const versaoNoBanco = async (id: string) => (await prisma.usuario.findUniqueOrThrow({ where: { id } })).versaoDaSessao

describe('login logo depois da troca de senha (integração)', () => {
  it('o login feito no mesmo instante da troca vale, o token da troca vale e o anterior cai', async () => {
    const u = await criarUsuario()
    const { token: antigo } = await entrar({ email: u.email, senha: SENHA_PADRAO })

    const { token: daTroca } = await troca(u, SENHA_PADRAO, NOVA)
    const { token: novoLogin } = await entrar({ email: u.email, senha: NOVA })

    expect(await usuarioDaSessao(daTroca)).toMatchObject({ id: u.id })
    expect(await usuarioDaSessao(novoLogin)).toMatchObject({ id: u.id })
    await expect(usuarioDaSessao(antigo)).rejects.toMatchObject({ status: 401, message: expect.stringContaining('troca de senha') })
  })

  it('duas trocas seguidas deixam só a última sessão e os logins posteriores válidos', async () => {
    const u = await criarUsuario()
    const { token: t1 } = await troca(u, SENHA_PADRAO, NOVA)
    const { token: loginEntre } = await entrar({ email: u.email, senha: NOVA })
    const { token: t2 } = await troca(u, NOVA, OUTRA)
    const { token: loginDepois } = await entrar({ email: u.email, senha: OUTRA })

    await expect(usuarioDaSessao(t1)).rejects.toMatchObject({ status: 401 })
    await expect(usuarioDaSessao(loginEntre)).rejects.toMatchObject({ status: 401 })
    expect(await usuarioDaSessao(t2)).toMatchObject({ id: u.id })
    expect(await usuarioDaSessao(loginDepois)).toMatchObject({ id: u.id })
  })
})

describe('versão no usuário e no token (funcional)', () => {
  it('a versão vai de 0 a 1 e a 2 a cada troca e o token carrega a versão do login', async () => {
    const u = await criarUsuario()
    expect(await versaoNoBanco(u.id)).toBe(0)
    const { token: v0 } = await entrar({ email: u.email, senha: SENHA_PADRAO })
    expect((await lerSessao(v0)).versao).toBe(0)

    const { token: v1 } = await troca(u, SENHA_PADRAO, NOVA)
    expect(await versaoNoBanco(u.id)).toBe(1)
    expect((await lerSessao(v1)).versao).toBe(1)

    const { token: v2 } = await troca(u, NOVA, OUTRA)
    expect(await versaoNoBanco(u.id)).toBe(2)
    expect((await lerSessao(v2)).versao).toBe(2)
  })

  it('um usuário existente, de versão 0, mantém o token v0 válido até a primeira troca', async () => {
    const u = await criarUsuario()
    const { token } = await entrar({ email: u.email, senha: SENHA_PADRAO })
    expect(await usuarioDaSessao(token)).toMatchObject({ id: u.id })
    await troca(u, SENHA_PADRAO, NOVA)
    await expect(usuarioDaSessao(token)).rejects.toMatchObject({ status: 401 })
  })

  it('a troca recusada (senha atual errada) não muda a versão nem derruba a sessão', async () => {
    const u = await criarUsuario()
    const { token } = await entrar({ email: u.email, senha: SENHA_PADRAO })
    await expect(troca(u, 'senha-errada-000', NOVA)).rejects.toMatchObject({ status: 422 })
    expect(await versaoNoBanco(u.id)).toBe(0)
    expect(await usuarioDaSessao(token)).toMatchObject({ id: u.id })
  })
})
