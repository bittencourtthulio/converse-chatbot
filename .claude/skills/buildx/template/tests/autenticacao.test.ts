import { describe, it, expect, beforeEach } from 'vitest'
import { entrar, usuarioDaSessao, exigirAdmin } from '../src/servicos/autenticacao.js'
import { ErroDeAplicacao } from '../src/lib/erros.js'
import { assinarSessao } from '../src/lib/sessao.js'
import { prisma } from '../src/lib/prisma.js'
import { criarUsuario, criarAdmin, limparBanco, SENHA_PADRAO } from './ajuda.js'

beforeEach(limparBanco)

describe('entrar', () => {
  it('devolve token e usuário com as credenciais corretas', async () => {
    const criado = await criarUsuario()
    const { token, usuario } = await entrar({
      email: criado.email,
      senha: SENHA_PADRAO,
    })

    expect(token).toBeTruthy()
    expect(usuario.id).toBe(criado.id)
    expect(usuario.papel).toBe('usuario')
  })

  it('aceita o e-mail com caixa e espaço diferentes do cadastrado', async () => {
    const criado = await criarUsuario({ email: 'alguem@teste.local' })
    const { usuario } = await entrar({
      email: '  ALGUEM@TESTE.LOCAL  ',
      senha: SENHA_PADRAO,
    })
    expect(usuario.id).toBe(criado.id)
  })

  it('recusa senha errada', async () => {
    const criado = await criarUsuario()
    await expect(
      entrar({ email: criado.email, senha: 'senha-errada' }),
    ).rejects.toThrow(ErroDeAplicacao)
  })

  it('recusa conta desativada', async () => {
    const criado = await criarUsuario({ ativo: false })
    await expect(
      entrar({ email: criado.email, senha: SENHA_PADRAO }),
    ).rejects.toThrow(ErroDeAplicacao)
  })

  it('não distingue e-mail inexistente de senha errada na mensagem', async () => {
    const criado = await criarUsuario()

    const inexistente = await entrar({
      email: 'ninguem@teste.local',
      senha: SENHA_PADRAO,
    }).catch((e: ErroDeAplicacao) => e)
    const senhaErrada = await entrar({
      email: criado.email,
      senha: 'outra-senha',
    }).catch((e: ErroDeAplicacao) => e)

    expect((inexistente as ErroDeAplicacao).message).toBe(
      (senhaErrada as ErroDeAplicacao).message,
    )
  })

  it('recusa e-mail malformado antes de tocar o banco', async () => {
    await expect(entrar({ email: 'nao-e-email', senha: 'x' })).rejects.toMatchObject({
      status: 422,
    })
  })
})

describe('usuarioDaSessao', () => {
  it('resolve o usuário a partir de um token válido', async () => {
    const criado = await criarUsuario()
    const { token } = await entrar({ email: criado.email, senha: SENHA_PADRAO })

    const usuario = await usuarioDaSessao(token)
    expect(usuario.id).toBe(criado.id)
  })

  it('recusa token assinado com outro segredo', async () => {
    const criado = await criarUsuario()
    const segredoOriginal = process.env.JWT_SECRET
    process.env.JWT_SECRET = 'um-segredo-completamente-diferente'
    const tokenIntruso = await assinarSessao(criado.id, 'admin')
    process.env.JWT_SECRET = segredoOriginal

    await expect(usuarioDaSessao(tokenIntruso)).rejects.toMatchObject({ status: 401 })
  })

  it('recusa token de conta desativada depois da emissão', async () => {
    const criado = await criarUsuario()
    const { token } = await entrar({ email: criado.email, senha: SENHA_PADRAO })

    await prisma.usuario.update({
      where: { id: criado.id },
      data: { ativo: false },
    })

    await expect(usuarioDaSessao(token)).rejects.toMatchObject({ status: 401 })
  })

  it('recusa token de conta apagada', async () => {
    const criado = await criarUsuario()
    const { token } = await entrar({ email: criado.email, senha: SENHA_PADRAO })
    await prisma.usuario.delete({ where: { id: criado.id } })

    await expect(usuarioDaSessao(token)).rejects.toMatchObject({ status: 401 })
  })

  it('recusa texto que não é um token', async () => {
    await expect(usuarioDaSessao('isto-nao-e-um-jwt')).rejects.toMatchObject({
      status: 401,
    })
  })
})

describe('exigirAdmin', () => {
  it('deixa passar quem é admin', async () => {
    const admin = await criarAdmin()
    expect(() => exigirAdmin(admin)).not.toThrow()
  })

  it('barra quem não é admin, com 403', async () => {
    const comum = await criarUsuario()
    expect(() => exigirAdmin(comum)).toThrowError(
      expect.objectContaining({ status: 403 }),
    )
  })
})
