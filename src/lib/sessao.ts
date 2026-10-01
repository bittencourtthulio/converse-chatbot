import { randomUUID } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'
import { ambiente } from '@/lib/ambiente'
import { naoAutenticado } from '@/lib/erros'

export interface Sessao {
  usuarioId: string
  papel: string
  /** Identificador da sessão, o mesmo em todos os tokens renovados dela; é o que `sair` revoga (PR-101). */
  jti: string
  /** A versão de sessão do usuário no login; token de versão menor que a do usuário é inválido (PR-103). */
  versao: number
  /** Início absoluto da sessão, em segundos: o limite de duração conta daqui, a renovação não o muda (PR-102). */
  inicio: number
  /** Emitido em, em segundos. */
  emitidoEm: number
  /** Expira em, em segundos. */
  expiraEm: number
}

/** O que muda de um token para outro; o que não se passa nasce no login (jti novo, versão 0, início agora). */
export interface OpcoesDoToken {
  versao?: number
  /** Repassado pela renovação: o `jti` de uma sessão nunca muda. */
  jti?: string
  /** Repassado pela renovação: o início da sessão nunca muda. */
  inicio?: number
  /** "Agora", em segundos; o padrão é o relógio do sistema. Os testes o injetam. */
  agora?: number
}

function chave(): Uint8Array {
  return new TextEncoder().encode(ambiente.jwtSecret)
}

export function agoraEmSegundos(): number {
  return Math.floor(Date.now() / 1000)
}

/** O último instante, em segundos, em que uma sessão iniciada em `inicio` pode valer (`SESSAO_MAXIMA_HORAS`). */
export function limiteAbsolutoDaSessao(inicio: number): number {
  return inicio + ambiente.sessaoMaximaHoras * 3600
}

/**
 * Assina o token da sessão: `sub`, `papel`, `jti` (a identidade da sessão), `v` (versão de sessão do usuário),
 * `ini` (início absoluto) e `iat`/`exp`. O `exp` é o menor entre "agora mais o TTL" e o limite absoluto da
 * sessão, então nem o login nem a renovação passam de `SESSAO_MAXIMA_HORAS`.
 */
export async function assinarSessao(usuarioId: string, papel: string, opcoes: OpcoesDoToken = {}): Promise<string> {
  const agora = opcoes.agora ?? agoraEmSegundos()
  const inicio = opcoes.inicio ?? agora
  const expiraEm = Math.min(agora + ambiente.jwtTtlSegundos, limiteAbsolutoDaSessao(inicio))
  return new SignJWT({ papel, v: opcoes.versao ?? 0, ini: inicio })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(usuarioId)
    .setJti(opcoes.jti ?? randomUUID())
    .setIssuedAt(agora)
    .setExpirationTime(expiraEm)
    .sign(chave())
}

/**
 * Lê e confere a assinatura e a expiração (pelo relógio injetado, se houver). Token sem `jti`, `v` ou `ini`
 * (emitido antes da FT-12) é recusado: sem `jti` ele não poderia ser revogado.
 */
export async function lerSessao(token: string, opcoes: { agora?: number } = {}): Promise<Sessao> {
  try {
    const { payload } = await jwtVerify(token, chave(), opcoes.agora === undefined ? {} : { currentDate: new Date(opcoes.agora * 1000) })
    const { sub, papel, jti, v, ini, iat, exp } = payload
    if (
      !sub ||
      typeof papel !== 'string' ||
      typeof jti !== 'string' ||
      jti === '' ||
      typeof v !== 'number' ||
      !Number.isInteger(v) ||
      v < 0 ||
      typeof ini !== 'number' ||
      !Number.isInteger(ini) ||
      !iat ||
      !exp
    ) {
      throw naoAutenticado()
    }
    return { usuarioId: sub, papel, jti, versao: v, inicio: ini, emitidoEm: iat, expiraEm: exp }
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
