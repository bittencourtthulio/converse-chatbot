// Adaptador do OpenRouter (PR-06, PR-22, PR-38): o único ponto do sistema que
// fala com o provedor de IA. Erros viram `ErroDeAplicacao` em português, sem
// repassar o corpo do provedor nem a chave. O endereço vem de
// `OPENROUTER_BASE_URL` (lido em `ambiente.ts`), o que deixa os testes
// apontarem para `tests/apoio/openrouter-falso.ts`.
import { ambiente } from '@/lib/ambiente'
import { ErroDeAplicacao, erroDoProvedor } from '@/lib/erros'
import { lerTrechosDeSSE } from '@/lib/sse'
import { iniciarRegistroDeIA, type ContextoDaChamada, type RegistroDeChamada } from '@/lib/registro-de-ia'

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
].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

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
    /** O chamador conclui o registro depois de consumir o corpo (stream ou JSON). */
    registro?: RegistroDeChamada
    contexto?: ContextoDaChamada
  },
): Promise<Response> {
  const registro = opcoes.registro ?? await iniciarRegistroDeIA({
    caminho,
    funcao: opcoes.contexto?.funcao ?? 'chamarProvedor',
    origem: opcoes.contexto?.origem ?? 'integracoes',
    semCusto: (opcoes.metodo ?? 'GET') === 'GET',
  })
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
    registro.receberStatusHttp(resposta.status)
    if (!resposta.ok) {
      await resposta.body?.cancel().catch(() => undefined)
      throw erroDoProvedor(resposta.status)
    }
    if (!opcoes.registro) await registro.concluir('sucesso')
    return resposta
  } catch (erro) {
    const traduzido = erro instanceof ErroDeAplicacao || opcoes.sinal?.aborted ? erro
      : erroDoProvedor(prazo.signal.aborted ? 'timeout' : 'rede')
    if (!opcoes.registro) await registro.concluir(opcoes.sinal?.aborted ? 'cancelada' : 'erro', traduzido)
    throw traduzido
  } finally {
    clearTimeout(temporizador)
  }
}

let cache: { em: number; base: string; lista: Modelo[] } | null = null

export function limparCacheDeModelos(): void {
  cache = null
}

/**
 * Modelos com saída de texto, ordenados por nome. Cache de 5 minutos em memória; se o
 * provedor falha, devolve a lista de reserva (`reserva: true`, sem cache).
 */
export async function listarModelos(chave?: string): Promise<ListaDeModelos> {
  const base = ambiente.openrouterBaseUrl
  if (cache && cache.base === base && Date.now() - cache.em < DURACAO_DO_CACHE_MS) {
    return { modelos: cache.lista, reserva: false }
  }
  try {
    const resposta = await chamarProvedor('/models?output_modalities=text', {
      contexto: { funcao: 'listarModelos', origem: 'integracoes' },
      chave,
      tempoLimiteMs: TEMPO_CURTO_MS,
    })
    const corpo = (await resposta.json()) as {
      data?: Array<{
        id?: unknown
        name?: unknown
        context_length?: unknown
        architecture?: { input_modalities?: unknown; output_modalities?: unknown }
      }>
    }
    const modelos: Modelo[] = (corpo.data ?? [])
      .filter((m) => typeof m.id === 'string' && m.id !== '')
      .filter((m) => {
        const entrada = m.architecture?.input_modalities
        const saida = m.architecture?.output_modalities
        // O endpoint já filtra por texto; confirma as modalidades quando informadas.
        return (!Array.isArray(entrada) || entrada.includes('text')) &&
          (!Array.isArray(saida) || saida.includes('text'))
      })
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
    contexto: { funcao: 'verificarChave', origem: 'integracoes' },
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
  contexto?: ContextoDaChamada
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
  const registro = await iniciarRegistroDeIA({ caminho: '/chat/completions', modelo: pedido.modelo,
    funcao: pedido.contexto?.funcao ?? 'conversar', origem: pedido.contexto?.origem ?? 'chat' })
  let status: 'sucesso' | 'erro' | 'cancelada' = 'cancelada'
  let falha: unknown
  const total = new AbortController()
  const temporizador = setTimeout(() => total.abort(), pedido.tempoTotalMs ?? 120_000)
  const sinal = AbortSignal.any([total.signal, ...(pedido.sinal ? [pedido.sinal] : [])])

  try {
    const resposta = await chamarProvedor('/chat/completions', {
      registro,
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
    yield* lerTrechosDeSSE(resposta.body, registro.receberDados)
    status = pedido.sinal?.aborted ? 'cancelada' : 'sucesso'
  } catch (erro) {
    if (pedido.sinal?.aborted) return
    status = 'erro'
    falha = total.signal.aborted ? erroDoProvedor('timeout') : erro instanceof ErroDeAplicacao ? erro : erroDoProvedor('rede')
    throw falha
  } finally {
    clearTimeout(temporizador)
    await registro.concluir(status, falha)
  }
}

/** Prazo total de uma transcrição de áudio de 10 minutos (PR-73): bem acima dos 30 s da conversa. */
export const TEMPO_DA_TRANSCRICAO_MS = 300_000

/** Instrução fixa da transcrição (PR-73): só o texto falado, sem resumo, tradução nem comentário. */
export const INSTRUCAO_DE_TRANSCRICAO =
  'Transcreva fielmente a fala deste áudio, no idioma em que ela foi falada. ' +
  'Não resuma, não traduza, não comente e não acrescente nada: devolva somente o texto transcrito.'

export interface PedidoDeTranscricao {
  contexto?: ContextoDaChamada
  chave: string
  modelo: string
  /** O áudio em base64 (o OpenRouter não aceita URL para áudio). */
  audioBase64: string
  /** Formato do áudio, como o OpenRouter o nomeia (`mp3`, `wav`...). */
  formato: string
  /** Cancela o pedido; o erro de cancelamento sobe como veio, sem virar erro do provedor. */
  sinal?: AbortSignal
  /** Prazo da chamada inteira, cabeçalhos e corpo (padrão 5 minutos). */
  tempoTotalMs?: number
}

/**
 * Transcreve um trecho de áudio por `chat/completions` sem stream, com a parte
 * `input_audio`. Erros do provedor viram `ErroDeAplicacao` (`provedor_*`); texto
 * vazio vira `transcricao_vazia` (502). Usada só pelo processamento de vídeo e
 * áudio da base de conhecimento (FT-08).
 */
export async function transcreverAudio(pedido: PedidoDeTranscricao): Promise<string> {
  const registro = await iniciarRegistroDeIA({ caminho: '/chat/completions', modelo: pedido.modelo,
    funcao: pedido.contexto?.funcao ?? 'transcreverAudio', origem: pedido.contexto?.origem ?? 'conhecimento' })
  let status: 'sucesso' | 'erro' | 'cancelada' = 'erro'
  let falha: unknown
  const prazoTotal = pedido.tempoTotalMs ?? TEMPO_DA_TRANSCRICAO_MS
  const total = new AbortController()
  const temporizador = setTimeout(() => total.abort(), prazoTotal)
  const sinal = AbortSignal.any([total.signal, ...(pedido.sinal ? [pedido.sinal] : [])])
  try {
    const resposta = await chamarProvedor('/chat/completions', {
      registro,
      chave: pedido.chave,
      metodo: 'POST',
      corpo: {
        model: pedido.modelo,
        stream: false,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: INSTRUCAO_DE_TRANSCRICAO },
              { type: 'input_audio', input_audio: { data: pedido.audioBase64, format: pedido.formato } },
            ],
          },
        ],
      },
      tempoLimiteMs: prazoTotal,
      sinal,
    })
    const corpo = (await resposta.json()) as {
      choices?: Array<{ message?: { content?: unknown } }>
    }
    registro.receberDados(corpo)
    const conteudo = corpo.choices?.[0]?.message?.content
    const texto = (
      typeof conteudo === 'string'
        ? conteudo
        : Array.isArray(conteudo)
          ? conteudo.map((p) => (typeof (p as { text?: unknown })?.text === 'string' ? (p as { text: string }).text : '')).join('')
          : ''
    ).trim()
    if (texto === '') {
      throw new ErroDeAplicacao(
        'O modelo não devolveu texto para este trecho do áudio.',
        502,
        'transcricao_vazia',
      )
    }
    status = 'sucesso'
    return texto
  } catch (erro) {
    status = pedido.sinal?.aborted ? 'cancelada' : 'erro'
    falha = pedido.sinal?.aborted ? erro : total.signal.aborted ? erroDoProvedor('timeout')
      : erro instanceof ErroDeAplicacao ? erro : erroDoProvedor('rede')
    throw falha
  } finally {
    clearTimeout(temporizador)
    await registro.concluir(status, falha)
  }
}
