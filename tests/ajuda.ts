import { prisma } from '../src/lib/prisma.js'
import { hashDeSenha } from '../src/lib/senha.js'
import type { UsuarioAutenticado } from '../src/servicos/autenticacao.js'

export const SENHA_PADRAO = 'senha-de-teste-123'

let contador = 0

/** Cria um usuário no banco e devolve a forma autenticada dele. */
export async function criarUsuario(opcoes?: {
  papel?: string
  ativo?: boolean
  senha?: string
  email?: string
}): Promise<UsuarioAutenticado & { senha: string }> {
  contador += 1
  const senha = opcoes?.senha ?? SENHA_PADRAO
  const usuario = await prisma.usuario.create({
    data: {
      nome: `Usuário ${contador}`,
      email: opcoes?.email ?? `usuario${contador}@teste.local`,
      senhaHash: await hashDeSenha(senha),
      papel: opcoes?.papel ?? 'usuario',
      ativo: opcoes?.ativo ?? true,
    },
  })
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    senha,
  }
}

export const criarAdmin = () => criarUsuario({ papel: 'admin' })

/** Esvazia a tabela entre testes, para que um não veja o que o outro criou. */
export async function limparBanco(): Promise<void> {
  await prisma.usuario.deleteMany()
}
