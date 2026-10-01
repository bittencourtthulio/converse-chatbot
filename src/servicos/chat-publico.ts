// O turno do visitante anônimo no chat embutido (FT-06, PR-56). Reusa
// `responderMensagem` com o canal `widget`: o modo fundamentado da FT-05 vale
// sem mudança, porque depende só do agente. Este módulo põe em volta dele o que
// o canal público exige e o painel não: validar o visitante, exigir o agente
// ativo, aplicar os limites de uso (PR-57), entregar a conversa só a quem a
// criou e nunca deixar detalhe técnico chegar ao visitante (PR-22, PR-42).
// Não conhece HTTP nem IP de cabeçalho: quem chama passa o IP.
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ErroDeAplicacao, entradaInvalida, naoEncontrado } from '@/lib/erros'
import type { Limitador } from '@/lib/limite-de-uso'
import {
  listar as listarConversas,
  listarMensagens,
  obter as obterConversa,
} from '@/servicos/conversas'
import { responderMensagem, type EventoDoChat } from '@/servicos/chat'
import { apagarConversasDe } from '@/servicos/historico'
import { MENSAGEM_PARA_VISITANTE, mensagemParaVisitante } from '@/servicos/chat-erros'
import { lerFontesGravadas, type FonteDaResposta } from '@/servicos/fontes-da-resposta'
import {
  ErroDeLimite,
  exigirLimiteDaConversa,
  exigirLimiteDeIp,
  exigirTetoDiario,
} from '@/servicos/chat-publico-limites'

export const LIMITE_DA_MENSAGEM_PUBLICA = 1000
export const LIMITE_DE_MENSAGENS_RETOMADAS_PUBLICAS = 50
export const MENSAGEM_DE_INDISPONIVEL = 'Este assistente não está disponível.'
export const CODIGO_INDISPONIVEL = 'indisponivel'

/** Os eventos do turno público: os do painel, com as fontes reduzidas. */
export type EventoPublico = EventoDoChat

const VISITANTE_ID = /^[A-Za-z0-9_-]{16,64}$/

/** O identificador opaco do visitante (16 a 64 caracteres de `[A-Za-z0-9_-]`). */
export function validarVisitanteId(valor: unknown): string {
  if (typeof valor !== 'string' || !VISITANTE_ID.test(valor)) {
    throw entradaInvalida('Identificação do visitante inválida. Recarregue a página e tente de novo.')
  }
  return valor
}

const textoDaMensagem = z
  .string({ message: 'Escreva uma mensagem.' })
  .trim()
  .min(1, 'Escreva uma mensagem.')
  .max(LIMITE_DA_MENSAGEM_PUBLICA, `A mensagem pode ter até ${LIMITE_DA_MENSAGEM_PUBLICA} caracteres.`)

/**
 * O chat do agente está publicado? Inativo e inexistente dão o mesmo 404, com a
 * mesma mensagem: o público não descobre quais agentes existem.
 */
export async function exigirAgenteAtivo(agenteId: string): Promise<{ limiteDiario: number }> {
  const linha = await prisma.configuracaoDoChat.findUnique({
    where: { agenteId },
    select: { ativo: true, limiteDiario: true },
  })
  if (!linha || !linha.ativo) throw naoEncontrado(MENSAGEM_DE_INDISPONIVEL)
  return { limiteDiario: linha.limiteDiario }
}

/**
 * As fontes para o visitante: só o título, se foi citada e os números `[n]`. O
 * trecho interno da base e os ids reais não saem (PR-56). Mantém o formato do
 * painel para o mesmo leitor de SSE e o mesmo componente serem reusados.
 */
export function reduzirFontes(fontes: FonteDaResposta[]): FonteDaResposta[] {
  return fontes.map((f, i) => ({
    fonteId: `f${i + 1}`,
    titulo: f.titulo,
    citada: f.citada,
    trechos: f.trechos.map((t) => ({ n: t.n, posicao: t.n, trechoTexto: '' })),
  }))
}

/**
 * O que o visitante pode saber de um erro: limite e entrada inválida levam a
 * própria mensagem (já amigável); conversa ou agente inexistente, a de 404;
 * corpo grande demais (413) também; todo o resto vira a frase única de `mensagemParaVisitante`, sem código do
 * provedor, correlação nem pilha.
 */
export function erroParaVisitante(erro: unknown): ErroDeAplicacao {
  if (erro instanceof ErroDeLimite) return erro
  if (erro instanceof ErroDeAplicacao && (erro.status === 404 || erro.status === 413 || erro.status === 422)) return erro
  return new ErroDeAplicacao(mensagemParaVisitante(erro), 503, CODIGO_INDISPONIVEL)
}

/** O quadro do evento `erro` do stream público: a frase única, sem código do provedor nem correlação. */
export function quadroDeErroParaVisitante(erro: unknown): { codigo: string; mensagem: string } {
  const e = erroParaVisitante(erro)
  return { codigo: e.codigo, mensagem: e.message }
}

export interface EntradaDoTurnoPublico {
  agenteId: string
  visitanteId: unknown
  conversaId?: unknown
  mensagem: unknown
  /** O IP de quem chama (`ipDoCliente`); com `TRUST_PROXY` desligado é fixo. */
  ip: string
  sinal?: AbortSignal
  /** Limitador de IP; o de teste recebe relógio injetado. */
  limitador?: Limitador
  /** "Agora" do teto diário, para o teste. */
  agora?: Date
}

/**
 * Responde à mensagem do visitante. Lança `ErroDeAplicacao` já sanitizado:
 * antes do evento `inicio` nada foi gravado (404, 422, 429) ou o turno falhou
 * antes de responder; depois dele, a pergunta está gravada e a resposta não.
 */
export async function* conversarComoVisitante(entrada: EntradaDoTurnoPublico): AsyncGenerator<EventoPublico> {
  try {
    const visitanteId = validarVisitanteId(entrada.visitanteId)
    exigirLimiteDeIp({ ip: entrada.ip, agenteId: entrada.agenteId }, entrada.limitador)
    const { limiteDiario } = await exigirAgenteAtivo(entrada.agenteId)

    const texto = textoDaMensagem.safeParse(entrada.mensagem)
    if (!texto.success) throw entradaInvalida(texto.error.issues[0]?.message ?? 'Escreva uma mensagem.')

    let conversaId: string | undefined
    if (entrada.conversaId !== undefined && entrada.conversaId !== null) {
      if (typeof entrada.conversaId !== 'string') throw entradaInvalida('Identificador de conversa inválido.')
      // A posse vem antes de qualquer outra coisa: só o dono sabe que a conversa existe.
      await obterConversa(entrada.conversaId, {
        agenteId: entrada.agenteId,
        canal: 'widget',
        identificadorExterno: visitanteId,
      })
      await exigirLimiteDaConversa(entrada.conversaId)
      conversaId = entrada.conversaId
    }
    await exigirTetoDiario(entrada.agenteId, limiteDiario, entrada.agora)

    for await (const evento of responderMensagem({
      agenteId: entrada.agenteId,
      conversaId,
      canal: 'widget',
      identificadorExterno: visitanteId,
      mensagem: texto.data,
      sinal: entrada.sinal,
    })) {
      yield evento.tipo === 'fontes' ? { tipo: 'fontes', fontes: reduzirFontes(evento.fontes) } : evento
    }
  } catch (erro) {
    throw erroParaVisitante(erro)
  }
}

export interface ConversaRetomadaPublica {
  conversaId: string
  mensagens: Array<{
    id: string
    papel: 'user' | 'assistant'
    conteudo: string
    fontes?: FonteDaResposta[]
  }>
  /** Há mensagens mais antigas que as 50 devolvidas. */
  truncada: boolean
}

/**
 * A conversa mais recente do visitante com o agente, com as últimas 50
 * mensagens (PR-56); `{conversa: null}` se ele ainda não conversou. Só a dele.
 */
export async function retomarConversaDoVisitante(
  agenteId: string,
  visitanteIdBruto: unknown,
): Promise<{ conversa: ConversaRetomadaPublica | null }> {
  const visitanteId = validarVisitanteId(visitanteIdBruto)
  await exigirAgenteAtivo(agenteId)
  const [conversa] = await listarConversas({ agenteId, canal: 'widget', identificadorExterno: visitanteId, limite: 1 })
  if (!conversa) return { conversa: null }
  const recentes = await listarMensagens(conversa.id, LIMITE_DE_MENSAGENS_RETOMADAS_PUBLICAS + 1)
  const truncada = recentes.length > LIMITE_DE_MENSAGENS_RETOMADAS_PUBLICAS
  const mensagens = recentes.slice(-LIMITE_DE_MENSAGENS_RETOMADAS_PUBLICAS).map((m) => {
    const fontes = reduzirFontes(lerFontesGravadas(m.fontes))
    return {
      id: m.id,
      papel: m.papel === 'assistant' ? ('assistant' as const) : ('user' as const),
      conteudo: m.conteudo,
      ...(fontes.length > 0 && { fontes }),
    }
  })
  return { conversa: { conversaId: conversa.id, mensagens, truncada } }
}

export interface EntradaDeApagarDoVisitante {
  agenteId: string
  visitanteId: unknown
  /** O IP de quem chama (`ipDoCliente`). */
  ip: string
  /** Limitador de IP; o de teste recebe relógio injetado. */
  limitador?: Limitador
}

/**
 * O visitante apaga a PRÓPRIA conversa (FT-10, PR-18, PR-90): todas as conversas `widget` dele
 * com este agente, com as mensagens. Só as dele (o `visitanteId` é a posse), só com o agente
 * ativo (404 igual ao de inexistente) e sujeito ao mesmo limite de uso por IP e agente do chat.
 * Visitante sem conversa recebe zero, sem erro. Erro sai sempre sanitizado para o visitante.
 */
export async function apagarConversasDoVisitante(entrada: EntradaDeApagarDoVisitante): Promise<{ conversas: number }> {
  try {
    const visitanteId = validarVisitanteId(entrada.visitanteId)
    exigirLimiteDeIp({ ip: entrada.ip, agenteId: entrada.agenteId }, entrada.limitador)
    await exigirAgenteAtivo(entrada.agenteId)
    const { conversas } = await apagarConversasDe(
      { canal: 'widget', identificadorExterno: visitanteId, agenteId: entrada.agenteId },
      { usuarioId: null, origem: 'visitante' },
    )
    return { conversas }
  } catch (erro) {
    throw erroParaVisitante(erro)
  }
}

export { MENSAGEM_PARA_VISITANTE }
