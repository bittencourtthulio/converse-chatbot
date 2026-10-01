// Lógica pura do histórico de conversas (FT-09): rótulo mascarado do interlocutor (PR-78),
// prévia, escape do LIKE (PR-79) e validação dos filtros. Sem banco e sem HTTP.
import { z } from 'zod'
import { entradaInvalida } from '@/lib/erros'

export const CANAIS_DO_HISTORICO = ['painel', 'widget', 'telegram'] as const
export type CanalDoHistorico = (typeof CANAIS_DO_HISTORICO)[number]

export const TAMANHO_PADRAO = 25
export const TAMANHO_MAXIMO = 100
export const TAMANHO_DA_PREVIA = 120
export const LIMITE_DO_TEXTO = 200
export const LIMITE_DE_CASADAS = 200
export const LIMITE_DO_LOTE = 50
const PREFIXO_DO_VISITANTE = 6

export interface EntradaDeRotulo {
  canal: string
  identificadorExterno: string | null
  titulo: string | null
  nomeDoUsuario: string | null
}

/**
 * Quem é o interlocutor, sem dado pessoal além do necessário (PR-78): o visitante do widget
 * aparece pelos 6 primeiros caracteres do identificador; o Telegram, pelo título já mascarado
 * ("Telegram: Nome"), nunca pelo id do chat; o painel, pelo nome do usuário.
 */
export function rotuloDoInterlocutor(e: EntradaDeRotulo): string {
  if (e.canal === 'widget') {
    return e.identificadorExterno
      ? `Visitante ${e.identificadorExterno.slice(0, PREFIXO_DO_VISITANTE)}`
      : 'Visitante'
  }
  if (e.canal === 'telegram') return e.titulo && e.titulo.trim() !== '' ? e.titulo : 'Telegram: contato'
  return e.nomeDoUsuario && e.nomeDoUsuario.trim() !== '' ? e.nomeDoUsuario : 'Usuário removido'
}

/**
 * Prévia de uma mensagem: sem a marcação de markdown (negrito, código, link, item de lista,
 * título), espaços colapsados e no máximo 120 caracteres (com reticências).
 */
export function previaDaMensagem(texto: string | null | undefined): string {
  const limpo = (texto ?? '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s*(?:[-*+]|#{1,6}|\d+\.)\s+/gm, '')
    .replace(/(\*\*|__|`+)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const pontos = Array.from(limpo)
  if (pontos.length <= TAMANHO_DA_PREVIA) return limpo
  return `${pontos.slice(0, TAMANHO_DA_PREVIA - 1).join('').trimEnd()}…`
}

/** Escapa `%`, `_` e `\` para o texto virar literal num `LIKE ... ESCAPE '\'`. */
export function escaparLike(texto: string): string {
  return texto.replace(/[\\%_]/g, (c) => `\\${c}`)
}

const DIA = /^(\d{4})-(\d{2})-(\d{2})$/

/** Meia-noite local (do fuso do servidor) do dia `AAAA-MM-DD`. */
export function inicioDoDia(dia: string): Date {
  const m = DIA.exec(dia)
  if (!m) throw entradaInvalida('Data inválida. Use o formato AAAA-MM-DD.')
  const [ano, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const data = new Date(ano, mes - 1, d, 0, 0, 0, 0)
  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== d) {
    throw entradaInvalida('Data inválida. Use o formato AAAA-MM-DD.')
  }
  return data
}

/** A meia-noite local que fecha o dia (exclusiva): o primeiro instante do dia seguinte. */
export function fimDoDia(dia: string): Date {
  const i = inicioDoDia(dia)
  return new Date(i.getFullYear(), i.getMonth(), i.getDate() + 1, 0, 0, 0, 0)
}

export interface FiltrosDoHistorico {
  agenteId?: string
  canal?: CanalDoHistorico
  texto?: string
  /** Início (inclusivo) do período. */
  de?: Date
  /** Fim (exclusivo) do período. */
  ate?: Date
  pagina: number
  tamanho: number
}

const vazioVira = <T extends z.ZodType>(esquema: T) =>
  z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), esquema.optional())

const esquema = z.object({
  agenteId: vazioVira(z.string().max(100, 'Agente inválido.')),
  canal: vazioVira(z.enum(CANAIS_DO_HISTORICO, { message: 'Canal inválido.' })),
  texto: vazioVira(z.string().trim().max(LIMITE_DO_TEXTO, `A busca aceita até ${LIMITE_DO_TEXTO} caracteres.`)),
  de: vazioVira(z.string()),
  ate: vazioVira(z.string()),
  pagina: z.preprocess(
    (v) => (v === undefined || v === '' ? 1 : typeof v === 'string' ? Number(v) : v),
    z.number({ message: 'Página inválida.' }).int('Página inválida.').min(1, 'Página inválida.'),
  ),
  tamanho: z.preprocess(
    (v) => (v === undefined || v === '' ? TAMANHO_PADRAO : typeof v === 'string' ? Number(v) : v),
    z
      .number({ message: 'Tamanho de página inválido.' })
      .int('Tamanho de página inválido.')
      .min(1, 'Tamanho de página inválido.')
      .max(TAMANHO_MAXIMO, `No máximo ${TAMANHO_MAXIMO} conversas por página.`),
  ),
})

/** Valida os filtros brutos (searchParams ou JSON); erro de entrada vira 422. */
export function lerFiltros(entrada: unknown): FiltrosDoHistorico {
  const dados = esquema.safeParse(entrada ?? {})
  if (!dados.success) throw entradaInvalida(dados.error.issues[0]?.message ?? 'Filtro inválido.')
  const v = dados.data
  const de = v.de ? inicioDoDia(v.de) : undefined
  const ate = v.ate ? fimDoDia(v.ate) : undefined
  if (de && ate && de.getTime() >= ate.getTime()) {
    throw entradaInvalida('O período é inválido: a data final vem antes da inicial.')
  }
  return {
    pagina: v.pagina,
    tamanho: v.tamanho,
    ...(v.agenteId !== undefined && { agenteId: v.agenteId }),
    ...(v.canal !== undefined && { canal: v.canal }),
    ...(v.texto !== undefined && v.texto !== '' && { texto: v.texto }),
    ...(de && { de }),
    ...(ate && { ate }),
  }
}

/**
 * O instante como o SQLite o compara: o Prisma guarda `DateTime` como texto ISO em UTC
 * (`2026-03-10T12:00:00.000+00:00`, provado em `tests/sqlite-formatos.test.ts`). O parâmetro
 * vai sem o sufixo do fuso, para a comparação de texto valer também no instante exato.
 */
export function instanteParaSql(data: Date): string {
  return data.toISOString().slice(0, 23)
}

const ROTULOS_DE_CANAL: Record<string, string> = {
  painel: 'Painel',
  widget: 'Chat embutido',
  telegram: 'Telegram',
}

/** O nome do canal para a interface e para a exportação. */
export function rotuloDoCanal(canal: string): string {
  return ROTULOS_DE_CANAL[canal] ?? canal
}
