/**
 * Apoio dos testes do turno de conversa (FT-03): cenário com usuário, agente e
 * chave gravada, e coleta dos eventos de `responderMensagem`. Reutilizável
 * pelos testes dos canais (FT-06, FT-07).
 */
import { prisma } from '../../src/lib/prisma.js'
import { salvarChaveDoOpenrouter } from '../../src/servicos/integracoes.js'
import { responderMensagem, type EventoDoChat } from '../../src/servicos/chat.js'
import { criarAdmin } from '../ajuda.js'
import { CHAVE_VALIDA } from './openrouter-falso.js'
import { criarBase } from './conhecimento'

export async function cenarioDeChat(opcoes: { comChave?: boolean; instrucoes?: string } = {}) {
  const admin = await criarAdmin()
  if (opcoes.comChave !== false) await salvarChaveDoOpenrouter(admin, { chave: CHAVE_VALIDA })
  const agente = await prisma.agente.create({
    data: {
      nome: 'Agente de teste',
      modelo: 'openai/gpt-4o-mini',
      temperatura: 0.3,
      instrucoes: opcoes.instrucoes ?? 'Você é a Ana, atendente da loja.',
      criadoPorId: admin.id,
    },
  })
  return { admin, agente }
}

/** Turnos que exercitam o provedor precisam de uma pergunta coberta pela base. */
export async function cenarioDeChatComBase(opcoes: Parameters<typeof cenarioDeChat>[0] = {}) {
  const cenario = await cenarioDeChat(opcoes)
  await criarBase({ agenteId: cenario.agente.id, titulo: 'Política de troca', textos: ['Aceitamos a troca em até sete dias corridos.'] })
  return cenario
}

/** Consome o gerador até o fim, devolvendo os eventos e o erro, se houve. */
export async function coletar(gerador: AsyncGenerator<EventoDoChat>) {
  const eventos: EventoDoChat[] = []
  let erro: unknown
  try {
    for await (const e of gerador) eventos.push(e)
  } catch (e) {
    erro = e
  }
  return { eventos, erro }
}

export { responderMensagem }
