// Leitor do stream SSE da conversa, no navegador (PR-43). Só interpreta o
// corpo: quem faz o `fetch` é o componente de chat. Aceita pacotes de rede
// partidos em qualquer ponto (inclusive no meio de uma letra UTF-8).

/** Espelha `FonteDaResposta` de `src/servicos/fontes-da-resposta.ts`, que o cliente não importa. */
export interface FonteDaResposta {
  fonteId: string
  titulo: string
  trechos: Array<{ n: number; posicao: number; trechoTexto: string }>
  citada: boolean
}

export type EventoDoServidor =
  | { tipo: 'trecho'; texto: string }
  /** As fontes da resposta (FT-05): vêm depois dos trechos e antes do `fim`. */
  | { tipo: 'fontes'; fontes: FonteDaResposta[] }
  | { tipo: 'fim'; conversaId: string; mensagemId: string; tamanho: number }
  | { tipo: 'erro'; codigo: string; mensagem: string; correlacao?: string }

export const ERRO_DE_CONEXAO: EventoDoServidor = {
  tipo: 'erro',
  codigo: 'conexao_interrompida',
  mensagem: 'A conexão foi interrompida antes do fim da resposta. Tente de novo.',
}

const ERRO_DE_RESPOSTA: EventoDoServidor = {
  tipo: 'erro',
  codigo: 'resposta_invalida',
  mensagem: 'A resposta do servidor veio incompleta ou ilegível. Tente de novo.',
}

function fonteValida(f: unknown): f is FonteDaResposta {
  if (typeof f !== 'object' || f === null) return false
  const o = f as Record<string, unknown>
  return (
    typeof o.fonteId === 'string' &&
    typeof o.titulo === 'string' &&
    typeof o.citada === 'boolean' &&
    Array.isArray(o.trechos) &&
    o.trechos.every((t) => {
      const x = t as Record<string, unknown> | null
      return (
        typeof x === 'object' &&
        x !== null &&
        typeof x.n === 'number' &&
        typeof x.posicao === 'number' &&
        typeof x.trechoTexto === 'string'
      )
    })
  )
}

function interpretar(quadro: string): EventoDoServidor | 'ignorar' | 'invalido' {
  let nome = ''
  const dados: string[] = []
  for (const linha of quadro.split('\n')) {
    if (linha.startsWith('event:')) nome = linha.slice(6).trim()
    else if (linha.startsWith('data:')) dados.push(linha.slice(5).replace(/^ /, ''))
  }
  if (nome !== 'trecho' && nome !== 'fontes' && nome !== 'fim' && nome !== 'erro') return 'ignorar'
  let carga: Record<string, unknown>
  try {
    carga = JSON.parse(dados.join('\n')) as Record<string, unknown>
  } catch {
    return 'invalido'
  }
  if (typeof carga !== 'object' || carga === null) return 'invalido'
  if (nome === 'trecho') {
    return typeof carga.texto === 'string' ? { tipo: 'trecho', texto: carga.texto } : 'invalido'
  }
  if (nome === 'fontes') {
    return Array.isArray(carga.fontes) && carga.fontes.every(fonteValida)
      ? { tipo: 'fontes', fontes: carga.fontes }
      : 'invalido'
  }
  if (nome === 'fim') {
    return typeof carga.conversaId === 'string' &&
      typeof carga.mensagemId === 'string' &&
      typeof carga.tamanho === 'number'
      ? { tipo: 'fim', conversaId: carga.conversaId, mensagemId: carga.mensagemId, tamanho: carga.tamanho }
      : 'invalido'
  }
  return typeof carga.codigo === 'string' && typeof carga.mensagem === 'string'
    ? {
        tipo: 'erro',
        codigo: carga.codigo,
        mensagem: carga.mensagem,
        ...(typeof carga.correlacao === 'string' && { correlacao: carga.correlacao }),
      }
    : 'invalido'
}

/**
 * Devolve os eventos do corpo, na ordem. Termina depois de `fim` ou `erro`.
 * Um corpo que acaba sem nenhum dos dois, ou um evento ilegível, vira um evento
 * `erro` local. Com `sinal` abortado (o usuário parou), termina em silêncio.
 */
export async function* lerEventos(
  corpo: ReadableStream<Uint8Array>,
  sinal?: AbortSignal,
): AsyncGenerator<EventoDoServidor> {
  const leitor = corpo.getReader()
  const decodificador = new TextDecoder()
  let pendente = ''
  try {
    for (;;) {
      let leitura: ReadableStreamReadResult<Uint8Array>
      try {
        leitura = await leitor.read()
      } catch {
        if (!sinal?.aborted) yield ERRO_DE_CONEXAO
        return
      }
      if (leitura.done) {
        pendente += decodificador.decode()
        break
      }
      pendente += decodificador.decode(leitura.value, { stream: true })
      pendente = pendente.replace(/\r\n?/g, '\n')
      let corte: number
      while ((corte = pendente.indexOf('\n\n')) !== -1) {
        const quadro = pendente.slice(0, corte)
        pendente = pendente.slice(corte + 2)
        const evento = interpretar(quadro)
        if (evento === 'ignorar') continue
        if (evento === 'invalido') {
          yield ERRO_DE_RESPOSTA
          return
        }
        yield evento
        if (evento.tipo === 'fim' || evento.tipo === 'erro') return
      }
    }
    if (!sinal?.aborted) yield ERRO_DE_CONEXAO
  } finally {
    await leitor.cancel().catch(() => undefined)
  }
}
