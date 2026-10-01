// A saúde do sistema (FT-11, PR-21, PR-95): confere o banco (`SELECT 1` com prazo), o diretório de
// dados (grava e apaga um arquivo de prova), a tabela FTS5 da busca e o `ffmpeg` e o `ffprobe`.
// `falha` é o que o sistema não consegue servir (banco, disco ou busca); `degradado` é só uma
// capacidade a menos (sem ffmpeg o vídeo não funciona, o resto sim). O endpoint público devolve
// apenas o status; o detalhe vive em `src/servicos/sistema.ts`, só para o admin.
import { randomBytes } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { ambiente } from '@/lib/ambiente'
import { log } from '@/lib/log'
import { verificarMidia, type DisponibilidadeDaMidia } from '@/lib/midia'
import { prisma } from '@/lib/prisma'

export type SituacaoDeSaude = 'ok' | 'degradado' | 'falha'
export type NomeDoItemDeSaude = 'banco' | 'disco' | 'busca' | 'midia'

export interface ItemDeSaude {
  nome: NomeDoItemDeSaude
  situacao: SituacaoDeSaude
  /** Frase fixa em português; nunca a mensagem de um erro. */
  detalhe: string
}

export interface Saude {
  status: SituacaoDeSaude
  itens: ItemDeSaude[]
}

export interface OpcoesDaSaude {
  /** Prazo do `SELECT 1` e da conferência da tabela de busca. Padrão 3 segundos. */
  prazoDoBancoMs?: number
  /** Diretório de dados a conferir. Padrão: o `STORAGE_DIR` do ambiente. */
  storageDir?: string
  /** Só para teste: troca a sonda do ffmpeg. */
  midia?: () => Promise<DisponibilidadeDaMidia>
  /** Só para teste: o relógio do cache da sonda. */
  agora?: () => number
}

const PRAZO_DO_BANCO_MS = 3_000
/** A sonda de mídia roda no máximo uma vez por minuto: o endpoint é público e ela dispara processos. */
export const VALIDADE_DA_SONDA_MS = 60_000

let cacheDaMidia: { em: number; resultado: Promise<DisponibilidadeDaMidia> } | null = null

/** Os testes zeram o cache da sonda entre os casos. */
export function reiniciarCacheDaSaude(): void {
  cacheDaMidia = null
}

function comPrazo<T>(promessa: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolver, rejeitar) => {
    const relogio = setTimeout(() => rejeitar(new Error('prazo')), ms)
    promessa.then(
      (v) => {
        clearTimeout(relogio)
        resolver(v)
      },
      (e: unknown) => {
        clearTimeout(relogio)
        rejeitar(e)
      },
    )
  })
}

async function conferirBanco(prazo: number): Promise<ItemDeSaude> {
  try {
    await comPrazo(prisma.$queryRaw`SELECT 1`, prazo)
    return { nome: 'banco', situacao: 'ok', detalhe: 'O banco responde.' }
  } catch {
    return { nome: 'banco', situacao: 'falha', detalhe: 'O banco não respondeu.' }
  }
}

async function conferirDisco(dir: string): Promise<ItemDeSaude> {
  const prova = path.join(dir, `.saude-${randomBytes(4).toString('hex')}`)
  try {
    await mkdir(dir, { recursive: true })
    await writeFile(prova, 'ok')
    return { nome: 'disco', situacao: 'ok', detalhe: 'O diretório de dados aceita gravação.' }
  } catch {
    return { nome: 'disco', situacao: 'falha', detalhe: 'O diretório de dados não aceita gravação.' }
  } finally {
    await rm(prova, { force: true }).catch(() => undefined)
  }
}

async function conferirBusca(prazo: number): Promise<ItemDeSaude> {
  try {
    const linhas = await comPrazo(
      prisma.$queryRaw<Array<{ name: string }>>`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'trechos_fts'`,
      prazo,
    )
    if (linhas.length > 0) return { nome: 'busca', situacao: 'ok', detalhe: 'O índice de busca existe.' }
    return { nome: 'busca', situacao: 'falha', detalhe: 'O índice de busca não existe.' }
  } catch {
    return { nome: 'busca', situacao: 'falha', detalhe: 'Não foi possível conferir o índice de busca.' }
  }
}

function sondarMidia(opcoes: OpcoesDaSaude): Promise<DisponibilidadeDaMidia> {
  const agora = (opcoes.agora ?? Date.now)()
  if (cacheDaMidia && agora - cacheDaMidia.em < VALIDADE_DA_SONDA_MS) return cacheDaMidia.resultado
  const resultado = (opcoes.midia ?? verificarMidia)().catch(() => ({ ffmpeg: false, ffprobe: false, versao: null }))
  cacheDaMidia = { em: agora, resultado }
  return resultado
}

async function conferirMidia(opcoes: OpcoesDaSaude): Promise<ItemDeSaude> {
  const m = await sondarMidia(opcoes)
  if (m.ffmpeg && m.ffprobe) return { nome: 'midia', situacao: 'ok', detalhe: 'ffmpeg e ffprobe respondem.' }
  return { nome: 'midia', situacao: 'degradado', detalhe: 'ffmpeg ou ffprobe não responde: o vídeo e o áudio não são processados.' }
}

/** Confere tudo e devolve o pior estado entre os itens. Nunca lança. */
export async function verificarSaude(opcoes: OpcoesDaSaude = {}): Promise<Saude> {
  const prazo = opcoes.prazoDoBancoMs ?? PRAZO_DO_BANCO_MS
  const itens = await Promise.all([
    conferirBanco(prazo),
    conferirDisco(opcoes.storageDir ?? ambiente.storageDir),
    conferirBusca(prazo),
    conferirMidia(opcoes),
  ])
  const status: SituacaoDeSaude = itens.some((i) => i.situacao === 'falha')
    ? 'falha'
    : itens.some((i) => i.situacao === 'degradado')
      ? 'degradado'
      : 'ok'
  if (status === 'falha') log.erro('saude_falha', { itens: itens.filter((i) => i.situacao === 'falha').map((i) => i.nome) })
  return { status, itens }
}
