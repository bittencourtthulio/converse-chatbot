/**
 * T-03.03 (FT-12, PR-102): a renovação do cookie de sessão no proxy, com requisições reais do Next e o
 * relógio falso. Depois da metade da vida o proxy reemite o cookie (mesmo jti); não renova Server Action,
 * rota pública, token revogado ou inválido, nem quando a renovação falha; o matcher segue excluindo os uploads.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { decodeJwt } from 'jose'
import { COOKIE_SESSAO } from '@/lib/sessao'
import { entrar, revogarSessao } from '@/servicos/autenticacao'
import { criarUsuario, limparBanco, SENHA_PADRAO } from './ajuda'

// A falha da renovação é provocada no serviço, o resto do módulo é o real.
const falha = { ativa: false }
vi.mock('@/servicos/autenticacao', async (importarOriginal) => {
  const real = await importarOriginal<typeof import('@/servicos/autenticacao')>()
  return {
    ...real,
    renovarSessaoSePreciso: async (...args: Parameters<typeof real.renovarSessaoSePreciso>) => {
      if (falha.ativa) throw Object.assign(new Error('mensagem-que-nao-pode-vazar'), { name: 'ErroDoBancoDeTeste' })
      return real.renovarSessaoSePreciso(...args)
    },
  }
})

const { proxy, config } = await import('@/proxy')

const T0 = Math.floor(Date.now() / 1000)
let token: string

function requisicao(caminho: string, opcoes: { metodo?: string; cookie?: string | null; cabecalhos?: Record<string, string> } = {}) {
  const cabecalhos: Record<string, string> = { ...opcoes.cabecalhos }
  const cookie = opcoes.cookie === undefined ? `${COOKIE_SESSAO}=${token}` : opcoes.cookie
  if (cookie) cabecalhos.cookie = cookie
  return new NextRequest(`http://localhost:3000${caminho}`, { method: opcoes.metodo ?? 'GET', headers: cabecalhos })
}
/** Os instantes, em segundos, em que o proxy vê "agora". */
const em = (segundos: number) => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date((T0 + segundos) * 1000))
}
const setCookie = (r: Response) => r.headers.get('set-cookie')

beforeEach(async () => {
  await limparBanco()
  falha.ativa = false
  const u = await criarUsuario()
  token = (await entrar({ email: u.email, senha: SENHA_PADRAO }, { agora: T0 })).token
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('o proxy renova o cookie depois da metade da vida (integração)', () => {
  it('antes da metade não há Set-Cookie de sessão', async () => {
    em(100)
    expect(setCookie(await proxy(requisicao('/perfil')))).toBeNull()
  })

  it('depois da metade há um Set-Cookie com os atributos de sempre, o mesmo jti e o Max-Age da vida cheia', async () => {
    em(450)
    const r = await proxy(requisicao('/perfil'))
    const linha = setCookie(r)!
    expect(linha).toContain(`${COOKIE_SESSAO}=`)
    expect(linha).toMatch(/HttpOnly/i)
    expect(linha).toMatch(/SameSite=lax/i)
    expect(linha).toMatch(/Path=\//)
    expect(linha).toMatch(/Max-Age=900/)
    const novo = r.cookies.get(COOKIE_SESSAO)!.value
    expect(decodeJwt(novo)).toMatchObject({ jti: decodeJwt(token).jti, iat: T0 + 450, exp: T0 + 450 + 900, ini: T0 })
    expect(r.headers.get('X-Correlacao')).toBeTruthy()
  })

  it('um POST a uma rota de API renova (o chat e as buscas contam como uso)', async () => {
    em(450)
    expect(setCookie(await proxy(requisicao('/api/agentes/x/conversar', { metodo: 'POST' })))).toContain(`${COOKIE_SESSAO}=`)
  })
})

describe('o que o proxy não renova (funcional)', () => {
  beforeEach(() => em(450))

  it.each([
    ['Server Action com o cabeçalho next-action', '/perfil/senha', { metodo: 'POST', cabecalhos: { 'next-action': 'abc123' } }],
    ['formulário de Server Action sem JavaScript (POST a uma página)', '/', { metodo: 'POST' }],
    ['página do chat embutido', '/embed/agente-x', {}],
    ['API pública do chat', '/api/publico/agentes/x/conversa', {}],
    ['webhook do Telegram', '/api/telegram/x/webhook', { metodo: 'POST' }],
    ['saúde', '/api/saude', {}],
    ['requisição sem cookie', '/perfil', { cookie: null }],
    ['cookie com lixo', '/perfil', { cookie: `${COOKIE_SESSAO}=isto-nao-e-um-token` }],
  ] as const)('%s', async (_nome, caminho, opcoes) => {
    expect(setCookie(await proxy(requisicao(caminho, opcoes)))).toBeNull()
  })

  it('token revogado não renova', async () => {
    await revogarSessao(token, { agora: T0 })
    expect(setCookie(await proxy(requisicao('/perfil')))).toBeNull()
  })

  it('falha na renovação não derruba a requisição, não renova e o log leva só o nome do erro', async () => {
    falha.ativa = true
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const r = await proxy(requisicao('/perfil'))
    expect(r.status).toBe(200)
    expect(setCookie(r)).toBeNull()
    const saida = aviso.mock.calls.map((c) => String(c[0])).join('\n')
    expect(saida).toContain('renovacao_falhou')
    expect(saida).toContain('ErroDoBancoDeTeste')
    expect(saida).not.toContain('mensagem-que-nao-pode-vazar')
  })
})

describe('o matcher (funcional)', () => {
  it('segue excluindo os estáticos, o ícone e as rotas de upload', () => {
    const m = config.matcher
    expect(m).toContain('_next/static')
    expect(m).toContain('_next/image')
    expect(m).toContain('favicon.ico')
    expect(m).toContain('api/agentes/[^/]+/fontes')
    const regex = new RegExp(`^${m}$`)
    expect(regex.test('/perfil')).toBe(true)
    expect(regex.test('/api/agentes/abc/fontes')).toBe(false)
    expect(regex.test('/api/agentes/abc/fontes/video')).toBe(false)
    expect(regex.test('/_next/static/x.js')).toBe(false)
  })
})
