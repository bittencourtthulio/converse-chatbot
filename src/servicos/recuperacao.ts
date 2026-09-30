// Recuperação de trechos da base de conhecimento (FT-05, PR-04, PR-51).
// Camada de aplicação: busca textual do SQLite (FTS5, ranking BM25) sobre o
// índice `trechos_fts`, mantido por gatilhos da migration `busca_fts5`.
//
// SQL cru só por `prisma.$queryRaw` com template tagueado: a expressão MATCH já
// limpa e o `agenteId` vão como parâmetros; o texto do usuário nunca é
// concatenado em SQL (PR-13, PR-30).
import { prisma } from '@/lib/prisma'
import { LIMITE_DE_TERMOS, extrairTermos, montarExpressaoMatch } from '@/servicos/recuperacao-termos'

export { extrairTermos, montarExpressaoMatch } from '@/servicos/recuperacao-termos'

/** Padrão e teto de trechos devolvidos (PR-51). */
export const LIMITE_DE_TRECHOS = 6
/** Com até este número de termos próprios, a pergunta é de continuação. */
export const TERMOS_DE_CONTINUACAO = 2

export interface TrechoEncontrado {
  trechoId: string
  fonteId: string
  /** Título da fonte. */
  titulo: string
  /** Posição do trecho na fonte, a partir de 1. */
  posicao: number
  texto: string
  /** BM25 com o sinal trocado: maior é mais relevante. */
  pontuacao: number
}

export interface OpcoesDaBusca {
  /** Quantos trechos no máximo; nunca passa de 6. */
  limite?: number
  /** A pergunta anterior de quem pergunta, para perguntas de continuação. */
  perguntaAnterior?: string
}

interface LinhaDaBusca {
  trechoId: string
  fonteId: string
  titulo: string
  indice: number | bigint
  texto: string
  bm25: number
}

function termosDaConsulta(pergunta: string, anterior?: string): string[] {
  const termos = extrairTermos(pergunta)
  // Continuação ("e o preço?"): poucos termos próprios, mas algum. Sem termo
  // nenhum (saudação) não se busca nada, nem com a pergunta anterior.
  if (anterior && termos.length > 0 && termos.length <= TERMOS_DE_CONTINUACAO) {
    for (const termo of extrairTermos(anterior)) {
      if (termos.length >= LIMITE_DE_TERMOS) break
      if (!termos.includes(termo)) termos.push(termo)
    }
  }
  return termos
}

/**
 * Os trechos mais relevantes para a pergunta, só de fontes `pronto` do agente,
 * do mais para o menos relevante. Pergunta sem termo significativo devolve
 * lista vazia sem consultar o banco; o texto da pergunta nunca faz a consulta
 * falhar por sintaxe.
 */
export async function buscarTrechos(
  agenteId: string,
  pergunta: string,
  opcoes: OpcoesDaBusca = {},
): Promise<TrechoEncontrado[]> {
  const expressao = montarExpressaoMatch(termosDaConsulta(pergunta, opcoes.perguntaAnterior))
  if (expressao === '') return []
  const limite = Math.min(Math.max(Math.trunc(opcoes.limite ?? LIMITE_DE_TRECHOS), 1), LIMITE_DE_TRECHOS)

  const linhas = await prisma.$queryRaw<LinhaDaBusca[]>`
    SELECT t.id AS trechoId, t.fonteId AS fonteId, f.titulo AS titulo,
           t.indice AS indice, t.texto AS texto, bm25(trechos_fts) AS bm25
    FROM trechos_fts
    JOIN trechos t ON t.rowid = trechos_fts.rowid
    JOIN fontes f ON f.id = t.fonteId
    WHERE trechos_fts MATCH ${expressao}
      AND t.agenteId = ${agenteId}
      AND f.status = 'pronto'
    ORDER BY bm25(trechos_fts), t.fonteId, t.indice
    LIMIT ${limite}`

  return linhas.map((l) => ({
    trechoId: l.trechoId,
    fonteId: l.fonteId,
    titulo: l.titulo,
    posicao: Number(l.indice) + 1,
    texto: l.texto,
    pontuacao: -Number(l.bm25),
  }))
}
