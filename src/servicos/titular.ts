// Direitos do titular dos dados, pelo admin (FT-10, PR-18, PR-90, D-24): buscar as conversas de
// uma pessoa por canal e identificador, exportá-las (JSON ou TXT) e apagá-las todas. Só admin.
//
// O identificador completo nunca aparece: nem no resultado da busca, nem no arquivo exportado,
// nem no nome dele, nem na auditoria. No chat embutido o admin informa o id do visitante ou um
// prefixo de 6 ou mais caracteres (os 6 primeiros são o que a lista de conversas mostra,
// PR-78) e a busca só segue para exportar ou apagar quando o prefixo resolve a um titular
// único; senão devolve a lista com um prefixo maior de cada um, para desambiguar. No Telegram
// o identificador é o id numérico do chat, exato.
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { entradaInvalida, naoEncontrado } from '@/lib/erros'
import { exigirAdmin, type UsuarioAutenticado } from '@/servicos/autenticacao'
import { registrarMelhorEsforco } from '@/servicos/auditoria'
import { lerFontesGravadas } from '@/servicos/fontes-da-resposta'
import { apagarConversasDe } from '@/servicos/historico'
import { rotuloDoCanal, rotuloDoInterlocutor } from '@/servicos/historico-logica'

export const CANAIS_DO_TITULAR = ['widget', 'telegram'] as const
export type CanalDoTitular = (typeof CANAIS_DO_TITULAR)[number]
export const FORMATOS_DE_EXPORTACAO = ['json', 'txt'] as const
export type FormatoDeExportacao = (typeof FORMATOS_DE_EXPORTACAO)[number]

/** O prefixo mínimo do visitante: o que a lista de conversas já mostra. */
export const PREFIXO_MINIMO_DO_VISITANTE = 6
/** O prefixo mais longo que a desambiguação mostra de cada visitante. */
export const PREFIXO_DA_DESAMBIGUACAO = 10
/** No máximo estes titulares na lista de desambiguação. */
export const MAXIMO_DE_TITULARES_LISTADOS = 10
const MAXIMO_DE_CANDIDATOS = 50

const MENSAGEM_DO_VISITANTE = `Informe ao menos ${PREFIXO_MINIMO_DO_VISITANTE} caracteres do identificador do visitante (letras, números, - e _).`
const MENSAGEM_DO_TELEGRAM = 'O identificador do Telegram é o número do chat.'

const esquemaDoCriterio = z
  .object({
    canal: z.enum(CANAIS_DO_TITULAR, { message: 'Escolha o canal: chat embutido ou Telegram.' }),
    identificador: z.string({ message: 'Informe o identificador.' }).trim(),
  })
  .superRefine((v, ctx) => {
    const ok = v.canal === 'widget' ? /^[A-Za-z0-9_-]{6,64}$/.test(v.identificador) : /^-?\d{1,20}$/.test(v.identificador)
    if (!ok) ctx.addIssue({ code: 'custom', path: ['identificador'], message: v.canal === 'widget' ? MENSAGEM_DO_VISITANTE : MENSAGEM_DO_TELEGRAM })
  })

export interface CriterioDoTitular {
  canal: string
  identificador: string
}

function lerCriterio(entrada: unknown): { canal: CanalDoTitular; identificador: string } {
  const r = esquemaDoCriterio.safeParse(entrada)
  if (!r.success) throw entradaInvalida(r.error.issues[0]?.message ?? 'Entrada inválida.')
  return r.data
}

export interface TitularEncontrado {
  /** "Visitante abc123" ou o nome público do Telegram ("Telegram: Maria"). */
  rotulo: string
  /** Os 10 primeiros caracteres do visitante, para desambiguar; nulo no Telegram. */
  prefixo: string | null
  conversas: number
  mensagens: number
  ultimaAtividade: Date
  agentes: string[]
}

export interface ResultadoDaBusca {
  estado: 'nenhum' | 'unico' | 'varios'
  titulares: TitularEncontrado[]
}

/** Os identificadores completos que casam com o critério (uso interno: nunca saem do serviço). */
async function identificadoresQueCasam(canal: CanalDoTitular, identificador: string): Promise<string[]> {
  if (canal === 'telegram') {
    const existe = await prisma.conversa.findFirst({ where: { canal, identificadorExterno: identificador }, select: { id: true } })
    return existe ? [identificador] : []
  }
  const candidatos = await prisma.conversa.findMany({
    where: { canal, identificadorExterno: { startsWith: identificador } },
    select: { identificadorExterno: true },
    distinct: ['identificadorExterno'],
    take: MAXIMO_DE_CANDIDATOS,
  })
  // O LIKE do banco trata `_` como curinga: a conferência exata é aqui.
  return candidatos
    .map((c) => c.identificadorExterno)
    .filter((id): id is string => id !== null && id.startsWith(identificador))
}

async function resolverTitular(canal: CanalDoTitular, identificador: string): Promise<string> {
  const ids = await identificadoresQueCasam(canal, identificador)
  if (ids.length === 0) throw naoEncontrado('Nenhum titular encontrado com esse identificador.')
  if (ids.length > 1) throw entradaInvalida('Mais de um titular combina com esse identificador. Informe mais caracteres.')
  return ids[0] as string
}

/** Busca os titulares que casam e diz se há nenhum, um ou vários (e neste caso lista para desambiguar). */
export async function buscarTitular(autor: UsuarioAutenticado, entrada: unknown): Promise<ResultadoDaBusca> {
  exigirAdmin(autor)
  const { canal, identificador } = lerCriterio(entrada)
  const ids = await identificadoresQueCasam(canal, identificador)
  if (ids.length === 0) return { estado: 'nenhum', titulares: [] }

  const conversas = await prisma.conversa.findMany({
    where: { canal, identificadorExterno: { in: ids } },
    select: {
      identificadorExterno: true,
      titulo: true,
      atualizadoEm: true,
      agente: { select: { nome: true } },
      _count: { select: { mensagens: true } },
    },
    orderBy: { atualizadoEm: 'desc' },
  })
  const porId = new Map<string, TitularEncontrado>()
  for (const c of conversas) {
    const id = c.identificadorExterno as string
    const atual = porId.get(id)
    if (atual) {
      atual.conversas += 1
      atual.mensagens += c._count.mensagens
      if (!atual.agentes.includes(c.agente.nome)) atual.agentes.push(c.agente.nome)
    } else {
      porId.set(id, {
        // A lista vem da mais recente: o título e a última atividade são os dela.
        rotulo: rotuloDoInterlocutor({ canal, identificadorExterno: id, titulo: c.titulo, nomeDoUsuario: null }),
        prefixo: canal === 'widget' ? id.slice(0, PREFIXO_DA_DESAMBIGUACAO) : null,
        conversas: 1,
        mensagens: c._count.mensagens,
        ultimaAtividade: c.atualizadoEm,
        agentes: [c.agente.nome],
      })
    }
  }
  const titulares = [...porId.values()]
    .sort((a, b) => b.ultimaAtividade.getTime() - a.ultimaAtividade.getTime())
    .slice(0, MAXIMO_DE_TITULARES_LISTADOS)
  return { estado: ids.length === 1 ? 'unico' : 'varios', titulares }
}

export interface ArquivoExportado {
  nomeDoArquivo: string
  tipo: string
  conteudo: string
  conversas: number
  mensagens: number
}

const formatoDeData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium' })

/**
 * Exporta todas as conversas do titular (que precisa ser único) em JSON ou TXT, com as mensagens
 * e os títulos das fontes citadas, sem o identificador. Grava `dados_do_titular_exportados`.
 */
export async function exportarTitular(
  autor: UsuarioAutenticado,
  entrada: unknown,
  /** Só para o teste fixar a data do nome do arquivo. */
  agora: Date = new Date(),
): Promise<ArquivoExportado> {
  exigirAdmin(autor)
  const bruto = (typeof entrada === 'object' && entrada !== null ? entrada : {}) as Record<string, unknown>
  const { canal, identificador } = lerCriterio(bruto)
  const formato = bruto.formato
  if (formato !== 'json' && formato !== 'txt') throw entradaInvalida('Escolha o formato da exportação: JSON ou TXT.')
  const quando = agora

  const id = await resolverTitular(canal, identificador)
  const conversas = await prisma.conversa.findMany({
    where: { canal, identificadorExterno: id },
    orderBy: { criadoEm: 'asc' },
    include: { agente: { select: { nome: true } }, mensagens: { orderBy: { criadoEm: 'asc' } } },
  })
  const totalDeMensagens = conversas.reduce((soma, c) => soma + c.mensagens.length, 0)
  const rotulo = rotuloDoInterlocutor({ canal, identificadorExterno: id, titulo: conversas[0]?.titulo ?? null, nomeDoUsuario: null })

  const estruturadas = conversas.map((c) => ({
    agente: c.agente.nome,
    inicio: c.criadoEm.toISOString(),
    ultimaAtividade: c.atualizadoEm.toISOString(),
    mensagens: c.mensagens.map((m) => ({
      quando: m.criadoEm.toISOString(),
      autor: m.papel === 'assistant' ? 'agente' : 'titular',
      texto: m.conteudo,
      fontes: lerFontesGravadas(m.fontes).map((f) => f.titulo),
    })),
  }))

  const dia = quando.toISOString().slice(0, 10)
  let conteudo: string
  if (formato === 'json') {
    conteudo = JSON.stringify(
      { exportadoEm: quando.toISOString(), canal: rotuloDoCanal(canal), titular: rotulo, conversas: estruturadas },
      null,
      2,
    )
  } else {
    const linhas = [
      `Dados do titular - ${rotuloDoCanal(canal)}`,
      `Titular: ${rotulo}`,
      `Exportado em: ${formatoDeData.format(quando)}`,
      `Conversas: ${conversas.length}`,
      `Mensagens: ${totalDeMensagens}`,
      '',
    ]
    for (const c of conversas) {
      linhas.push(`=== Conversa com o agente "${c.agente.nome}" ===`)
      linhas.push(`Início: ${formatoDeData.format(c.criadoEm)}`)
      linhas.push(`Última atividade: ${formatoDeData.format(c.atualizadoEm)}`, '')
      for (const m of c.mensagens) {
        linhas.push(`[${formatoDeData.format(m.criadoEm)}] ${m.papel === 'assistant' ? 'Agente' : 'Titular'}:`)
        linhas.push(m.conteudo)
        const fontes = lerFontesGravadas(m.fontes)
        if (fontes.length > 0) linhas.push(`Fontes: ${fontes.map((f) => f.titulo).join('; ')}`)
        linhas.push('')
      }
    }
    conteudo = linhas.join('\n')
  }

  void registrarMelhorEsforco({
    ator: autor,
    acao: 'dados_do_titular_exportados',
    alvoTipo: 'titular',
    detalhes: { canal, conversas: conversas.length, mensagens: totalDeMensagens, formato },
  })
  return {
    nomeDoArquivo: `titular-${canal}-${dia}.${formato}`,
    tipo: formato === 'json' ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
    conteudo,
    conversas: conversas.length,
    mensagens: totalDeMensagens,
  }
}

/**
 * Apaga todas as conversas do titular (que precisa ser único), com as mensagens em cascata.
 * Avisa `aoApagarConversa` por conversa e grava o resumo `dados_do_titular_apagados`.
 */
export async function apagarDoTitular(
  autor: UsuarioAutenticado,
  entrada: unknown,
): Promise<{ conversas: number; mensagens: number }> {
  exigirAdmin(autor)
  const { canal, identificador } = lerCriterio(entrada)
  const id = await resolverTitular(canal, identificador)
  const r = await apagarConversasDe({ canal, identificadorExterno: id }, { usuarioId: autor.id, origem: 'titular' })
  void registrarMelhorEsforco({
    ator: autor,
    acao: 'dados_do_titular_apagados',
    alvoTipo: 'titular',
    detalhes: { canal, conversas: r.conversas, mensagens: r.mensagens },
  })
  return r
}
