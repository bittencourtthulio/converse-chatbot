import { SignJWT, jwtVerify } from 'jose'
import { ambiente } from '@/lib/ambiente'
import { naoAutenticado } from '@/lib/erros'

export interface Sessao {
  usuarioId: string
  papel: string
  /** Emitido em, em segundos. Comparado com `sessoesValidasDesde` do usuário. */
  emitidoEm: number
}

function chave(): Uint8Array {
  return new TextEncoder().encode(ambiente.jwtSecret)
}

export async function assinarSessao(
  usuarioId: string,
  papel: string,
  /**
   * Instante de emissão, em segundos. A troca de senha passa um valor
   * explícito para que o token novo nasça depois do corte que ela acabou
   * de gravar — o `iat` do JWT tem resolução de segundos, e sem isso o
   * token recém-emitido seria invalidado pela própria troca.
   */
  emitidoEm = Math.floor(Date.now() / 1000),
): Promise<string> {
  return new SignJWT({ papel })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(usuarioId)
    .setIssuedAt(emitidoEm)
    .setExpirationTime(emitidoEm + ambiente.jwtTtlSegundos)
    .sign(chave())
}

export async function lerSessao(token: string): Promise<Sessao> {
  try {
    const { payload } = await jwtVerify(token, chave())
    if (!payload.sub || typeof payload.papel !== 'string' || !payload.iat) {
      throw naoAutenticado()
    }
    return {
      usuarioId: payload.sub,
      papel: payload.papel,
      emitidoEm: payload.iat,
    }
  } catch {
    throw naoAutenticado()
  }
}

/** O nome do cookie de sessão. httpOnly, secure em produção, sameSite lax (L4, L7). */
export const COOKIE_SESSAO = 'expx_sessao'

export function opcoesDoCookie() {
  return {
    httpOnly: true,
    secure: ambiente.ehProducao,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: ambiente.jwtTtlSegundos,
  }
}
