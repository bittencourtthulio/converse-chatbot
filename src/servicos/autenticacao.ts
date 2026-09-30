import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { senhaConfere } from '@/lib/senha'
import { assinarSessao, lerSessao, type Sessao } from '@/lib/sessao'
import {
  entradaInvalida,
  limiteExcedido,
  naoAutenticado,
  naoAutorizado,
} from '@/lib/erros'
import { limitadorPadrao, type Limitador } from '@/lib/limite-de-uso'

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

/** PR-36: toda tentativa conta, certa ou errada. */
export const LIMITE_DE_LOGIN_POR_IP_E_EMAIL = { max: 5, janelaMs: 60_000 }
export const LIMITE_DE_LOGIN_POR_IP = { max: 20, janelaMs: 60_000 }

/**
 * Barra o excesso de tentativas de login: 5 por minuto por IP e e-mail, e 20
 * por minuto por IP (PR-16, PR-36). Lança 429 com mensagem para a tela. É
 * chamada antes de `entrar` pela ação de login; `entrar` em si não conhece IP.
 */
export function exigirLimiteDeLogin(
  quem: { ip: string; email: unknown },
  limitador: Pick<Limitador, 'verificarLimite'> = limitadorPadrao,
): void {
  const email = typeof quem.email === 'string' ? quem.email.trim().toLowerCase() : ''
  const porIp = limitador.verificarLimite(`login:ip:${quem.ip}`, LIMITE_DE_LOGIN_POR_IP)
  if (!porIp.permitido) throw limiteExcedido('entrada', porIp.reiniciaEmMs)
  const porIpEEmail = limitador.verificarLimite(
    `login:ip-email:${quem.ip}:${email}`,
    LIMITE_DE_LOGIN_POR_IP_E_EMAIL,
  )
  if (!porIpEEmail.permitido) throw limiteExcedido('entrada', porIpEEmail.reiniciaEmMs)
}

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
