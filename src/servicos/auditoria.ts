// A trilha de auditoria (FT-10, PR-19, PR-86): quem fez o quê e quando nas ações que mudam
// credencial, acesso, agente, canal ou dado de terceiros. SOMENTE ACRÉSCIMO: este módulo só
// cria e lê registros; a única remoção é `purgarAnterioresA`, usada pelo expurgo por idade.
// Nenhuma rota nem ação de servidor apaga ou altera registro (provado por teste).
//
// Falha de gravação (PR-87): `registrar` lança, e quem precisa que a ação desfaça junto o
// chama dentro da transação (`cliente`); `registrarMelhorEsforco` nunca lança e só escreve
// uma linha de log, para as ações que já estão confirmadas.
import { z } from 'zod'
import type { Prisma } from '@/gerado/prisma/client'
import { prisma } from '@/lib/prisma'
import { entradaInvalida } from '@/lib/erros'
import type { UsuarioAutenticado } from '@/servicos/autenticacao'
import {
  ACOES,
  validarAcao,
  validarDetalhes,
  validarTipoDeAlvo,
  type AcaoDeAuditoria,
  type TipoDeAlvo,
} from '@/servicos/auditoria-acoes'
import { fimDoDia, inicioDoDia } from '@/servicos/historico-logica'

export const ROTULO_DO_SISTEMA = 'Sistema'
export const ROTULO_DO_VISITANTE = 'Visitante (chat embutido)'

/** Quem agiu: um usuário autenticado, o sistema (tarefa em segundo plano) ou o visitante do chat. */
export type AtorDaAuditoria = UsuarioAutenticado | 'sistema' | 'visitante'

export interface EventoDeAuditoria {
  ator: AtorDaAuditoria
  acao: AcaoDeAuditoria
  alvoTipo: TipoDeAlvo
  alvoId?: string | null
  detalhes?: Record<string, unknown>
}

/** O cliente que grava: o do Prisma ou o de uma transação. */
export type ClienteDeAuditoria = Pick<Prisma.TransactionClient, 'registroDeAuditoria'>

export interface RegistroListado {
  id: string
  quando: Date
  usuarioId: string | null
  usuarioRotulo: string
  acao: string
  alvoTipo: string
  alvoId: string | null
  detalhes: Record<string, unknown>
}

function rotuloDoAtor(ator: AtorDaAuditoria): { usuarioId: string | null; usuarioRotulo: string } {
  if (ator === 'sistema') return { usuarioId: null, usuarioRotulo: ROTULO_DO_SISTEMA }
  if (ator === 'visitante') return { usuarioId: null, usuarioRotulo: ROTULO_DO_VISITANTE }
  return { usuarioId: ator.id, usuarioRotulo: `${ator.nome} <${ator.email}>` }
}

function lerDetalhes(json: string): Record<string, unknown> {
  try {
    const v: unknown = JSON.parse(json)
    return typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

function paraListado(linha: {
  id: string
  quando: Date
  usuarioId: string | null
  usuarioRotulo: string
  acao: string
  alvoTipo: string
  alvoId: string | null
  detalhes: string
}): RegistroListado {
  return { ...linha, detalhes: lerDetalhes(linha.detalhes) }
}

/**
 * Grava um registro. Ação, tipo de alvo e detalhes são validados (422 e nada é gravado). Com
 * `cliente` de transação, o registro entra na mesma transação da ação.
 */
export async function registrar(
  evento: EventoDeAuditoria,
  cliente: ClienteDeAuditoria = prisma,
): Promise<RegistroListado> {
  const acao = validarAcao(evento.acao)
  const alvoTipo = validarTipoDeAlvo(evento.alvoTipo)
  const detalhes = validarDetalhes(acao, evento.detalhes)
  const { usuarioId, usuarioRotulo } = rotuloDoAtor(evento.ator)
  const linha = await cliente.registroDeAuditoria.create({
    data: { usuarioId, usuarioRotulo, acao, alvoTipo, alvoId: evento.alvoId ?? null, detalhes },
  })
  return paraListado(linha)
}

const pendentes = new Set<Promise<unknown>>()

/**
 * Grava sem nunca lançar (PR-87): falha vira a linha de log `auditoria_falhou`, com a ação
 * e o nome do erro, sem detalhes nem a mensagem do erro. Devolve quando a gravação termina.
 */
export function registrarMelhorEsforco(evento: EventoDeAuditoria): Promise<void> {
  const tarefa = registrar(evento)
    .then(() => undefined)
    .catch((erro: unknown) => {
      console.error(
        JSON.stringify({
          evento: 'auditoria_falhou',
          acao: typeof evento.acao === 'string' ? evento.acao : 'desconhecida',
          erro: erro instanceof Error ? erro.name : 'desconhecido',
        }),
      )
    })
  pendentes.add(tarefa)
  void tarefa.finally(() => pendentes.delete(tarefa))
  return tarefa
}

/** Espera as gravações de melhor esforço em andamento (os testes, e o desligamento limpo). */
export async function aguardarGravacoesPendentes(): Promise<void> {
  while (pendentes.size > 0) await Promise.all([...pendentes])
}

export const TAMANHO_PADRAO_DA_AUDITORIA = 25
export const TAMANHO_MAXIMO_DA_AUDITORIA = 100

const vazioVira = <T extends z.ZodType>(esquema: T) =>
  z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), esquema.optional())

const esquemaDosFiltros = z.object({
  acao: vazioVira(z.enum(ACOES, { message: 'Ação inválida.' })),
  usuarioId: vazioVira(z.string().max(100, 'Usuário inválido.')),
  de: vazioVira(z.string()),
  ate: vazioVira(z.string()),
  pagina: z.preprocess(
    (v) => (v === undefined || v === '' ? 1 : typeof v === 'string' ? Number(v) : v),
    z.number({ message: 'Página inválida.' }).int('Página inválida.').min(1, 'Página inválida.'),
  ),
  tamanho: z.preprocess(
    (v) => (v === undefined || v === '' ? TAMANHO_PADRAO_DA_AUDITORIA : typeof v === 'string' ? Number(v) : v),
    z
      .number({ message: 'Tamanho de página inválido.' })
      .int('Tamanho de página inválido.')
      .min(1, 'Tamanho de página inválido.')
      .max(TAMANHO_MAXIMO_DA_AUDITORIA, `No máximo ${TAMANHO_MAXIMO_DA_AUDITORIA} registros por página.`),
  ),
})

export interface FiltrosDaAuditoria {
  acao?: string
  usuarioId?: string
  /** `AAAA-MM-DD`, dia local do servidor, inclusive. */
  de?: string
  /** `AAAA-MM-DD`, dia local do servidor, inclusive. */
  ate?: string
  pagina?: number | string
  tamanho?: number | string
}

export interface PaginaDaAuditoria {
  itens: RegistroListado[]
  total: number
  pagina: number
  tamanho: number
  totalDePaginas: number
}

/** Lista os registros, do mais recente ao mais antigo, com filtros e paginação. Entrada inválida é 422. */
export async function listar(entrada: FiltrosDaAuditoria = {}): Promise<PaginaDaAuditoria> {
  const dados = esquemaDosFiltros.safeParse(entrada)
  if (!dados.success) throw entradaInvalida(dados.error.issues[0]?.message ?? 'Filtro inválido.')
  const f = dados.data
  const de = f.de ? inicioDoDia(f.de) : undefined
  const ate = f.ate ? fimDoDia(f.ate) : undefined
  if (de && ate && de.getTime() >= ate.getTime()) {
    throw entradaInvalida('O período é inválido: a data final vem antes da inicial.')
  }
  const where: Prisma.RegistroDeAuditoriaWhereInput = {
    ...(f.acao !== undefined && { acao: f.acao }),
    ...(f.usuarioId !== undefined && { usuarioId: f.usuarioId }),
    ...((de || ate) && { quando: { ...(de && { gte: de }), ...(ate && { lt: ate }) } }),
  }
  const [total, linhas] = await Promise.all([
    prisma.registroDeAuditoria.count({ where }),
    prisma.registroDeAuditoria.findMany({
      where,
      orderBy: [{ quando: 'desc' }, { id: 'desc' }],
      skip: (f.pagina - 1) * f.tamanho,
      take: f.tamanho,
    }),
  ])
  return {
    itens: linhas.map(paraListado),
    total,
    pagina: f.pagina,
    tamanho: f.tamanho,
    totalDePaginas: Math.max(1, Math.ceil(total / f.tamanho)),
  }
}

/**
 * A única remoção da trilha: apaga os registros com `quando` estritamente anterior ao corte
 * e devolve quantos. Quem chama é o expurgo por idade (`AUDITORIA_RETENCAO_DIAS`); o registro
 * exatamente no corte fica.
 */
export async function purgarAnterioresA(corte: Date): Promise<number> {
  const { count } = await prisma.registroDeAuditoria.deleteMany({ where: { quando: { lt: corte } } })
  return count
}
