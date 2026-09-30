import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { senhaConfere } from '@/lib/senha'
import { assinarSessao, lerSessao, type Sessao } from '@/lib/sessao'
import { entradaInvalida, naoAutenticado, naoAutorizado } from '@/lib/erros'

// O trim e o lowercase acontecem ANTES da validação: um e-mail digitado
// com espaço à frente ou em caixa alta é o mesmo e-mail, e recusá-lo seria
// um defeito de usabilidade disfarçado de validação.
const emailNormalizado = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('E-mail inválido.'))

export const entradaDeLogin = z.object({
  email: emailNormalizado,
  senha: z.string().min(1, 'Informe a senha.'),
})

export interface UsuarioAutenticado {
  id: string
  nome: string
  email: string
  papel: string
}

/**
 * Autentica e devolve o token. A mensagem de falha é a mesma para e-mail
 * inexistente, senha errada e conta desativada — dizer qual das três é
 * entregar meio caminho a quem está tentando adivinhar.
 */
export async function entrar(entrada: unknown): Promise<{
  token: string
  usuario: UsuarioAutenticado
}> {
  const dados = entradaDeLogin.safeParse(entrada)
  if (!dados.success) {
    throw entradaInvalida(dados.error.issues[0]?.message ?? 'Entrada inválida.')
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: dados.data.email },
  })

  const falha = naoAutenticado('E-mail ou senha incorretos.')
  if (!usuario || !usuario.ativo) throw falha
  if (!(await senhaConfere(dados.data.senha, usuario.senhaHash))) throw falha

  return {
    token: await assinarSessao(usuario.id, usuario.papel),
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
    },
  }
}

/**
 * Resolve o usuário por trás de um token, verificando o que o token sozinho
 * não sabe: se a conta ainda existe, ainda está ativa, e se a sessão não foi
 * invalidada por uma troca de senha posterior à emissão.
 */
export async function usuarioDaSessao(token: string): Promise<UsuarioAutenticado> {
  const sessao: Sessao = await lerSessao(token)

  const usuario = await prisma.usuario.findUnique({
    where: { id: sessao.usuarioId },
  })
  if (!usuario || !usuario.ativo) throw naoAutenticado()

  const invalidasAte = Math.floor(usuario.sessoesValidasDesde.getTime() / 1000)
  if (sessao.emitidoEm < invalidasAte) {
    throw naoAutenticado('Sessão encerrada por troca de senha.')
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
  }
}

/** Exige que o usuário seja admin. A verificação é aqui, no servidor (L2). */
export function exigirAdmin(usuario: UsuarioAutenticado): void {
  if (usuario.papel !== 'admin') throw naoAutorizado()
}
