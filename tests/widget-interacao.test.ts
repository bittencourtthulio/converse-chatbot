// @vitest-environment happy-dom
/**
 * T-05.02 (FT-06, PR-60): o widget.js aberto: iframe preguiçoso, abrir e fechar
 * por clique, Esc, API global, foco de volta ao botão e postMessage com
 * `event.origin` e `event.source` estritos.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  CAMINHO_DO_WIDGET,
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

type ApiGlobal = { abrir: (id?: string) => void; fechar: (id?: string) => void }
const api = () => (window as unknown as { Converse: ApiGlobal }).Converse

async function montar(agente = 'ag1') {
  globalThis.fetch = fetchSimulado(() => ({ status: 200, corpo: CONFIG })).fn as typeof fetch
  executarWidget(inserirScript({ 'data-agent': agente }))
  await assentar(5)
}

const raiz = (agente = 'ag1') =>
  document.querySelector(`[data-converse-agente="${agente}"]`)!.shadowRoot as ShadowRoot
const botao = (agente = 'ag1') => raiz(agente).querySelector('button.lancador') as HTMLButtonElement
const painel = (agente = 'ag1') => raiz(agente).querySelector('#converse-painel') as HTMLElement
const iframe = (agente = 'ag1') => raiz(agente).querySelector('iframe') as HTMLIFrameElement | null
const aberto = (agente = 'ag1') => painel(agente).classList.contains('aberto')

function mensagem(dados: unknown, origin: string, source?: unknown) {
  window.dispatchEvent(new MessageEvent('message', { data: dados, origin, source: source as Window }))
}

beforeEach(() => {
  // O happy-dom avisa, no console, que não baixa a página do iframe (de propósito:
  // nenhum teste chama a rede). O aviso é ruído, não resultado.
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  vi.spyOn(window.console, 'error').mockImplementation(() => undefined)
  limparPagina()
  delete (window as unknown as { Converse?: unknown }).Converse
  Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true, writable: true })
})
afterEach(() => {
  globalThis.fetch = fetchOriginal
  vi.restoreAllMocks()
})

describe('abrir e fechar por clique', () => {
  it('o iframe só existe depois do primeiro clique e aponta para a página do agente na plataforma', async () => {
    await montar()
    expect(iframe()).toBeNull()
    botao().click()
    const f = iframe()!
    expect(f).toBeTruthy()
    expect(f.getAttribute('src')).toBe(`${ORIGEM_DA_PLATAFORMA}/embed/ag1`)
    expect(f.title).toBe('Fale com a Ana')
    expect(f.getAttribute('referrerpolicy')).toBe('strict-origin-when-cross-origin')
    expect(f.getAttribute('sandbox')).toContain('allow-scripts')
    expect(f.getAttribute('sandbox')).not.toContain('allow-top-navigation')
  })

  it('abrir marca aria-expanded, o rótulo de fechar e mostra o painel', async () => {
    await montar()
    botao().click()
    expect(aberto()).toBe(true)
    expect(botao().getAttribute('aria-expanded')).toBe('true')
    expect(botao().getAttribute('aria-label')).toMatch(/Fechar o chat/)
  })

  it('fechar por clique desmarca tudo e devolve o foco ao botão', async () => {
    await montar()
    botao().click()
    botao().click()
    expect(aberto()).toBe(false)
    expect(botao().getAttribute('aria-expanded')).toBe('false')
    expect(botao().getAttribute('aria-label')).toMatch(/Abrir o chat/)
    expect(raiz().activeElement).toBe(botao())
  })

  it('reabrir reaproveita o mesmo iframe: nunca dois', async () => {
    await montar()
    botao().click()
    const primeiro = iframe()
    botao().click()
    botao().click()
    expect(raiz().querySelectorAll('iframe')).toHaveLength(1)
    expect(iframe()).toBe(primeiro)
  })

  it('o painel é um diálogo nomeado pelo título do agente', async () => {
    await montar()
    expect(painel().getAttribute('role')).toBe('dialog')
    expect(painel().getAttribute('aria-label')).toBe('Fale com a Ana')
  })
})

describe('Esc', () => {
  it('fecha o chat aberto, de qualquer ponto da página, e devolve o foco ao botão', async () => {
    await montar()
    botao().click()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(aberto()).toBe(false)
    expect(raiz().activeElement).toBe(botao())
  })

  it('com o chat fechado não faz nada (não rouba o foco da página)', async () => {
    await montar()
    const campo = document.createElement('input')
    document.body.appendChild(campo)
    campo.focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(document.activeElement).toBe(campo)
  })

  it('outras teclas não fecham', async () => {
    await montar()
    botao().click()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(aberto()).toBe(true)
  })
})

describe('window.Converse', () => {
  it('abrir() e fechar() controlam o widget', async () => {
    await montar()
    api().abrir()
    expect(aberto()).toBe(true)
    api().fechar()
    expect(aberto()).toBe(false)
  })

  it('com id, só o widget daquele agente; id desconhecido não faz nada', async () => {
    await montar('ag1')
    await montar('ag2')
    api().abrir('ag2')
    expect(aberto('ag2')).toBe(true)
    expect(aberto('ag1')).toBe(false)
    api().abrir('nao-existe')
    expect(aberto('ag1')).toBe(false)
    api().fechar('ag2')
    expect(aberto('ag2')).toBe(false)
  })
})

describe('postMessage: origin e source estritos', () => {
  /** Abre o chat e dá ao iframe uma janela própria (o happy-dom não carrega a página dele). */
  async function aberta() {
    await montar()
    botao().click()
    const janela = { nome: 'janela do iframe do widget' }
    Object.defineProperty(iframe()!, 'contentWindow', { value: janela, configurable: true })
    return janela
  }
  const fechar = { origem: 'converse', tipo: 'fechar' }

  it('fechar vindo da plataforma, do iframe do widget, fecha o painel', async () => {
    const janela = await aberta()
    mensagem(fechar, ORIGEM_DA_PLATAFORMA, janela)
    expect(aberto()).toBe(false)
  })

  it('a mesma mensagem com origin de outro site é ignorada', async () => {
    const janela = await aberta()
    mensagem(fechar, 'https://atacante.com', janela)
    mensagem(fechar, 'null', janela)
    mensagem(fechar, ORIGEM_DA_PLATAFORMA.replace('https', 'http'), janela)
    expect(aberto()).toBe(true)
  })

  it('origin certo mas de outra janela (não é o iframe do widget) é ignorada', async () => {
    await aberta()
    mensagem(fechar, ORIGEM_DA_PLATAFORMA, window)
    mensagem(fechar, ORIGEM_DA_PLATAFORMA, null)
    expect(aberto()).toBe(true)
  })

  it('mensagem que não é do protocolo é ignorada', async () => {
    const janela = await aberta()
    for (const dados of [null, 'fechar', 42, {}, { origem: 'outro', tipo: 'fechar' }, { origem: 'converse', tipo: 'apagar-tudo' }]) {
      mensagem(dados, ORIGEM_DA_PLATAFORMA, janela)
    }
    expect(aberto()).toBe(true)
  })

  it('redimensionar amplia e reduz o painel; expandido que não é booleano é ignorado', async () => {
    const janela = await aberta()
    mensagem({ origem: 'converse', tipo: 'redimensionar', expandido: true }, ORIGEM_DA_PLATAFORMA, janela)
    expect(painel().classList.contains('ampliado')).toBe(true)
    mensagem({ origem: 'converse', tipo: 'redimensionar', expandido: 'sim' }, ORIGEM_DA_PLATAFORMA, janela)
    expect(painel().classList.contains('ampliado')).toBe(true)
    mensagem({ origem: 'converse', tipo: 'redimensionar', expandido: false }, ORIGEM_DA_PLATAFORMA, janela)
    expect(painel().classList.contains('ampliado')).toBe(false)
  })

  it('redimensionar de outro origin é ignorado', async () => {
    const janela = await aberta()
    mensagem({ origem: 'converse', tipo: 'redimensionar', expandido: true }, 'https://atacante.com', janela)
    expect(painel().classList.contains('ampliado')).toBe(false)
  })

  it('em tela estreita (até 480px) não amplia: o painel já ocupa a tela toda', async () => {
    const janela = await aberta()
    Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true, writable: true })
    mensagem({ origem: 'converse', tipo: 'redimensionar', expandido: true }, ORIGEM_DA_PLATAFORMA, janela)
    expect(painel().classList.contains('ampliado')).toBe(false)
  })

  it('antes do primeiro clique (sem iframe) nenhuma mensagem tem efeito', async () => {
    await montar()
    mensagem(fechar, ORIGEM_DA_PLATAFORMA, window)
    expect(aberto()).toBe(false)
    expect(iframe()).toBeNull()
  })
})

describe('estilo: tela estreita, movimento reduzido e camada', () => {
  it('abaixo de 480px o painel ocupa a tela toda e o botão some enquanto aberto', async () => {
    await montar()
    const css = raiz().querySelector('style')!.textContent!
    expect(css).toMatch(/@media \(max-width:480px\)\{[^@]*\.painel,\.painel\.ampliado\{inset:0/)
    expect(css).toMatch(/@media \(max-width:480px\)\{[^@]*\.lancador\.aberto\{display:none/)
  })

  it('respeita prefers-reduced-motion', async () => {
    await montar()
    expect(raiz().querySelector('style')!.textContent).toMatch(/prefers-reduced-motion:reduce\)\{\*\{transition:none!important/)
  })

  it('z-index alto para ficar acima do site, e o painel acima do botão', async () => {
    await montar()
    const css = raiz().querySelector('style')!.textContent!
    expect(css).toMatch(/\.lancador\{[^}]*z-index:2147483000/)
    expect(css).toMatch(/\.painel\{[^}]*z-index:2147483001/)
  })

  it('o anel de foco do botão é visível em qualquer fundo (dois anéis)', async () => {
    await montar()
    expect(raiz().querySelector('style')!.textContent).toMatch(/\.lancador:focus-visible\{[^}]*box-shadow:0 0 0 3px[^}]*0 0 0 6px/)
  })
})

describe('o arquivo do script', () => {
  const codigo = readFileSync(CAMINHO_DO_WIDGET, 'utf8')

  it('é ES2017: sem optional chaining, coalescência nem espalhamento de objeto', () => {
    expect(codigo).not.toMatch(/\?\.[A-Za-z_(\[]/)
    expect(codigo).not.toContain('??')
    expect(codigo).not.toMatch(/\{\s*\.\.\./)
  })

  it('não depende de nada externo: sem import, require nem URL fixa (fora dos comentários)', () => {
    const semComentarios = codigo.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    expect(semComentarios).not.toMatch(/\bimport\s|\brequire\(|https?:\/\/[a-z]/i)
  })

  it('não usa innerHTML com dado vindo do servidor nem eval', () => {
    expect(codigo).not.toMatch(/\beval\(|new Function\(|document\.write/)
    // o único innerHTML é de ícones constantes
    const usos = codigo.match(/innerHTML\s*=\s*[^;]+;/g) ?? []
    for (const u of usos) expect(u).toMatch(/ICONE_(ABRIR|FECHAR)/)
  })
})
