// O atendimento de um update do Telegram (FT-07, PR-67): só mensagem de chat
// privado; `/start` responde a mensagem inicial do agente, `/novo` e `/reiniciar`
// abrem uma conversa nova, o que não é texto recebe um aviso e grupos e canais
// são ignorados. Roda depois que o webhook respondeu 200, por isso nenhum erro
// sobe: o que falha vira o último erro do canal (mensagem segura, sem token).
import { prisma } from '@/lib/prisma'
import { decifrar } from '@/lib/cripto'
import { ErroDoTelegram, sendMessage } from '@/lib/telegram'
import { registrarErroDoCanal } from '@/servicos/canal-telegram'
import { criar as criarConversa, listar as listarConversas, LIMITE_DO_TITULO } from '@/servicos/conversas'
import type { CanalAutenticado, MensagemDoUpdate, UpdateLido } from '@/servicos/telegram-webhook'

export const AVISO_SO_TEXTO = 'Só consigo ler mensagens de texto por enquanto.'
export const MENSAGEM_INICIAL_PADRAO = 'Olá! Envie sua pergunta.'
export const MENSAGEM_DE_NOVA_CONVERSA = 'Certo, começamos uma nova conversa. Pode perguntar.'

export type Comando = 'start' | 'novo'

/**
 * O comando que o texto carrega, se for um dos nossos: `/start`, `/novo` ou
 * `/reiniciar`, com argumento ou com o `@` do próprio bot; qualquer outra coisa
 * (inclusive comando de outro bot) é texto comum.
 */
export function interpretarComando(texto: string, botUsername: string): Comando | null {
  const m = /^\/([A-Za-z0-9_]+)(?:@([A-Za-z0-9_]+))?(?:\s|$)/.exec(texto.trim())
  if (!m) return null
  if (m[2] !== undefined && m[2].toLowerCase() !== botUsername.toLowerCase()) return null
  switch ((m[1] as string).toLowerCase()) {
    case 'start':
      return 'start'
    case 'novo':
    case 'reiniciar':
      return 'novo'
    default:
      return null
  }
}

/** "Telegram: Nome", só com o nome público (PR-18), sem controle e em até 60 caracteres. */
export function tituloDoChat(nome: string | undefined): string {
  const limpo = (nome ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim()
  return `Telegram: ${limpo === '' ? 'contato' : limpo}`.slice(0, LIMITE_DO_TITULO)
}

/** Envia ao chat; falha do Telegram vira o último erro do canal e não propaga. */
export async function enviarAoChat(canal: CanalAutenticado, chatId: number, texto: string): Promise<boolean> {
  try {
    await sendMessage(decifrar(canal.tokenCifrado), chatId, texto)
    return true
  } catch (erro) {
    const mensagem =
      erro instanceof ErroDoTelegram
        ? erro.message
        : 'Não foi possível enviar a resposta pelo Telegram. Confira o token do bot.'
    await registrarErroDoCanal(canal.id, mensagem).catch(() => undefined)
    return false
  }
}

/** A conversa mais recente do chat com o agente, ou uma nova com o título pelo nome público. */
export async function conversaDoChat(canal: CanalAutenticado, mensagem: MensagemDoUpdate): Promise<{ id: string }> {
  const identificadorExterno = String(mensagem.chatId)
  const [existente] = await listarConversas({ agenteId: canal.agenteId, canal: 'telegram', identificadorExterno, limite: 1 })
  if (existente) return existente
  return novaConversaDoChat(canal, mensagem)
}

export async function novaConversaDoChat(canal: CanalAutenticado, mensagem: MensagemDoUpdate): Promise<{ id: string }> {
  return criarConversa({
    agenteId: canal.agenteId,
    canal: 'telegram',
    identificadorExterno: String(mensagem.chatId),
    titulo: tituloDoChat(mensagem.nome),
  })
}

async function marcarMensagemRecebida(canalId: string): Promise<void> {
  await prisma.canalTelegram.updateMany({ where: { id: canalId }, data: { ultimaMensagemEm: new Date() } })
}

/**
 * Atende o update. Só chat privado; grupos, canais e updates que não são
 * mensagem são ignorados sem resposta.
 */
export async function atenderUpdate(canal: CanalAutenticado, update: UpdateLido): Promise<void> {
  const mensagem = update.mensagem
  if (!mensagem || mensagem.tipoDoChat !== 'private') return
  await marcarMensagemRecebida(canal.id)

  if (mensagem.texto === undefined) {
    await enviarAoChat(canal, mensagem.chatId, AVISO_SO_TEXTO)
    return
  }
  const comando = interpretarComando(mensagem.texto, canal.botUsername)
  if (comando === 'start') {
    const agente = await prisma.agente.findUnique({ where: { id: canal.agenteId }, select: { mensagemInicial: true } })
    const inicial = agente?.mensagemInicial.trim() ?? ''
    await enviarAoChat(canal, mensagem.chatId, inicial === '' ? MENSAGEM_INICIAL_PADRAO : inicial)
    return
  }
  if (comando === 'novo') {
    await novaConversaDoChat(canal, mensagem)
    await enviarAoChat(canal, mensagem.chatId, MENSAGEM_DE_NOVA_CONVERSA)
    return
  }
  // Texto comum: a resposta do agente (T-04.03).
}
