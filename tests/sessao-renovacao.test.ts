/**
 * T-02.07 (FT-12, PR-102): a renovação deslizante com limite absoluto, com o relógio injetado. Quem usa
 * continua logado além dos 15 minutos, quem some cai, a sessão nunca passa do limite absoluto, e token
 * revogado ou de versão antiga não renova.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { decodeJwt } from 'jose'
import { entrar, renovarSessaoSePreciso, revogarSessao, usuarioDaSessao } from '@/servicos/autenticacao'
import { trocarSenha } from '@/servicos/perfil'
import { criarUsuario, limparBanco, SENHA_PADRAO } from './ajuda'

beforeEach(limparBanco)

const T0 = Math.floor(Date.now() / 1000)
const TTL = 900
const LIMITE = 12 * 3600
const login = async () => {
  const u = await criarUsuario()
  const { token } = await entrar({ email: u.email, senha: SENHA_PADRAO }, { agora: T0 })
  return { u, token }
}

describe('quando renova (integração)', () => {
  it('antes da metade da vida não renova; na metade renova com o mesmo jti, versão e início', async () => {
    const { token } = await login()
    expect(await renovarSessaoSePreciso(token, { agora: T0 + TTL / 2 - 1 })).toBeNull()

    const r = await renovarSessaoSePreciso(token, { agora: T0 + TTL / 2 })
    expect(r).not.toBeNull()
    const antes = decodeJwt(token)
    const depois = decodeJwt(r!.token)
    expect(depois).toMatchObject({ jti: antes.jti, v: antes.v, ini: T0, iat: T0 + TTL / 2, exp: T0 + TTL / 2 + TTL })
    expect(r!.maxAge).toBe(TTL)
  })

  it('quem usa a cada 8 minutos continua logado além dos 15 minutos, e o token original já teria caído', async () => {
    const { u, token } = await login()
    let atual = token
    let t = T0
    for (let passo = 0; passo < 4; passo += 1) {
      t += 480
      const r = await renovarSessaoSePreciso(atual, { agora: t })
      // 8 minutos é mais que a metade da vida (7,5 minutos): toda visita renova.
      expect(r, `passo ${passo}`).not.toBeNull()
      atual = r!.token
      expect(await usuarioDaSessao(atual, { agora: t })).toMatchObject({ id: u.id })
    }
    expect(t - T0).toBeGreaterThan(TTL)
    await expect(usuarioDaSessao(token, { agora: t })).rejects.toMatchObject({ status: 401 })
  })

  it('quem some por 16 minutos cai', async () => {
    const { token } = await login()
    await expect(usuarioDaSessao(token, { agora: T0 + 16 * 60 })).rejects.toMatchObject({ status: 401 })
    await expect(renovarSessaoSePreciso(token, { agora: T0 + 16 * 60 })).rejects.toMatchObject({ status: 401 })
  })
})

describe('limite absoluto (funcional)', () => {
  it('o exp nunca passa de início mais 12 horas, a última renovação é encurtada e depois do limite a sessão cai', async () => {
    const { u, token } = await login()
    let atual = token
    let t = T0
    let ultimaRenovacao = 0
    // Uma visita a cada 8 minutos durante as 12 horas: 89 renovações cabem antes do limite.
    for (let passo = 1; T0 + passo * 480 < T0 + LIMITE; passo += 1) {
      t = T0 + passo * 480
      const r = await renovarSessaoSePreciso(atual, { agora: t })
      expect(r, `visita ${passo}`).not.toBeNull()
      atual = r!.token
      ultimaRenovacao = r!.maxAge
      expect(decodeJwt(atual).exp).toBeLessThanOrEqual(T0 + LIMITE)
    }
    // A renovação que passaria do limite foi encurtada: o token termina exatamente em início mais 12 h.
    expect(decodeJwt(atual).exp).toBe(T0 + LIMITE)
    expect(ultimaRenovacao).toBe(T0 + LIMITE - t)
    expect(ultimaRenovacao).toBeLessThan(TTL)
    // Nada mais a estender e, no limite, a sessão cai.
    expect(await renovarSessaoSePreciso(atual, { agora: T0 + LIMITE - 100 })).toBeNull()
    expect(await usuarioDaSessao(atual, { agora: T0 + LIMITE - 1 })).toMatchObject({ id: u.id })
    await expect(usuarioDaSessao(atual, { agora: T0 + LIMITE })).rejects.toMatchObject({ status: 401 })
    await expect(renovarSessaoSePreciso(atual, { agora: T0 + LIMITE })).rejects.toMatchObject({ status: 401 })
  })
})

describe('o que não renova (funcional)', () => {
  it('token revogado não renova', async () => {
    const { token } = await login()
    await revogarSessao(token, { agora: T0 })
    await expect(renovarSessaoSePreciso(token, { agora: T0 + TTL / 2 })).rejects.toMatchObject({ status: 401 })
  })

  it('token de versão antiga (troca de senha) não renova', async () => {
    const { u, token } = await login()
    await trocarSenha(u, { senhaAtual: SENHA_PADRAO, senhaNova: 'senha-nova-456', confirmacao: 'senha-nova-456' })
    await expect(renovarSessaoSePreciso(token, { agora: T0 + TTL / 2 })).rejects.toMatchObject({ status: 401 })
  })

  it('a renovação mantém o jti: revogar o token renovado também barra o token original que foi roubado antes', async () => {
    const { token } = await login()
    const r = await renovarSessaoSePreciso(token, { agora: T0 + TTL / 2 })
    await revogarSessao(r!.token, { agora: T0 + TTL / 2 })
    await expect(usuarioDaSessao(token, { agora: T0 + TTL / 2 + 1 })).rejects.toMatchObject({ status: 401 })
  })
})
