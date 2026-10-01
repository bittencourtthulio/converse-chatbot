// A base do webhook do Telegram (FT-07, PR-63, PR-66): autenticar o segredo em
// tempo constante contra o hash gravado, validar o formato do update e
// deduplicar por `update_id`. Não conhece HTTP: o handler traduz.
import { createHash, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export interface CanalAutenticado {
  id: string
  agenteId: string
  ativo: boolean
  tokenCifrado: string
  botUsername: string
  limiteDiario: number
}

const sha256 = (texto: string): Buffer => createHash('sha256').update(texto).digest()

/** Hash fixo que ocupa o lugar do canal inexistente: a comparação roda sempre. */
const HASH_DO_CANAL_INEXISTENTE = sha256('canal-telegram-inexistente')

/**
 * Confere o cabeçalho `X-Telegram-Bot-Api-Secret-Token` contra o hash do canal do
 * agente. Segredo ausente, errado e canal inexistente dão o mesmo resultado
 * (`null`), e a comparação roda nos três casos, para a resposta não revelar quais
 * agentes têm bot nem pelo tempo.
 */
export async function autenticarWebhook(agenteId: string, segredo: string | null): Promise<CanalAutenticado | null> {
  const canal = await prisma.canalTelegram.findUnique({
    where: { agenteId },
    select: { id: true, agenteId: true, ativo: true, tokenCifrado: true, botUsername: true, limiteDiario: true, segredoDoWebhookHash: true },
  })
  const esperado = canal ? Buffer.from(canal.segredoDoWebhookHash, 'hex') : HASH_DO_CANAL_INEXISTENTE
  const recebido = sha256(segredo ?? '')
  const mesmoTamanho = esperado.length === recebido.length
  // Hashes SHA-256 têm sempre 32 bytes; hash gravado malformado nunca confere.
  const confere = mesmoTamanho && timingSafeEqual(esperado, recebido)
  if (!canal || segredo === null || segredo === '' || !confere) return null
  const { segredoDoWebhookHash: _hash, ...autenticado } = canal
  return autenticado
}

const esquemaDoUpdate = z.object({
  update_id: z.number().int().nonnegative(),
  message: z
    .object({
      text: z.string().optional(),
      chat: z.object({ id: z.number().int(), type: z.string().min(1) }),
      from: z.object({ first_name: z.string().optional(), last_name: z.string().optional() }).optional(),
    })
    .optional(),
})

export interface MensagemDoUpdate {
  chatId: number
  tipoDoChat: string
  /** Ausente em mensagem que não é texto (foto, voz, documento). */
  texto?: string
  /** Nome público (`first_name` e `last_name`), aparado; nada além disso é lido do perfil. */
  nome?: string
}

export interface UpdateLido {
  updateId: string
  /** Ausente em update que não é `message` (edição, por exemplo). */
  mensagem?: MensagemDoUpdate
}

/** Valida o formato do update (zod). `null` quando o corpo não é um update utilizável. */
export function lerUpdate(corpo: unknown): UpdateLido | null {
  const r = esquemaDoUpdate.safeParse(corpo)
  if (!r.success) return null
  const { update_id: id, message } = r.data
  if (!message) return { updateId: String(id) }
  const nome = [message.from?.first_name, message.from?.last_name]
    .map((parte) => parte?.trim())
    .filter((parte): parte is string => Boolean(parte))
    .join(' ')
  return {
    updateId: String(id),
    mensagem: {
      chatId: message.chat.id,
      tipoDoChat: message.chat.type,
      ...(message.text !== undefined && { texto: message.text }),
      ...(nome !== '' && { nome }),
    },
  }
}

/**
 * Registra o update antes de processá-lo (dedupe, PR-63): `true` se é novo,
 * `false` se o par (canal, update) já existia, ou seja, é reenvio do Telegram.
 */
export async function registrarAtualizacao(canalId: string, updateId: string): Promise<boolean> {
  try {
    await prisma.atualizacaoTelegram.create({ data: { canalId, updateId } })
    return true
  } catch (erro) {
    if (typeof erro === 'object' && erro !== null && (erro as { code?: unknown }).code === 'P2002') return false
    throw erro
  }
}

export const RETENCAO_DAS_ATUALIZACOES_MS = 7 * 24 * 3600 * 1000
const INTERVALO_DA_PURGA_MS = 3600 * 1000

/** Apaga os registros de dedupe com mais de 7 dias; devolve quantos. */
export async function purgarAtualizacoes(agora: Date = new Date()): Promise<number> {
  const { count } = await prisma.atualizacaoTelegram.deleteMany({
    where: { criadoEm: { lt: new Date(agora.getTime() - RETENCAO_DAS_ATUALIZACOES_MS) } },
  })
  return count
}

let ultimaPurga = 0

/** A purga oportunista do webhook: no máximo uma vez por hora por processo. */
export async function purgarAtualizacoesSeNecessario(agora: Date = new Date()): Promise<number> {
  if (agora.getTime() - ultimaPurga < INTERVALO_DA_PURGA_MS) return 0
  ultimaPurga = agora.getTime()
  return purgarAtualizacoes(agora)
}
