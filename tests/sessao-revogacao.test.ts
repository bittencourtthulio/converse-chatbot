/**
 * T-02.05 (FT-12, PR-101): a sessão revogável no serviço. `revogarSessao` grava o jti até o fim máximo
 * possível da sessão; `usuarioDaSessao` recusa o token revogado e o que passou do limite absoluto de duração,
 * mesmo quando o `exp` do token (forjado) ainda valeria. Outras sessões do mesmo usuário continuam.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { SignJWT } from 'jose'
import { entrar, revogarSessao, usuarioDaSessao } from '@/servicos/autenticacao'
import { assinarSessao, lerSessao } from '@/lib/sessao'
import { prisma } from '@/lib/prisma'
import { criarUsuario, limparBanco, SENHA_PADRAO } from './ajuda'

beforeEach(limparBanco)

const AGORA = Math.floor(Date.now() / 1000)
const DOZE_HORAS = 12 * 3600

describe('sair revoga de verdade (integração)', () => {
  it('depois de revogar, o token recebe 401 e outra sessão do mesmo usuário continua válida', async () => {
    const u = await criarUsuario()
    const { token: roubado } = await entrar({ email: u.email, senha: SENHA_PADRAO })
    const { token: outro } = await entrar({ email: u.email, senha: SENHA_PADRAO })
    expect(await usuarioDaSessao(roubado)).toMatchObject({ id: u.id })

    await revogarSessao(roubado)

    await expect(usuarioDaSessao(roubado)).rejects.toMatchObject({ status: 401 })
    expect(await usuarioDaSessao(outro)).toMatchObject({ id: u.id })
  })

  it('entrar aceita o relógio injetado: iat é o agora passado', async () => {
    const u = await criarUsuario()
    const { token } = await entrar({ email: u.email, senha: SENHA_PADRAO }, { agora: AGORA - 100 })
    expect((await lerSessao(token, { agora: AGORA - 100 })).emitidoEm).toBe(AGORA - 100)
  })
})

describe('revogarSessao (funcional)', () => {
  it('revogar duas vezes não falha e grava uma linha com expiraEm igual a início mais o máximo', async () => {
    const u = await criarUsuario()
    const { token } = await entrar({ email: u.email, senha: SENHA_PADRAO })
    const sessao = await lerSessao(token)
    await revogarSessao(token)
    await revogarSessao(token)
    const linhas = await prisma.sessaoRevogada.findMany()
    expect(linhas).toHaveLength(1)
    expect(linhas[0]).toMatchObject({ jti: sessao.jti, usuarioId: u.id })
    expect(linhas[0]!.expiraEm.getTime()).toBe((sessao.inicio + DOZE_HORAS) * 1000)
  })

  it('token adulterado, lixo e token expirado são ignorados sem linha e sem erro', async () => {
    const u = await criarUsuario()
    const expirado = await assinarSessao(u.id, 'usuario', { agora: AGORA - 5000 })
    await expect(revogarSessao('isto-nao-e-um-token')).resolves.toBeUndefined()
    await expect(revogarSessao(expirado)).resolves.toBeUndefined()
    const { token } = await entrar({ email: u.email, senha: SENHA_PADRAO })
    await expect(revogarSessao(token.slice(0, -3) + 'abc')).resolves.toBeUndefined()
    expect(await prisma.sessaoRevogada.count()).toBe(0)
  })

  it('um token forjado com início antigo e exp ainda válido recebe 401 pela conferência de início mais o máximo', async () => {
    const u = await criarUsuario()
    const agora = Math.floor(Date.now() / 1000) + 2
    const segredo = new TextEncoder().encode(process.env.JWT_SECRET as string)
    const forjar = (inicio: number, jti: string, exp: number) =>
      new SignJWT({ papel: 'usuario', v: 0, ini: inicio })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(u.id)
        .setJti(jti)
        .setIssuedAt(agora)
        .setExpirationTime(exp)
        .sign(segredo)

    // Um minuto depois do limite absoluto: o exp ainda valeria, mas a sessão passou das 12 horas.
    const passouDoLimite = await forjar(agora - DOZE_HORAS - 60, 'jti-forjado-0123456789', agora + 900)
    await expect(usuarioDaSessao(passouDoLimite, { agora })).rejects.toMatchObject({ status: 401, message: expect.stringContaining('expirada') })
    // Um minuto antes do limite o mesmo tipo de token vale.
    const quaseNoLimite = await forjar(agora - DOZE_HORAS + 60, 'jti-forjado-9876543210', agora + 30)
    expect(await usuarioDaSessao(quaseNoLimite, { agora })).toMatchObject({ id: u.id })
  })
})
