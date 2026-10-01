// Painel inicial (FT-09, PR-81): os números, a série de mensagens por dia e, nas próximas
// funções, as conversas recentes, as fontes com erro e os primeiros passos. Camada de
// aplicação: sem sessão nem HTTP (quem chama já exigiu usuário autenticado).
//
// A agregação é SQL parametrizado (`$queryRaw`, PR-13): o dia é o do fuso do servidor, o
// mesmo do teto diário (PR-57), e o instante de "agora" é injetável para o teste. O
// `DateTime` do Prisma fica no SQLite como texto ISO em UTC (`tests/sqlite-formatos.test.ts`),
// e `strftime(..., 'localtime')` o converte para o dia local do processo.
import { prisma } from '@/lib/prisma'
import { CANAIS_DO_HISTORICO, instanteParaSql, type CanalDoHistorico } from '@/servicos/historico-logica'

export const DIAS_DOS_NUMEROS = 7
export const DIAS_DA_SERIE = 14

/** A meia-noite local do dia `base` deslocado de `dias` (vale na mudança de horário de verão). */
function inicioDoDiaLocal(base: Date, dias = 0): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + dias, 0, 0, 0, 0)
}

const doisDigitos = (n: number) => String(n).padStart(2, '0')

/** `AAAA-MM-DD` do dia local. */
export function chaveDoDia(d: Date): string {
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`
}

export interface NumerosPorCanal {
  canal: CanalDoHistorico
  /** Conversas com ao menos uma mensagem na janela. */
  conversas: number
  mensagens: number
}

export interface NumerosDoPainel {
  agentes: number
  fontesProntas: number
  fontesComErro: number
  /** Conversas com atividade (mensagem) nos últimos 7 dias. */
  conversas: number
  /** Mensagens dos últimos 7 dias. */
  mensagens: number
  porCanal: NumerosPorCanal[]
}

/** Agentes, fontes e a atividade dos últimos 7 dias (hoje e os 6 dias locais anteriores). */
export async function numerosDoPainel(agora: Date = new Date()): Promise<NumerosDoPainel> {
  const inicio = instanteParaSql(inicioDoDiaLocal(agora, -(DIAS_DOS_NUMEROS - 1)))
  const fim = instanteParaSql(inicioDoDiaLocal(agora, 1))

  const [agentes, porSituacao, porCanalBruto] = await Promise.all([
    prisma.agente.count(),
    prisma.fonte.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.$queryRaw<Array<{ canal: string; mensagens: number | bigint; conversas: number | bigint }>>`
      SELECT c.canal AS canal, COUNT(*) AS mensagens, COUNT(DISTINCT m.conversaId) AS conversas
      FROM mensagens m
      JOIN conversas c ON c.id = m.conversaId
      WHERE m.criadoEm >= ${inicio} AND m.criadoEm < ${fim}
      GROUP BY c.canal`,
  ])

  const situacao = (s: string) => porSituacao.find((g) => g.status === s)?._count._all ?? 0
  const porCanal = CANAIS_DO_HISTORICO.map((canal) => {
    const linha = porCanalBruto.find((l) => l.canal === canal)
    return { canal, conversas: Number(linha?.conversas ?? 0), mensagens: Number(linha?.mensagens ?? 0) }
  })
  return {
    agentes,
    fontesProntas: situacao('pronto'),
    fontesComErro: situacao('erro'),
    conversas: porCanal.reduce((s, c) => s + c.conversas, 0),
    mensagens: porCanal.reduce((s, c) => s + c.mensagens, 0),
    porCanal,
  }
}

export interface DiaDaSerie {
  /** `AAAA-MM-DD`, dia local do servidor. */
  dia: string
  mensagens: number
}

/** Mensagens por dia nos últimos 14 dias, do mais antigo a hoje, com os dias vazios em zero. */
export async function serieDeMensagens(agora: Date = new Date()): Promise<DiaDaSerie[]> {
  const inicio = inicioDoDiaLocal(agora, -(DIAS_DA_SERIE - 1))
  const fim = inicioDoDiaLocal(agora, 1)
  const linhas = await prisma.$queryRaw<Array<{ dia: string; n: number | bigint }>>`
    SELECT strftime('%Y-%m-%d', m.criadoEm, 'localtime') AS dia, COUNT(*) AS n
    FROM mensagens m
    WHERE m.criadoEm >= ${instanteParaSql(inicio)} AND m.criadoEm < ${instanteParaSql(fim)}
    GROUP BY dia`
  const porDia = new Map(linhas.map((l) => [l.dia, Number(l.n)]))
  return Array.from({ length: DIAS_DA_SERIE }, (_, i) => {
    const dia = chaveDoDia(inicioDoDiaLocal(agora, i - (DIAS_DA_SERIE - 1)))
    return { dia, mensagens: porDia.get(dia) ?? 0 }
  })
}
