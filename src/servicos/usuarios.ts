import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { conflito, entradaInvalida, naoEncontrado } from '@/lib/erros'
import { exigirAdmin, type UsuarioAutenticado } from '@/servicos/autenticacao'

// Sem regra de complexidade teatral (L3): tamanho mínimo e nada mais.
const senhaValida = z.string().min(8, 'A senha precisa de ao menos 8 caracteres.')

// Normaliza antes de validar — ver a nota em autenticacao.ts.
const emailNormalizado = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('E-mail inválido.'))
const papelValido = z.enum(['admin', 'usuario'], {
  message: 'Papel precisa ser admin ou usuario.',
})

export const entradaDeCriacao = z.object({
  nome: z.string().trim().min(1, 'Informe o nome.'),
  email: emailNormalizado,
  senha: senhaValida,
  papel: papelValido.default('usuario'),
})

export const entradaDeEdicao = z.object({
  nome: z.string().trim().min(1, 'Informe o nome.').optional(),
  email: emailNormalizado.optional(),
  papel: papelValido.optional(),
  ativo: z.boolean().optional(),
})

export interface UsuarioListado {
  id: string
  nome: string
  email: string
  papel: string
  ativo: boolean
  criadoEm: Date
}

const camposListados = {
  id: true,
  nome: true,
  email: true,
  papel: true,
  ativo: true,
  criadoEm: true,
} as const

export async function listar(autor: UsuarioAutenticado): Promise<UsuarioListado[]> {
  exigirAdmin(autor)
  return prisma.usuario.findMany({
    select: camposListados,
    orderBy: { criadoEm: 'asc' },
  })
}

export async function criar(
  autor: UsuarioAutenticado,
  entrada: unknown,
): Promise<UsuarioListado> {
  exigirAdmin(autor)

  const dados = entradaDeCriacao.safeParse(entrada)
  if (!dados.success) {
    throw entradaInvalida(dados.error.issues[0]?.message ?? 'Entrada inválida.')
  }

  const email = dados.data.email
  if (await prisma.usuario.findUnique({ where: { email } })) {
    throw conflito('Já existe um usuário com este e-mail.')
  }

  return prisma.usuario.create({
    data: {
      nome: dados.data.nome,
      email,
      papel: dados.data.papel,
      senhaHash: await hashDeSenha(dados.data.senha),
    },
    select: camposListados,
  })
}

export async function editar(
  autor: UsuarioAutenticado,
  id: string,
  entrada: unknown,
): Promise<UsuarioListado> {
  exigirAdmin(autor)

  const dados = entradaDeEdicao.safeParse(entrada)
  if (!dados.success) {
    throw entradaInvalida(dados.error.issues[0]?.message ?? 'Entrada inválida.')
  }

  const alvo = await prisma.usuario.findUnique({ where: { id } })
  if (!alvo) throw naoEncontrado('Usuário não encontrado.')

  // Um admin que se rebaixa ou se desativa tranca a si mesmo para fora, e
  // se for o último admin tranca todo mundo. As duas guardas abaixo são o
  // que impede o sistema de ficar sem administrador.
  const perdePapel = dados.data.papel !== undefined && dados.data.papel !== 'admin'
  const perdeAcesso = dados.data.ativo === false
  if (alvo.papel === 'admin' && (perdePapel || perdeAcesso)) {
    const outrosAdmins = await prisma.usuario.count({
      where: { papel: 'admin', ativo: true, id: { not: id } },
    })
    if (outrosAdmins === 0) {
      throw conflito('Este é o último administrador ativo. Promova outro antes.')
    }
  }

  if (dados.data.email) {
    const email = dados.data.email
    const jaExiste = await prisma.usuario.findUnique({ where: { email } })
    if (jaExiste && jaExiste.id !== id) {
      throw conflito('Já existe um usuário com este e-mail.')
    }
  }

  return prisma.usuario.update({
    where: { id },
    data: {
      ...(dados.data.nome !== undefined && { nome: dados.data.nome }),
      ...(dados.data.email !== undefined && { email: dados.data.email }),
      ...(dados.data.papel !== undefined && { papel: dados.data.papel }),
      ...(dados.data.ativo !== undefined && { ativo: dados.data.ativo }),
    },
    select: camposListados,
  })
}

/**
 * Desativa em vez de apagar. Um usuário apagado levaria junto o rastro do
 * que ele fez; a exclusão de verdade, quando o projeto precisar dela, é a
 * feature de LGPD, com o cuidado que ela exige.
 */
export async function desativar(
  autor: UsuarioAutenticado,
  id: string,
): Promise<UsuarioListado> {
  return editar(autor, id, { ativo: false })
}
