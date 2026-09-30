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

  return {
    async processarUma(fonteId) {
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
    },
  }
}
