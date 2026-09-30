import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashDeSenha, senhaConfere } from '@/lib/senha'
import { conflito, entradaInvalida, naoAutenticado } from '@/lib/erros'
import { assinarSessao } from '@/lib/sessao'
import type { UsuarioAutenticado } from '@/servicos/autenticacao'

// Normaliza antes de validar — ver a nota em autenticacao.ts.
const emailNormalizado = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('E-mail inválido.'))

export const entradaDePerfil = z.object({
  nome: z.string().trim().min(1, 'Informe o nome.'),
  email: emailNormalizado,
})

export const entradaDeSenha = z
  .object({
    senhaAtual: z.string().min(1, 'Informe a senha atual.'),
    senhaNova: z.string().min(8, 'A nova senha precisa de ao menos 8 caracteres.'),
    confirmacao: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((d) => d.senhaNova === d.confirmacao, {
    message: 'A confirmação não confere com a nova senha.',
    path: ['confirmacao'],
  })
  .refine((d) => d.senhaNova !== d.senhaAtual, {
    message: 'A nova senha precisa ser diferente da atual.',
    path: ['senhaNova'],
  })

/** O próprio usuário edita nome e e-mail. Papel não se muda aqui: isso é do admin. */
export async function atualizarPerfil(
  usuario: UsuarioAutenticado,
  entrada: unknown,
): Promise<UsuarioAutenticado> {
  const dados = entradaDePerfil.safeParse(entrada)
  if (!dados.success) {
    throw entradaInvalida(dados.error.issues[0]?.message ?? 'Entrada inválida.')
  }

  const email = dados.data.email
  const jaExiste = await prisma.usuario.findUnique({ where: { email } })
  if (jaExiste && jaExiste.id !== usuario.id) {
    throw conflito('Já existe um usuário com este e-mail.')
  }

  const atualizado = await prisma.usuario.update({
    where: { id: usuario.id },
    data: { nome: dados.data.nome, email },
  })

  return {
    id: atualizado.id,
    nome: atualizado.nome,
    email: atualizado.email,
    papel: atualizado.papel,
  }
}

/**
 * Troca a senha. Exige a atual — sem isso, uma sessão sequestrada troca a
 * senha e toma a conta. E move `sessoesValidasDesde` para agora, o que
 * derruba toda sessão emitida antes (L4), inclusive a de quem roubou.
 *
 * Devolve um token novo para que quem trocou a senha não seja deslogado
 * pela própria troca.
 */
export async function trocarSenha(
  usuario: UsuarioAutenticado,
  entrada: unknown,
): Promise<{ token: string }> {
  const dados = entradaDeSenha.safeParse(entrada)
  if (!dados.success) {
    throw entradaInvalida(dados.error.issues[0]?.message ?? 'Entrada inválida.')
  }

  const atual = await prisma.usuario.findUnique({ where: { id: usuario.id } })
  if (!atual) throw naoAutenticado()

  if (!(await senhaConfere(dados.data.senhaAtual, atual.senhaHash))) {
    throw entradaInvalida('A senha atual está incorreta.')
  }

  // O `iat` do JWT tem resolução de segundos, então um token emitido no
  // mesmo segundo da troca teria `iat` igual ao corte e sobreviveria a ele.
  // O corte avança um segundo para ficar estritamente à frente de todo
  // token já emitido — é isso que derruba de fato as sessões abertas.
  const corteEmSegundos = Math.floor(Date.now() / 1000) + 1

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      senhaHash: await hashDeSenha(dados.data.senhaNova),
      sessoesValidasDesde: new Date(corteEmSegundos * 1000),
    },
  })

  // O token novo nasce exatamente no corte. A comparação em
  // `usuarioDaSessao` é `iat < corte`, então este sobrevive (igual não é
  // menor) e todo token anterior, com `iat` menor, cai.
  return { token: await assinarSessao(atual.id, atual.papel, corteEmSegundos) }
}
