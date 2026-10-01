// @vitest-environment happy-dom
/**
 * T-04.03: seleção e apagar em lote com confirmação na própria tela (PR-80). O componente
 * roda de verdade num DOM simulado, com `fetch` simulado e sem rede.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ListaComSelecao } from '@/componentes/ListaComSelecao'
import { apagarConversasNoServidor } from '@/componentes/apagar-conversas'
import type { ItemDaLista } from '@/componentes/ListaDeConversas'
import type { ResultadoDeExclusao } from '@/componentes/apagar-conversas'

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const itens = (n = 3): ItemDaLista[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `c${i + 1}`,
    agenteId: 'a1',
    agenteNome: 'Vendas',
    canal: 'widget',
    rotulo: `Visitante v${i + 1}`,
    totalDeMensagens: 2,
    atualizadoEm: '2026-03-10T15:30:00.000Z',
    previa: `msg ${i + 1}`,
  }))

let container: HTMLDivElement
let raiz: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  raiz = createRoot(container)
})
afterEach(() => {
  act(() => raiz.unmount())
  container.remove()
  vi.restoreAllMocks()
})

const montar = (
  n: number,
  apagar: ReturnType<typeof vi.fn<(ids: string[]) => Promise<ResultadoDeExclusao>>> = vi.fn(async () => ({ ok: true, apagadas: 0 })),
  recarregar = vi.fn(),
) => {
  act(() => raiz.render(<ListaComSelecao itens={itens(n)} apagar={apagar} recarregar={recarregar} />))
  return { apagar, recarregar }
}
const clicar = (el: Element | null | undefined) => {
  if (!el) throw new Error('elemento ausente')
  act(() => (el as HTMLElement).click())
}
const caixa = (rotulo: string) => container.querySelector<HTMLInputElement>(`input[aria-label="${rotulo}"]`)
const botao = (texto: string) => [...container.querySelectorAll('button')].find((b) => b.textContent?.trim() === texto)
const esperar = async () => {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0))
  })
}

describe('lote (integração com DOM e fetch simulado)', () => {
  it('marcar duas linhas, pedir e confirmar chama o servidor com os dois ids e recarrega a lista', async () => {
    const { apagar, recarregar } = montar(3, vi.fn(async () => ({ ok: true, apagadas: 2 })))
    expect(botao('Apagar selecionadas')).toBeUndefined()
    clicar(caixa('Selecionar a conversa com Visitante v1'))
    clicar(caixa('Selecionar a conversa com Visitante v3'))
    expect(container.textContent).toContain('2 selecionadas')
    clicar(botao('Apagar selecionadas'))
    expect(container.querySelector('[role="alertdialog"]')?.textContent).toContain('Apagar 2 conversas?')
    expect(apagar).not.toHaveBeenCalled()
    clicar(botao('Confirmar exclusão'))
    await esperar()
    expect(apagar).toHaveBeenCalledWith(['c1', 'c3'])
    expect(recarregar).toHaveBeenCalledTimes(1)
  })

  it('o módulo de rede envia POST /api/conversas/apagar com { ids } e entende a resposta', async () => {
    const chamadas: Array<{ url: string; init?: RequestInit }> = []
    const buscar = (async (url: string, init?: RequestInit) => {
      chamadas.push({ url, init })
      return new Response(JSON.stringify({ apagadas: 2 }), { status: 200 })
    }) as unknown as typeof fetch
    expect(await apagarConversasNoServidor(['c1', 'c2'], buscar)).toEqual({ ok: true, apagadas: 2 })
    expect(chamadas[0]?.url).toBe('/api/conversas/apagar')
    expect(chamadas[0]?.init?.method).toBe('POST')
    expect(JSON.parse(String(chamadas[0]?.init?.body))).toEqual({ ids: ['c1', 'c2'] })
    const recusa = (async () => new Response(JSON.stringify({ mensagem: 'Apague no máximo 50 conversas por vez.' }), { status: 422 })) as unknown as typeof fetch
    expect(await apagarConversasNoServidor(['c1'], recusa)).toEqual({ ok: false, mensagem: 'Apague no máximo 50 conversas por vez.' })
    const semRede = (async () => {
      throw new Error('rede')
    }) as unknown as typeof fetch
    const r = await apagarConversasNoServidor(['c1'], semRede)
    expect(r.ok).toBe(false)
  })
})

describe('lote (funcional)', () => {
  it('a barra mostra a contagem, Cancelar fecha sem chamar a rede, window.confirm nunca é usado e o foco volta ao botão', () => {
    const confirmar = vi.fn(() => true)
    window.confirm = confirmar
    const { apagar } = montar(3)
    clicar(caixa('Selecionar a conversa com Visitante v2'))
    expect(container.textContent).toContain('1 selecionada')
    clicar(botao('Apagar selecionadas'))
    clicar(botao('Cancelar'))
    expect(container.querySelector('[role="alertdialog"]')).toBeNull()
    expect(apagar).not.toHaveBeenCalled()
    expect(confirmar).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(botao('Apagar selecionadas'))
    expect(container.textContent).toContain('1 selecionada')
  })

  it('falha do servidor mostra o erro na tela, mantém a seleção e permite tentar de novo', async () => {
    const apagar = vi.fn<(ids: string[]) => Promise<ResultadoDeExclusao>>(async () => ({ ok: false, mensagem: 'Não foi possível apagar as conversas.' }))
    const { recarregar } = montar(2, apagar)
    clicar(caixa('Selecionar a conversa com Visitante v1'))
    clicar(botao('Apagar selecionadas'))
    clicar(botao('Confirmar exclusão'))
    await esperar()
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('Não foi possível apagar as conversas.')
    expect(recarregar).not.toHaveBeenCalled()
    expect(botao('Confirmar exclusão')?.hasAttribute('disabled')).toBe(false)
    expect(container.textContent).toContain('1 selecionada')
  })

  it('selecionar todas de uma página de 60 respeita o limite de 50 e avisa', () => {
    montar(60)
    clicar(caixa('Selecionar todas as conversas desta página'))
    expect(container.textContent).toContain('50 selecionadas')
    expect(container.textContent).toContain('até 50')
    clicar(botao('Limpar seleção'))
    expect(container.textContent).not.toContain('selecionadas')
  })

  it('o botão Selecionar todas serve de caminho para o celular, onde o cabeçalho da tabela some', () => {
    montar(3)
    clicar(botao('Selecionar todas desta página'))
    expect(container.textContent).toContain('3 selecionadas')
  })

  it('a linha continua sendo um link para a conversa', () => {
    montar(2)
    expect(container.querySelector('a[href="/conversas/c2"]')?.textContent).toBe('Visitante v2')
  })
})
