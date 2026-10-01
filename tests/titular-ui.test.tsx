// @vitest-environment happy-dom
/**
 * T-06.05 (FT-10, PR-90, D-24): as ferramentas do titular na tela de Privacidade. O componente
 * roda de verdade num DOM simulado; as ações de servidor e o download são trocados por fakes.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { FerramentasDoTitular } from '@/componentes/FerramentasDoTitular'
import { nomeDoArquivoDoCabecalho, podeConfirmarApagarTitular, type EstadoDaBuscaDoTitular } from '@/componentes/privacidade-logica'

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const titular = { rotulo: 'Visitante visita', prefixo: 'visitanteAA', conversas: 2, mensagens: 5, ultimaAtividade: '2026-03-10T15:30:00.000Z', agentes: ['Loja', 'Suporte'] }

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

const botao = (texto: string) => [...container.querySelectorAll('button')].find((b) => b.textContent?.trim() === texto) as HTMLButtonElement | undefined
function digitar(nome: string, valor: string) {
  const campo = container.querySelector(`[name="${nome}"]`) as HTMLInputElement
  const proto = campo instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype
  const definir = Object.getOwnPropertyDescriptor(proto, 'value')!.set!
  act(() => {
    definir.call(campo, valor)
    campo.dispatchEvent(new Event(campo instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
  })
}
async function renderizar(props: Partial<Parameters<typeof FerramentasDoTitular>[0]> = {}) {
  const buscar = vi.fn(async (_estado: EstadoDaBuscaDoTitular, _form: FormData): Promise<EstadoDaBuscaDoTitular> => ({ canal: 'widget', identificador: 'visita', busca: { estado: 'unico' as const, titulares: [titular] } }))
  const apagar = vi.fn(async (_estado: unknown, _form: FormData) => ({ sucesso: 'Apagadas 2 conversas e 5 mensagens do titular.' }))
  const exportar = vi.fn(async () => ({ ok: true as const }))
  await act(async () => {
    raiz.render(<FerramentasDoTitular acaoDeBusca={buscar} acaoDeApagar={apagar} exportar={exportar} {...props} />)
  })
  return { buscar, apagar, exportar }
}
async function buscarComo(identificador = 'visita') {
  digitar('identificador', identificador)
  await act(async () => botao('Buscar')!.click())
}

describe('lógica pura (funcional)', () => {
  it('só confirma apagar depois de digitar APAGAR, sem espaços nas pontas', () => {
    expect(podeConfirmarApagarTitular('APAGAR')).toBe(true)
    expect(podeConfirmarApagarTitular('  APAGAR ')).toBe(true)
    for (const ruim of ['', 'apagar', 'APAGA', 'APAGAR TUDO']) expect(podeConfirmarApagarTitular(ruim), ruim).toBe(false)
  })

  it('lê o nome do arquivo do cabeçalho Content-Disposition e cai num nome seguro', () => {
    expect(nomeDoArquivoDoCabecalho('attachment; filename="titular-widget-2026-07-04.json"')).toBe('titular-widget-2026-07-04.json')
    expect(nomeDoArquivoDoCabecalho(null)).toBe('titular.txt')
    expect(nomeDoArquivoDoCabecalho('attachment; filename="../../etc/passwd"')).toBe('titular.txt')
  })
})

describe('busca (integração com o componente real)', () => {
  it('o formulário tem canal e identificador rotulados e o botão Buscar', async () => {
    await renderizar()
    expect(container.querySelector('label')!.textContent).toBeTruthy()
    expect(container.querySelector('select[name="canal"]')).not.toBeNull()
    expect(container.querySelector('input[name="identificador"]')).not.toBeNull()
    expect(botao('Buscar')).toBeDefined()
    expect(botao('Apagar tudo')).toBeUndefined()
  })

  it('com um titular só mostra o resumo e as três ações, sem mostrar o id', async () => {
    const { buscar } = await renderizar()
    await buscarComo('visita')
    expect(buscar).toHaveBeenCalledTimes(1)
    const f = vi.mocked(buscar).mock.calls[0]![1] as FormData
    expect(f.get('canal')).toBe('widget')
    expect(f.get('identificador')).toBe('visita')
    expect(container.textContent).toContain('Visitante visita')
    expect(container.textContent).toContain('2 conversas')
    expect(container.textContent).toContain('5 mensagens')
    expect(container.textContent).toContain('Loja')
    expect(botao('Exportar em JSON')).toBeDefined()
    expect(botao('Exportar em TXT')).toBeDefined()
    expect(botao('Apagar tudo')).toBeDefined()
  })

  it('com vários titulares lista o prefixo de 10 caracteres e as contagens e pede mais caracteres, sem ações', async () => {
    await renderizar({
      acaoDeBusca: async () => ({ canal: 'widget', identificador: 'visita', busca: { estado: 'varios' as const, titulares: [titular, { ...titular, prefixo: 'visitanteBB', conversas: 1, mensagens: 1 }] } }),
    })
    await buscarComo()
    expect(container.textContent).toContain('visitanteAA')
    expect(container.textContent).toContain('visitanteBB')
    expect(container.textContent).toMatch(/mais de um titular/i)
    expect(container.textContent).toMatch(/mais caracteres/i)
    expect(botao('Apagar tudo')).toBeUndefined()
    expect(botao('Exportar em JSON')).toBeUndefined()
  })

  it('sem resultado diz que nenhum titular foi encontrado, e o erro da ação aparece como alerta', async () => {
    await renderizar({ acaoDeBusca: async () => ({ canal: 'widget', identificador: 'xyz', busca: { estado: 'nenhum' as const, titulares: [] } }) })
    await buscarComo('naoexiste')
    expect(container.textContent).toMatch(/Nenhum titular encontrado/)
    act(() => raiz.unmount())
    raiz = createRoot(container)
    await renderizar({ acaoDeBusca: async () => ({ erro: 'Informe ao menos 6 caracteres do identificador do visitante.' }) })
    await buscarComo('abc')
    expect(container.querySelector('[role="alert"]')!.textContent).toMatch(/ao menos 6 caracteres/)
  })
})

describe('exportar e apagar (funcional)', () => {
  it('exportar chama o download com o canal, o identificador digitado e o formato', async () => {
    const { exportar } = await renderizar()
    await buscarComo('visita')
    await act(async () => botao('Exportar em JSON')!.click())
    await act(async () => botao('Exportar em TXT')!.click())
    expect(exportar).toHaveBeenNthCalledWith(1, { canal: 'widget', identificador: 'visita' }, 'json')
    expect(exportar).toHaveBeenNthCalledWith(2, { canal: 'widget', identificador: 'visita' }, 'txt')
  })

  it('erro na exportação aparece na tela', async () => {
    await renderizar({ exportar: async () => ({ ok: false as const, mensagem: 'Nenhum titular encontrado com esse identificador.' }) })
    await buscarComo('visita')
    await act(async () => botao('Exportar em JSON')!.click())
    expect(container.querySelector('[role="alert"]')!.textContent).toMatch(/Nenhum titular encontrado/)
  })

  it('apagar abre a confirmação na tela, só habilita depois de digitar APAGAR e então chama a ação', async () => {
    const { apagar } = await renderizar()
    await buscarComo('visita')
    await act(async () => botao('Apagar tudo')!.click())
    const dialogo = container.querySelector('[role="alertdialog"]')
    expect(dialogo).not.toBeNull()
    expect(dialogo!.textContent).toMatch(/irrevers/i)
    expect(apagar).not.toHaveBeenCalled()
    const confirmar = () => botao('Confirmar exclusão')!
    expect(confirmar().disabled).toBe(true)
    digitar('confirmacao', 'apagar')
    expect(confirmar().disabled).toBe(true)
    digitar('confirmacao', 'APAGAR')
    expect(confirmar().disabled).toBe(false)
    await act(async () => confirmar().click())
    expect(apagar).toHaveBeenCalledTimes(1)
    const f = vi.mocked(apagar).mock.calls[0]![1] as FormData
    expect(f.get('canal')).toBe('widget')
    expect(f.get('identificador')).toBe('visita')
    expect(f.get('confirmacao')).toBe('APAGAR')
    expect(container.textContent).toContain('Apagadas 2 conversas e 5 mensagens do titular.')
    expect(container.querySelector('[role="alertdialog"]')).toBeNull()
  })

  it('cancelar fecha a confirmação sem apagar', async () => {
    const { apagar } = await renderizar()
    await buscarComo('visita')
    await act(async () => botao('Apagar tudo')!.click())
    await act(async () => botao('Cancelar')!.click())
    expect(container.querySelector('[role="alertdialog"]')).toBeNull()
    expect(apagar).not.toHaveBeenCalled()
    expect(botao('Apagar tudo')).toBeDefined()
  })
})
