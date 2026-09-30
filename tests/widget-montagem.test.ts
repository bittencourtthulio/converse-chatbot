// @vitest-environment happy-dom
/**
 * T-05.01 (FT-06, PR-60): o widget.js de verdade, dentro de um DOM simulado:
 * monta botão e painel em Shadow DOM, fica em silêncio quando o agente não está
 * publicado, é idempotente, respeita data-position e data-color e não vaza global.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { corDoTextoSobre } from '@/lib/cor'
import {
  ORIGEM_DA_PLATAFORMA,
  assentar,
  executarWidget,
  fetchSimulado,
  inserirScript,
  limparPagina,
} from './apoio/dom'

const CONFIG = {
  ativo: true,
  titulo: 'Fale com a Ana',
  cor: '#2563eb',
  posicao: 'direita',
  avatar: 'iniciais',
  mensagemInicial: 'Olá!',
  avisoDePrivacidade: null,
  sugestoes: [],
}

const fetchOriginal = globalThis.fetch
let espioes: Array<ReturnType<typeof vi.spyOn>> = []

function monitorarConsole() {
  espioes = (['log', 'info', 'warn', 'error', 'debug'] as const).map((m) =>
    vi.spyOn(console, m).mockImplementation(() => undefined),
  )
}
const consoleFoiUsado = () => espioes.some((e) => e.mock.calls.length > 0)

function usarConfig(resposta: { status: number; corpo?: unknown } | 'erro-de-rede') {
  const simulado = fetchSimulado(() => (resposta === 'erro-de-rede' ? { status: 0 } : resposta))
  globalThis.fetch = (
    resposta === 'erro-de-rede'
      ? async (u: unknown) => {
          simulado.pedidas.push(String(u))
          throw new TypeError('rede fora')
        }
      : simulado.fn
  ) as typeof fetch
  return simulado
}

async function montar(atributos: Record<string, string> = { 'data-agent': 'ag1' }) {
  executarWidget(inserirScript(atributos))
  await assentar(5)
}

const hosts = () => Array.from(document.querySelectorAll('[data-converse-agente]'))
const raiz = (agente = 'ag1') =>
  document.querySelector(`[data-converse-agente="${agente}"]`)?.shadowRoot as ShadowRoot
const estilo = (agente = 'ag1') => raiz(agente).querySelector('style')!.textContent ?? ''

beforeEach(() => {
  limparPagina()
  monitorarConsole()
  delete (window as unknown as { Converse?: unknown }).Converse
})
afterEach(() => {
  globalThis.fetch = fetchOriginal
  for (const e of espioes) e.mockRestore()
})

describe('montagem', () => {
  it('com o agente ativo acrescenta um host com Shadow DOM aberto, botão e painel', async () => {
    usarConfig({ status: 200, corpo: CONFIG })
    await montar()
    expect(hosts()).toHaveLength(1)
    const r = raiz()
    expect(r).toBeTruthy()
    const botao = r.querySelector('button.lancador')!
    expect(botao.getAttribute('aria-label')).toMatch(/Abrir o chat: Fale com a Ana/)
    expect(botao.getAttribute('aria-expanded')).toBe('false')
    expect(botao.getAttribute('aria-controls')).toBe('converse-painel')
    expect(r.querySelector('#converse-painel')?.getAttribute('role')).toBe('dialog')
    expect(r.querySelector('iframe')).toBeNull() // carregamento preguiçoso
  })

  it('isola o conteúdo: nada do widget aparece no documento da página', async () => {
    usarConfig({ status: 200, corpo: CONFIG })
    await montar()
    expect(document.querySelector('button')).toBeNull()
    expect(document.querySelector('.lancador')).toBeNull()
    expect(document.querySelector('style')).toBeNull()
  })

  it('busca a configuração na origem do próprio script, sem credenciais', async () => {
    const { pedidas } = usarConfig({ status: 200, corpo: CONFIG })
    const espiao = vi.fn(globalThis.fetch)
    globalThis.fetch = espiao as typeof fetch
    await montar()
    expect(espiao).toHaveBeenCalledTimes(1)
    expect(String(espiao.mock.calls[0]![0])).toBe(`${ORIGEM_DA_PLATAFORMA}/api/publico/agentes/ag1/config`)
    expect(espiao.mock.calls[0]![1]).toMatchObject({ credentials: 'omit' })
    expect(pedidas).toHaveLength(1)
  })
})

describe('silêncio quando não há chat', () => {
  it.each([
    ['404 (inativo ou inexistente)', { status: 404, corpo: { codigo: 'nao_encontrado' } }],
    ['500', { status: 500 }],
    ['200 com ativo falso', { status: 200, corpo: { ...CONFIG, ativo: false } }],
    ['200 com corpo que não é objeto', { status: 200, corpo: 'texto' }],
  ])('%s: não mostra nada e não escreve no console', async (_nome, resposta) => {
    usarConfig(resposta)
    await montar()
    expect(hosts()).toHaveLength(0)
    expect(consoleFoiUsado()).toBe(false)
  })

  it('rede fora: não mostra nada, não escreve no console e não gera rejeição sem tratamento', async () => {
    const rejeicoes: unknown[] = []
    const ouvir = (e: unknown) => rejeicoes.push(e)
    process.on('unhandledRejection', ouvir)
    usarConfig('erro-de-rede')
    await montar()
    await assentar(10)
    process.off('unhandledRejection', ouvir)
    expect(hosts()).toHaveLength(0)
    expect(consoleFoiUsado()).toBe(false)
    expect(rejeicoes).toEqual([])
  })

  it.each([
    ['sem data-agent', {}],
    ['com data-agent vazio', { 'data-agent': '' }],
    ['com data-agent com caminho', { 'data-agent': '../admin' }],
    ['com data-agent com espaço', { 'data-agent': 'a b' }],
  ])('%s: não faz nada, nem pede a configuração', async (_nome, atributos) => {
    const espiao = vi.fn()
    globalThis.fetch = espiao as unknown as typeof fetch
    await montar(atributos)
    expect(espiao).not.toHaveBeenCalled()
    expect(hosts()).toHaveLength(0)
  })
})

describe('idempotência', () => {
  it('incluir o script duas vezes monta um botão só e pede a configuração uma vez', async () => {
    const espiao = vi.fn(fetchSimulado(() => ({ status: 200, corpo: CONFIG })).fn)
    globalThis.fetch = espiao as unknown as typeof fetch
    executarWidget(inserirScript({ 'data-agent': 'ag1' }))
    executarWidget(inserirScript({ 'data-agent': 'ag1' }))
    await assentar(5)
    expect(hosts()).toHaveLength(1)
    expect(raiz().querySelectorAll('button.lancador')).toHaveLength(1)
    expect(espiao).toHaveBeenCalledTimes(1)
  })

  it('agentes diferentes na mesma página montam cada um o seu', async () => {
    usarConfig({ status: 200, corpo: CONFIG })
    executarWidget(inserirScript({ 'data-agent': 'ag1' }))
    executarWidget(inserirScript({ 'data-agent': 'ag2' }))
    await assentar(5)
    expect(hosts().map((h) => h.getAttribute('data-converse-agente'))).toEqual(['ag1', 'ag2'])
  })
})

describe('data-position e data-color', () => {
  it('data-position válido sobrescreve a configuração e inválido é ignorado', async () => {
    usarConfig({ status: 200, corpo: CONFIG })
    await montar({ 'data-agent': 'ag1', 'data-position': 'esquerda' })
    expect(estilo()).toMatch(/\.lancador\{[^}]*left:20px/)
    limparPagina()
    await montar({ 'data-agent': 'ag1', 'data-position': 'cima' })
    expect(estilo()).toMatch(/\.lancador\{[^}]*right:20px/)
  })

  it('a posição da configuração vale sem o atributo', async () => {
    usarConfig({ status: 200, corpo: { ...CONFIG, posicao: 'esquerda' } })
    await montar()
    expect(estilo()).toMatch(/\.lancador\{[^}]*left:20px/)
  })

  it('data-color válido (inclusive #abc) sobrescreve e inválido é ignorado', async () => {
    usarConfig({ status: 200, corpo: CONFIG })
    await montar({ 'data-agent': 'ag1', 'data-color': '#F00' })
    expect(estilo()).toContain('background:#ff0000')
    limparPagina()
    await montar({ 'data-agent': 'ag1', 'data-color': 'red;background:url(x)' })
    expect(estilo()).toContain('background:#2563eb')
    expect(estilo()).not.toContain('url(x)')
  })

  it('o texto do botão é o de maior contraste, igual à regra de src/lib/cor.ts', async () => {
    for (const cor of ['#ffeb3b', '#1a237e', '#808080', '#2563eb', '#f59e0b', '#ffffff', '#000000']) {
      limparPagina()
      usarConfig({ status: 200, corpo: { ...CONFIG, cor } })
      await montar()
      const esperado = corDoTextoSobre(cor).token === '--fg-em-cor-clara' ? '#000000' : '#ffffff'
      expect(estilo(), cor).toMatch(new RegExp(`\\.lancador\\{[^}]*color:${esperado}`))
    }
  })
})

describe('globais', () => {
  it('a única propriedade global nova é window.Converse, com abrir e fechar', async () => {
    const antes = new Set(Object.getOwnPropertyNames(globalThis))
    usarConfig({ status: 200, corpo: CONFIG })
    await montar()
    const novas = Object.getOwnPropertyNames(globalThis).filter((n) => !antes.has(n))
    expect(novas).toEqual(['Converse'])
    const api = (window as unknown as { Converse: Record<string, unknown> }).Converse
    expect(Object.keys(api).sort()).toEqual(['abrir', 'fechar'])
    expect(typeof api.abrir).toBe('function')
    expect(typeof api.fechar).toBe('function')
  })
})
