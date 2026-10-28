// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ChatDeTeste } from '@/componentes/ChatDeTeste'

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let raiz: Root
const fetchSimulado = vi.fn<typeof fetch>()
const campo = () => container.querySelector('textarea')!
const limpar = () => [...container.querySelectorAll('button')].find((b) => b.textContent === 'Limpar conversa')!

beforeEach(async () => {
  fetchSimulado.mockReset()
  vi.stubGlobal('fetch', fetchSimulado)
  container = document.createElement('div')
  document.body.appendChild(container)
  raiz = createRoot(container)
  await act(async () => raiz.render(
    <ChatDeTeste
      agente={{ id: 'ag1', nome: 'Ana', mensagemInicial: 'Olá!' }}
      retomada={{ conversaId: 'antiga', mensagens: [{ id: 'm1', papel: 'user', conteudo: 'Pergunta antiga' }] }}
      temChave
      ehAdmin={false}
    />,
  ))
})

afterEach(() => {
  act(() => raiz.unmount())
  container.remove()
  vi.unstubAllGlobals()
})

async function escrever(texto: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(campo(), texto)
    campo().dispatchEvent(new Event('input', { bubbles: true }))
  })
}

async function enviar() {
  await act(async () => {
    container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  })
}

function resposta(conversaId: string) {
  return new Response(`event: fim\ndata: ${JSON.stringify({ conversaId, mensagemId: 'm2', tamanho: 0 })}\n\n`, {
    headers: { 'X-Conversa-Id': conversaId },
  })
}

it('limpa mensagens e rascunho e envia a próxima pergunta sem o contexto antigo', async () => {
  await escrever('Rascunho')
  await act(async () => limpar().click())
  expect(container.textContent).not.toContain('Pergunta antiga')
  expect(container.textContent).toContain('Olá!')
  expect(campo().value).toBe('')
  expect(document.activeElement).toBe(campo())
  fetchSimulado.mockResolvedValueOnce(resposta('nova'))
  await escrever('Nova pergunta')
  await enviar()
  expect(JSON.parse(fetchSimulado.mock.calls[0]![1]!.body as string)).toEqual({ mensagem: 'Nova pergunta' })
})

it('cancela o envio pendente e ignora a resposta antiga mesmo depois de começar outra conversa', async () => {
  let responder!: (r: Response) => void
  fetchSimulado.mockImplementationOnce(() => new Promise((resolve) => { responder = resolve }))
  await escrever('Pergunta pendente')
  await enviar()
  const sinal = fetchSimulado.mock.calls[0]![1]!.signal!
  await act(async () => limpar().click())
  expect(sinal.aborted).toBe(true)
  fetchSimulado.mockResolvedValueOnce(resposta('nova'))
  await escrever('Nova pergunta')
  await enviar()
  await act(async () => responder(resposta('antiga')))
  fetchSimulado.mockResolvedValueOnce(resposta('nova'))
  await escrever('Continuação')
  await enviar()
  expect(JSON.parse(fetchSimulado.mock.calls[2]![1]!.body as string).conversaId).toBe('nova')
  expect(container.textContent).not.toContain('Pergunta pendente')
})
