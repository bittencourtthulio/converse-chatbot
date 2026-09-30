import { describe, it, expect, beforeEach } from 'vitest'
import { atualizarPerfil, trocarSenha } from '../src/servicos/perfil.js'
import { entrar, usuarioDaSessao } from '../src/servicos/autenticacao.js'
import { prisma } from '../src/lib/prisma.js'
import { criarUsuario, limparBanco, SENHA_PADRAO } from './ajuda.js'

beforeEach(limparBanco)

describe('atualizarPerfil', () => {
  it('muda o próprio nome e e-mail', async () => {
    const usuario = await criarUsuario()

    const atualizado = await atualizarPerfil(usuario, {
      nome: 'Nome Escolhido',
      email: 'escolhido@teste.local',
    })

    expect(atualizado.nome).toBe('Nome Escolhido')
    expect(atualizado.email).toBe('escolhido@teste.local')
  })

  it('não muda o próprio papel, mesmo se o campo for enviado', async () => {
    const usuario = await criarUsuario()

    await atualizarPerfil(usuario, {
      nome: 'Tentativa',
      email: 'tentativa@teste.local',
      papel: 'admin',
    })

    const noBanco = await prisma.usuario.findUniqueOrThrow({
      where: { id: usuario.id },
    })
    expect(noBanco.papel).toBe('usuario')
  })

  it('recusa e-mail já usado por outro, com 409', async () => {
    const usuario = await criarUsuario()
    await criarUsuario({ email: 'ocupado@teste.local' })

    await expect(
      atualizarPerfil(usuario, { nome: 'X', email: 'ocupado@teste.local' }),
    ).rejects.toMatchObject({ status: 409 })
  })

  it('aceita manter o próprio e-mail', async () => {
    const usuario = await criarUsuario({ email: 'meu@teste.local' })

    const atualizado = await atualizarPerfil(usuario, {
      nome: 'Nome Novo',
      email: 'meu@teste.local',
    })
    expect(atualizado.email).toBe('meu@teste.local')
  })

  it('recusa nome vazio', async () => {
    const usuario = await criarUsuario()
    await expect(
      atualizarPerfil(usuario, { nome: '   ', email: 'x@teste.local' }),
    ).rejects.toMatchObject({ status: 422 })
  })
})

describe('trocarSenha', () => {
  it('troca a senha e permite entrar com a nova', async () => {
    const usuario = await criarUsuario({ email: 'troca@teste.local' })

    await trocarSenha(usuario, {
      senhaAtual: SENHA_PADRAO,
      senhaNova: 'senha-nova-456',
      confirmacao: 'senha-nova-456',
    })

    const { usuario: entrou } = await entrar({
      email: 'troca@teste.local',
      senha: 'senha-nova-456',
    })
    expect(entrou.id).toBe(usuario.id)
  })

  it('a senha antiga deixa de funcionar', async () => {
    const usuario = await criarUsuario({ email: 'troca@teste.local' })

    await trocarSenha(usuario, {
      senhaAtual: SENHA_PADRAO,
      senhaNova: 'senha-nova-456',
      confirmacao: 'senha-nova-456',
    })

    await expect(
      entrar({ email: 'troca@teste.local', senha: SENHA_PADRAO }),
    ).rejects.toMatchObject({ status: 401 })
  })

  it('exige a senha atual — sem ela, ninguém toma a conta com a sessão', async () => {
    const usuario = await criarUsuario()

    await expect(
      trocarSenha(usuario, {
        senhaAtual: 'chute-errado',
        senhaNova: 'senha-nova-456',
        confirmacao: 'senha-nova-456',
      }),
    ).rejects.toMatchObject({ status: 422 })
  })

  it('recusa quando a confirmação não confere', async () => {
    const usuario = await criarUsuario()

    await expect(
      trocarSenha(usuario, {
        senhaAtual: SENHA_PADRAO,
        senhaNova: 'senha-nova-456',
        confirmacao: 'outra-coisa-789',
      }),
    ).rejects.toMatchObject({ status: 422 })
  })

  it('recusa nova senha igual à atual', async () => {
    const usuario = await criarUsuario()

    await expect(
      trocarSenha(usuario, {
        senhaAtual: SENHA_PADRAO,
        senhaNova: SENHA_PADRAO,
        confirmacao: SENHA_PADRAO,
      }),
    ).rejects.toMatchObject({ status: 422 })
  })

  it('recusa nova senha curta', async () => {
    const usuario = await criarUsuario()

    await expect(
      trocarSenha(usuario, {
        senhaAtual: SENHA_PADRAO,
        senhaNova: 'curta',
        confirmacao: 'curta',
      }),
    ).rejects.toMatchObject({ status: 422 })
  })

  it('a senha errada não altera nada no banco', async () => {
    const usuario = await criarUsuario()
    const antes = await prisma.usuario.findUniqueOrThrow({ where: { id: usuario.id } })

    await trocarSenha(usuario, {
      senhaAtual: 'chute-errado',
      senhaNova: 'senha-nova-456',
      confirmacao: 'senha-nova-456',
    }).catch(() => undefined)

    const depois = await prisma.usuario.findUniqueOrThrow({ where: { id: usuario.id } })
    expect(depois.senhaHash).toBe(antes.senhaHash)
    expect(depois.sessoesValidasDesde.getTime()).toBe(
      antes.sessoesValidasDesde.getTime(),
    )
  })
})

describe('a troca de senha derruba as outras sessões (L4)', () => {
  it('a sessão aberta antes da troca deixa de valer', async () => {
    const usuario = await criarUsuario({ email: 'sessoes@teste.local' })

    // Uma sessão aberta em outro dispositivo, antes da troca.
    const { token: tokenAntigo } = await entrar({
      email: 'sessoes@teste.local',
      senha: SENHA_PADRAO,
    })
    expect(await usuarioDaSessao(tokenAntigo)).toMatchObject({ id: usuario.id })

    await trocarSenha(usuario, {
      senhaAtual: SENHA_PADRAO,
      senhaNova: 'senha-nova-456',
      confirmacao: 'senha-nova-456',
    })

    await expect(usuarioDaSessao(tokenAntigo)).rejects.toMatchObject({ status: 401 })
  })

  it('quem trocou a senha continua na sessão, com o token devolvido', async () => {
    const usuario = await criarUsuario()

    const { token } = await trocarSenha(usuario, {
      senhaAtual: SENHA_PADRAO,
      senhaNova: 'senha-nova-456',
      confirmacao: 'senha-nova-456',
    })

    expect(await usuarioDaSessao(token)).toMatchObject({ id: usuario.id })
  })
})
