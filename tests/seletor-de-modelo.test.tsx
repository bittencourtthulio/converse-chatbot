// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { SeletorDeModelo } from '@/componentes/SeletorDeModelo'

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const modelos = [
  { id: 'openai/gpt-4o-mini', nome: 'OpenAI: GPT-4o mini' },
  { id: 'anthropic/claude-sonnet-4', nome: 'Anthropic: Claude Sonnet 4' },
  { id: 'google/gemini', nome: 'Google: Gêmini' },
]
const base = { valorInicial: 'openai/gpt-4o-mini', ehAdmin: false, temChave: true, modelos, reserva: false }
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
})

function montar(props: Partial<typeof base> = {}) {
  act(() => raiz.render(<form><SeletorDeModelo {...base} {...props} /><button type="submit">Salvar</button></form>))
}
function gatilho() { return container.querySelector<HTMLButtonElement>('button[aria-haspopup="listbox"]')! }
function busca() { return container.querySelector<HTMLInputElement>('[role="combobox"]')! }
function opcoes() { return [...container.querySelectorAll<HTMLElement>('[role="option"]')] }
function clicar(elemento: HTMLElement) { act(() => elemento.click()) }
function pesquisar(texto: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(busca(), texto)
    busca().dispatchEvent(new Event('input', { bubbles: true }))
  })
}
function tecla(key: string) {
  const evento = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  act(() => busca().dispatchEvent(evento))
  return evento
}
function valorEnviado() { return new FormData(container.querySelector('form')!).get('modelo') }

describe('SeletorDeModelo', () => {
  it('mostra o nome do modelo e envia seu identificador no formulário', () => {
    montar()
    expect(gatilho().textContent).toContain('OpenAI: GPT-4o mini')
    expect(valorEnviado()).toBe('openai/gpt-4o-mini')
    expect(gatilho().getAttribute('aria-expanded')).toBe('false')
    expect(container.querySelector('[role="listbox"]')).toBeNull()
  })

  it('abre com pesquisa focada e todas as opções em ordem alfabética', () => {
    montar()
    clicar(gatilho())
    expect(document.activeElement).toBe(busca())
    expect(opcoes().map((opcao) => opcao.textContent)).toEqual([
      'Anthropic: Claude Sonnet 4anthropic/claude-sonnet-4',
      'Google: Gêminigoogle/gemini',
      'OpenAI: GPT-4o miniopenai/gpt-4o-mini',
    ])
    expect(container.querySelector('[aria-selected="true"]')?.textContent).toContain('OpenAI')
  })

  it('pesquisa por nome, provedor e identificador, ignorando acentos e maiúsculas', () => {
    montar()
    clicar(gatilho())
    for (const termo of ['GEMINI', 'google', 'google/gemini']) {
      pesquisar(termo)
      expect(opcoes()).toHaveLength(1)
      expect(opcoes()[0]!.textContent).toContain('Google')
    }
    pesquisar('OPENAI mini')
    expect(opcoes()).toHaveLength(1)
    expect(opcoes()[0]!.textContent).toContain('OpenAI')
  })

  it('seleciona por clique, fecha o combo e envia apenas o id escolhido', () => {
    montar()
    clicar(gatilho())
    pesquisar('claude')
    expect(valorEnviado()).toBe('openai/gpt-4o-mini')
    clicar(opcoes()[0]!)
    expect(valorEnviado()).toBe('anthropic/claude-sonnet-4')
    expect(gatilho().textContent).toContain('Anthropic: Claude Sonnet 4')
    expect(container.querySelector('[role="listbox"]')).toBeNull()
    expect(document.activeElement).toBe(gatilho())
    clicar(gatilho())
    expect(busca().value).toBe('')
    expect(opcoes()).toHaveLength(3)
  })

  it('permite abrir e escolher com setas e Enter sem enviar o formulário', () => {
    montar()
    act(() => gatilho().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })))
    tecla('ArrowDown')
    expect(document.getElementById(busca().getAttribute('aria-activedescendant')!)?.textContent).toContain('Google')
    expect(tecla('Enter').defaultPrevented).toBe(true)
    expect(valorEnviado()).toBe('google/gemini')
    expect(gatilho().getAttribute('aria-expanded')).toBe('false')
  })

  it('Escape descarta a pesquisa e devolve o foco ao seletor', () => {
    montar()
    clicar(gatilho())
    pesquisar('claude')
    tecla('Escape')
    expect(valorEnviado()).toBe('openai/gpt-4o-mini')
    expect(document.activeElement).toBe(gatilho())
    expect(container.querySelector('[role="listbox"]')).toBeNull()
  })

  it('pesquisa sem resultado informa o estado e não troca o modelo nem envia o formulário', () => {
    montar()
    clicar(gatilho())
    pesquisar('inexistente')
    expect(opcoes()).toHaveLength(0)
    expect(container.querySelector('[role="status"]')?.textContent).toContain('Nenhum modelo encontrado')
    expect(busca().hasAttribute('aria-activedescendant')).toBe(false)
    expect(tecla('Enter').defaultPrevented).toBe(true)
    expect(valorEnviado()).toBe('openai/gpt-4o-mini')
  })

  it('fecha ao clicar fora ou mover o foco para outro campo', () => {
    montar()
    clicar(gatilho())
    act(() => document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })))
    expect(container.querySelector('[role="listbox"]')).toBeNull()
    clicar(gatilho())
    act(() => container.querySelector<HTMLButtonElement>('button[type="submit"]')!.focus())
    expect(container.querySelector('[role="listbox"]')).toBeNull()
  })

  it('preserva o modelo salvo mesmo quando ele não consta no catálogo atual', () => {
    montar({ valorInicial: 'provedor/modelo-antigo' })
    expect(gatilho().textContent).toContain('provedor/modelo-antigo')
    expect(valorEnviado()).toBe('provedor/modelo-antigo')
  })

  it('sem chave continua oferecendo o catálogo e explica como habilitar as conversas', () => {
    montar({ temChave: false })
    clicar(gatilho())
    expect(opcoes()).toHaveLength(3)
    expect(container.textContent).toContain('Nenhuma chave do OpenRouter cadastrada')
    expect(container.textContent).toContain('para conversar com o agente')
  })

  it('o link para Integrações só aparece para admin', () => {
    const comum = renderToStaticMarkup(<SeletorDeModelo {...base} temChave={false} />)
    expect(comum).not.toContain('/configuracoes/integracoes')
    expect(comum).toMatch(/administrador/i)
    const admin = renderToStaticMarkup(<SeletorDeModelo {...base} ehAdmin temChave={false} />)
    expect(admin).toContain('href="/configuracoes/integracoes"')
  })

  it('avisa quando o catálogo está indisponível, inclusive sem chave', () => {
    montar({ reserva: true, temChave: false })
    expect(container.textContent).toContain('lista reduzida')
    clicar(gatilho())
    expect(opcoes()).toHaveLength(3)
  })
})
