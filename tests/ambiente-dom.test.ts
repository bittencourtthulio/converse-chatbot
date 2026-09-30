// @vitest-environment happy-dom
/**
 * T-01.05 (FT-06): o ambiente de DOM simulado funciona ao lado dos testes de
 * ambiente node, com Shadow DOM, `postMessage` com `origin` e `fetch` simulado.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { assentar, fetchSimulado, inserirScript, limparPagina, ORIGEM_DA_PLATAFORMA } from './apoio/dom'

describe('ambiente de DOM (happy-dom)', () => {
  beforeEach(limparPagina)

  it('existe document e window neste arquivo', () => {
    expect(typeof document).toBe('object')
    expect(typeof window.addEventListener).toBe('function')
  })

  it('Shadow DOM aberto isola o conteúdo do documento', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const raiz = host.attachShadow({ mode: 'open' })
    raiz.innerHTML = '<button id="b" aria-expanded="false">Abrir</button>'
    expect(raiz.querySelector('#b')?.getAttribute('aria-expanded')).toBe('false')
    expect(document.querySelector('#b')).toBeNull()
  })

  it('postMessage entrega event.origin igual ao informado', async () => {
    const recebidas: Array<{ origin: string; dados: unknown }> = []
    window.addEventListener('message', (e) => recebidas.push({ origin: e.origin, dados: e.data }))
    window.dispatchEvent(
      new MessageEvent('message', { data: { origem: 'converse', tipo: 'fechar' }, origin: ORIGEM_DA_PLATAFORMA }),
    )
    await assentar()
    expect(recebidas).toEqual([{ origin: ORIGEM_DA_PLATAFORMA, dados: { origem: 'converse', tipo: 'fechar' } }])
  })

  it('o fetch simulado responde JSON por URL e registra o que foi pedido', async () => {
    const { fn, pedidas } = fetchSimulado((url) =>
      url.endsWith('/config') ? { status: 200, corpo: { ativo: true } } : { status: 404 },
    )
    const ok = await fn('https://x.test/config')
    expect(await ok.json()).toEqual({ ativo: true })
    expect((await fn('https://x.test/outra')).status).toBe(404)
    expect(pedidas).toEqual(['https://x.test/config', 'https://x.test/outra'])
  })

  it('inserirScript cria o elemento com o src da plataforma e os atributos', () => {
    const s = inserirScript({ 'data-agent': 'abc' })
    expect(s.getAttribute('src')).toBe(`${ORIGEM_DA_PLATAFORMA}/widget.js`)
    expect(s.getAttribute('data-agent')).toBe('abc')
    expect(new URL(s.src).origin).toBe(ORIGEM_DA_PLATAFORMA)
  })
})
