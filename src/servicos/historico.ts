// Histórico de conversas (FT-09): lê as conversas de todos os canais, com filtros e
// paginação, sem N+1. Camada de aplicação: não conhece sessão nem HTTP; quem chama
// (página, handler) já exigiu usuário autenticado, e qualquer usuário autenticado lê
// tudo (PR-12). O rótulo do interlocutor é sempre mascarado (PR-78).
//
// SQL cru só por `prisma.$queryRaw` com template tagueado: nenhum valor vindo do usuário é
// concatenado em SQL (PR-13, PR-79).
import { Prisma } from '@/gerado/prisma/client'
import { prisma } from '@/lib/prisma'
import {
  LIMITE_DE_CASADAS,
  escaparLike,
  instanteParaSql,
  lerFiltros,
  previaDaMensagem,
  rotuloDoInterlocutor,
  type FiltrosDoHistorico,
} from '@/servicos/historico-logica'

export interface ItemDoHistorico {
  id: string
  agenteId: string
  agenteNome: string
  canal: string
  /** Quem conversou, mascarado (PR-78). */
  rotulo: string
  totalDeMensagens: number
  atualizadoEm: Date
  /** Início da última mensagem, até 120 caracteres. */
  previa: string
}

export interface PaginaDoHistorico {
  itens: ItemDoHistorico[]
  total: number
  pagina: number
  tamanho: number
  totalDePaginas: number
}

interface LinhaDoHistorico {
  id: string
  agenteId: string
  agenteNome: string
  canal: string
  identificadorExterno: string | null
  titulo: string | null
  usuarioNome: string | null
  atualizadoEm: Date | string
  totalDeMensagens: number | bigint
  ultima: string | null
}

/** As condições do WHERE da listagem; cada valor vai como parâmetro. */
function condicoes(f: FiltrosDoHistorico): Prisma.Sql {
  const partes: Prisma.Sql[] = []
  if (f.agenteId !== undefined) partes.push(Prisma.sql`c.agenteId = ${f.agenteId}`)
  if (f.canal !== undefined) partes.push(Prisma.sql`c.canal = ${f.canal}`)
  if (f.de !== undefined) partes.push(Prisma.sql`c.atualizadoEm >= ${instanteParaSql(f.de)}`)
  if (f.ate !== undefined) partes.push(Prisma.sql`c.atualizadoEm < ${instanteParaSql(f.ate)}`)
  if (f.texto !== undefined) {
    // `%`, `_` e `\` do usuário viram literais; o padrão inteiro vai como parâmetro (PR-79).
    const padrao = `%${escaparLike(f.texto)}%`
    partes.push(
      Prisma.sql`EXISTS (SELECT 1 FROM mensagens mt WHERE mt.conversaId = c.id AND mt.conteudo LIKE ${padrao} ESCAPE '\\')`,
    )
  }
  return partes.length === 0 ? Prisma.sql`1 = 1` : Prisma.join(partes, ' AND ')
}

/**
 * O universo da listagem. Com texto, só as 200 conversas casadas de atividade mais recente
 * entram (PR-79): a varredura de `Mensagem.conteudo` não tem índice e o teto a limita.
 */
function universo(f: FiltrosDoHistorico): Prisma.Sql {
  const onde = condicoes(f)
  if (f.texto === undefined) return onde
  return Prisma.sql`${onde} AND c.id IN (
    SELECT id FROM (
      SELECT c.id AS id FROM conversas c WHERE ${onde}
      ORDER BY c.atualizadoEm DESC, c.id DESC LIMIT ${LIMITE_DE_CASADAS}))`
}

/**
 * As conversas de todos os canais, a de atividade mais recente primeiro. Duas consultas, não
 * importa o tamanho da página: a que traz a página (contagem de mensagens e prévia por
 * subconsulta correlacionada) e a que conta o total.
 */
export async function listarConversas(entrada: unknown): Promise<PaginaDoHistorico> {
  const filtros = lerFiltros(entrada)
  const onde = universo(filtros)
  const deslocamento = (filtros.pagina - 1) * filtros.tamanho

  const linhas = await prisma.$queryRaw<LinhaDoHistorico[]>`
    SELECT c.id AS id, c.agenteId AS agenteId, a.nome AS agenteNome, c.canal AS canal,
           c.identificadorExterno AS identificadorExterno, c.titulo AS titulo,
           u.nome AS usuarioNome, c.atualizadoEm AS atualizadoEm,
           (SELECT COUNT(*) FROM mensagens m WHERE m.conversaId = c.id) AS totalDeMensagens,
           (SELECT m2.conteudo FROM mensagens m2 WHERE m2.conversaId = c.id
             ORDER BY m2.criadoEm DESC, m2.id DESC LIMIT 1) AS ultima
    FROM conversas c
    JOIN agentes a ON a.id = c.agenteId
    LEFT JOIN usuarios u ON u.id = c.criadoPorId
    WHERE ${onde}
    ORDER BY c.atualizadoEm DESC, c.id DESC
    LIMIT ${filtros.tamanho} OFFSET ${deslocamento}`

  const [contagem] = await prisma.$queryRaw<Array<{ total: number | bigint }>>`
    SELECT COUNT(*) AS total FROM conversas c WHERE ${onde}`
  const total = Number(contagem?.total ?? 0)

  return {
    itens: linhas.map((l) => ({
      id: l.id,
      agenteId: l.agenteId,
      agenteNome: l.agenteNome,
      canal: l.canal,
      rotulo: rotuloDoInterlocutor({
        canal: l.canal,
        identificadorExterno: l.identificadorExterno,
        titulo: l.titulo,
        nomeDoUsuario: l.usuarioNome,
      }),
      totalDeMensagens: Number(l.totalDeMensagens),
      atualizadoEm: new Date(l.atualizadoEm),
      previa: previaDaMensagem(l.ultima),
    })),
    total,
    pagina: filtros.pagina,
    tamanho: filtros.tamanho,
    totalDePaginas: Math.max(1, Math.ceil(total / filtros.tamanho)),
  }
}
