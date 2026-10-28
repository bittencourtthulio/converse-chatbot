// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { AdicionarFontes } from '@/componentes/AdicionarFontes'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
let container: HTMLDivElement
let raiz: Root
const fetchSimulado = vi.fn<typeof fetch>()
const aoAlterar = vi.fn()

beforeEach(async () => {
  fetchSimulado.mockReset()
  aoAlterar.mockReset()
  vi.stubGlobal('fetch', fetchSimulado)
  container = document.createElement('div')
  document.body.appendChild(container)
  raiz = createRoot(container)
  await act(async () => raiz.render(<AdicionarFontes agenteId="a1" limiteDeUploadBytes={1000}
    limiteDeVideoBytes={1000} limiteDeVideoMinutos={10} modeloDeTranscricao="modelo" aoAlterar={aoAlterar} />))
  const abas = container.querySelectorAll<HTMLButtonElement>('[role="tab"]')
  expect(abas).toHaveLength(4)
  await act(async () => abas[3]!.click())
  expect(abas[3]!.getAttribute('aria-selected')).toBe('true')
})

afterEach(() => {
  act(() => raiz.unmount())
  container.remove()
  vi.unstubAllGlobals()
})

async function preencher(pergunta: string, resposta: string) {
  await act(async () => {
    const input = container.querySelector('input')!
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, pergunta)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    const textarea = container.querySelector('textarea')!
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(textarea, resposta)
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
async function enviar() {
  await act(async () => { container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })
}

it('cadastra pela quarta aba, limpa os campos e atualiza a lista após sucesso', async () => {
  await preencher('Qual é o prazo de troca?', 'Até sete dias.')
  fetchSimulado.mockResolvedValueOnce(new Response('{}', { status: 202 }))
  await enviar()
  expect(fetchSimulado).toHaveBeenCalledWith('/api/agentes/a1/fontes/perguntas-respostas', expect.objectContaining({
    method: 'POST', body: JSON.stringify({ pergunta: 'Qual é o prazo de troca?', resposta: 'Até sete dias.' }),
  }))
  expect(aoAlterar).toHaveBeenCalledOnce()
  expect(container.querySelector('input')!.value).toBe('')
  expect(container.querySelector('textarea')!.value).toBe('')
  expect(container.textContent).toContain('Pergunta e resposta adicionadas.')
})

it('exige os dois campos e preserva o conteúdo quando a API falha', async () => {
  await enviar()
  expect(fetchSimulado).not.toHaveBeenCalled()
  expect(container.textContent).toContain('Informe a pergunta.')
  await preencher('Prazo?', '')
  await enviar()
  expect(container.textContent).toContain('Informe a resposta.')
  await preencher('Prazo?', 'Sete dias.')
  fetchSimulado.mockResolvedValueOnce(new Response(JSON.stringify({ mensagem: 'Falha ao salvar.' }), { status: 500 }))
  await enviar()
  expect(container.textContent).toContain('Falha ao salvar.')
  expect(container.querySelector('textarea')!.value).toBe('Sete dias.')
  expect(aoAlterar).not.toHaveBeenCalled()
})
