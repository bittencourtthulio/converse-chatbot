// Histórico de conversas (FT-09): lê as conversas de todos os canais, com filtros e
// paginação, sem N+1. Camada de aplicação: não conhece sessão nem HTTP; quem chama
// (página, handler) já exigiu usuário autenticado, e qualquer usuário autenticado lê
// tudo (PR-12). O rótulo do interlocutor é sempre mascarado (PR-78).
//
// SQL cru só por `prisma.$queryRaw` com template tagueado: nenhum valor vindo do usuário é
// concatenado em SQL (PR-13, PR-79).
import { Prisma } from '@/gerado/prisma/client'
import { prisma } from '@/lib/prisma'
import { entradaInvalida, naoEncontrado } from '@/lib/erros'
import { lerFontesGravadas, type FonteDaResposta } from '@/servicos/fontes-da-resposta'
import {
  LIMITE_DE_CASADAS,
  LIMITE_DO_LOTE,
  escaparLike,
  instanteParaSql,
  lerFiltros,
  previaDaMensagem,
  rotuloDoCanal,
  rotuloDoInterlocutor,
  type FiltrosDoHistorico,
} from '@/servicos/historico-logica'
import { log } from '@/lib/log'

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

export interface MensagemDoHistorico {
  id: string
  papel: 'user' | 'assistant'
  conteudo: string
  criadoEm: Date
  /** Modelo que respondeu (só nas respostas). */
  modelo: string | null
  /** De onde veio a resposta (FT-05); vazio quando não houve trechos. */
  fontes: FonteDaResposta[]
}

export interface ConversaDoHistorico {
  id: string
  agenteId: string
  agenteNome: string
  canal: string
  rotulo: string
  criadoEm: Date
  atualizadoEm: Date
  totalDeMensagens: number
  mensagens: MensagemDoHistorico[]
}

/** A conversa com todas as mensagens em ordem cronológica; id inexistente é 404. */
export async function obterConversa(id: string): Promise<ConversaDoHistorico> {
  const conversa = await prisma.conversa.findUnique({
    where: { id },
    include: {
      agente: { select: { nome: true } },
      criadoPor: { select: { nome: true } },
      mensagens: { orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }] },
    },
  })
  if (!conversa) throw naoEncontrado('Conversa não encontrada.')
  return {
    id: conversa.id,
    agenteId: conversa.agenteId,
    agenteNome: conversa.agente.nome,
    canal: conversa.canal,
    rotulo: rotuloDoInterlocutor({
      canal: conversa.canal,
      identificadorExterno: conversa.identificadorExterno,
      titulo: conversa.titulo,
      nomeDoUsuario: conversa.criadoPor?.nome ?? null,
    }),
    criadoEm: conversa.criadoEm,
    atualizadoEm: conversa.atualizadoEm,
    totalDeMensagens: conversa.mensagens.length,
    mensagens: conversa.mensagens.map((m) => ({
      id: m.id,
      papel: m.papel === 'assistant' ? ('assistant' as const) : ('user' as const),
      conteudo: m.conteudo,
      criadoEm: m.criadoEm,
      modelo: m.modelo,
      fontes: lerFontesGravadas(m.fontes),
    })),
  }
}

const formatoDeData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium' })

/**
 * A conversa em texto simples e legível (PR-83). O nome do arquivo usa só o id interno da
 * conversa; o texto traz o rótulo mascarado e os títulos das fontes, nunca o identificador
 * externo nem o texto dos trechos.
 */
export async function exportarConversaTexto(id: string): Promise<{ nomeDoArquivo: string; texto: string }> {
  const c = await obterConversa(id)
  const linhas = [
    `Conversa com o agente "${c.agenteNome}"`,
    `Canal: ${rotuloDoCanal(c.canal)} (${c.canal})`,
    `Interlocutor: ${c.rotulo}`,
    `Início: ${formatoDeData.format(c.criadoEm)}`,
    `Última atividade: ${formatoDeData.format(c.atualizadoEm)}`,
    `Mensagens: ${c.totalDeMensagens}`,
    '',
  ]
  for (const m of c.mensagens) {
    linhas.push(`[${formatoDeData.format(m.criadoEm)}] ${m.papel === 'assistant' ? 'Agente' : c.rotulo}:`)
    linhas.push(m.conteudo)
    if (m.fontes.length > 0) linhas.push(`Fontes: ${m.fontes.map((f) => f.titulo).join('; ')}`)
    linhas.push('')
  }
  return { nomeDoArquivo: `conversa-${c.id}.txt`, texto: linhas.join('\n') }
}

/**
 * O que o ponto de extensão da auditoria (FT-10) recebe a cada conversa apagada. Nunca o
 * conteúdo das mensagens nem o identificador externo do visitante ou do chat (PR-80).
 */
export interface ConversaApagada {
  conversaId: string
  agenteId: string
  canal: string
  /** Quem pediu; nulo quando foi o próprio visitante (FT-10, PR-90). */
  usuarioId: string | null
  quantidadeDeMensagens: number
  /**
   * De onde veio o pedido, quando não é um usuário do painel (FT-10, D-23): `titular` é a
   * exclusão de todos os dados de um titular pelo admin (a auditoria registra o resumo) e
   * `visitante` é o visitante apagando a própria conversa. Ausente: um usuário do painel.
   */
  origem?: 'titular' | 'visitante'
}

const CHAVE_DOS_OUVINTES = Symbol.for('converse.ouvintesDeConversaApagada')

/**
 * O conjunto de ouvintes mora em `globalThis`: o Next pode carregar este módulo mais de uma
 * vez (a subida em `instrumentation.ts` e os handlers), e a auditoria precisa ser vista por
 * todos (FT-10, PR-86).
 */
function obterOuvintes(): Set<(apagada: ConversaApagada) => void> {
  const g = globalThis as unknown as Record<symbol, Set<(apagada: ConversaApagada) => void> | undefined>
  return (g[CHAVE_DOS_OUVINTES] ??= new Set())
}

/**
 * Ponto de extensão da FT-10: registra um ouvinte das conversas apagadas e devolve a função
 * que o remove. Ouvinte que lança não derruba a exclusão (que já foi confirmada no banco).
 */
export function aoApagarConversa(ouvinte: (apagada: ConversaApagada) => void): () => void {
  const conjunto = obterOuvintes()
  conjunto.add(ouvinte)
  return () => void conjunto.delete(ouvinte)
}

function avisarExclusao(apagada: ConversaApagada): void {
  for (const ouvinte of [...obterOuvintes()]) {
    try {
      ouvinte(apagada)
    } catch {
      log.erro('ouvinte_de_exclusao_falhou', { conversaId: apagada.conversaId })
    }
  }
}

function lerIds(ids: unknown): string[] {
  if (!Array.isArray(ids) || ids.length === 0) throw entradaInvalida('Escolha ao menos uma conversa para apagar.')
  if (!ids.every((id) => typeof id === 'string' && id.trim() !== '' && id.length <= 100)) {
    throw entradaInvalida('Identificador de conversa inválido.')
  }
  const unicos = [...new Set(ids as string[])]
  if (unicos.length > LIMITE_DO_LOTE) {
    throw entradaInvalida(`Apague no máximo ${LIMITE_DO_LOTE} conversas por vez.`)
  }
  return unicos
}

/**
 * Apaga as conversas pedidas (e, em cascata, as mensagens) numa transação, só as que existem,
 * e devolve quantas apagou. Avisa o ouvinte depois de confirmada a exclusão. `usuarioId` é
 * quem pediu, vindo da sessão (a verificação é de quem chama).
 */
export async function apagarConversas(ids: unknown, usuarioId: string): Promise<number> {
  const pedidas = lerIds(ids)
  const apagadas = await prisma.$transaction(async (tx) => {
    const existentes = await tx.conversa.findMany({
      where: { id: { in: pedidas } },
      select: { id: true, agenteId: true, canal: true, _count: { select: { mensagens: true } } },
    })
    if (existentes.length === 0) return []
    await tx.conversa.deleteMany({ where: { id: { in: existentes.map((c) => c.id) } } })
    return existentes
  })
  for (const c of apagadas) {
    avisarExclusao({
      conversaId: c.id,
      agenteId: c.agenteId,
      canal: c.canal,
      usuarioId,
      quantidadeDeMensagens: c._count.mensagens,
    })
  }
  return apagadas.length
}

/** Apaga uma conversa; id inexistente é 404 e ninguém é avisado. */
export async function apagarConversa(id: string, usuarioId: string): Promise<void> {
  if ((await apagarConversas([id], usuarioId)) === 0) throw naoEncontrado('Conversa não encontrada.')
}

export interface CriterioDeExclusao {
  canal: string
  identificadorExterno: string
  /** Quando informado, só as conversas deste agente (o visitante apaga só o que é dele no agente). */
  agenteId?: string
}

/**
 * Apaga todas as conversas de um titular (`canal` mais `identificadorExterno`, e o agente se
 * informado) numa transação, com as mensagens em cascata, e avisa `aoApagarConversa` por
 * conversa com a origem (`titular` ou `visitante`, D-23). Devolve as contagens. Quem chama
 * (o serviço do titular, a API pública do visitante) já validou quem pode pedir isto.
 */
export async function apagarConversasDe(
  criterio: CriterioDeExclusao,
  quem: { usuarioId: string | null; origem: 'titular' | 'visitante' },
): Promise<{ conversas: number; mensagens: number }> {
  const where = {
    canal: criterio.canal,
    identificadorExterno: criterio.identificadorExterno,
    ...(criterio.agenteId !== undefined && { agenteId: criterio.agenteId }),
  }
  const apagadas = await prisma.$transaction(async (tx) => {
    const existentes = await tx.conversa.findMany({
      where,
      select: { id: true, agenteId: true, canal: true, _count: { select: { mensagens: true } } },
    })
    if (existentes.length === 0) return []
    await tx.conversa.deleteMany({ where })
    return existentes
  })
  let mensagens = 0
  for (const c of apagadas) {
    mensagens += c._count.mensagens
    avisarExclusao({
      conversaId: c.id,
      agenteId: c.agenteId,
      canal: c.canal,
      usuarioId: quem.usuarioId,
      quantidadeDeMensagens: c._count.mensagens,
      origem: quem.origem,
    })
  }
  return { conversas: apagadas.length, mensagens }
}
