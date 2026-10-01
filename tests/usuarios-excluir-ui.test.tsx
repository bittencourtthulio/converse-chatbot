// @vitest-environment happy-dom
/**
 * T-03.02 (FT-10, PR-88): a linha de usuário com a ação "Excluir definitivamente" e a
 * confirmação na própria tela, sem a janela nativa do navegador. O componente roda de
 * verdade num DOM simulado; as ações de servidor são trocadas.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

vi.mock('@/app/acoes', () => ({
  desativarUsuario: vi.fn(async () => ({})),
  excluirUsuario: vi.fn(async () => ({ erro: 'Este é o último administrador ativo. Promova outro antes.' })),
}))

import { LinhaDeUsuario } from '@/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario'
import { excluirUsuario } from '@/app/acoes'

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const maria = { id: 'u2', nome: 'Maria Souza', email: 'maria@empresa.com.br', papel: 'usuario', ativo: true, ehVoce: false }

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
  vi.clearAllMocks()
})

function renderizar(usuario: typeof maria) {
  act(() => {
    raiz.render(
      <table>
        <tbody>
          <LinhaDeUsuario usuario={usuario} />
        </tbody>
      </table>,
    )
  })
}
const botao = (texto: string) => [...container.querySelectorAll('button')].find((b) => b.textContent?.trim() === texto) as HTMLButtonElement | undefined

function digitar(valor: string) {
  const campo = container.querySelector('input[name="confirmacao"]') as HTMLInputElement
  const definir = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
  act(() => {
    definir.call(campo, valor)
    campo.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

describe('linha de usuário (integração com o componente real)', () => {
  it('mostra Excluir definitivamente para outro usuário e abre a confirmação na tela', () => {
    renderizar(maria)
    expect(botao('Desativar')).toBeDefined()
    const excluir = botao('Excluir definitivamente')
    expect(excluir).toBeDefined()
    act(() => excluir!.click())
    const dialogo = container.querySelector('[role="alertdialog"]')
    expect(dialogo).not.toBeNull()
    expect(dialogo!.textContent).toMatch(/irrevers/i)
    expect(dialogo!.textContent).toMatch(/Desativar/)
    expect(dialogo!.textContent).toContain('maria@empresa.com.br')
    expect(botao('Excluir definitivamente')).toBeUndefined()
  })

  it('a própria linha não oferece a ação', () => {
    renderizar({ ...maria, ehVoce: true })
    expect(botao('Excluir definitivamente')).toBeUndefined()
  })

  it('o usuário já desativado também pode ser excluído', () => {
    renderizar({ ...maria, ativo: false })
    expect(botao('Excluir definitivamente')).toBeDefined()
    expect(botao('Desativar')).toBeUndefined()
  })
})

describe('confirmação (funcional)', () => {
  it('o botão de confirmar só habilita com o e-mail igual, sem diferença de caixa e de espaços', () => {
    renderizar(maria)
    act(() => botao('Excluir definitivamente')!.click())
    const confirmar = () => botao('Confirmar exclusão')!
    expect(confirmar().disabled).toBe(true)
    digitar('maria@empresa')
    expect(confirmar().disabled).toBe(true)
    digitar('  MARIA@Empresa.com.br ')
    expect(confirmar().disabled).toBe(false)
  })

  it('cancelar fecha a confirmação e devolve o botão', () => {
    renderizar(maria)
    act(() => botao('Excluir definitivamente')!.click())
    act(() => botao('Cancelar')!.click())
    expect(container.querySelector('[role="alertdialog"]')).toBeNull()
    expect(botao('Excluir definitivamente')).toBeDefined()
  })

  it('o envio chama a ação com o id e o e-mail digitado e mostra o erro devolvido', async () => {
    renderizar(maria)
    act(() => botao('Excluir definitivamente')!.click())
    digitar('maria@empresa.com.br')
    await act(async () => {
      botao('Confirmar exclusão')!.click()
    })
    expect(excluirUsuario).toHaveBeenCalledTimes(1)
    const form = vi.mocked(excluirUsuario).mock.calls[0]![1] as FormData
    expect(form.get('id')).toBe('u2')
    expect(form.get('confirmacao')).toBe('maria@empresa.com.br')
    expect(container.querySelector('[role="alert"]')!.textContent).toMatch(/último administrador/)
  })
})
