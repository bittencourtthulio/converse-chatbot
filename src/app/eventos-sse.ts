// Tradução dos eventos do turno de conversa para o formato SSE do navegador
// (PR-43). Camada de apresentação: o serviço não conhece este formato.
import { ErroDeAplicacao } from '@/lib/erros'
import { camposDoErro, log } from '@/lib/log'
import { mensagemParaOperador, type EventoDoChat } from '@/servicos/chat'
import { gerarCorrelacao } from '@/servicos/chat-erros'

const codificador = new TextEncoder()

/** Um quadro SSE: `event`, `data` em uma linha de JSON e a linha em branco. */
export function formatarEvento(nome: string, dados: unknown): string {
  return `event: ${nome}\ndata: ${JSON.stringify(dados)}\n\n`
}

/** Como o erro do gerador vira o quadro do evento `erro`; o canal público passa o seu (PR-56). */
export type MapeadorDeErro = (erro: unknown) => { codigo: string; mensagem: string }

function quadroDoErro(erro: unknown, mapearErro?: MapeadorDeErro): string {
  if (mapearErro) {
    // O mapeador decide tudo o que sai: nada de correlação nem de log com o texto do erro.
    const { codigo, mensagem } = mapearErro(erro)
    return formatarEvento('erro', { codigo, mensagem })
  }
  // Erro de aplicação já foi registrado pelo serviço; o resto é registrado aqui,
  // só com o código de referência, nunca com o texto do erro (PR-42).
  const correlacao = erro instanceof ErroDeAplicacao ? undefined : gerarCorrelacao()
  if (correlacao) log.erro('chat_erro_no_fluxo', { correlacao, ...camposDoErro(erro) })
  const { codigo, mensagem } = mensagemParaOperador(erro, correlacao)
  return formatarEvento('erro', { codigo, mensagem, ...(correlacao && { correlacao }) })
}

/**
 * Converte o gerador de eventos do serviço num fluxo SSE. `trecho`, `fontes` e
 * `fim` são repassados (só o `fim` encerra); `inicio` fica de fora, porque o id da conversa
 * segue no cabeçalho; erro do gerador vira o evento `erro`, com a mensagem do
 * operador (ou a do `mapearErro`, no canal público), e encerra. Cancelar a leitura
 * aborta o gerador.
 */
export function fluxoDeEventos(
  gerador: AsyncGenerator<EventoDoChat>,
  opcoes: { mapearErro?: MapeadorDeErro } = {},
): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    async pull(controle) {
      try {
        for (;;) {
          const proximo = await gerador.next()
          if (proximo.done) {
            controle.close()
            return
          }
          const evento = proximo.value
          if (evento.tipo === 'inicio') continue
          if (evento.tipo === 'trecho') {
            controle.enqueue(codificador.encode(formatarEvento('trecho', { texto: evento.texto })))
            return
          }
          if (evento.tipo === 'fontes') {
            // As fontes vêm antes do `fim` e não encerram o fluxo (PR-53).
            controle.enqueue(codificador.encode(formatarEvento('fontes', { fontes: evento.fontes })))
            return
          }
          const { tipo: _tipo, ...dados } = evento
          controle.enqueue(codificador.encode(formatarEvento('fim', dados)))
          controle.close()
          await gerador.return(undefined)
          return
        }
      } catch (erro) {
        controle.enqueue(codificador.encode(quadroDoErro(erro, opcoes.mapearErro)))
        controle.close()
      }
    },
    async cancel() {
      await gerador.return(undefined)
    },
  })
}
