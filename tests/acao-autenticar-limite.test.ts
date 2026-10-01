/**
 * T-04.01 (FT-12, PEND-12, PR-16, PR-36, achado A-01 do B6): o limite de tentativas de login provado na ação
 * `autenticar` de verdade (a que a tela chama), com cookies e cabeçalhos simulados e o `sessao-servidor`
 * real. Se a chamada do limitador sair de `autenticar`, estes testes quebram.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { COOKIE_SESSAO } from '@/lib/sessao'
import { usuarioDaSessao } from '@/servicos/autenticacao'
import { limitadorPadrao } from '@/lib/limite-de-uso'
import { criarUsuario, limparBanco, SENHA_PADRAO } from './ajuda'
import {
  definirCabecalho,
  destinoDoRedirecionamento,
  gravados,
  reiniciarNextFalso,
  valorDoCookie,
} from './apoio/next-falso'

vi.mock('next/headers', async () => (await import('./apoio/next-falso')).moduloNextHeaders())
vi.mock('next/navigation', async () => (await import('./apoio/next-falso')).moduloNextNavigation())
vi.mock('next/cache', () => ({ revalidatePath: () => undefined }))

const { autenticar } = await import('@/app/acoes')

const formulario = (email: string, senha: string) => {
  const f = new FormData()
  f.set('email', email)
  f.set('senha', senha)
  return f
}
/** Uma tentativa pela ação: o estado devolvido, ou o destino do redirecionamento quando entrou. */
async function tentar(email: string, senha: string): Promise<{ erro?: string; entrou?: string }> {
  let estado: { erro?: string } = {}
  const destino = await destinoDoRedirecionamento(async () => {
    estado = await autenticar({}, formulario(email, senha))
  })
  return destino === null ? estado : { entrou: destino }
}

const original = process.env.TRUST_PROXY
let contadorDeIp = 0
let ip: string
let email: string

beforeEach(async () => {
  await limparBanco()
  reiniciarNextFalso()
  process.env.TRUST_PROXY = '1'
  contadorDeIp += 1
  ip = `203.0.113.${contadorDeIp}`
  definirCabecalho('x-forwarded-for', ip)
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-01T12:00:00Z'))
  email = (await criarUsuario()).email
})
afterEach(() => {
  vi.useRealTimers()
  if (original === undefined) delete process.env.TRUST_PROXY
  else process.env.TRUST_PROXY = original
  limitadorPadrao.limparVencidas()
})

describe('o limite por IP e e-mail na ação autenticar (integração)', () => {
  it('as cinco primeiras tentativas erradas por minuto recebem "incorretos"; a sexta é barrada com a mensagem amigável', async () => {
    for (let i = 1; i <= 5; i += 1) expect((await tentar(email, 'senha-errada-000')).erro, `tentativa ${i}`).toContain('incorretos')
    const sexta = await tentar(email, 'senha-errada-000')
    expect(sexta.erro).toMatch(/^Muitas tentativas de entrada\. Tente de novo em \d+ segundos\.$/)
    expect(sexta.erro).toContain('60 segundos')
  })

  it('a sexta tentativa com a senha CERTA também é barrada: toda tentativa conta e nenhum cookie é gravado', async () => {
    for (let i = 1; i <= 5; i += 1) await tentar(email, 'senha-errada-000')
    const sexta = await tentar(email, SENHA_PADRAO)
    expect(sexta.erro).toContain('Muitas tentativas')
    expect(sexta.entrou).toBeUndefined()
    expect(gravados).toEqual([])
  })

  it('a vigésima primeira tentativa do mesmo IP, com e-mails diferentes, é barrada', async () => {
    for (let i = 1; i <= 20; i += 1) expect((await tentar(`ninguem${i}@teste.local`, 'senha-errada-000')).erro).toContain('incorretos')
    const vigesimaPrimeira = await tentar('ninguem21@teste.local', 'senha-errada-000')
    expect(vigesimaPrimeira.erro).toContain('Muitas tentativas')
  })
})

describe('o que o limite não pode atrapalhar (funcional)', () => {
  it('credencial certa dentro do limite entra: redireciona para / e grava o cookie com um token válido', async () => {
    for (let i = 1; i <= 4; i += 1) await tentar(email, 'senha-errada-000')
    const quinta = await tentar(email, SENHA_PADRAO)
    expect(quinta.entrou).toBe('/')
    expect(gravados).toHaveLength(1)
    expect(gravados[0]!.nome).toBe(COOKIE_SESSAO)
    expect(await usuarioDaSessao(valorDoCookie(COOKIE_SESSAO)!)).toMatchObject({ email })
  })

  it('o limite reinicia com o relógio: 61 segundos depois a mesma credencial certa entra', async () => {
    for (let i = 1; i <= 5; i += 1) await tentar(email, 'senha-errada-000')
    expect((await tentar(email, SENHA_PADRAO)).erro).toContain('Muitas tentativas')
    vi.setSystemTime(new Date('2026-10-01T12:01:01Z'))
    expect((await tentar(email, SENHA_PADRAO)).entrou).toBe('/')
  })

  it('outro IP não é afetado pelo bloqueio deste', async () => {
    for (let i = 1; i <= 6; i += 1) await tentar(email, 'senha-errada-000')
    expect((await tentar(email, SENHA_PADRAO)).erro).toContain('Muitas tentativas')
    definirCabecalho('x-forwarded-for', '198.51.100.99')
    expect((await tentar(email, SENHA_PADRAO)).entrou).toBe('/')
  })
})
