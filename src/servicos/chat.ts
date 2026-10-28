// O turno de conversa (FT-03): recebe a mensagem de quem pergunta, monta o
// prompt, chama o OpenRouter em stream e valida a resposta antes de entregá-la.
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
import {
  LIMITE_DE_MENSAGENS_DO_HISTORICO,
  montarMaterialDeConsulta,
  type TrechoIncluido,
  montarMaterialSemResultado,
  montarPrompt,
  novoMarcador,
} from '@/servicos/chat-prompt'
import { buscarTrechos } from '@/servicos/recuperacao'
import { montarFontes, serializarFontes, type FonteDaResposta } from '@/servicos/fontes-da-resposta'
import {
  CODIGO_INESPERADO,
  erroSemChave,
  gerarCorrelacao,
  mensagemParaOperador,
} from '@/servicos/chat-erros'
import { log } from '@/lib/log'
import {
  pedidoForaDoEscopo,
  respostaDeCordialidade,
  respostaPermitida,
  RESPOSTA_FORA_DO_ESCOPO,
  RESPOSTA_SEM_CONHECIMENTO,
} from '@/servicos/chat-guardrails'

export { mensagemParaOperador, mensagemParaVisitante } from '@/servicos/chat-erros'

export const LIMITE_DA_MENSAGEM = 4000

export type EventoDoChat =
  /** A mensagem foi gravada e a conversa existe: o consumidor já pode guardar o id. */
  | { tipo: 'inicio'; conversaId: string }
  | { tipo: 'trecho'; texto: string }
  /** As fontes da resposta (PR-53): só quando houve trechos; sai antes do `fim`. */
  | { tipo: 'fontes'; fontes: FonteDaResposta[] }
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
  /** Cancela o turno: aborta o provedor e descarta a resposta do assistente. */
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
  log.erro('chat_erro', {
    correlacao,
    codigo: erro instanceof ErroDeAplicacao ? erro.codigo : CODIGO_INESPERADO,
    agenteId: contexto.agenteId,
    conversaId: contexto.conversaId ?? null,
  })
  return correlacao
}

/** Uma linha JSON, sem a pergunta nem o texto dos trechos (PR-42). */
function registrarRecuperacao(agenteId: string, conversaId: string, trechos: number): void {
  log.info('recuperacao', { agenteId, conversaId, trechos })
}

interface MaterialDoTurno {
  texto: string
  /** Os trechos que entraram no prompt, numerados. */
  incluidos: TrechoIncluido[]
}

/**
 * Sem fonte pronta ou sem resultado, a base não cobre a pergunta. Nunca há
 * fallback para conhecimento geral. A pergunta anterior do usuário ajuda as
 * perguntas de continuação (PR-51). Erro da busca é erro do turno: responder
 * como se a base estivesse vazia seria mentir.
 */
async function materialDaBase(
  agenteId: string,
  conversaId: string,
  historico: Array<{ role: 'user' | 'assistant'; content: string }>,
): Promise<MaterialDoTurno> {
  const comBase = (await prisma.fonte.count({ where: { agenteId, status: 'pronto' } })) > 0
  if (!comBase) return { texto: montarMaterialSemResultado(), incluidos: [] }
  const perguntas = historico.filter((m) => m.role === 'user')
  const pergunta = perguntas.at(-1)?.content ?? ''
  const trechos = await buscarTrechos(agenteId, pergunta, { perguntaAnterior: perguntas.at(-2)?.content })
  registrarRecuperacao(agenteId, conversaId, trechos.length)
  if (trechos.length === 0) return { texto: montarMaterialSemResultado(), incluidos: [] }
  const { texto, incluidos } = montarMaterialDeConsulta({ trechos, marcador: novoMarcador() })
  return { texto, incluidos }
}

/** Falha nas fontes não derruba a resposta: vai ao log, sem conteúdo (PR-42, PR-53). */
function registrarFalhaDeFontes(agenteId: string, conversaId: string): void {
  log.erro('fontes_nao_gravadas', { agenteId, conversaId })
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

    if (entrada.sinal?.aborted) return
    const bloqueado = pedidoForaDoEscopo(texto.data)
    const cordialidade = bloqueado ? null : respostaDeCordialidade(texto.data)
    const material: MaterialDoTurno = bloqueado || cordialidade !== null
      ? { texto: montarMaterialSemResultado(), incluidos: [] }
      : await materialDaBase(agente.id, conversa.id, historico)

    let resposta = bloqueado ? RESPOSTA_FORA_DO_ESCOPO : cordialidade ?? RESPOSTA_SEM_CONHECIMENTO
    let trechosDaResposta = [resposta]
    let modeloDaResposta: string | null = null
    if (material.incluidos.length > 0) {
      resposta = ''
      trechosDaResposta = []
      for await (const trecho of conversar({
        contexto: { funcao: 'responderMensagem', origem: entrada.canal },
        chave,
        modelo: agente.modelo,
        mensagens: montarPrompt({ instrucoes: agente.instrucoes, materialDeConsulta: material.texto, historico }),
        temperatura: agente.temperatura,
        maxTokens: ambiente.maxTokensDaResposta,
        sinal: entrada.sinal,
      })) {
        resposta += trecho
        trechosDaResposta.push(trecho)
      }
      modeloDaResposta = agente.modelo
      // Cancelado: o adaptador termina sem erro; o texto parcial é descartado.
      if (entrada.sinal?.aborted) return
      if (resposta.trim() === '') {
        throw new ErroDeAplicacao(
          'O OpenRouter está indisponível no momento. Tente de novo em instantes.',
          502,
          'provedor_indisponivel',
        )
      }
      if (!respostaPermitida({ resposta, modelo: agente.modelo, instrucoes: agente.instrucoes, citacoesPermitidas: material.incluidos.map((i) => i.n) })) {
        resposta = RESPOSTA_SEM_CONHECIMENTO
        trechosDaResposta = [resposta]
        material.incluidos = []
        modeloDaResposta = null
      }
    }

    // A resposta completa passa pelo guardrail antes de qualquer texto sair.
    for (const trecho of trechosDaResposta) {
      if (entrada.sinal?.aborted) return
      yield { tipo: 'trecho', texto: trecho }
    }
    if (entrada.sinal?.aborted) return

    let fontes: FonteDaResposta[] = []
    try {
      fontes = montarFontes(material.incluidos, resposta)
    } catch {
      registrarFalhaDeFontes(agente.id, conversa.id)
    }
    if (fontes.length > 0) yield { tipo: 'fontes', fontes }

    const dadosDaResposta = { papel: 'assistant' as const, conteudo: resposta, modelo: modeloDaResposta }
    let mensagem
    try {
      mensagem = await anexarMensagem(conversa.id, {
        ...dadosDaResposta,
        ...(fontes.length > 0 && { fontes: serializarFontes(fontes) }),
      })
    } catch (erroDeGravacao) {
      // Sem fontes não há o que perder: tenta de novo só com a resposta (PR-53).
      if (fontes.length === 0) throw erroDeGravacao
      registrarFalhaDeFontes(agente.id, conversa.id)
      mensagem = await anexarMensagem(conversa.id, dadosDaResposta)
    }
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
