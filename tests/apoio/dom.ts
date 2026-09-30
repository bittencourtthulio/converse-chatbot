/**
 * Apoio dos testes do script do chat embutido (FT-06): roda o `widget.js` de
 * verdade dentro de um DOM simulado (happy-dom), com `fetch` simulado e sem
 * rede. O arquivo de teste precisa declarar `// @vitest-environment happy-dom`.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

export const ORIGEM_DA_PLATAFORMA = 'https://converse.exemplo.test'

export const CAMINHO_DO_WIDGET = path.join(process.cwd(), 'src/widget/widget.js')

export interface RespostaSimulada {
  status: number
  corpo?: unknown
}

/** Um `fetch` que responde JSON conforme a URL; devolve também as URLs pedidas. */
export function fetchSimulado(respostas: (url: string) => RespostaSimulada) {
  const pedidas: string[] = []
  const fn = async (entrada: string | URL | Request): Promise<Response> => {
    const url = String(entrada instanceof Request ? entrada.url : entrada)
    pedidas.push(url)
    const { status, corpo } = respostas(url)
    return new Response(corpo === undefined ? null : JSON.stringify(corpo), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return { fn, pedidas }
}

/** Zera a página de teste. */
export function limparPagina(): void {
  // Nenhum teste chama a rede: o happy-dom não baixa a página de um iframe nem um script.
  const ajustes = (window as unknown as { happyDOM?: { settings: Record<string, unknown> } }).happyDOM?.settings
  if (ajustes) {
    ajustes.disableIframePageLoading = true
    ajustes.disableJavaScriptFileLoading = true
  }
  document.head.innerHTML = ''
  document.body.innerHTML = ''
}

/** Insere o `<script data-agent>` da página do cliente, com o `src` da plataforma. */
export function inserirScript(atributos: Record<string, string> = {}): HTMLScriptElement {
  const script = document.createElement('script')
  // Tipo não executável: o happy-dom não tenta baixar o arquivo ao inseri-lo.
  script.type = 'text/x-converse-teste'
  script.src = `${ORIGEM_DA_PLATAFORMA}/widget.js`
  for (const [nome, valor] of Object.entries(atributos)) script.setAttribute(nome, valor)
  document.body.appendChild(script)
  return script
}

/**
 * Executa o código do widget como o navegador executaria o script incluído:
 * `document.currentScript` aponta para o elemento inserido.
 */
export function executarWidget(script: HTMLScriptElement): void {
  const codigo = readFileSync(CAMINHO_DO_WIDGET, 'utf8')
  Object.defineProperty(document, 'currentScript', { value: script, configurable: true })
  try {
    new Function(codigo)()
  } finally {
    Object.defineProperty(document, 'currentScript', { value: null, configurable: true })
  }
}

/** Espera a fila de microtarefas e de temporizadores curtos esvaziar. */
export async function assentar(ms = 0): Promise<void> {
  await new Promise((r) => setTimeout(r, ms))
  await Promise.resolve()
}
