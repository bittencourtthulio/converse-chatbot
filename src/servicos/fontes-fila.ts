// Fila em segundo plano no mesmo processo (PR-05, PR-48): o estado de cada
// fonte mora no banco (`pendente`, `processando`, `pronto`, `erro`), sem fila
// externa. Esta tarefa lê o original, extrai o texto, divide em trechos e
// grava tudo numa transação; em falha, grava `erro` com mensagem amigável e
// nunca derruba quem a chamou.
import { randomBytes } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { ambiente } from '@/lib/ambiente'
import { ErroDeAplicacao } from '@/lib/erros'
import { criarArmazenamento, type Armazenamento } from '@/lib/armazenamento'
import { extrairTexto } from '@/lib/extracao'
import { formatoDoNome, type Formato } from '@/lib/extracao/formatos'
import { dividirEmTrechos, normalizarTexto } from '@/servicos/trechos'

export interface OpcoesDaFila {
  /** Injetável para o teste fixar a hora de `processadoEm`. */
  relogio?: () => Date
  /** Injetável: o teste aponta para um diretório temporário. */
  armazenamento?: Armazenamento
  concorrencia?: number
  /** Só para teste: troca a extração. */
  extrair?: typeof extrairTexto
}

export interface Fila {
  /** Processa uma fonte pendente. `false` se não existe ou outra execução a reivindicou. */
  processarUma(fonteId: string): Promise<boolean>
  /** Processa até não haver pendente, com a concorrência da fila. Devolve quantas processou. */
  processarPendentes(): Promise<number>
  /** Devolve a `pendente` as fontes que um reinício deixou em `processando`. */
  retomar(): Promise<number>
  /** Liga o processamento automático e começa a drenar, sem esperar. */
  iniciar(): void
  /** Avisa que há trabalho novo; só age depois de `iniciar`. */
  acordar(): void
  /** Resolve quando a drenagem em curso (se houver) terminar. */
  ocioso(): Promise<void>
}

const MENSAGEM_GENERICA = 'Não foi possível processar este arquivo. Tente reprocessar ou envie outro arquivo.'
const LOTE_DE_TRECHOS = 500

function formatoDaFonte(fonte: { tipo: string; nomeOriginal: string | null }): Formato {
  if (fonte.tipo === 'texto') return 'txt'
  if (fonte.tipo === 'arquivo') {
    const formato = formatoDoNome(fonte.nomeOriginal ?? '')
    if (formato) return formato
    throw new ErroDeAplicacao('O formato deste arquivo não é aceito.', 422, 'formato_nao_aceito')
  }
  throw new ErroDeAplicacao('Este tipo de fonte ainda não pode ser processado.', 422, 'tipo_nao_suportado')
}

export function criarFila(opcoes: OpcoesDaFila = {}): Fila {
  const relogio = opcoes.relogio ?? (() => new Date())
  const extrair = opcoes.extrair ?? extrairTexto
  const armazenamento = () => opcoes.armazenamento ?? criarArmazenamento(ambiente.storageDir)

  async function gravarErro(fonteId: string, mensagem: string): Promise<void> {
    // updateMany: se a fonte foi excluída no meio do caminho, não há o que atualizar.
    await prisma.fonte.updateMany({
      where: { id: fonteId },
      data: { status: 'erro', mensagemErro: mensagem, processadoEm: relogio() },
    })
  }

  async function gravarResultado(fonteId: string, agenteId: string, trechos: string[], caracteres: number) {
    await prisma.$transaction(
      async (tx) => {
        // Excluída durante o processamento: o resultado é descartado.
        if (!(await tx.fonte.findUnique({ where: { id: fonteId }, select: { id: true } }))) return
        await tx.trecho.deleteMany({ where: { fonteId } })
        for (let i = 0; i < trechos.length; i += LOTE_DE_TRECHOS) {
          await tx.trecho.createMany({
            data: trechos.slice(i, i + LOTE_DE_TRECHOS).map((texto, j) => ({
              fonteId,
              agenteId,
              indice: i + j,
              texto,
              caracteres: texto.length,
            })),
          })
        }
        await tx.fonte.update({
          where: { id: fonteId },
          data: {
            status: 'pronto',
            mensagemErro: null,
            totalTrechos: trechos.length,
            caracteres,
            processadoEm: relogio(),
          },
        })
      },
      { timeout: 60_000, maxWait: 60_000 },
    )
  }

  async function processar(fonte: {
    id: string
    agenteId: string
    tipo: string
    nomeOriginal: string | null
    caminhoArquivo: string | null
  }): Promise<void> {
    try {
      const formato = formatoDaFonte(fonte)
      if (!fonte.caminhoArquivo) {
        throw new ErroDeAplicacao('Esta fonte não tem arquivo original para processar.', 422, 'arquivo_ausente')
      }
      const bytes = await armazenamento().ler(fonte.caminhoArquivo)
      const texto = normalizarTexto(await extrair({ formato, bytes }))
      await gravarResultado(fonte.id, fonte.agenteId, dividirEmTrechos(texto), texto.length)
    } catch (erro) {
      if (erro instanceof ErroDeAplicacao) {
        await gravarErro(fonte.id, erro.message)
        return
      }
      const correlacao = randomBytes(4).toString('hex')
      // Só identificadores e o tipo do erro: nunca o conteúdo do arquivo (PR-21).
      console.error(
        JSON.stringify({
          evento: 'fonte_falhou',
          correlacao,
          fonteId: fonte.id,
          agenteId: fonte.agenteId,
          erro: erro instanceof Error ? erro.name : 'desconhecido',
        }),
      )
      await gravarErro(fonte.id, MENSAGEM_GENERICA).catch(() => undefined)
    }
  }

  const concorrencia = opcoes.concorrencia ?? 2
  let ativa = false
  let drenagem: Promise<void> | null = null
  let reexecutar = false

  async function trabalhador(): Promise<number> {
    let feitas = 0
    for (;;) {
      const proxima = await prisma.fonte.findFirst({
        where: { status: 'pendente' },
        orderBy: { criadoEm: 'asc' },
        select: { id: true },
      })
      if (!proxima) return feitas
      if (await processarUma(proxima.id)) feitas += 1
    }
  }

  async function processarPendentes(): Promise<number> {
    const parciais = await Promise.all(Array.from({ length: concorrencia }, () => trabalhador()))
    return parciais.reduce((soma, n) => soma + n, 0)
  }

  async function drenar(): Promise<void> {
    do {
      reexecutar = false
      await processarPendentes().catch(() => undefined)
    } while (reexecutar)
  }

  function acordar(): void {
    if (!ativa) return
    if (drenagem) {
      reexecutar = true
      return
    }
    drenagem = drenar().finally(() => {
      drenagem = null
    })
  }

  async function processarUma(fonteId: string): Promise<boolean> {
    // Reivindicação atômica: só uma execução passa de `pendente` para `processando`.
    const { count } = await prisma.fonte.updateMany({
      where: { id: fonteId, status: 'pendente' },
      data: { status: 'processando', mensagemErro: null },
    })
    if (count === 0) return false
    const fonte = await prisma.fonte.findUnique({ where: { id: fonteId } })
    if (!fonte) return true
    await processar(fonte)
    return true
  }

  return {
    processarUma,
    processarPendentes,
    async retomar() {
      const { count } = await prisma.fonte.updateMany({
        where: { status: 'processando' },
        data: { status: 'pendente' },
      })
      return count
    },
    iniciar() {
      ativa = true
      acordar()
    },
    acordar,
    async ocioso() {
      while (drenagem) await drenagem
    },
  }
}

const CHAVE_DA_FILA = Symbol.for('converse.filaDeFontes')

/**
 * A fila do processo. Guardada em `globalThis` para sobreviver à recarga de
 * módulos do `next dev` sem criar uma segunda fila (PR-48).
 */
export function obterFila(): Fila {
  const global = globalThis as unknown as Record<symbol, Fila | undefined>
  global[CHAVE_DA_FILA] ??= criarFila()
  return global[CHAVE_DA_FILA]
}
