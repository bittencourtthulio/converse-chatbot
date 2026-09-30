import { describe, it, expect, beforeEach } from 'vitest'
import { criarLimitador } from '@/lib/limite-de-uso'
import { ErroDeAplicacao } from '@/lib/erros'
import { entrar, exigirLimiteDeLogin } from '@/servicos/autenticacao'
import { criarUsuario, limparBanco } from './ajuda'

function relogioFalso() {
  let agora = 5_000_000
  return { agora: () => agora, avancar: (ms: number) => (agora += ms) }
}

/** Devolve o erro lançado, ou `undefined` se a chamada passou. */
function tentar(fn: () => void): ErroDeAplicacao | undefined {
  try {
    fn()
  } catch (erro) {
    return erro as ErroDeAplicacao
  }
  return undefined
}

describe('limite de tentativas de login', () => {
  it('a sexta tentativa por minuto do mesmo IP e e-mail é barrada com 429', () => {
    const r = relogioFalso()
    const l = criarLimitador(r.agora)
    const tentativa = () =>
      exigirLimiteDeLogin({ ip: '203.0.113.9', email: 'ana@exemplo.local' }, l)

    for (let i = 0; i < 5; i += 1) expect(tentar(tentativa)).toBeUndefined()
    const erro = tentar(tentativa)
    expect(erro).toBeInstanceOf(ErroDeAplicacao)
    expect(erro?.status).toBe(429)
    expect(erro?.codigo).toBe('limite_excedido')
    expect(erro?.message).toContain('Muitas tentativas')
    expect(erro?.message).toContain('60 segundos')
  })

  it('e-mail com caixa e espaços diferentes cai no mesmo limite', () => {
    const l = criarLimitador(relogioFalso().agora)
    for (let i = 0; i < 5; i += 1) {
      exigirLimiteDeLogin({ ip: 'a', email: i % 2 ? ' ANA@exemplo.local ' : 'ana@exemplo.local' }, l)
    }
    expect(
      tentar(() => exigirLimiteDeLogin({ ip: 'a', email: 'Ana@Exemplo.local' }, l))?.status,
    ).toBe(429)
  })

  it('a vigésima primeira tentativa do mesmo IP, com e-mails diferentes, é barrada', () => {
    const l = criarLimitador(relogioFalso().agora)
    for (let i = 0; i < 20; i += 1) {
      expect(
        tentar(() => exigirLimiteDeLogin({ ip: 'a', email: `pessoa${i}@exemplo.local` }, l)),
      ).toBeUndefined()
    }
    expect(
      tentar(() => exigirLimiteDeLogin({ ip: 'a', email: 'outra@exemplo.local' }, l))?.status,
    ).toBe(429)
  })

  it('outro IP não é afetado', () => {
    const l = criarLimitador(relogioFalso().agora)
    for (let i = 0; i < 5; i += 1) exigirLimiteDeLogin({ ip: 'a', email: 'ana@exemplo.local' }, l)
    expect(
      tentar(() => exigirLimiteDeLogin({ ip: 'b', email: 'ana@exemplo.local' }, l)),
    ).toBeUndefined()
  })

  it('passado o minuto, volta a permitir', () => {
    const r = relogioFalso()
    const l = criarLimitador(r.agora)
    for (let i = 0; i < 5; i += 1) exigirLimiteDeLogin({ ip: 'a', email: 'ana@exemplo.local' }, l)
    expect(tentar(() => exigirLimiteDeLogin({ ip: 'a', email: 'ana@exemplo.local' }, l))).toBeDefined()
    r.avancar(60_000)
    expect(tentar(() => exigirLimiteDeLogin({ ip: 'a', email: 'ana@exemplo.local' }, l))).toBeUndefined()
  })

  it('a mensagem diz quantos segundos faltam', () => {
    const r = relogioFalso()
    const l = criarLimitador(r.agora)
    for (let i = 0; i < 5; i += 1) exigirLimiteDeLogin({ ip: 'a', email: 'ana@exemplo.local' }, l)
    r.avancar(41_500)
    expect(
      tentar(() => exigirLimiteDeLogin({ ip: 'a', email: 'ana@exemplo.local' }, l))?.message,
    ).toContain('19 segundos')
  })
})

describe('entrar continua funcionando', () => {
  beforeEach(limparBanco)

  it('credencial certa ainda devolve token', async () => {
    const u = await criarUsuario()
    const r = await entrar({ email: u.email, senha: u.senha })
    expect(r.token).toBeTruthy()
  })
})
