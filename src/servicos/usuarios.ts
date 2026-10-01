import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { conflito, entradaInvalida, naoAutorizado, naoEncontrado } from '@/lib/erros'
import { exigirAdmin, type UsuarioAutenticado } from '@/servicos/autenticacao'
import { registrar } from '@/servicos/auditoria'

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

  const senhaHash = await hashDeSenha(dados.data.senha)
  // A auditoria entra na mesma transação (PR-87): sem registro, o usuário não é criado.
  return prisma.$transaction(async (tx) => {
    const criado = await tx.usuario.create({
      data: { nome: dados.data.nome, email, papel: dados.data.papel, senhaHash },
      select: camposListados,
    })
    await registrar(
      { ator: autor, acao: 'usuario_criado', alvoTipo: 'usuario', alvoId: criado.id, detalhes: { papel: criado.papel } },
      tx,
    )
    return criado
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

  // Só os nomes dos campos que mudaram de verdade vão à auditoria (PR-86): nunca nome, e-mail
  // nem senha. Papel e situação levam o valor porque não são dado pessoal.
  const campos: string[] = []
  if (dados.data.nome !== undefined && dados.data.nome !== alvo.nome) campos.push('nome')
  if (dados.data.email !== undefined && dados.data.email !== alvo.email) campos.push('email')
  if (dados.data.papel !== undefined && dados.data.papel !== alvo.papel) campos.push('papel')
  if (dados.data.ativo !== undefined && dados.data.ativo !== alvo.ativo) campos.push('ativo')

  return prisma.$transaction(async (tx) => {
    const atualizado = await tx.usuario.update({
      where: { id },
      data: {
        ...(dados.data.nome !== undefined && { nome: dados.data.nome }),
        ...(dados.data.email !== undefined && { email: dados.data.email }),
        ...(dados.data.papel !== undefined && { papel: dados.data.papel }),
        ...(dados.data.ativo !== undefined && { ativo: dados.data.ativo }),
      },
      select: camposListados,
    })
    if (campos.length > 0) {
      await registrar(
        {
          ator: autor,
          acao: 'usuario_editado',
          alvoTipo: 'usuario',
          alvoId: id,
          detalhes: {
            campos,
            ...(campos.includes('papel') && { papelAnterior: alvo.papel, papelNovo: dados.data.papel }),
            ...(campos.includes('ativo') && { ativo: dados.data.ativo }),
          },
        },
        tx,
      )
    }
    return atualizado
  })
}

/**
 * Desativa: a alternativa reversível à exclusão. A exclusão de verdade é
 * `excluirDefinitivamente`.
 */
export async function desativar(
  autor: UsuarioAutenticado,
  id: string,
): Promise<UsuarioListado> {
  return editar(autor, id, { ativo: false })
}

/**
 * Exclui o usuário de forma definitiva e irreversível (FT-10, PR-18, PR-88). Só um admin
 * ativo (conferido no banco: o serviço recebe o id, não confia em quem chama). Recusa excluir
 * a si mesmo e, por isso, o último admin ativo (409). O conteúdo da empresa permanece: os
 * agentes que o usuário criou passam ao admin que excluiu (`Agente.criadoPorId` é obrigatório,
 * com chave estrangeira restritiva), conversas e fontes ficam sem criador, e a conta some, o
 * que derruba as sessões (`usuarioDaSessao` exige que a conta exista). Tudo numa transação,
 * junto da auditoria, que guarda o rótulo de quem foi excluído.
 */
export async function excluirDefinitivamente(
  id: string,
  adminId: string,
): Promise<{ agentesTransferidos: number }> {
  return prisma.$transaction(async (tx) => {
    const admin = await tx.usuario.findUnique({ where: { id: adminId } })
    if (!admin || !admin.ativo || admin.papel !== 'admin') throw naoAutorizado()

    const alvo = await tx.usuario.findUnique({ where: { id } })
    if (!alvo) throw naoEncontrado('Usuário não encontrado.')

    if (alvo.id === admin.id) {
      const outrosAdmins = await tx.usuario.count({
        where: { papel: 'admin', ativo: true, id: { not: alvo.id } },
      })
      throw conflito(
        outrosAdmins === 0
          ? 'Este é o último administrador ativo. Promova outro antes.'
          : 'Você não pode excluir a própria conta.',
      )
    }

    const { count: agentesTransferidos } = await tx.agente.updateMany({
      where: { criadoPorId: id },
      data: { criadoPorId: admin.id },
    })
    // Conversas e fontes têm `onDelete: SetNull`; o campo de quem gravou a configuração por
    // último não tem chave estrangeira e é zerado aqui.
    await tx.configuracaoDoWorkspace.updateMany({ where: { atualizadoPor: id }, data: { atualizadoPor: null } })

    await registrar(
      {
        ator: { id: admin.id, nome: admin.nome, email: admin.email, papel: admin.papel },
        acao: 'usuario_excluido',
        alvoTipo: 'usuario',
        alvoId: id,
        detalhes: { rotulo: `${alvo.nome} <${alvo.email}>`, papel: alvo.papel, agentesTransferidos },
      },
      tx,
    )
    await tx.usuario.delete({ where: { id } })
    return { agentesTransferidos }
  })
}
