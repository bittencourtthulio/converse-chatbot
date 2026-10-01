// Limites do canal Telegram (FT-07, PR-16, PR-68). Cada mensagem custa IA paga
// pela empresa, então passa por três portas antes do provedor: 10 por minuto por
// chat (memória, relógio injetável), 60 por conversa e o teto diário do canal
// (os dois no banco). Por IP não se aplica: o tráfego vem do Telegram. Quando um
// limite estoura, o chat recebe uma frase amigável em vez de silêncio.
import { limitadorPadrao, type Limitador } from '@/lib/limite-de-uso'
import { ErroDeLimite, exigirLimiteDaConversa, exigirTetoDiario } from '@/servicos/chat-publico-limites'

export const LIMITES_DO_TELEGRAM = {
  porChatPorMinuto: 10,
  mensagensPorConversa: 60,
  janelaMs: 60_000,
} as const

export const MENSAGENS_DE_LIMITE = {
  porChat: 'Você enviou muitas mensagens em pouco tempo. Aguarde um instante e tente de novo.',
  conversaCheia: 'Esta conversa atingiu o limite de mensagens. Envie /novo para começar outra.',
  tetoDiario: 'Este assistente atingiu o limite de mensagens de hoje. Tente novamente amanhã.',
} as const

/** 10 por minuto por chat. Só a chamada permitida conta. `false` = estourou. */
export function permitirMensagemDoChat(
  entrada: { canalId: string; chatId: number },
  limitador: Limitador = limitadorPadrao,
): boolean {
  return limitador.verificarLimite(`telegram:chat:${entrada.canalId}:${entrada.chatId}`, {
    max: LIMITES_DO_TELEGRAM.porChatPorMinuto,
    janelaMs: LIMITES_DO_TELEGRAM.janelaMs,
  }).permitido
}

/**
 * Os limites do banco: conversa cheia e teto diário do canal. Devolve a frase
 * para o chat ou `null` se pode seguir. Outro erro (banco) sobe.
 */
export async function frasePorLimiteDoBanco(entrada: {
  agenteId: string
  conversaId: string
  limiteDiario: number
  agora?: Date
}): Promise<string | null> {
  try {
    await exigirLimiteDaConversa(entrada.conversaId)
    await exigirTetoDiario(entrada.agenteId, entrada.limiteDiario, entrada.agora, 'telegram')
    return null
  } catch (erro) {
    if (erro instanceof ErroDeLimite) {
      return erro.codigo === 'conversa_cheia' ? MENSAGENS_DE_LIMITE.conversaCheia : MENSAGENS_DE_LIMITE.tetoDiario
    }
    throw erro
  }
}
