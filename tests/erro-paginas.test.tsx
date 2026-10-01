/**
 * Páginas de erro com código de referência (FT-11, PR-93): `error.tsx`, `global-error.tsx`,
 * `not-found.tsx` e o `error.tsx` do sistema mostram o código que o operador procura no log, sem
 * a mensagem do erro; e `onRequestError` grava a linha que liga o `digest` à correlação.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-correlacao': '0a1b2c3d' }),
}))

const SEGREDO = 'mensagem-interna-com-segredo-xyz'
const erroComDigest = (digest?: string) => Object.assign(new Error(SEGREDO), digest ? { digest } : {})
const reset = () => undefined

afterEach(() => vi.restoreAllMocks())

describe('error.tsx da raiz', () => {
  it('com digest mostra "Código de referência", o código e o botão Tentar de novo, nunca a mensagem do erro', async () => {
    const { default: Erro } = await import('../src/app/error')
    const html = renderToStaticMarkup(<Erro error={erroComDigest('digest123')} reset={reset} />)
    expect(html).toContain('Código de referência')
    expect(html).toContain('digest123')
    expect(html).toContain('Tentar de novo')
    expect(html).toContain('href="/"')
    expect(html).not.toContain(SEGREDO)
  })

  it('sem digest (erro do navegador) não mostra código nem inventa um', async () => {
    const { default: Erro } = await import('../src/app/error')
    const html = renderToStaticMarkup(<Erro error={erroComDigest()} reset={reset} />)
    expect(html).not.toContain('Código de referência')
    expect(html).toContain('Tentar de novo')
    expect(html).not.toContain(SEGREDO)
  })
})

describe('global-error.tsx', () => {
  it('traz html e body próprios, o código de referência e nada da mensagem do erro', async () => {
    const { default: ErroGlobal } = await import('../src/app/global-error')
    const html = renderToStaticMarkup(<ErroGlobal error={erroComDigest('global456')} reset={reset} />)
    expect(html.startsWith('<html')).toBe(true)
    expect(html).toContain('lang="pt-BR"')
    expect(html).toContain('<body')
    expect(html).toContain('Código de referência')
    expect(html).toContain('global456')
    expect(html).not.toContain(SEGREDO)
  })
})

describe('error.tsx do sistema', () => {
  it('usa o mesmo texto de código de referência e não mostra a mensagem do erro', async () => {
    const { default: ErroDoSistema } = await import('../src/app/(sistema)/error')
    const html = renderToStaticMarkup(<ErroDoSistema error={erroComDigest('sis789')} reset={reset} />)
    expect(html).toContain('Código de referência')
    expect(html).toContain('sis789')
    expect(html).toContain('Tentar de novo')
    expect(html).not.toContain(SEGREDO)
  })
})

describe('not-found.tsx', () => {
  it('mostra a página não encontrada com o código da correlação da requisição', async () => {
    const { default: NaoEncontrada } = await import('../src/app/not-found')
    const html = renderToStaticMarkup(await NaoEncontrada())
    expect(html).toContain('Página não encontrada')
    expect(html).toContain('Código de referência')
    expect(html).toContain('0a1b2c3d')
    expect(html).toContain('href="/"')
  })
})

describe('onRequestError', () => {
  const original = process.env.NEXT_RUNTIME
  beforeEach(() => {
    process.env.NEXT_RUNTIME = 'nodejs'
  })
  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_RUNTIME
    else process.env.NEXT_RUNTIME = original
  })

  const contexto = {
    routerKind: 'App Router',
    routePath: '/configuracoes/sistema',
    routeType: 'render',
    renderSource: 'react-server-components',
    revalidateReason: undefined,
    renderType: 'dynamic',
  } as const

  it('grava erro_na_requisicao com o digest, a correlação, a rota e o nome do erro, sem a mensagem', async () => {
    const espiao = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { onRequestError } = await import('../src/instrumentation')
    await onRequestError(
      erroComDigest('digest123'),
      { path: '/configuracoes/sistema?busca=dado-pessoal', method: 'GET', headers: { 'x-correlacao': '0a1b2c3d' } },
      contexto,
    )
    expect(espiao).toHaveBeenCalledTimes(1)
    const linha = JSON.parse(String((espiao.mock.calls[0] as unknown as [string])[0])) as Record<string, unknown>
    expect(linha).toMatchObject({
      nivel: 'erro',
      msg: 'erro_na_requisicao',
      referencia: 'digest123',
      correlacao: '0a1b2c3d',
      rota: '/configuracoes/sistema',
      tipo: 'render',
      metodo: 'GET',
      erro: 'Error',
    })
    const texto = JSON.stringify(linha)
    expect(texto).not.toContain(SEGREDO)
    expect(texto).not.toContain('dado-pessoal')
  })

  it('sem digest nem cabeçalho de correlação grava a linha sem esses campos', async () => {
    const espiao = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { onRequestError } = await import('../src/instrumentation')
    await onRequestError(new TypeError('x'), { path: '/x', method: 'POST', headers: {} }, { ...contexto, routeType: 'action' })
    const linha = JSON.parse(String((espiao.mock.calls[0] as unknown as [string])[0])) as Record<string, unknown>
    expect(linha).toMatchObject({ msg: 'erro_na_requisicao', tipo: 'action', metodo: 'POST', erro: 'TypeError' })
    expect(linha.referencia).toBeUndefined()
    expect(linha.correlacao).toBeUndefined()
  })

  it('um cabeçalho de correlação fora do formato é ignorado', async () => {
    const espiao = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { onRequestError } = await import('../src/instrumentation')
    await onRequestError(erroComDigest('d'), { path: '/x', method: 'GET', headers: { 'x-correlacao': '<script>' } }, contexto)
    const linha = JSON.parse(String((espiao.mock.calls[0] as unknown as [string])[0])) as Record<string, unknown>
    expect(linha.correlacao).toBeUndefined()
  })
})
