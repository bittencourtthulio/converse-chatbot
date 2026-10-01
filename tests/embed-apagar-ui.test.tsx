// @vitest-environment happy-dom
/**
 * T-05.04 (FT-10, PR-90): o botão "Apagar minha conversa" do chat embutido, com confirmação na
 * própria tela. O componente roda de verdade num DOM simulado, com `fetch` simulado e sem rede.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { ChatEmbutido, type ConfiguracaoDoEmbed } from '@/componentes/ChatEmbutido'
import { chaveDaConversa, CHAVE_DO_VISITANTE } from '@/componentes/embed-logica'

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const configuracao: ConfiguracaoDoEmbed = {
  titulo: 'Ana da Loja',
  cor: '#2563eb',
  posicao: 'direita',
  avatar: 'iniciais',
  mensagemInicial: 'Olá! Como posso ajudar?',
  avisoDePrivacidade: null,
  sugestoes: [],
}
const VISITANTE = 'abcdef0123456789abcdef0123456789'

let container: HTMLDivElement
let raiz: Root
const chamadas: Array<{ url: string; metodo: string; cabecalhos: Record<string, string> }> = []
let respostaDoDelete: () => Response

beforeEach(() => {
  chamadas.length = 0
  respostaDoDelete = () => new Response(JSON.stringify({ apagadas: 1 }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  localStorage.clear()
  localStorage.setItem(CHAVE_DO_VISITANTE, VISITANTE)
  localStorage.setItem(chaveDaConversa('ag1'), 'c1')
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    const metodo = init?.method ?? 'GET'
    chamadas.push({ url, metodo, cabecalhos: (init?.headers ?? {}) as Record<string, string> })
    if (metodo === 'DELETE') return respostaDoDelete()
    return new Response(
      JSON.stringify({ conversa: { conversaId: 'c1', truncada: false, mensagens: [{ id: 'm1', papel: 'user', conteudo: 'minha pergunta antiga' }, { id: 'm2', papel: 'assistant', conteudo: 'resposta antiga' }] } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  })
  container = document.createElement('div')
  document.body.appendChild(container)
  raiz = createRoot(container)
})
afterEach(() => {
  act(() => raiz.unmount())
  container.remove()
  vi.unstubAllGlobals()
})

async function abrir(modo: 'publico' | 'previa' = 'publico') {
  await act(async () => {
    raiz.render(<ChatEmbutido agenteId="ag1" modo={modo} configuracao={configuracao} />)
  })
}
const botao = (texto: string) => [...container.querySelectorAll('button')].find((b) => b.textContent?.trim() === texto || b.getAttribute('aria-label') === texto) as HTMLButtonElement | undefined

describe('Apagar minha conversa (integração com o componente real)', () => {
  it('no modo público mostra o botão no cabeçalho; na prévia do painel ele não existe', async () => {
    await abrir('publico')
    expect(botao('Apagar minha conversa')).toBeDefined()
    act(() => raiz.unmount())
    raiz = createRoot(container)
    await abrir('previa')
    expect(botao('Apagar minha conversa')).toBeUndefined()
  })

  it('o primeiro clique só abre a confirmação na tela, sem chamar o servidor', async () => {
    await abrir()
    expect(container.textContent).toContain('minha pergunta antiga')
    await act(async () => botao('Apagar minha conversa')!.click())
    const dialogo = container.querySelector('[role="alertdialog"]')
    expect(dialogo).not.toBeNull()
    expect(dialogo!.textContent).toMatch(/de vez/)
    expect(dialogo!.textContent).toMatch(/não pode ser desfeito/i)
    expect(chamadas.filter((c) => c.metodo === 'DELETE')).toHaveLength(0)
  })

  it('cancelar fecha a confirmação e mantém a conversa', async () => {
    await abrir()
    await act(async () => botao('Apagar minha conversa')!.click())
    await act(async () => botao('Cancelar')!.click())
    expect(container.querySelector('[role="alertdialog"]')).toBeNull()
    expect(container.textContent).toContain('minha pergunta antiga')
    expect(localStorage.getItem(chaveDaConversa('ag1'))).toBe('c1')
  })
})

describe('Apagar minha conversa (funcional)', () => {
  it('confirmar chama o DELETE com o id no cabeçalho, limpa a conversa e o estado local e recomeça', async () => {
    await abrir()
    await act(async () => botao('Apagar minha conversa')!.click())
    await act(async () => botao('Apagar tudo')!.click())
    const apagar = chamadas.filter((c) => c.metodo === 'DELETE')
    expect(apagar).toHaveLength(1)
    expect(apagar[0]!.url).toBe('/api/publico/agentes/ag1/conversa')
    expect(apagar[0]!.cabecalhos['X-Visitante-Id']).toBe(VISITANTE)
    expect(container.textContent).not.toContain('minha pergunta antiga')
    expect(container.textContent).toContain('Olá! Como posso ajudar?')
    expect(localStorage.getItem(chaveDaConversa('ag1'))).toBeNull()
    expect(container.querySelector('[role="alertdialog"]')).toBeNull()
    expect(container.querySelector('[role="status"]')!.textContent).toMatch(/Conversa apagada/)
  })

  it('erro da API mostra a mensagem na confirmação e não apaga o estado local', async () => {
    respostaDoDelete = () => new Response(JSON.stringify({ codigo: 'limite_excedido', mensagem: 'Você enviou muitas mensagens em pouco tempo.' }), { status: 429, headers: { 'Content-Type': 'application/json' } })
    await abrir()
    await act(async () => botao('Apagar minha conversa')!.click())
    await act(async () => botao('Apagar tudo')!.click())
    expect(container.querySelector('[role="alertdialog"] [role="alert"]')!.textContent).toMatch(/muitas mensagens/)
    expect(container.textContent).toContain('minha pergunta antiga')
    expect(localStorage.getItem(chaveDaConversa('ag1'))).toBe('c1')
  })

  it('o texto da confirmação fica nos tokens: nenhum estilo novo usa cor literal', () => {
    const css = readFileSync(path.resolve(process.cwd(), 'src/estilos/global.css'), 'utf8')
    const bloco = css.slice(css.indexOf('.embed-apagar'), css.indexOf('.embed-apagar') + 1500)
    expect(bloco).toContain('.embed-apagar')
    expect(bloco).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(/)
  })
})
