/**
 * Servidor OpenRouter simulado (PR-26: nenhum teste chama a rede real).
 *
 * Uso:
 *   const falso = await iniciarOpenRouterFalso({ resposta: 'Olá' })
 *   process.env.OPENROUTER_BASE_URL = falso.url   // http://127.0.0.1:<porta>/api/v1
 *   ... teste ...
 *   await falso.fechar()                          // em afterEach
 *
 * Rotas (todas sob /api/v1): GET /models (pública), GET /key e GET /auth/key
 * (exigem `Authorization: Bearer CHAVE_VALIDA`), POST /chat/completions (chave
 * válida; com `stream: true` responde SSE).
 *
 * `OpcoesDoFalso` (todas opcionais; `configurar(parcial)` muda no meio do teste):
 *   chavesValidas        chaves aceitas (padrão [CHAVE_VALIDA]); outra dá 401
 *   modelos              lista de /models e modelos aceitos no chat
 *   resposta             texto devolvido pelo chat
 *   erroHttp             status de erro do chat: 400, 402, 404, 429, 500, 503...
 *   modelosFalham        /models responde 500
 *   latenciaMs           atraso antes de qualquer resposta (para testar timeout)
 *   trechos              (stream) pedaços do texto; padrão: a resposta por palavras
 *   intervaloEntreTrechosMs  (stream) pausa entre eventos (para testar cancelamento)
 *   comentarioDeProcessamento  (stream) emite ": OPENROUTER PROCESSING" primeiro (padrão true)
 *   partirChunks         (stream) corta cada evento em dois pacotes de rede
 *   erroNoMeioApos       (stream) após N trechos emite evento de erro e encerra
 *
 * Áudio (FT-08, PR-77): um pedido com parte `input_audio` é uma transcrição. A
 * "parte" é o áudio distinto, numerada de 0 pela ordem da primeira aparição; o
 * mesmo áudio de novo (nova tentativa) é a mesma parte. Use áudios diferentes
 * (por exemplo ruído) para partes diferentes.
 *   transcricoes         texto por parte (índice 0, 1, ...); faltando, "Transcrição simulada da parte N."
 *   falhasPorParte       { parte: status } o pedido daquela parte responde esse erro, até configurar de novo
 *   latenciaPorParteMs   { parte: ms } atraso só daquela parte
 *   `audios` registra modelo, formato, tamanho do base64, parte e tentativa.
 *
 * Estado observável: `requisicoes` (método, caminho, cabeçalhos em minúsculas,
 * corpo JSON) e `cancelamentos` (conexões de stream que o cliente abortou).
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'

export const CHAVE_VALIDA = 'sk-or-v1-chave-de-teste-0000'

export interface ModeloFalso {
  id: string
  name: string
  context_length: number
}

export interface OpcoesDoFalso {
  chavesValidas?: string[]
  modelos?: ModeloFalso[]
  resposta?: string
  erroHttp?: number | null
  modelosFalham?: boolean
  latenciaMs?: number
  trechos?: string[]
  intervaloEntreTrechosMs?: number
  comentarioDeProcessamento?: boolean
  partirChunks?: boolean
  erroNoMeioApos?: number | null
  transcricoes?: string[]
  falhasPorParte?: Record<number, number>
  latenciaPorParteMs?: Record<number, number>
}

export interface AudioRegistrado {
  modelo: string
  formato: string
  tamanhoBase64: number
  parte: number
  tentativa: number
}

export interface RequisicaoRegistrada {
  metodo: string
  caminho: string
  cabecalhos: Record<string, string>
  corpo: unknown
}

export interface OpenRouterFalso {
  /** URL base para OPENROUTER_BASE_URL, com /api/v1. */
  url: string
  requisicoes: RequisicaoRegistrada[]
  /** Os pedidos de transcrição de áudio, na ordem. */
  audios: AudioRegistrado[]
  /** Quantas conexões de stream o cliente abortou antes do fim. */
  readonly cancelamentos: number
  configurar(parcial: OpcoesDoFalso): void
  fechar(): Promise<void>
}

export const MODELOS_PADRAO: ModeloFalso[] = [
  { id: 'openai/gpt-4o-mini', name: 'OpenAI: GPT-4o mini', context_length: 128000 },
  { id: 'anthropic/claude-sonnet-4', name: 'Anthropic: Claude Sonnet 4', context_length: 200000 },
  { id: 'google/gemini-2.0-flash-001', name: 'Google: Gemini 2.0 Flash', context_length: 1000000 },
]

const MENSAGENS_DE_ERRO: Record<number, string> = {
  400: 'Invalid model specified',
  401: 'No auth credentials found',
  402: 'Insufficient credits',
  404: 'No endpoints found for this model',
  429: 'Rate limit exceeded',
  500: 'Internal server error',
  503: 'No available model provider',
}

/** A primeira parte `input_audio` das mensagens, ou `null`. */
function extrairAudio(mensagens: Array<{ content?: unknown }> | undefined): { data: string; format: string } | null {
  for (const m of mensagens ?? []) {
    if (!Array.isArray(m.content)) continue
    for (const parte of m.content as Array<{ type?: string; input_audio?: { data?: unknown; format?: unknown } }>) {
      if (parte?.type === 'input_audio' && typeof parte.input_audio?.data === 'string') {
        return { data: parte.input_audio.data, format: String(parte.input_audio.format ?? '') }
      }
    }
  }
  return null
}

const dormir = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function iniciarOpenRouterFalso(
  inicial: OpcoesDoFalso = {},
): Promise<OpenRouterFalso> {
  const opcoes: OpcoesDoFalso = {
    chavesValidas: [CHAVE_VALIDA],
    modelos: MODELOS_PADRAO,
    resposta: 'Olá! Sou o assistente simulado.',
    erroHttp: null,
    modelosFalham: false,
    latenciaMs: 0,
    intervaloEntreTrechosMs: 0,
    comentarioDeProcessamento: true,
    partirChunks: false,
    erroNoMeioApos: null,
    ...inicial,
  }
  const requisicoes: RequisicaoRegistrada[] = []
  const audios: AudioRegistrado[] = []
  const partesVistas = new Map<string, { parte: number; tentativas: number }>()
  let cancelamentos = 0

  const erro = (res: ServerResponse, status: number) => {
    res.writeHead(status, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        error: { code: status, message: MENSAGENS_DE_ERRO[status] ?? 'Error' },
      }),
    )
  }
  const json = (res: ServerResponse, corpo: unknown) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(corpo))
  }
  const chaveDaRequisicao = (req: IncomingMessage) =>
    /^Bearer (.+)$/.exec(String(req.headers.authorization ?? ''))?.[1]
  const autorizada = (req: IncomingMessage) => {
    const chave = chaveDaRequisicao(req)
    return chave !== undefined && (opcoes.chavesValidas ?? []).includes(chave)
  }

  async function lerCorpo(req: IncomingMessage): Promise<unknown> {
    const partes: Buffer[] = []
    for await (const parte of req) partes.push(parte as Buffer)
    const texto = Buffer.concat(partes).toString('utf8')
    if (!texto) return null
    try {
      return JSON.parse(texto)
    } catch {
      return texto
    }
  }

  /** Responde em SSE, como o OpenRouter com `stream: true`. */
  async function transmitir(res: ServerResponse, modelo: string) {
    let encerrada = false
    res.on('close', () => {
      if (!res.writableEnded) {
        encerrada = true
        cancelamentos += 1
      }
    })
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })
    const evento = (dados: unknown) => `data: ${JSON.stringify(dados)}\n\n`
    const base = { id: 'gen-falso', object: 'chat.completion.chunk', model: modelo }
    const enviar = async (texto: string) => {
      if (encerrada) return
      if (opcoes.partirChunks && texto.length > 10) {
        const meio = Math.floor(texto.length / 2)
        res.write(texto.slice(0, meio))
        await dormir(15)
        if (!encerrada) res.write(texto.slice(meio))
      } else {
        res.write(texto)
      }
    }

    if (opcoes.comentarioDeProcessamento) await enviar(': OPENROUTER PROCESSING\n\n')
    const trechos = opcoes.trechos ?? (opcoes.resposta ?? '').split(/(?<= )/)
    for (const [i, trecho] of trechos.entries()) {
      if (encerrada) return
      if (opcoes.erroNoMeioApos != null && i >= opcoes.erroNoMeioApos) {
        await enviar(
          evento({
            ...base,
            error: { code: 'server_error', message: 'Provider disconnected unexpectedly' },
            choices: [{ index: 0, delta: { content: '' }, finish_reason: 'error' }],
          }),
        )
        res.end()
        return
      }
      await enviar(
        evento({ ...base, choices: [{ index: 0, delta: { content: trecho }, finish_reason: null }] }),
      )
      if (opcoes.intervaloEntreTrechosMs) await dormir(opcoes.intervaloEntreTrechosMs)
    }
    if (encerrada) return
    await enviar(
      evento({ ...base, choices: [{ index: 0, delta: { content: '' }, finish_reason: 'stop' }] }),
    )
    await enviar(
      evento({
        ...base,
        choices: [{ index: 0, delta: { content: '' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 1, completion_tokens: trechos.length, total_tokens: trechos.length + 1 },
      }),
    )
    await enviar('data: [DONE]\n\n')
    res.end()
  }

  async function tratar(req: IncomingMessage, res: ServerResponse) {
    const caminho = (req.url ?? '').split('?')[0] ?? ''
    const corpo = await lerCorpo(req)
    const cabecalhos: Record<string, string> = {}
    for (const [nome, valor] of Object.entries(req.headers)) {
      cabecalhos[nome] = Array.isArray(valor) ? valor.join(', ') : String(valor)
    }
    requisicoes.push({ metodo: req.method ?? 'GET', caminho, cabecalhos, corpo })

    if (opcoes.latenciaMs) await dormir(opcoes.latenciaMs)

    if (req.method === 'GET' && caminho === '/api/v1/models') {
      if (opcoes.modelosFalham) return erro(res, 500)
      return json(res, { data: opcoes.modelos })
    }
    if (req.method === 'GET' && (caminho === '/api/v1/key' || caminho === '/api/v1/auth/key')) {
      if (!autorizada(req)) return erro(res, 401)
      return json(res, {
        data: { label: 'chave-de-teste', limit: null, limit_remaining: null, is_free_tier: false, usage: 0 },
      })
    }
    if (req.method === 'POST' && caminho === '/api/v1/chat/completions') {
      if (!autorizada(req)) return erro(res, 401)
      if (opcoes.erroHttp) return erro(res, opcoes.erroHttp)
      const pedido = (corpo ?? {}) as { model?: string; stream?: boolean; messages?: Array<{ content?: unknown }> }
      const audio = extrairAudio(pedido.messages)
      if (audio) {
        let vista = partesVistas.get(audio.data)
        if (!vista) {
          vista = { parte: partesVistas.size, tentativas: 0 }
          partesVistas.set(audio.data, vista)
        }
        vista.tentativas += 1
        audios.push({
          modelo: String(pedido.model),
          formato: audio.format,
          tamanhoBase64: audio.data.length,
          parte: vista.parte,
          tentativa: vista.tentativas,
        })
        const espera = opcoes.latenciaPorParteMs?.[vista.parte]
        if (espera) await dormir(espera)
        const falha = opcoes.falhasPorParte?.[vista.parte]
        if (falha) return erro(res, falha)
        const conteudo = opcoes.transcricoes?.[vista.parte] ?? `Transcrição simulada da parte ${vista.parte + 1}.`
        return json(res, {
          id: 'gen-falso',
          object: 'chat.completion',
          model: pedido.model,
          choices: [{ index: 0, message: { role: 'assistant', content: conteudo }, finish_reason: 'stop' }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
        })
      }
      if (!(opcoes.modelos ?? []).some((m) => m.id === pedido.model)) return erro(res, 400)
      if (pedido.stream) return transmitir(res, String(pedido.model))
      return json(res, {
        id: 'gen-falso',
        object: 'chat.completion',
        model: pedido.model,
        choices: [
          { index: 0, message: { role: 'assistant', content: opcoes.resposta }, finish_reason: 'stop' },
        ],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      })
    }
    erro(res, 404)
  }

  const servidor: Server = createServer((req, res) => {
    tratar(req, res).catch(() => {
      if (!res.headersSent) erro(res, 500)
      else res.end()
    })
  })
  await new Promise<void>((resolve) => servidor.listen(0, '127.0.0.1', resolve))
  const { port } = servidor.address() as AddressInfo

  return {
    url: `http://127.0.0.1:${port}/api/v1`,
    requisicoes,
    audios,
    get cancelamentos() {
      return cancelamentos
    },
    configurar(parcial) {
      Object.assign(opcoes, parcial)
    },
    async fechar() {
      servidor.closeAllConnections()
      await new Promise<void>((resolve) => servidor.close(() => resolve()))
    },
  }
}
