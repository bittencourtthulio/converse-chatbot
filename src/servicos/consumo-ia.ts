import { prisma } from '@/lib/prisma'
import { exigirAdmin, type UsuarioAutenticado } from '@/servicos/autenticacao'

export const PERIODOS_DE_CONSUMO = [7, 15, 30, 90] as const
const TAMANHO_DA_PAGINA = 50

/** Períodos móveis de 24h até agora; todos os KPIs abrangem o período inteiro.
 * A transação mantém os totais e o histórico na mesma fotografia do banco.
 */
export async function obterConsumoDeIA(
  usuario: UsuarioAutenticado,
  entrada: { dias?: number; pagina?: number; agora?: Date } = {},
) {
  exigirAdmin(usuario)
  const dias = PERIODOS_DE_CONSUMO.find(d => d === entrada.dias) ?? 7
  const ate = entrada.agora ?? new Date()
  const de = new Date(ate.getTime() - dias * 86_400_000)
  const paginaPedida = Number.isSafeInteger(entrada.pagina) && entrada.pagina! > 0 ? entrada.pagina! : 1
  const where = { iniciadoEm: { gte: de, lte: ate } }

  return prisma.$transaction(async tx => {
    const [resumo, estados, modelos, funcoes, geracoesComCusto] = await Promise.all([
      tx.chamadaDeIA.aggregate({ where, _count: { _all: true, custoUsd: true },
        _sum: { custoUsd: true, tokensEntrada: true, tokensSaida: true, tokensTotal: true } }),
      tx.chamadaDeIA.groupBy({ by: ['status'], where, _count: { _all: true } }),
      tx.chamadaDeIA.groupBy({ by: ['modelo'], where, _count: { _all: true, custoUsd: true },
        _sum: { custoUsd: true }, orderBy: { _sum: { custoUsd: 'desc' } } }),
      tx.chamadaDeIA.groupBy({ by: ['funcao'], where, _count: { _all: true, custoUsd: true },
        _sum: { custoUsd: true }, orderBy: { _sum: { custoUsd: 'desc' } } }),
      tx.chamadaDeIA.count({ where: { ...where, caminho: '/chat/completions', custoUsd: { not: null } } }),
    ])
    const total = resumo._count._all
    const totalDePaginas = Math.max(1, Math.ceil(total / TAMANHO_DA_PAGINA))
    const pagina = Math.min(paginaPedida, totalDePaginas)
    const itens = await tx.chamadaDeIA.findMany({ where,
      orderBy: [{ iniciadoEm: 'desc' }, { id: 'desc' }],
      skip: (pagina - 1) * TAMANHO_DA_PAGINA, take: TAMANHO_DA_PAGINA,
    })
    const quantidade = (status: string) => estados.find(e => e.status === status)?._count._all ?? 0
    const custoTotalUsd = resumo._sum.custoUsd ?? 0
    return {
      dias, de, ate, pagina, tamanho: TAMANHO_DA_PAGINA, totalDePaginas, total, itens,
      custoTotalUsd, custosNaoInformados: total - resumo._count.custoUsd,
      custoMedioUsd: geracoesComCusto > 0 ? custoTotalUsd / geracoesComCusto : null,
      tokensEntrada: resumo._sum.tokensEntrada ?? 0, tokensSaida: resumo._sum.tokensSaida ?? 0,
      tokensTotal: resumo._sum.tokensTotal ?? 0,
      erros: quantidade('erro'), canceladas: quantidade('cancelada'), emAndamento: quantidade('em_andamento'),
      porModelo: modelos.map(m => ({ modelo: m.modelo, chamadas: m._count._all,
        custoUsd: m._sum.custoUsd ?? 0, custosNaoInformados: m._count._all - m._count.custoUsd })),
      porFuncao: funcoes.map(f => ({ funcao: f.funcao, chamadas: f._count._all,
        custoUsd: f._sum.custoUsd ?? 0, custosNaoInformados: f._count._all - f._count.custoUsd })),
    }
  })
}

export type ConsumoDeIA = Awaited<ReturnType<typeof obterConsumoDeIA>>
