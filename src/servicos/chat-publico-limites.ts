// Limites de uso do chat público (FT-06, PR-16, PR-57). Visitante anônimo
// aciona custo de IA que a empresa paga, então cada mensagem passa por quatro
// portas antes do provedor: IP e agente, IP, conversa e o teto diário do agente.
// Os dois primeiros vivem na memória do processo (`criarLimitador`, relógio
// injetável); os outros dois são contados no banco e sobrevivem a reinício.
// A mensagem ao visitante é sempre amigável e sem número técnico.
import { prisma } from '@/lib/prisma'
import { ErroDeAplicacao } from '@/lib/erros'
import { limitadorPadrao, type Limitador } from '@/lib/limite-de-uso'

export const LIMITES_DO_CHAT = {
  ipEAgentePorMinuto: 10,
  ipPorMinuto: 30,
  mensagensPorConversa: 60,
  janelaMs: 60_000,
} as const

/** Limite excedido (429). `retryAfterSegundos` é nulo quando esperar não resolve. */
export class ErroDeLimite extends ErroDeAplicacao {
  constructor(
    mensagem: string,
    codigo: 'limite_excedido' | 'limite_diario' | 'conversa_cheia',
    readonly retryAfterSegundos: number | null,
  ) {
    super(mensagem, 429, codigo)
  }
}

const segundos = (ms: number) => Math.max(1, Math.ceil(ms / 1000))

/** 10 por minuto por IP e agente, e 30 por minuto por IP. Só a chamada permitida conta. */
export function exigirLimiteDeIp(
  entrada: { ip: string; agenteId: string },
  limitador: Limitador = limitadorPadrao,
): void {
  const janelaMs = LIMITES_DO_CHAT.janelaMs
  const porAgente = limitador.verificarLimite(`chat:ip-agente:${entrada.ip}:${entrada.agenteId}`, {
    max: LIMITES_DO_CHAT.ipEAgentePorMinuto,
    janelaMs,
  })
  const porIp = porAgente.permitido
    ? limitador.verificarLimite(`chat:ip:${entrada.ip}`, { max: LIMITES_DO_CHAT.ipPorMinuto, janelaMs })
    : porAgente
  if (!porAgente.permitido || !porIp.permitido) {
    throw new ErroDeLimite(
      'Você enviou muitas mensagens em pouco tempo. Aguarde alguns instantes e tente de novo.',
      'limite_excedido',
      segundos(porIp.reiniciaEmMs),
    )
  }
}

/** A conversa já tem 60 mensagens do visitante: a saída é começar outra. */
export async function exigirLimiteDaConversa(conversaId: string): Promise<void> {
  const enviadas = await prisma.mensagem.count({ where: { conversaId, papel: 'user' } })
  if (enviadas >= LIMITES_DO_CHAT.mensagensPorConversa) {
    throw new ErroDeLimite(
      'Esta conversa atingiu o limite de mensagens. Comece uma nova conversa.',
      'conversa_cheia',
      null,
    )
  }
}

/** Meia-noite local (fuso do servidor) que começa o dia de `agora`. */
function inicioDoDia(agora: Date): Date {
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
}

/**
 * Teto diário do agente (PR-57, PR-68): mensagens `user` do canal (`widget`, ou
 * `telegram` na FT-07) criadas desde a meia-noite do fuso do servidor. Conta tentativas, inclusive as que falharam
 * no provedor, porque a pergunta é gravada antes de chamá-lo (PR-41).
 */
export async function exigirTetoDiario(
  agenteId: string,
  limiteDiario: number,
  agora: Date = new Date(),
  canal: 'widget' | 'telegram' = 'widget',
): Promise<void> {
  const inicio = inicioDoDia(agora)
  const enviadas = await prisma.mensagem.count({
    where: { papel: 'user', criadoEm: { gte: inicio }, conversa: { agenteId, canal } },
  })
  if (enviadas >= limiteDiario) {
    const amanha = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 1)
    throw new ErroDeLimite(
      'Este assistente atingiu o limite de mensagens de hoje. Tente novamente amanhã.',
      'limite_diario',
      segundos(amanha.getTime() - agora.getTime()),
    )
  }
}
