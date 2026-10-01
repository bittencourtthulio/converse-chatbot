/**
 * Correlação por requisição (FT-11, PR-93): o proxy gera o código de toda requisição, repassa-o
 * ao handler por cabeçalho e o devolve em `X-Correlacao`; o servidor lê o cabeçalho de volta; e
 * `chat-erros` gera o código pelo log (um gerador só).
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { config, proxy } from '../src/proxy.js'
import { gerarCorrelacao } from '../src/servicos/chat-erros.js'
import { subirServidor, type Servidor } from './apoio/servidor'

const HEX8 = /^[0-9a-f]{8}$/

afterEach(() => {
  vi.doUnmock('next/headers')
  vi.resetModules()
})

describe('proxy', () => {
  it('toda requisição sai com X-Correlacao de 8 hexadecimais e repassa x-correlacao ao handler', async () => {
    const resposta = await proxy(new NextRequest('http://localhost/api/qualquer'))
    const id = resposta.headers.get('X-Correlacao')
    expect(id).toMatch(HEX8)
    // O Next entrega os cabeçalhos de requisição alterados pelo prefixo x-middleware-request-.
    expect(resposta.headers.get('x-middleware-request-x-correlacao')).toBe(id)
  })

  it('ignora o valor que o cliente mandou e gera um novo a cada requisição', async () => {
    const a = await proxy(new NextRequest('http://localhost/entrar', { headers: { 'x-correlacao': 'ffffffff' } }))
    const b = await proxy(new NextRequest('http://localhost/entrar', { headers: { 'x-correlacao': 'ffffffff' } }))
    const ida = a.headers.get('X-Correlacao')!
    expect(ida).toMatch(HEX8)
    expect(ida).not.toBe('ffffffff')
    expect(b.headers.get('X-Correlacao')).not.toBe(ida)
    expect(a.headers.get('x-middleware-request-x-correlacao')).toBe(ida)
  })

  it('em /embed continua definindo o frame-ancestors (agente inexistente: só a própria plataforma)', async () => {
    const resposta = await proxy(new NextRequest('http://localhost/embed/agente-que-nao-existe'))
    expect(resposta.headers.get('Content-Security-Policy')).toBe("frame-ancestors 'self'")
    expect(resposta.headers.get('X-Correlacao')).toMatch(HEX8)
  })

  it('fora de /embed não define Content-Security-Policy', async () => {
    const resposta = await proxy(new NextRequest('http://localhost/api/saude'))
    expect(resposta.headers.get('Content-Security-Policy')).toBeNull()
  })

  it('o matcher cobre a raiz, as rotas de API e de página, e não cobre /_next/static, /_next/image nem favicon.ico', () => {
    const casa = (caminho: string) => new RegExp(`^${config.matcher}$`).test(caminho)
    for (const caminho of ['/', '/entrar', '/api/saude', '/api/agentes/x/conversar', '/embed/abc', '/configuracoes/sistema', '/widget.js']) {
      expect(casa(caminho), caminho).toBe(true)
    }
    for (const caminho of ['/_next/static/chunks/app.js', '/_next/image', '/favicon.ico']) {
      expect(casa(caminho), caminho).toBe(false)
    }
  })

  it('o matcher deixa de fora os envios de arquivo e de vídeo, que o Next truncaria em 10 MB se passassem pelo proxy', () => {
    const casa = (caminho: string) => new RegExp(`^${config.matcher}$`).test(caminho)
    for (const caminho of ['/api/agentes/a1/fontes', '/api/agentes/a1/fontes/video', '/api/agentes/a1/fontes/youtube', '/api/agentes/a1/fontes/f1']) {
      expect(casa(caminho), caminho).toBe(false)
    }
    // O resto de /api/agentes continua coberto.
    for (const caminho of ['/api/agentes/a1/conversar', '/api/agentes/a1/busca', '/api/agentes']) {
      expect(casa(caminho), caminho).toBe(true)
    }
  })
})

describe('correlacaoDaRequisicao', () => {
  async function comCabecalho(valor: string | null) {
    vi.resetModules()
    vi.doMock('next/headers', () => ({
      headers: async () => new Headers(valor === null ? {} : { 'x-correlacao': valor }),
    }))
    return (await import('../src/app/correlacao-servidor.js')).correlacaoDaRequisicao()
  }

  it('devolve o código do cabeçalho que o proxy definiu', async () => {
    expect(await comCabecalho('0a1b2c3d')).toBe('0a1b2c3d')
  })

  it('sem cabeçalho ou com valor fora do formato, gera um código novo', async () => {
    expect(await comCabecalho(null)).toMatch(HEX8)
    const estranho = await comCabecalho('<script>alert(1)</script>')
    expect(estranho).toMatch(HEX8)
  })

  it('fora de uma requisição (headers() lança) gera um código novo', async () => {
    vi.resetModules()
    vi.doMock('next/headers', () => ({
      headers: async () => {
        throw new Error('fora do escopo de requisição')
      },
    }))
    const id = await (await import('../src/app/correlacao-servidor.js')).correlacaoDaRequisicao()
    expect(id).toMatch(HEX8)
  })
})

describe('chat-erros', () => {
  it('gerarCorrelacao devolve 8 hexadecimais e um valor diferente a cada chamada', () => {
    const a = gerarCorrelacao()
    expect(a).toMatch(HEX8)
    expect(gerarCorrelacao()).not.toBe(a)
  })
})

describe('contra o servidor de produção (exige npm run build)', () => {
  let servidor: Servidor
  beforeAll(async () => {
    servidor = await subirServidor(3220)
  }, 180_000)
  afterAll(() => servidor?.parar())

  it('páginas, rotas de API e arquivos gerados saem com X-Correlacao, diferente a cada requisição', async () => {
    const ids = new Set<string>()
    for (const caminho of ['/entrar', '/entrar', '/api/publico/agentes/inexistente/config', '/widget.js']) {
      const r = await fetch(`${servidor.base}${caminho}`)
      const id = r.headers.get('x-correlacao')
      expect(id, caminho).toMatch(HEX8)
      ids.add(id!)
    }
    expect(ids.size).toBe(4)
  })

  it('o valor mandado pelo cliente não é repetido na resposta', async () => {
    const r = await fetch(`${servidor.base}/entrar`, { headers: { 'x-correlacao': 'deadbeef' } })
    expect(r.headers.get('x-correlacao')).toMatch(HEX8)
    expect(r.headers.get('x-correlacao')).not.toBe('deadbeef')
  })

  it('a rota do iframe mantém o frame-ancestors e ganha o código', async () => {
    const r = await fetch(`${servidor.base}/embed/nao-existe`)
    expect(r.headers.get('content-security-policy')).toBe("frame-ancestors 'self'")
    expect(r.headers.get('x-correlacao')).toMatch(HEX8)
  })
})
