/**
 * T-02.03 (FT-12, PR-101, PR-102, PR-103): o token de sessão carrega jti, versão e início, o `exp` respeita o
 * limite absoluto e o relógio é injetável. Token sem as claims novas é recusado.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { SignJWT, decodeJwt } from 'jose'
import { assinarSessao, lerSessao } from '@/lib/sessao'

const original = { ...process.env }
afterEach(() => {
  for (const chave of ['JWT_TTL_SEGUNDOS', 'SESSAO_MAXIMA_HORAS', 'JWT_SECRET']) {
    if (original[chave] === undefined) delete process.env[chave]
    else process.env[chave] = original[chave]
  }
})

const AGORA = 1_790_000_000
const chave = (segredo = process.env.JWT_SECRET as string) => new TextEncoder().encode(segredo)

describe('claims do token e relógio injetado (integração)', () => {
  it('carrega sub, papel, jti, v, ini, iat e exp, e lerSessao as devolve', async () => {
    const token = await assinarSessao('u1', 'admin', { agora: AGORA, versao: 3 })
    const claims = decodeJwt(token)
    expect(claims).toMatchObject({ sub: 'u1', papel: 'admin', v: 3, ini: AGORA, iat: AGORA, exp: AGORA + 900 })
    expect(typeof claims.jti).toBe('string')
    expect((claims.jti as string).length).toBeGreaterThanOrEqual(16)

    expect(await lerSessao(token, { agora: AGORA })).toEqual({
      usuarioId: 'u1',
      papel: 'admin',
      jti: claims.jti,
      versao: 3,
      inicio: AGORA,
      emitidoEm: AGORA,
      expiraEm: AGORA + 900,
    })
  })

  it('cada login ganha um jti novo e a chamada de duas posições continua valendo (versão 0, início = iat)', async () => {
    const a = decodeJwt(await assinarSessao('u1', 'usuario'))
    const b = decodeJwt(await assinarSessao('u1', 'usuario'))
    expect(a.jti).not.toBe(b.jti)
    expect(a).toMatchObject({ v: 0 })
    expect(a.ini).toBe(a.iat)
  })

  it('a renovação repassa jti, versão e início e muda só iat e exp', async () => {
    const primeiro = await assinarSessao('u1', 'usuario', { agora: AGORA, versao: 2 })
    const base = decodeJwt(primeiro)
    const renovado = decodeJwt(
      await assinarSessao('u1', 'usuario', { agora: AGORA + 500, jti: base.jti, versao: 2, inicio: AGORA }),
    )
    expect(renovado).toMatchObject({ jti: base.jti, v: 2, ini: AGORA, iat: AGORA + 500, exp: AGORA + 500 + 900 })
  })
})

describe('limite absoluto no exp (integração)', () => {
  it('com SESSAO_MAXIMA_HORAS=1 e TTL de 7200 s o exp do login é iat mais 3600, não mais 7200', async () => {
    process.env.SESSAO_MAXIMA_HORAS = '1'
    process.env.JWT_TTL_SEGUNDOS = '7200'
    const claims = decodeJwt(await assinarSessao('u1', 'usuario', { agora: AGORA }))
    expect(claims.exp).toBe(AGORA + 3600)
  })

  it('o token renovado nunca passa de início mais o máximo', async () => {
    process.env.SESSAO_MAXIMA_HORAS = '1'
    process.env.JWT_TTL_SEGUNDOS = '7200'
    const claims = decodeJwt(await assinarSessao('u1', 'usuario', { agora: AGORA + 3000, inicio: AGORA }))
    expect(claims.exp).toBe(AGORA + 3600)
  })
})

describe('recusas (funcional)', () => {
  const sem = (omitir: 'jti' | 'v' | 'ini') => {
    const jwt = new SignJWT({ papel: 'usuario', ...(omitir !== 'v' && { v: 0 }), ...(omitir !== 'ini' && { ini: AGORA }) })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('u1')
      .setIssuedAt(AGORA)
      .setExpirationTime(AGORA + 900)
    if (omitir !== 'jti') jwt.setJti('jti-valido-0123456789')
    return jwt.sign(chave())
  }

  it.each(['jti', 'v', 'ini'] as const)('token sem a claim %s é recusado com 401 (token de antes desta feature)', async (claim) => {
    await expect(lerSessao(await sem(claim), { agora: AGORA })).rejects.toMatchObject({ status: 401 })
  })

  it('o mesmo token com todas as claims passa', async () => {
    const token = await new SignJWT({ papel: 'usuario', v: 0, ini: AGORA })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('u1')
      .setJti('jti-valido-0123456789')
      .setIssuedAt(AGORA)
      .setExpirationTime(AGORA + 900)
      .sign(chave())
    expect((await lerSessao(token, { agora: AGORA })).jti).toBe('jti-valido-0123456789')
  })

  it('token adulterado, de outro segredo e depois do exp são recusados; um segundo antes do exp ainda vale', async () => {
    const token = await assinarSessao('u1', 'usuario', { agora: AGORA })
    const adulterado = token.slice(0, -2) + (token.endsWith('AA') ? 'BB' : 'AA')
    await expect(lerSessao(adulterado, { agora: AGORA })).rejects.toMatchObject({ status: 401 })

    const deOutro = await new SignJWT({ papel: 'admin', v: 0, ini: AGORA })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('u1')
      .setJti('jti-valido-0123456789')
      .setIssuedAt(AGORA)
      .setExpirationTime(AGORA + 900)
      .sign(chave('outro-segredo-que-nao-e-o-do-servidor'))
    await expect(lerSessao(deOutro, { agora: AGORA })).rejects.toMatchObject({ status: 401 })

    await expect(lerSessao(token, { agora: AGORA + 901 })).rejects.toMatchObject({ status: 401 })
    expect((await lerSessao(token, { agora: AGORA + 899 })).usuarioId).toBe('u1')
  })
})
