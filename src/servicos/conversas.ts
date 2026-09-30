// Conversas e mensagens (FT-03): o armazenamento que o painel, o chat embutido
// (FT-06) e o Telegram (FT-07) compartilham. É camada de aplicação: não conhece
// sessão nem HTTP. Quem chama decide quem é o "dono" da conversa (usuário do
// painel, visitante ou chat) e o serviço só entrega conversa a quem a criou;
// qualquer outra combinação é 404, sem revelar que a conversa existe (PR-43).
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { entradaInvalida, naoEncontrado } from '@/lib/erros'
import { lerFontesGravadas, type FonteDaResposta } from '@/servicos/fontes-da-resposta'

export const CANAIS = ['painel', 'widget', 'telegram'] as const
export type Canal = (typeof CANAIS)[number]
export type Papel = 'user' | 'assistant'

export const LIMITE_DO_TITULO = 60

export interface ConversaVisivel {
  id: string
  agenteId: string
  canal: string
  identificadorExterno: string | null
  titulo: string | null
  criadoPorId: string | null
  criadoEm: Date
  atualizadoEm: Date
}

export interface MensagemVisivel {
  id: string
  conversaId: string
  papel: string
  conteudo: string
  modelo: string | null
  tokensEntrada: number | null
  tokensSaida: number | null
  /** JSON em texto; a FT-05 grava aqui as fontes da resposta. */
  fontes: string | null
  criadoEm: Date
}

/** Quem é dono da conversa. `undefined` num campo opcional = não conferir. */
export interface DonoDaConversa {
  agenteId: string
  canal: Canal
  identificadorExterno?: string | null
  criadoPorId?: string | null
}

const canal = z.enum(CANAIS, { message: 'Canal de conversa inválido.' })

const entradaDeCriacao = z.object({
  agenteId: z.string().min(1),
  canal,
  identificadorExterno: z.string().max(200).nullish(),
  criadoPorId: z.string().min(1).nullish(),
  primeiraMensagem: z.string().optional(),
})

const entradaDeMensagem = z.object({
  papel: z.enum(['user', 'assistant'], { message: 'Papel de mensagem inválido.' }),
  conteudo: z.string().min(1, 'A mensagem não pode ser vazia.'),
  modelo: z.string().max(200).nullish(),
  tokensEntrada: z.number().int().nonnegative().nullish(),
  tokensSaida: z.number().int().nonnegative().nullish(),
  fontes: z.string().nullish(),
})

export type EntradaDeConversa = z.input<typeof entradaDeCriacao>
export type EntradaDeMensagem = z.input<typeof entradaDeMensagem>

function validar<T>(esquema: z.ZodType<T>, entrada: unknown): T {
  const dados = esquema.safeParse(entrada)
  if (!dados.success) {
    throw entradaInvalida(dados.error.issues[0]?.message ?? 'Entrada inválida.')
  }
  return dados.data
}

/** Os primeiros 60 caracteres da mensagem, com os espaços colapsados. */
export function tituloDaConversa(texto: string): string {
  return texto.replace(/\s+/g, ' ').trim().slice(0, LIMITE_DO_TITULO)
}

export async function criar(entrada: EntradaDeConversa): Promise<ConversaVisivel> {
  const dados = validar(entradaDeCriacao, entrada)
  const titulo = dados.primeiraMensagem ? tituloDaConversa(dados.primeiraMensagem) : ''
  if (!(await prisma.agente.findUnique({ where: { id: dados.agenteId }, select: { id: true } }))) {
    throw naoEncontrado('Agente não encontrado.')
  }
  return prisma.conversa.create({
    data: {
      agenteId: dados.agenteId,
      canal: dados.canal,
      identificadorExterno: dados.identificadorExterno ?? null,
      criadoPorId: dados.criadoPorId ?? null,
      titulo: titulo === '' ? null : titulo,
    },
  })
}

/** A conversa, se `dono` for quem a criou; senão 404. */
export async function obter(id: string, dono: DonoDaConversa): Promise<ConversaVisivel> {
  const conversa = await prisma.conversa.findUnique({ where: { id } })
  const confere =
    conversa !== null &&
    conversa.agenteId === dono.agenteId &&
    conversa.canal === dono.canal &&
    (dono.identificadorExterno === undefined ||
      conversa.identificadorExterno === dono.identificadorExterno) &&
    (dono.criadoPorId === undefined || conversa.criadoPorId === dono.criadoPorId)
  if (!confere) throw naoEncontrado('Conversa não encontrada.')
  return conversa
}

export interface FiltroDeConversas {
  agenteId: string
  canal: Canal
  criadoPorId?: string
  identificadorExterno?: string
  limite?: number
}

/** As conversas de um agente num canal, a de atividade mais recente primeiro. */
export async function listar(filtro: FiltroDeConversas): Promise<ConversaVisivel[]> {
  return prisma.conversa.findMany({
    where: {
      agenteId: filtro.agenteId,
      canal: filtro.canal,
      ...(filtro.criadoPorId !== undefined && { criadoPorId: filtro.criadoPorId }),
      ...(filtro.identificadorExterno !== undefined && {
        identificadorExterno: filtro.identificadorExterno,
      }),
    },
    orderBy: [{ atualizadoEm: 'desc' }, { id: 'desc' }],
    ...(filtro.limite !== undefined && { take: filtro.limite }),
  })
}

/** Grava a mensagem e marca a conversa como atualizada agora. */
export async function anexarMensagem(
  conversaId: string,
  entrada: EntradaDeMensagem,
): Promise<MensagemVisivel> {
  const dados = validar(entradaDeMensagem, entrada)
  const [mensagem] = await prisma.$transaction([
    prisma.mensagem.create({
      data: {
        conversaId,
        papel: dados.papel,
        conteudo: dados.conteudo,
        modelo: dados.modelo ?? null,
        tokensEntrada: dados.tokensEntrada ?? null,
        tokensSaida: dados.tokensSaida ?? null,
        fontes: dados.fontes ?? null,
      },
    }),
    prisma.conversa.update({ where: { id: conversaId }, data: { atualizadoEm: new Date() } }),
  ])
  return mensagem
}

/** As últimas `limite` mensagens (todas, sem limite), em ordem cronológica. */
export async function listarMensagens(
  conversaId: string,
  limite?: number,
): Promise<MensagemVisivel[]> {
  const recentes = await prisma.mensagem.findMany({
    where: { conversaId },
    orderBy: [{ criadoEm: 'desc' }, { id: 'desc' }],
    ...(limite !== undefined && { take: limite }),
  })
  return recentes.reverse()
}

/** Apaga a conversa e, em cascata, as mensagens dela. */
export async function apagar(id: string): Promise<void> {
  const { count } = await prisma.conversa.deleteMany({ where: { id } })
  if (count === 0) throw naoEncontrado('Conversa não encontrada.')
}

export interface ConversaRetomada {
  conversaId: string
  mensagens: Array<{
    id: string
    papel: 'user' | 'assistant'
    conteudo: string
    /** Só nas respostas gravadas com fontes (FT-05). */
    fontes?: FonteDaResposta[]
  }>
}

export const LIMITE_DE_MENSAGENS_RETOMADAS = 100

/**
 * A conversa do painel a retomar (PR-44): a de atividade mais recente que este
 * usuário tem com o agente, com as últimas 100 mensagens. `null` se não há.
 */
export async function retomarDoPainel(
  agenteId: string,
  usuarioId: string,
): Promise<ConversaRetomada | null> {
  const [conversa] = await listar({ agenteId, canal: 'painel', criadoPorId: usuarioId, limite: 1 })
  if (!conversa) return null
  const mensagens = await listarMensagens(conversa.id, LIMITE_DE_MENSAGENS_RETOMADAS)
  return {
    conversaId: conversa.id,
    mensagens: mensagens.map((m) => {
      const fontes = lerFontesGravadas(m.fontes)
      return {
        id: m.id,
        papel: m.papel === 'assistant' ? ('assistant' as const) : ('user' as const),
        conteudo: m.conteudo,
        ...(fontes.length > 0 && { fontes }),
      }
    }),
  }
}
