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
import { entradaInvalida, naoAutenticado } from '@/lib/erros'
import { exigirAdmin, type UsuarioAutenticado } from '@/servicos/autenticacao'
import {
  ACOES,
  validarAcao,
  validarDetalhes,
  validarTipoDeAlvo,
  type AcaoDeAuditoria,
  type TipoDeAlvo,
} from '@/servicos/auditoria-acoes'
import { fimDoDia, inicioDoDia } from '@/servicos/historico-logica'
import { camposDoErro, log } from '@/lib/log'

export const ROTULO_DO_SISTEMA = 'Sistema'
export const ROTULO_DO_VISITANTE = 'Visitante (chat embutido)'
export const ROTULO_DE_USUARIO_REMOVIDO = 'Usuário removido'

/**
 * Quem agiu: um usuário autenticado, o sistema (tarefa em segundo plano), o visitante do chat
 * ou uma referência a usuário por id (o ouvinte só sabe o id; o rótulo é lido na hora de
 * gravar, e um usuário que já não existe vira "Usuário removido").
 */
export type AtorDaAuditoria = UsuarioAutenticado | 'sistema' | 'visitante' | { usuarioId: string }

export interface EventoDeAuditoria {
  ator: AtorDaAuditoria
  acao: AcaoDeAuditoria
  alvoTipo: TipoDeAlvo
  alvoId?: string | null
  detalhes?: Record<string, unknown>
}

/** O cliente que grava: o do Prisma ou o de uma transação. */
export type ClienteDeAuditoria = Pick<Prisma.TransactionClient, 'registroDeAuditoria' | 'usuario'>

export interface RegistroListado {
  id: string
  quando: Date
  usuarioId: string | null
  usuarioRotulo: string
  acao: string
  alvoTipo: string
  alvoId: string | null
  /** O nome atual do alvo, para a tela: só o usuário; nulo se não se aplica ou se já não existe. */
  alvoNome: string | null
  detalhes: Record<string, unknown>
}

async function rotuloDoAtor(
  ator: AtorDaAuditoria,
  cliente: ClienteDeAuditoria,
): Promise<{ usuarioId: string | null; usuarioRotulo: string }> {
  if (ator === 'sistema') return { usuarioId: null, usuarioRotulo: ROTULO_DO_SISTEMA }
  if (ator === 'visitante') return { usuarioId: null, usuarioRotulo: ROTULO_DO_VISITANTE }
  if ('email' in ator) return { usuarioId: ator.id, usuarioRotulo: `${ator.nome} <${ator.email}>` }
  const u = await cliente.usuario.findUnique({
    where: { id: ator.usuarioId },
    select: { id: true, nome: true, email: true },
  })
  return u
    ? { usuarioId: u.id, usuarioRotulo: `${u.nome} <${u.email}>` }
    : { usuarioId: null, usuarioRotulo: ROTULO_DE_USUARIO_REMOVIDO }
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
  return { ...linha, alvoNome: null, detalhes: lerDetalhes(linha.detalhes) }
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
  const { usuarioId, usuarioRotulo } = await rotuloDoAtor(evento.ator, cliente)
  const linha = await cliente.registroDeAuditoria.create({
    data: { usuarioId, usuarioRotulo, acao, alvoTipo, alvoId: evento.alvoId ?? null, detalhes },
  })
  return paraListado(linha)
}

const CHAVE_DAS_PENDENTES = Symbol.for('converse.auditoriaPendentes')

/** As gravações em andamento, em `globalThis`: valem para todas as cópias carregadas do módulo. */
function obterPendentes(): Set<Promise<unknown>> {
  const g = globalThis as unknown as Record<symbol, Set<Promise<unknown>> | undefined>
  return (g[CHAVE_DAS_PENDENTES] ??= new Set())
}

/**
 * Grava sem nunca lançar (PR-87): falha vira a linha de log `auditoria_falhou`, com a ação
 * e o nome do erro, sem detalhes nem a mensagem do erro. Devolve quando a gravação termina.
 */
export function registrarMelhorEsforco(
  evento: EventoDeAuditoria | (() => Promise<EventoDeAuditoria>),
  acaoParaOLog = 'desconhecida',
): Promise<void> {
  const tarefa = Promise.resolve()
    .then(() => (typeof evento === 'function' ? evento() : evento))
    .then(async (e) => {
      acaoParaOLog = typeof e.acao === 'string' ? e.acao : acaoParaOLog
      await registrar(e)
    })
    .catch((erro: unknown) => {
      log.erro('auditoria_falhou', { acao: acaoParaOLog, ...camposDoErro(erro) })
    })
  const pendentes = obterPendentes()
  pendentes.add(tarefa)
  void tarefa.finally(() => pendentes.delete(tarefa))
  return tarefa
}

/** Espera as gravações de melhor esforço em andamento (os testes, e o desligamento limpo). */
export async function aguardarGravacoesPendentes(): Promise<void> {
  const pendentes = obterPendentes()
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

/**
 * Lista os registros, do mais recente ao mais antigo, com filtros e paginação. Só admin (PR-12, PR-104): o papel é
 * conferido aqui, no serviço, antes de qualquer consulta ou validação, e não só pela página. Sem ator é 401,
 * usuário comum é 403, entrada inválida é 422.
 */
export async function listar(autor: UsuarioAutenticado, entrada: FiltrosDaAuditoria = {}): Promise<PaginaDaAuditoria> {
  if (!autor?.id) throw naoAutenticado()
  exigirAdmin(autor)
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
  // O nome atual dos usuários alvo, numa consulta só (a tela diz "Alterou o papel de Maria").
  const idsDeUsuario = [...new Set(linhas.filter((l) => l.alvoTipo === 'usuario' && l.alvoId).map((l) => l.alvoId as string))]
  const nomes = new Map(
    idsDeUsuario.length === 0
      ? []
      : (await prisma.usuario.findMany({ where: { id: { in: idsDeUsuario } }, select: { id: true, nome: true } })).map((u) => [u.id, u.nome] as const),
  )
  return {
    itens: linhas.map((l) => ({
      ...paraListado(l),
      alvoNome: l.alvoTipo === 'usuario' && l.alvoId ? (nomes.get(l.alvoId) ?? null) : null,
    })),
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
