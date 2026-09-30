// Adaptador do OpenRouter (PR-06, PR-22, PR-38): o único ponto do sistema que
// fala com o provedor de IA. Erros viram `ErroDeAplicacao` em português, sem
// repassar o corpo do provedor nem a chave. O endereço vem de
// `OPENROUTER_BASE_URL` (lido em `ambiente.ts`), o que deixa os testes
// apontarem para `tests/apoio/openrouter-falso.ts`.
import { ambiente } from '@/lib/ambiente'
import { erroDoProvedor } from '@/lib/erros'
import { lerTrechosDeSSE } from '@/lib/sse'

export interface Modelo {
  id: string
  nome: string
  /** Janela de contexto em tokens, quando o provedor informa. */
  contexto: number | null
}

export interface ListaDeModelos {
  modelos: Modelo[]
  /** `true` quando o provedor falhou e a lista é a embutida. */
  reserva: boolean
}

export const TEMPO_CURTO_MS = 15_000
const DURACAO_DO_CACHE_MS = 5 * 60_000

/** Poucos modelos comuns, para o seletor não quebrar com o provedor fora do ar. */
export const MODELOS_DE_RESERVA: Modelo[] = [
  { id: 'openai/gpt-4o-mini', nome: 'OpenAI: GPT-4o mini', contexto: 128000 },
  { id: 'openai/gpt-4o', nome: 'OpenAI: GPT-4o', contexto: 128000 },
  { id: 'anthropic/claude-sonnet-4', nome: 'Anthropic: Claude Sonnet 4', contexto: 200000 },
  { id: 'google/gemini-2.0-flash-001', nome: 'Google: Gemini 2.0 Flash', contexto: 1000000 },
  { id: 'meta-llama/llama-3.3-70b-instruct', nome: 'Meta: Llama 3.3 70B Instruct', contexto: 131072 },
]

/** Cabeçalhos de toda chamada. A chave só entra em `Authorization`. */
export function cabecalhosDoProvedor(chave?: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'HTTP-Referer': ambiente.appUrl,
    'X-Title': ambiente.nomeDoProduto,
    ...(chave ? { Authorization: `Bearer ${chave}` } : {}),
  }
}

/**
 * Chamada HTTP ao provedor. Falha de rede, tempo esgotado e status de erro
 * viram `erroDoProvedor`; o corpo do erro é descartado de propósito.
 */
export async function chamarProvedor(
  caminho: string,
  opcoes: {
    chave?: string
    metodo?: 'GET' | 'POST'
    corpo?: unknown
    /** Vale até os cabeçalhos da resposta (o corpo em stream tem prazo próprio). */
    tempoLimiteMs: number
    sinal?: AbortSignal
  },
): Promise<Response> {
  const prazo = new AbortController()
  const temporizador = setTimeout(() => prazo.abort(), opcoes.tempoLimiteMs)
  const sinais = [prazo.signal, ...(opcoes.sinal ? [opcoes.sinal] : [])]
  try {
    const resposta = await fetch(`${ambiente.openrouterBaseUrl}${caminho}`, {
      method: opcoes.metodo ?? 'GET',
      headers: cabecalhosDoProvedor(opcoes.chave),
      body: opcoes.corpo === undefined ? undefined : JSON.stringify(opcoes.corpo),
      signal: AbortSignal.any(sinais),
    })
    if (!resposta.ok) {
      await resposta.body?.cancel().catch(() => undefined)
      throw erroDoProvedor(resposta.status)
    }
    return resposta
  } catch (erro) {
    if (erro instanceof Error && erro.name === 'ErroDeAplicacao') throw erro
    if (opcoes.sinal?.aborted) throw erro
    if (prazo.signal.aborted) throw erroDoProvedor('timeout')
    throw erroDoProvedor('rede')
  } finally {
    clearTimeout(temporizador)
  }
}

let cache: { em: number; base: string; lista: Modelo[] } | null = null

export function limparCacheDeModelos(): void {
  cache = null
}

/**
 * Modelos disponíveis, ordenados por nome. Cache de 5 minutos em memória; se o
 * provedor falha, devolve a lista de reserva (`reserva: true`, sem cache).
 */
export async function listarModelos(chave?: string): Promise<ListaDeModelos> {
  const base = ambiente.openrouterBaseUrl
  if (cache && cache.base === base && Date.now() - cache.em < DURACAO_DO_CACHE_MS) {
    return { modelos: cache.lista, reserva: false }
  }
  try {
    const resposta = await chamarProvedor('/models', { chave, tempoLimiteMs: TEMPO_CURTO_MS })
    const corpo = (await resposta.json()) as {
      data?: Array<{ id?: unknown; name?: unknown; context_length?: unknown }>
    }
    const modelos: Modelo[] = (corpo.data ?? [])
      .filter((m) => typeof m.id === 'string' && m.id !== '')
      .map((m) => ({
        id: m.id as string,
        nome: typeof m.name === 'string' && m.name !== '' ? m.name : (m.id as string),
        contexto: typeof m.context_length === 'number' ? m.context_length : null,
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    if (modelos.length === 0) throw erroDoProvedor('rede')
    cache = { em: Date.now(), base, lista: modelos }
    return { modelos, reserva: false }
  } catch {
    return { modelos: MODELOS_DE_RESERVA, reserva: true }
  }
}

/** Confere a chave por `GET /key`. Lança `provedor_chave_invalida` se recusada. */
export async function verificarChave(
  chave: string,
  opcoes: { tempoLimiteMs?: number } = {},
): Promise<{ valida: true; saldoRestante: number | null }> {
  const resposta = await chamarProvedor('/key', {
    chave,
    tempoLimiteMs: opcoes.tempoLimiteMs ?? TEMPO_CURTO_MS,
  })
  const corpo = (await resposta.json().catch(() => ({}))) as {
    data?: { limit_remaining?: unknown }
  }
  const restante = corpo.data?.limit_remaining
  return { valida: true, saldoRestante: typeof restante === 'number' ? restante : null }
}

export interface MensagemDeChat {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface PedidoDeConversa {
  chave: string
  modelo: string
  mensagens: MensagemDeChat[]
  temperatura?: number
  maxTokens?: number
  /** Cancela a conversa: a iteração termina sem erro e a conexão é fechada. */
  sinal?: AbortSignal
  /** Prazo até os cabeçalhos da resposta (padrão 30 s, PR-38). */
  tempoPrimeiroByteMs?: number
  /** Prazo da conversa inteira (padrão 120 s, PR-38). */
  tempoTotalMs?: number
}

/**
 * Conversa em streaming (`stream: true`): devolve os trechos de texto conforme
 * o modelo os produz. Lança `ErroDeAplicacao` (códigos `provedor_*`), inclusive
 * para erro que o provedor emite no meio do stream, depois dos trechos já
 * entregues. Usada pela conversa de teste (FT-03) e pelos canais.
 */
export async function* conversar(pedido: PedidoDeConversa): AsyncGenerator<string> {
  const total = new AbortController()
  const temporizador = setTimeout(() => total.abort(), pedido.tempoTotalMs ?? 120_000)
  const sinal = AbortSignal.any([total.signal, ...(pedido.sinal ? [pedido.sinal] : [])])

  try {
    const resposta = await chamarProvedor('/chat/completions', {
      chave: pedido.chave,
      metodo: 'POST',
      corpo: {
        model: pedido.modelo,
        messages: pedido.mensagens,
        ...(pedido.temperatura !== undefined && { temperature: pedido.temperatura }),
        ...(pedido.maxTokens !== undefined && { max_tokens: pedido.maxTokens }),
        stream: true,
      },
      tempoLimiteMs: pedido.tempoPrimeiroByteMs ?? 30_000,
      sinal,
    })
    if (!resposta.body) throw erroDoProvedor('rede')
    yield* lerTrechosDeSSE(resposta.body)
  } catch (erro) {
    if (pedido.sinal?.aborted) return
    if (total.signal.aborted) throw erroDoProvedor('timeout')
    if (erro instanceof Error && erro.name === 'ErroDeAplicacao') throw erro
    throw erroDoProvedor('rede')
  } finally {
    clearTimeout(temporizador)
  }
}
