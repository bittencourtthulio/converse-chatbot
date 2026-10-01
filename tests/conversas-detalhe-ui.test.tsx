// @vitest-environment happy-dom
/**
 * T-04.04: o detalhe da conversa (FT-09): transcrição em bolhas, fontes da FT-05, conteúdo
 * de visitante como texto (nunca HTML), Exportar e Apagar com confirmação na tela.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { TranscricaoDaConversa, type MensagemDaTranscricao } from '@/componentes/TranscricaoDaConversa'
import { AcoesDaConversa } from '@/componentes/AcoesDaConversa'
import type { ResultadoDeExclusao } from '@/componentes/apagar-conversas'

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const mensagens = (): MensagemDaTranscricao[] => [
  { id: 'm1', papel: 'user', conteudo: 'Qual o prazo de entrega?', criadoEm: '2026-03-10T15:00:01.000Z', modelo: null, fontes: [] },
  {
    id: 'm2',
    papel: 'assistant',
    conteudo: 'Cinco dias úteis [1].',
    criadoEm: '2026-03-10T15:00:05.000Z',
    modelo: 'openai/gpt-4o-mini',
    fontes: [
      {
        fonteId: 'f1',
        titulo: 'Política de entrega',
        citada: true,
        trechos: [{ n: 1, posicao: 2, trechoTexto: 'O prazo padrão é de 3 a 7 dias úteis.' }],
      },
    ],
  },
]

describe('transcrição (renderização)', () => {
  it('mostra as bolhas na ordem, com quem fala e o horário de cada mensagem', () => {
    const html = renderToStaticMarkup(<TranscricaoDaConversa mensagens={mensagens()} rotulo="Visitante abcdef" agenteNome="Vendas" />)
    expect(html.indexOf('Qual o prazo de entrega?')).toBeLessThan(html.indexOf('Cinco dias úteis'))
    expect(html).toContain('bolha-usuario')
    expect(html).toContain('bolha-agente')
    expect(html).toContain('Visitante abcdef: ')
    expect(html).toContain('Vendas: ')
    expect(html).toContain('<time dateTime="2026-03-10T15:00:01.000Z">10/03/2026 12:00</time>')
    expect(html).toContain('<time dateTime="2026-03-10T15:00:05.000Z">10/03/2026 12:00</time>')
    expect(html).toContain('aria-label="Mensagens da conversa"')
  })

  it('mostra as fontes da resposta do agente, com o componente da FT-05, e a referência [1] clicável', () => {
    const html = renderToStaticMarkup(<TranscricaoDaConversa mensagens={mensagens()} rotulo="Visitante abcdef" agenteNome="Vendas" />)
    expect(html).toContain('fontes-da-resposta')
    expect(html).toContain('Política de entrega')
    expect(html).toContain('chip-de-fonte-citada')
    expect(html).toContain('data-referencia="1"')
    // a mensagem do visitante nunca tem fontes
    expect(html.match(/fontes-da-resposta/g)).toHaveLength(1)
  })

  it('conteúdo de visitante com script, img onerror e link javascript: vira só texto', () => {
    const hostil: MensagemDaTranscricao[] = [
      { id: 'x1', papel: 'user', conteudo: '<script>alert(1)</script><img src=x onerror=alert(2)>', criadoEm: '2026-03-10T15:00:00.000Z', modelo: null, fontes: [] },
      { id: 'x2', papel: 'assistant', conteudo: '[clique](javascript:alert(3)) <b>negrito</b> <iframe src=x></iframe>', criadoEm: '2026-03-10T15:00:01.000Z', modelo: null, fontes: [] },
    ]
    const html = renderToStaticMarkup(<TranscricaoDaConversa mensagens={hostil} rotulo="Visitante abcdef" agenteNome="Vendas" />)
    expect(html).not.toContain('<script')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('<b>')
    expect(html).not.toContain('href="javascript')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).toContain('&lt;img src=x onerror=alert(2)&gt;')
  })

  it('no DOM de verdade o conteúdo hostil não cria elemento algum', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const raiz = createRoot(el)
    act(() =>
      raiz.render(
        <TranscricaoDaConversa
          mensagens={[{ id: 'x1', papel: 'user', conteudo: '<img src=x onerror=alert(1)><script>alert(2)</script>', criadoEm: '2026-03-10T15:00:00.000Z', modelo: null, fontes: [] }]}
          rotulo="Visitante abcdef"
          agenteNome="Vendas"
        />,
      ),
    )
    expect(el.querySelector('img')).toBeNull()
    expect(el.querySelector('script')).toBeNull()
    expect(el.textContent).toContain('<img src=x onerror=alert(1)>')
    act(() => raiz.unmount())
    el.remove()
  })

  it('a conversa sem mensagens mostra o estado vazio, não uma lista vazia', () => {
    const html = renderToStaticMarkup(<TranscricaoDaConversa mensagens={[]} rotulo="Visitante abcdef" agenteNome="Vendas" />)
    expect(html).toContain('Esta conversa não tem mensagens')
  })

  it('nenhum arquivo do histórico usa dangerouslySetInnerHTML', () => {
    const raiz = process.cwd()
    const arquivos = [
      'src/componentes/TranscricaoDaConversa.tsx',
      'src/componentes/AcoesDaConversa.tsx',
      'src/componentes/ListaDeConversas.tsx',
      'src/componentes/ListaComSelecao.tsx',
      ...readdirSync(path.join(raiz, 'src/app/(sistema)/conversas/[id]')).map((f) => `src/app/(sistema)/conversas/[id]/${f}`),
    ]
    for (const a of arquivos) expect(readFileSync(path.join(raiz, a), 'utf8'), a).not.toContain('dangerouslySetInnerHTML')
  })
})

describe('ações da conversa', () => {
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
  const botao = (texto: string) => [...container.querySelectorAll('button')].find((b) => b.textContent?.trim() === texto)
  const clicar = (el: Element | undefined | null) => {
    if (!el) throw new Error('elemento ausente')
    act(() => (el as HTMLElement).click())
  }
  const esperar = () => act(async () => void (await new Promise((r) => setTimeout(r, 0))))

  it('Exportar é um link para o .txt da conversa, sem JavaScript', () => {
    act(() => raiz.render(<AcoesDaConversa conversaId="c1" />))
    const link = container.querySelector('a[href="/api/conversas/c1/exportar"]')
    expect(link?.textContent).toContain('Exportar')
    expect(link?.hasAttribute('download')).toBe(true)
  })

  it('Apagar pede confirmação na tela; Cancelar não chama a rede e nem a janela nativa', () => {
    const confirmar = vi.fn(() => true)
    window.confirm = confirmar
    const apagar = vi.fn<(id: string) => Promise<ResultadoDeExclusao>>(async () => ({ ok: true, apagadas: 1 }))
    act(() => raiz.render(<AcoesDaConversa conversaId="c1" apagar={apagar} aoApagar={() => undefined} />))
    expect(container.querySelector('[role="alertdialog"]')).toBeNull()
    clicar(botao('Apagar'))
    expect(container.querySelector('[role="alertdialog"]')?.textContent).toContain('Apagar esta conversa?')
    clicar(botao('Cancelar'))
    expect(container.querySelector('[role="alertdialog"]')).toBeNull()
    expect(apagar).not.toHaveBeenCalled()
    expect(confirmar).not.toHaveBeenCalled()
  })

  it('Confirmar apaga pelo id e leva de volta à lista; erro fica na tela', async () => {
    const apagar = vi.fn<(id: string) => Promise<ResultadoDeExclusao>>(async () => ({ ok: true, apagadas: 1 }))
    const aoApagar = vi.fn()
    act(() => raiz.render(<AcoesDaConversa conversaId="c1" apagar={apagar} aoApagar={aoApagar} />))
    clicar(botao('Apagar'))
    clicar(botao('Confirmar exclusão'))
    await esperar()
    expect(apagar).toHaveBeenCalledWith('c1')
    expect(aoApagar).toHaveBeenCalledTimes(1)

    const falha = vi.fn<(id: string) => Promise<ResultadoDeExclusao>>(async () => ({ ok: false, mensagem: 'Não foi possível apagar a conversa.' }))
    const sem = vi.fn()
    act(() => raiz.render(<AcoesDaConversa key="c2" conversaId="c2" apagar={falha} aoApagar={sem} />))
    clicar(botao('Apagar'))
    clicar(botao('Confirmar exclusão'))
    await esperar()
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('Não foi possível apagar a conversa.')
    expect(sem).not.toHaveBeenCalled()
  })
})
