/**
 * Apoio dos testes do chat público (FT-06): agente com o chat publicado, chave
 * do OpenRouter gravada e coleta dos eventos do turno do visitante.
 */
import { salvarConfiguracao } from '../../src/servicos/chat-publico-config.js'
import {
  conversarComoVisitante,
  type EventoPublico,
} from '../../src/servicos/chat-publico.js'
import { cenarioDeChat } from './chat.js'

export const VISITANTE_A = 'visitante-a-0123456789abcdef'
export const VISITANTE_B = 'visitante-b-0123456789abcdef'

/** Agente com chave do OpenRouter e o chat publicado (ou não). */
export async function cenarioPublico(
  opcoes: { ativo?: boolean; comChave?: boolean; configuracao?: Record<string, unknown> } = {},
) {
  const { admin, agente } = await cenarioDeChat({ comChave: opcoes.comChave })
  await salvarConfiguracao(admin, agente.id, { ativo: opcoes.ativo ?? true, ...opcoes.configuracao })
  return { admin, agente }
}

/** Consome o turno público até o fim, devolvendo os eventos e o erro, se houve. */
export async function coletarPublico(gerador: AsyncGenerator<EventoPublico>) {
  const eventos: EventoPublico[] = []
  let erro: unknown
  try {
    for await (const e of gerador) eventos.push(e)
  } catch (e) {
    erro = e
  }
  return { eventos, erro }
}

export { conversarComoVisitante }
