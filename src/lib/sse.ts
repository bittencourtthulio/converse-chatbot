// Leitor de Server-Sent Events do OpenRouter (streaming.md): devolve os
// trechos de texto de `choices[0].delta.content`. Trata comentários (`:`),
// `[DONE]`, JSON e UTF-8 partidos entre pacotes de rede e erro no meio do
// stream (evento com `error` ou `finish_reason: "error"` com HTTP 200).
import { erroDoProvedor } from '@/lib/erros'

interface Evento {
  error?: { code?: number | string }
  choices?: Array<{
    delta?: { content?: string | null }
    finish_reason?: string | null
  }>
}

export async function* lerTrechosDeSSE(
  corpo: ReadableStream<Uint8Array>,
): AsyncGenerator<string> {
  const decodificador = new TextDecoder()
  const leitor = corpo.getReader()
  let pendente = ''
  let terminou = false

  /** Processa uma linha completa. `undefined` = nada a entregar; `null` = fim. */
  function processar(linha: string): string | null | undefined {
    if (linha === '' || linha.startsWith(':')) return undefined
    if (!linha.startsWith('data:')) return undefined
    const carga = linha.slice(5).trimStart()
    if (carga === '[DONE]') return null

    let evento: Evento
    try {
      evento = JSON.parse(carga) as Evento
    } catch {
      throw erroDoProvedor('rede')
    }
    const escolha = evento.choices?.[0]
    if (evento.error || escolha?.finish_reason === 'error') {
      const codigo = evento.error?.code
      throw erroDoProvedor(typeof codigo === 'number' ? codigo : 'rede')
    }
    if (escolha?.finish_reason) terminou = true
    const texto = escolha?.delta?.content
    return typeof texto === 'string' && texto !== '' ? texto : undefined
  }

  try {
    for (;;) {
      const { done, value } = await leitor.read()
      if (done) {
        pendente += decodificador.decode()
        break
      }
      pendente += decodificador.decode(value, { stream: true })
      let quebra: number
      while ((quebra = pendente.indexOf('\n')) !== -1) {
        const linha = pendente.slice(0, quebra).replace(/\r$/, '')
        pendente = pendente.slice(quebra + 1)
        const resultado = processar(linha)
        if (resultado === null) return
        if (resultado !== undefined) yield resultado
      }
    }
    const resto = processar(pendente.replace(/\r$/, ''))
    if (resto === null) return
    if (resto !== undefined) yield resto
    if (!terminou) throw erroDoProvedor('rede')
  } finally {
    await leitor.cancel().catch(() => undefined)
  }
}
