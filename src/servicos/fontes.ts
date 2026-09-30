// Base de conhecimento (FT-04): fontes de um agente. Qualquer usuário
// autenticado gerencia qualquer fonte de qualquer agente (PR-12); a sessão é
// conferida na camada de apresentação e o serviço exige um autor. A visão que
// sai daqui nunca traz o caminho do arquivo em disco (PR-49).
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ambiente } from '@/lib/ambiente'
import { entradaInvalida, naoAutenticado, naoEncontrado } from '@/lib/erros'
import { criarArmazenamento } from '@/lib/armazenamento'
import { LIMITES } from '@/lib/extracao/limites'
import { mimeDoFormato } from '@/lib/extracao/formatos'
import { obterFila } from '@/servicos/fontes-fila'
import type { UsuarioAutenticado } from '@/servicos/autenticacao'

export const TRECHOS_POR_PAGINA = 20

const entradaDeTexto = z.object({
  titulo: z
    .string({ message: 'Informe o título do texto.' })
    .trim()
    .min(1, 'Informe o título do texto.')
    .max(LIMITES.tituloDoTexto, `O título pode ter até ${LIMITES.tituloDoTexto} caracteres.`),
  conteudo: z
    .string({ message: 'Informe o conteúdo do texto.' })
    .max(
      LIMITES.conteudoDoTexto,
      `O conteúdo pode ter até ${LIMITES.conteudoDoTexto.toLocaleString('pt-BR')} caracteres.`,
    )
    .refine((c) => c.trim().length > 0, 'Informe o conteúdo do texto.'),
})

export interface FonteVisivel {
  id: string
  agenteId: string
  tipo: string
  titulo: string
  nomeOriginal: string | null
  tipoMime: string | null
  tamanhoBytes: number
  status: string
  mensagemErro: string | null
  totalTrechos: number
  caracteres: number
  criadoEm: Date
  atualizadoEm: Date
  processadoEm: Date | null
}

export interface ResumoDaBase {
  total: number
  prontas: number
  /** `pendente` mais `processando`. */
  emProcessamento: number
  comErro: number
  /** Soma dos caracteres das fontes prontas. */
  caracteres: number
}

export interface TrechoVisivel {
  id: string
  indice: number
  texto: string
  caracteres: number
}

export interface PaginaDeTrechos {
  fonte: FonteVisivel
  trechos: TrechoVisivel[]
  pagina: number
  porPagina: number
  totalPaginas: number
  totalTrechos: number
}

export const armazenamentoPadrao = () => criarArmazenamento(ambiente.storageDir)

export function exigirAutor(autor: UsuarioAutenticado | null | undefined): asserts autor {
  if (!autor?.id) throw naoAutenticado()
}

/** O que a interface pode ver de uma fonte: tudo menos o caminho em disco. */
export function visaoDaFonte(f: FonteVisivel & Record<string, unknown>): FonteVisivel {
  return {
    id: f.id,
    agenteId: f.agenteId,
    tipo: f.tipo,
    titulo: f.titulo,
    nomeOriginal: f.nomeOriginal,
    tipoMime: f.tipoMime,
    tamanhoBytes: f.tamanhoBytes,
    status: f.status,
    mensagemErro: f.mensagemErro,
    totalTrechos: f.totalTrechos,
    caracteres: f.caracteres,
    criadoEm: f.criadoEm,
    atualizadoEm: f.atualizadoEm,
    processadoEm: f.processadoEm,
  }
}

export async function exigirAgente(agenteId: string): Promise<void> {
  const agente = await prisma.agente.findUnique({ where: { id: agenteId }, select: { id: true } })
  if (!agente) throw naoEncontrado('Agente não encontrado.')
}

/** O id da fonte é gerado aqui (não pelo banco) porque o arquivo é gravado antes da linha. */
export const novoIdDeFonte = () => randomUUID().replace(/-/g, '')

export async function adicionarTexto(
  autor: UsuarioAutenticado,
  agenteId: string,
  entrada: unknown,
): Promise<FonteVisivel> {
  exigirAutor(autor)
  const dados = entradaDeTexto.safeParse(entrada)
  if (!dados.success) throw entradaInvalida(dados.error.issues[0]?.message ?? 'Entrada inválida.')
  await exigirAgente(agenteId)

  const bytes = Buffer.from(dados.data.conteudo, 'utf8')
  const id = novoIdDeFonte()
  const armazenamento = armazenamentoPadrao()
  // Arquivo primeiro, linha depois (PR-47): se a linha falhar, o arquivo é apagado.
  const caminho = await armazenamento.gravar(agenteId, id, bytes)
  try {
    const fonte = await prisma.fonte.create({
      data: {
        id,
        agenteId,
        tipo: 'texto',
        titulo: dados.data.titulo,
        tipoMime: mimeDoFormato('txt'),
        tamanhoBytes: bytes.length,
        caminhoArquivo: caminho,
        criadoPorId: autor.id,
      },
    })
    obterFila().acordar()
    return visaoDaFonte(fonte)
  } catch (erro) {
    await armazenamento.apagarFonte(agenteId, id).catch(() => undefined)
    throw erro
  }
}

export async function listar(autor: UsuarioAutenticado, agenteId: string): Promise<FonteVisivel[]> {
  exigirAutor(autor)
  await exigirAgente(agenteId)
  const fontes = await prisma.fonte.findMany({ where: { agenteId }, orderBy: { criadoEm: 'desc' } })
  return fontes.map(visaoDaFonte)
}

export async function obter(
  autor: UsuarioAutenticado,
  agenteId: string,
  fonteId: string,
): Promise<FonteVisivel> {
  exigirAutor(autor)
  const fonte = await prisma.fonte.findFirst({ where: { id: fonteId, agenteId } })
  if (!fonte) throw naoEncontrado('Fonte não encontrada.')
  return visaoDaFonte(fonte)
}

export async function resumo(autor: UsuarioAutenticado, agenteId: string): Promise<ResumoDaBase> {
  exigirAutor(autor)
  await exigirAgente(agenteId)
  const grupos = await prisma.fonte.groupBy({
    by: ['status'],
    where: { agenteId },
    _count: { _all: true },
    _sum: { caracteres: true },
  })
  const r: ResumoDaBase = { total: 0, prontas: 0, emProcessamento: 0, comErro: 0, caracteres: 0 }
  for (const g of grupos) {
    r.total += g._count._all
    if (g.status === 'pronto') {
      r.prontas += g._count._all
      r.caracteres += g._sum.caracteres ?? 0
    } else if (g.status === 'erro') r.comErro += g._count._all
    else r.emProcessamento += g._count._all
  }
  return r
}

export async function trechosDaFonte(
  autor: UsuarioAutenticado,
  agenteId: string,
  fonteId: string,
  opcoes: { pagina?: number } = {},
): Promise<PaginaDeTrechos> {
  const fonte = await obter(autor, agenteId, fonteId)
  const totalTrechos = await prisma.trecho.count({ where: { fonteId } })
  const totalPaginas = Math.max(1, Math.ceil(totalTrechos / TRECHOS_POR_PAGINA))
  const pedida = Number.isFinite(opcoes.pagina) ? Math.trunc(opcoes.pagina as number) : 1
  const pagina = Math.min(Math.max(pedida, 1), totalPaginas)
  const trechos = await prisma.trecho.findMany({
    where: { fonteId },
    orderBy: { indice: 'asc' },
    skip: (pagina - 1) * TRECHOS_POR_PAGINA,
    take: TRECHOS_POR_PAGINA,
    select: { id: true, indice: true, texto: true, caracteres: true },
  })
  return { fonte, trechos, pagina, porPagina: TRECHOS_POR_PAGINA, totalPaginas, totalTrechos }
}
