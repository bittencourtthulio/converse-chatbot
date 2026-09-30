import { describe, it, expect, beforeEach } from 'vitest'
import { listar, criar, editar, desativar } from '../src/servicos/usuarios.js'
import { entrar } from '../src/servicos/autenticacao.js'
import { prisma } from '../src/lib/prisma.js'
import { criarUsuario, criarAdmin, limparBanco } from './ajuda.js'

beforeEach(limparBanco)

describe('quem pode administrar usuários', () => {
  it('admin lista', async () => {
    const admin = await criarAdmin()
    await criarUsuario()
    expect(await listar(admin)).toHaveLength(2)
  })

  it('usuário comum não lista, e recebe 403', async () => {
    const comum = await criarUsuario()
    await expect(listar(comum)).rejects.toMatchObject({ status: 403 })
  })

  it('usuário comum não cria', async () => {
    const comum = await criarUsuario()
    await expect(
      criar(comum, {
        nome: 'Intruso',
        email: 'intruso@teste.local',
        senha: 'senha-boa-123',
      }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('usuário comum não edita ninguém, nem a si mesmo', async () => {
    const comum = await criarUsuario()
    await expect(editar(comum, comum.id, { papel: 'admin' })).rejects.toMatchObject(
      { status: 403 },
    )
  })
})

describe('criar', () => {
  it('cria com papel usuario por padrão', async () => {
    const admin = await criarAdmin()
    const novo = await criar(admin, {
      nome: 'Pessoa Nova',
      email: 'nova@teste.local',
      senha: 'senha-boa-123',
    })
    expect(novo.papel).toBe('usuario')
    expect(novo.ativo).toBe(true)
  })

  it('guarda a senha como hash, nunca em claro', async () => {
    const admin = await criarAdmin()
    const novo = await criar(admin, {
      nome: 'Pessoa Nova',
      email: 'nova@teste.local',
      senha: 'senha-boa-123',
    })

    const noBanco = await prisma.usuario.findUniqueOrThrow({ where: { id: novo.id } })
    expect(noBanco.senhaHash).not.toBe('senha-boa-123')
    expect(noBanco.senhaHash).not.toContain('senha-boa-123')
  })

  it('o usuário criado consegue entrar com a senha definida', async () => {
    const admin = await criarAdmin()
    await criar(admin, {
      nome: 'Pessoa Nova',
      email: 'nova@teste.local',
      senha: 'senha-boa-123',
    })

    const { usuario } = await entrar({
      email: 'nova@teste.local',
      senha: 'senha-boa-123',
    })
    expect(usuario.email).toBe('nova@teste.local')
  })

  it('recusa e-mail já cadastrado, com 409', async () => {
    const admin = await criarAdmin()
    await criarUsuario({ email: 'ocupado@teste.local' })
    await expect(
      criar(admin, {
        nome: 'Outra',
        email: 'ocupado@teste.local',
        senha: 'senha-boa-123',
      }),
    ).rejects.toMatchObject({ status: 409 })
  })

  it('recusa e-mail já cadastrado mesmo com caixa diferente', async () => {
    const admin = await criarAdmin()
    await criarUsuario({ email: 'ocupado@teste.local' })
    await expect(
      criar(admin, {
        nome: 'Outra',
        email: 'OCUPADO@TESTE.LOCAL',
        senha: 'senha-boa-123',
      }),
    ).rejects.toMatchObject({ status: 409 })
  })

  it('recusa senha curta', async () => {
    const admin = await criarAdmin()
    await expect(
      criar(admin, { nome: 'Curta', email: 'curta@teste.local', senha: '1234' }),
    ).rejects.toMatchObject({ status: 422 })
  })

  it('recusa papel que não existe', async () => {
    const admin = await criarAdmin()
    await expect(
      criar(admin, {
        nome: 'Estranha',
        email: 'estranha@teste.local',
        senha: 'senha-boa-123',
        papel: 'superusuario',
      }),
    ).rejects.toMatchObject({ status: 422 })
  })
})

describe('editar', () => {
  it('muda nome, e-mail e papel', async () => {
    const admin = await criarAdmin()
    const alvo = await criarUsuario()

    const editado = await editar(admin, alvo.id, {
      nome: 'Nome Novo',
      email: 'novo@teste.local',
      papel: 'admin',
    })

    expect(editado.nome).toBe('Nome Novo')
    expect(editado.email).toBe('novo@teste.local')
    expect(editado.papel).toBe('admin')
  })

  it('recusa e-mail de outro usuário, com 409', async () => {
    const admin = await criarAdmin()
    const um = await criarUsuario({ email: 'um@teste.local' })
    await criarUsuario({ email: 'dois@teste.local' })

    await expect(
      editar(admin, um.id, { email: 'dois@teste.local' }),
    ).rejects.toMatchObject({ status: 409 })
  })

  it('aceita salvar o próprio e-mail sem mudança', async () => {
    const admin = await criarAdmin()
    const alvo = await criarUsuario({ email: 'mesmo@teste.local' })

    const editado = await editar(admin, alvo.id, { email: 'mesmo@teste.local' })
    expect(editado.email).toBe('mesmo@teste.local')
  })

  it('recusa usuário inexistente, com 404', async () => {
    const admin = await criarAdmin()
    await expect(editar(admin, 'id-que-nao-existe', { nome: 'X' })).rejects.toMatchObject(
      { status: 404 },
    )
  })
})

describe('o sistema nunca fica sem administrador', () => {
  it('impede rebaixar o último admin ativo', async () => {
    const admin = await criarAdmin()
    await criarUsuario()

    await expect(
      editar(admin, admin.id, { papel: 'usuario' }),
    ).rejects.toMatchObject({ status: 409 })
  })

  it('impede desativar o último admin ativo', async () => {
    const admin = await criarAdmin()
    await expect(desativar(admin, admin.id)).rejects.toMatchObject({ status: 409 })
  })

  it('permite rebaixar um admin quando há outro ativo', async () => {
    const admin = await criarAdmin()
    const segundo = await criarUsuario({ papel: 'admin' })

    const editado = await editar(admin, segundo.id, { papel: 'usuario' })
    expect(editado.papel).toBe('usuario')
  })

  it('não conta admin desativado como o outro admin', async () => {
    const admin = await criarAdmin()
    await criarUsuario({ papel: 'admin', ativo: false })

    await expect(desativar(admin, admin.id)).rejects.toMatchObject({ status: 409 })
  })
})

describe('desativar', () => {
  it('desativa sem apagar o registro', async () => {
    const admin = await criarAdmin()
    const alvo = await criarUsuario()

    const desativado = await desativar(admin, alvo.id)
    expect(desativado.ativo).toBe(false)

    const noBanco = await prisma.usuario.findUnique({ where: { id: alvo.id } })
    expect(noBanco).not.toBeNull()
  })

  it('o usuário desativado não entra mais', async () => {
    const admin = await criarAdmin()
    const alvo = await criarUsuario({ email: 'sai@teste.local' })
    await desativar(admin, alvo.id)

    await expect(
      entrar({ email: 'sai@teste.local', senha: alvo.senha }),
    ).rejects.toMatchObject({ status: 401 })
  })
})
