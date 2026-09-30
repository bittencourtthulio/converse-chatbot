// O turno de conversa (FT-03): recebe a mensagem de quem pergunta, monta o
// prompt, chama o OpenRouter em stream e devolve os eventos conforme chegam.
// Serve ao painel agora e ao chat embutido e ao Telegram depois (FT-06, FT-07):
// não conhece HTTP nem sessão, só quem é o "dono" da conversa.
//
// Ordem das gravações (PR-41): a mensagem de quem pergunta é gravada antes de
// chamar o provedor; a resposta só é gravada quando o stream termina inteiro.
// Resposta interrompida (cancelamento, erro no meio, prazo) é descartada.
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ambiente } from '@/lib/ambiente'
import { ErroDeAplicacao, entradaInvalida, naoEncontrado } from '@/lib/erros'
import { conversar } from '@/lib/openrouter'
import { obterChaveDoOpenrouter } from '@/servicos/integracoes'
import {
  anexarMensagem,
  criar as criarConversa,
  listarMensagens,
  obter as obterConversa,
  type Canal,
} from '@/servicos/conversas'
import { montarPrompt, LIMITE_DE_MENSAGENS_DO_HISTORICO } from '@/servicos/chat-prompt'
import {
  CODIGO_INESPERADO,
  erroSemChave,
  gerarCorrelacao,
  mensagemParaOperador,
} from '@/servicos/chat-erros'

export { mensagemParaOperador, mensagemParaVisitante } from '@/servicos/chat-erros'

export const LIMITE_DA_MENSAGEM = 4000

export type EventoDoChat =
  /** A mensagem foi gravada e a conversa existe: o consumidor já pode guardar o id. */
  | { tipo: 'inicio'; conversaId: string }
  | { tipo: 'trecho'; texto: string }
  | { tipo: 'fim'; conversaId: string; mensagemId: string; tamanho: number }

export interface EntradaDoTurno {
  agenteId: string
  /** Sem ela, o turno abre uma conversa nova. */
  conversaId?: string
  canal: Canal
  /** Visitante (widget) ou chat (Telegram). */
  identificadorExterno?: string
  /** Usuário do painel. */
  criadoPorId?: string
  /** Validada aqui: 1 a 4000 caracteres, sem ser só espaços. */
  mensagem: unknown
  /** Cancela o turno: a chamada ao provedor é abortada e nada é gravado. */
  sinal?: AbortSignal
}

const textoDaMensagem = z
  .string({ message: 'Escreva uma mensagem.' })
  .trim()
  .min(1, 'Escreva uma mensagem.')
  .max(LIMITE_DA_MENSAGEM, `A mensagem pode ter até ${LIMITE_DA_MENSAGEM} caracteres.`)

/** Uma linha JSON, sem o conteúdo da conversa (PR-42). */
function registrarErro(erro: unknown, contexto: { agenteId: string; conversaId?: string }): string {
  const correlacao = gerarCorrelacao()
  console.error(
    JSON.stringify({
      evento: 'chat_erro',
      correlacao,
      codigo: erro instanceof ErroDeAplicacao ? erro.codigo : CODIGO_INESPERADO,
      agenteId: contexto.agenteId,
      conversaId: contexto.conversaId ?? null,
    }),
  )
  return correlacao
}

/**
 * Responde a uma mensagem. Lança `ErroDeAplicacao`: antes do evento `inicio`
 * (validação, agente ou conversa inexistente, sem chave) nada foi gravado;
 * depois dele, a mensagem de quem perguntou já está gravada e a resposta não.
 * Erro inesperado vira um `ErroDeAplicacao` 500 com código de referência.
 */
export async function* responderMensagem(entrada: EntradaDoTurno): AsyncGenerator<EventoDoChat> {
  let conversaId: string | undefined = entrada.conversaId
  try {
    const texto = textoDaMensagem.safeParse(entrada.mensagem)
    if (!texto.success) throw entradaInvalida(texto.error.issues[0]?.message ?? 'Mensagem inválida.')

    const agente = await prisma.agente.findUnique({ where: { id: entrada.agenteId } })
    if (!agente) throw naoEncontrado('Agente não encontrado.')

    const chave = await obterChaveDoOpenrouter()
    if (!chave) throw erroSemChave()

    const dono = {
      agenteId: agente.id,
      canal: entrada.canal,
      identificadorExterno: entrada.identificadorExterno,
      criadoPorId: entrada.criadoPorId,
    }
    const conversa = entrada.conversaId
      ? await obterConversa(entrada.conversaId, dono)
      : await criarConversa({ ...dono, primeiraMensagem: texto.data })
    conversaId = conversa.id

    await anexarMensagem(conversa.id, { papel: 'user', conteudo: texto.data })
    yield { tipo: 'inicio', conversaId: conversa.id }

    const historico = (
      await listarMensagens(conversa.id, LIMITE_DE_MENSAGENS_DO_HISTORICO * 2)
    ).map((m) => ({ role: m.papel as 'user' | 'assistant', content: m.conteudo }))

    let resposta = ''
    for await (const trecho of conversar({
      chave,
      modelo: agente.modelo,
      mensagens: montarPrompt({ instrucoes: agente.instrucoes, historico }),
      temperatura: agente.temperatura,
      maxTokens: ambiente.maxTokensDaResposta,
      sinal: entrada.sinal,
    })) {
      resposta += trecho
      yield { tipo: 'trecho', texto: trecho }
    }
    // Cancelado: o adaptador termina sem erro, e a resposta cortada não é gravada.
    if (entrada.sinal?.aborted) return
    if (resposta === '') {
      throw new ErroDeAplicacao(
        'O OpenRouter está indisponível no momento. Tente de novo em instantes.',
        502,
        'provedor_indisponivel',
      )
    }

    const mensagem = await anexarMensagem(conversa.id, {
      papel: 'assistant',
      conteudo: resposta,
      modelo: agente.modelo,
    })
    yield { tipo: 'fim', conversaId: conversa.id, mensagemId: mensagem.id, tamanho: resposta.length }
  } catch (erro) {
    if (entrada.sinal?.aborted) return
    // Só o que o operador não causou vai ao log: falha do provedor e erro inesperado.
    if (erro instanceof ErroDeAplicacao && erro.status < 500 && erro.status !== 429) throw erro
    const correlacao = registrarErro(erro, { agenteId: entrada.agenteId, conversaId })
    if (erro instanceof ErroDeAplicacao) throw erro
    throw new ErroDeAplicacao(
      mensagemParaOperador(erro, correlacao).mensagem,
      500,
      CODIGO_INESPERADO,
    )
  }
}
