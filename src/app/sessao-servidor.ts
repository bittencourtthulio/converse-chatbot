import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COOKIE_SESSAO, opcoesDoCookie } from '@/lib/sessao'
import {
  usuarioDaSessao,
  type UsuarioAutenticado,
} from '@/servicos/autenticacao'

/** O usuário da requisição, ou `null` se não houver sessão válida. */
export async function usuarioAtual(): Promise<UsuarioAutenticado | null> {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value
  if (!token) return null
  try {
    return await usuarioDaSessao(token)
  } catch {
    return null
  }
}

/** O usuário da requisição. Sem sessão, manda para o login. */
export async function exigirUsuario(): Promise<UsuarioAutenticado> {
  const usuario = await usuarioAtual()
  if (!usuario) redirect('/entrar')
  return usuario
}

/**
 * O usuário da requisição, que precisa ser admin. A verificação acontece
 * aqui, no servidor — esconder o item do menu não é controle de acesso (L2).
 */
export async function exigirUsuarioAdmin(): Promise<UsuarioAutenticado> {
  const usuario = await exigirUsuario()
  if (usuario.papel !== 'admin') redirect('/')
  return usuario
}

/** O token do cookie de sessão, ou `undefined` sem cookie. É o que `sair` revoga (PR-101). */
export async function tokenDaSessao(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_SESSAO)?.value
}

export async function gravarCookieDeSessao(token: string): Promise<void> {
  ;(await cookies()).set(COOKIE_SESSAO, token, opcoesDoCookie())
}

export async function apagarCookieDeSessao(): Promise<void> {
  ;(await cookies()).delete(COOKIE_SESSAO)
}
