// Base de conhecimento (FT-04): fontes de um agente. Qualquer usuário
// autenticado gerencia qualquer fonte de qualquer agente (PR-12); a sessão é
// conferida na camada de apresentação e o serviço exige um autor. A visão que
// sai daqui nunca traz o caminho do arquivo em disco (PR-49).
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ambiente } from '@/lib/ambiente'
import { ErroDeAplicacao, conflito, entradaInvalida, naoAutenticado, naoEncontrado } from '@/lib/erros'
import { criarArmazenamento } from '@/lib/armazenamento'
import { LIMITES } from '@/lib/extracao/limites'
import { validarConteudo } from '@/lib/extracao'
import {
  EXTENSOES_ACEITAS,
  formatoDoNome,
  mimeDoFormato,
  sanitizarNome,
} from '@/lib/extracao/formatos'
import {
  BYTES_DE_ASSINATURA,
  EXTENSOES_DE_MIDIA,
  conferirAssinaturaDeMidia,
  formatoDeMidia,
  mimeDeMidia,
} from '@/lib/midia-formatos'
import { extrairIdDoYoutube, tituloProvisorioDoYoutube, urlDeOrigem } from '@/lib/youtube'
import { obterFila } from '@/servicos/fontes-fila'
import type { UsuarioAutenticado } from '@/servicos/autenticacao'
import { log } from '@/lib/log'

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

const entradaDoYoutube = z.object({
  url: z
    .string({ message: 'Informe o link do vídeo do YouTube.' })
    .trim()
    .min(1, 'Informe o link do vídeo do YouTube.')
    .max(300, 'O link pode ter até 300 caracteres.'),
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
  /** Vídeo e YouTube (FT-08): andamento de 0 a 100 e etapa em texto curto, só enquanto processa. */
  progresso: number | null
  etapa: string | null
  duracaoSegundos: number | null
  /** Link do YouTube de origem. */
  urlOrigem: string | null
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
    progresso: f.progresso,
    etapa: f.etapa,
    duracaoSegundos: f.duracaoSegundos,
    urlOrigem: f.urlOrigem,
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

export interface ArquivoEnviado {
  nome: string
  bytes: Uint8Array
}

export type ResultadoDeArquivo =
  | { nome: string; aceito: true; fonte: FonteVisivel }
  | { nome: string; aceito: false; codigo: string; motivo: string }

function megabytes(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return `${Number.isInteger(mb) ? mb : mb.toFixed(1).replace('.', ',')} MB`
}

async function adicionarUmArquivo(
  autor: UsuarioAutenticado,
  agenteId: string,
  arquivo: ArquivoEnviado,
): Promise<ResultadoDeArquivo> {
  const nome = sanitizarNome(arquivo.nome)
  const recusa = (codigo: string, motivo: string): ResultadoDeArquivo => ({ nome, aceito: false, codigo, motivo })

  const formato = formatoDoNome(nome)
  if (!formato) {
    return recusa(
      'formato_nao_aceito',
      `Formato não aceito. Formatos aceitos: ${EXTENSOES_ACEITAS.join(', ')}.`,
    )
  }
  const tamanho = arquivo.bytes.length
  if (tamanho === 0) return recusa('arquivo_vazio', 'O arquivo está vazio.')
  const limite = ambiente.maxUploadBytes
  if (tamanho > limite) {
    return recusa(
      'arquivo_grande_demais',
      `O arquivo tem ${megabytes(tamanho)} e o limite é de ${megabytes(limite)}.`,
    )
  }

  const id = novoIdDeFonte()
  const armazenamento = armazenamentoPadrao()
  try {
    validarConteudo(formato, arquivo.bytes)
    const caminho = await armazenamento.gravar(agenteId, id, arquivo.bytes)
    try {
      const fonte = await prisma.fonte.create({
        data: {
          id,
          agenteId,
          tipo: 'arquivo',
          titulo: nome,
          nomeOriginal: nome,
          tipoMime: mimeDoFormato(formato),
          tamanhoBytes: tamanho,
          caminhoArquivo: caminho,
          criadoPorId: autor.id,
        },
      })
      return { nome, aceito: true, fonte: visaoDaFonte(fonte) }
    } catch (erro) {
      await armazenamento.apagarFonte(agenteId, id).catch(() => undefined)
      throw erro
    }
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao) return recusa(erro.codigo, erro.message)
    log.erro('envio_falhou', { agenteId })
    return recusa('erro_interno', 'Não foi possível guardar este arquivo. Tente de novo.')
  }
}

/**
 * Recebe um ou mais arquivos e devolve um resultado por arquivo: aceito (já
 * `pendente` na fila) ou recusado com o motivo. Um arquivo recusado não
 * derruba os outros (PR-45).
 */
export async function adicionarArquivos(
  autor: UsuarioAutenticado,
  agenteId: string,
  arquivos: ArquivoEnviado[],
): Promise<ResultadoDeArquivo[]> {
  exigirAutor(autor)
  if (!Array.isArray(arquivos) || arquivos.length === 0) throw entradaInvalida('Selecione ao menos um arquivo.')
  if (arquivos.length > LIMITES.arquivosPorEnvio) {
    throw entradaInvalida(`Envie no máximo ${LIMITES.arquivosPorEnvio} arquivos por vez.`)
  }
  await exigirAgente(agenteId)
  const resultados: ResultadoDeArquivo[] = []
  for (const arquivo of arquivos) resultados.push(await adicionarUmArquivo(autor, agenteId, arquivo))
  if (resultados.some((r) => r.aceito)) obterFila().acordar()
  return resultados
}

/** Exclusão definitiva: linha, trechos (cascata) e o diretório da fonte em disco. */
export async function excluir(autor: UsuarioAutenticado, agenteId: string, fonteId: string): Promise<void> {
  exigirAutor(autor)
  const { count } = await prisma.fonte.deleteMany({ where: { id: fonteId, agenteId } })
  if (count === 0) throw naoEncontrado('Fonte não encontrada.')
  // Falha ao apagar o arquivo vai para o log e não desfaz a exclusão (PR-47).
  try {
    await armazenamentoPadrao().apagarFonte(agenteId, fonteId)
  } catch {
    log.erro('armazenamento_falhou', { agenteId, fonteId })
  }
}

/** Só a fonte em erro pode ser reprocessada (PR-48): volta a `pendente` e a fila a retoma. */
export async function reprocessar(
  autor: UsuarioAutenticado,
  agenteId: string,
  fonteId: string,
): Promise<FonteVisivel> {
  exigirAutor(autor)
  await obter(autor, agenteId, fonteId) // 404 se não existe ou é de outro agente
  const { count } = await prisma.fonte.updateMany({
    where: { id: fonteId, agenteId, status: 'erro' },
    data: { status: 'pendente', mensagemErro: null, etapa: null, progresso: null },
  })
  if (count === 0) throw conflito('Só é possível reprocessar uma fonte que terminou com erro.')
  obterFila().acordar()
  return obter(autor, agenteId, fonteId)
}

export interface VideoEnviado {
  /** O nome que o usuário enviou: só título e exibição, nunca caminho (PR-13). */
  nome: unknown
  /** O corpo bruto da requisição; nunca carregado inteiro em memória. */
  corpo: ReadableStream<Uint8Array> | null
  /** `Content-Length` declarado, se houver: acima do limite é recusado sem ler o corpo. */
  tamanhoDeclarado?: number | null
}

/**
 * Vídeo ou áudio para a base (FT-08, PR-71): confere o nome e a extensão, grava
 * o corpo em disco por stream com teto de bytes e conferência da assinatura
 * real, e cria a fonte `pendente` do tipo `video`. Qualquer falha apaga o
 * diretório da fonte e não deixa linha. A transcrição é da fila.
 */
export async function adicionarVideo(
  autor: UsuarioAutenticado,
  agenteId: string,
  entrada: VideoEnviado,
): Promise<FonteVisivel> {
  exigirAutor(autor)
  if (typeof entrada.nome !== 'string' || entrada.nome.trim() === '') {
    throw entradaInvalida('Informe o nome do arquivo.')
  }
  const nome = sanitizarNome(entrada.nome)
  const formato = formatoDeMidia(nome)
  if (!formato) {
    throw new ErroDeAplicacao(
      `Formato não aceito. Formatos aceitos: ${EXTENSOES_DE_MIDIA.join(', ')}.`,
      415,
      'formato_nao_aceito',
    )
  }
  if (!entrada.corpo) throw entradaInvalida('Envie o arquivo no corpo da requisição.')
  await exigirAgente(agenteId)

  const limite = ambiente.maxVideoBytes
  const noLimite = `O arquivo passa do limite de ${megabytes(limite)}.`
  if (typeof entrada.tamanhoDeclarado === 'number' && entrada.tamanhoDeclarado > limite) {
    await entrada.corpo.cancel().catch(() => undefined)
    throw new ErroDeAplicacao(noLimite, 413, 'arquivo_grande_demais')
  }

  const id = novoIdDeFonte()
  const armazenamento = armazenamentoPadrao()
  try {
    const { caminho, tamanhoBytes } = await armazenamento.gravarDeStream(agenteId, id, entrada.corpo, {
      maxBytes: limite,
      bytesDeInicio: BYTES_DE_ASSINATURA,
      conferirInicio: (inicio) => {
        if (inicio.length === 0) throw new ErroDeAplicacao('O arquivo está vazio.', 422, 'arquivo_vazio')
        if (!conferirAssinaturaDeMidia(formato, inicio)) {
          throw new ErroDeAplicacao(
            `O conteúdo não parece ser um arquivo ${formato.toUpperCase()}: a extensão não bate com o arquivo.`,
            415,
            'assinatura_incoerente',
          )
        }
      },
    })
    const fonte = await prisma.fonte.create({
      data: {
        id,
        agenteId,
        tipo: 'video',
        titulo: nome,
        nomeOriginal: nome,
        tipoMime: mimeDeMidia(formato),
        tamanhoBytes,
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

/**
 * Link do YouTube para a base (FT-08, PR-75): valida a URL (host do YouTube e
 * id de 11 caracteres) e cria a fonte `pendente` do tipo `youtube`, sem falar
 * com o YouTube: quem lê as legendas é a fila. Sem arquivo em disco.
 */
export async function adicionarYoutube(
  autor: UsuarioAutenticado,
  agenteId: string,
  entrada: unknown,
): Promise<FonteVisivel> {
  exigirAutor(autor)
  const dados = entradaDoYoutube.safeParse(entrada)
  if (!dados.success) throw entradaInvalida(dados.error.issues[0]?.message ?? 'Entrada inválida.')
  const id = extrairIdDoYoutube(dados.data.url)
  await exigirAgente(agenteId)
  const fonte = await prisma.fonte.create({
    data: {
      agenteId,
      tipo: 'youtube',
      titulo: tituloProvisorioDoYoutube(id),
      tamanhoBytes: 0,
      urlOrigem: urlDeOrigem(id),
      criadoPorId: autor.id,
    },
  })
  obterFila().acordar()
  return visaoDaFonte(fonte)
}
