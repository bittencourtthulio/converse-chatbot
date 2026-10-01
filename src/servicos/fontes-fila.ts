// Fila em segundo plano no mesmo processo (PR-05, PR-48): o estado de cada
// fonte mora no banco (`pendente`, `processando`, `pronto`, `erro`), sem fila
// externa. Esta tarefa lê o original, extrai o texto, divide em trechos e
// grava tudo numa transação; em falha, grava `erro` com mensagem amigável e
// nunca derruba quem a chamou.
import { prisma } from '@/lib/prisma'
import { ambiente } from '@/lib/ambiente'
import { ErroDeAplicacao } from '@/lib/erros'
import { criarArmazenamento, type Armazenamento } from '@/lib/armazenamento'
import { extrairTexto } from '@/lib/extracao'
import { extrairParaFila, extrairTextoIsolado } from '@/lib/extracao/isolada'
import { LIMITES } from '@/lib/extracao/limites'
import { extrairIdDoYoutube, obterLegendas, tituloProvisorioDoYoutube } from '@/lib/youtube'
import { formatoDoNome, type Formato } from '@/lib/extracao/formatos'
import { erroSemChave } from '@/servicos/chat-erros'
import { modeloDeTranscricaoEfetivo, obterChaveDoOpenrouter } from '@/servicos/integracoes'
import { transcreverMidia, type PedidoDeMidia, type TextoDeMidia } from '@/servicos/transcricao-de-midia'
import { montarTextoDeLegenda } from '@/servicos/transcricao-marcadores'
import { trechoSoDeMarcadores } from '@/servicos/transcricao-marcadores'
import { dividirEmTrechos, normalizarTexto } from '@/servicos/trechos'
import { camposDoErro, comCorrelacao, log, novaCorrelacao } from '@/lib/log'

export interface OpcoesDaFila {
  /** Injetável para o teste fixar a hora de `processadoEm`. */
  relogio?: () => Date
  /** Injetável: o teste aponta para um diretório temporário. */
  armazenamento?: Armazenamento
  /** Raia leve (texto e arquivo): quantas fontes ao mesmo tempo (padrão 2). */
  concorrencia?: number
  /** Raia de mídia (vídeo): quantas ao mesmo tempo (padrão 1, PR-74). */
  concorrenciaDeMidia?: number
  /** Só para teste: troca a extração. */
  extrair?: typeof extrairTexto
  /** Só para teste: troca a extração em processo filho de PDF, DOCX e HTML (espião, prazo curto, trabalhador travado). */
  extrairIsolado?: typeof extrairTextoIsolado
  /** Só para teste: partes menores que os 10 minutos de produção. */
  segundosPorParte?: number
  /** Só para teste: troca a leitura das legendas do YouTube. */
  legendas?: typeof obterLegendas
  /** Só para teste: troca a transcrição de vídeo (sem ffmpeg e sem rede). */
  transcreverMidia?: (pedido: PedidoDeMidia) => Promise<TextoDeMidia>
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
  /**
   * Desligamento (FT-11, PR-99): para de reivindicar fontes novas, para sempre neste processo. A fonte em
   * curso termina o passo corrente.
   */
  parar(): void
  /**
   * Espera o que está em curso terminar, até `prazoMs`. Devolve `true` se terminou; `false` se o prazo
   * acabou, e então já devolve a `pendente` as fontes ainda em `processando`, para o próximo start as
   * retomar (o `retomar()` da subida faria o mesmo).
   */
  aguardarEncerramento(prazoMs: number): Promise<boolean>
}

const MENSAGEM_GENERICA = 'Não foi possível processar este arquivo. Tente reprocessar ou envie outro arquivo.'
/** Tipos que rodam na raia de mídia, de concorrência 1; o resto roda na leve (PR-74). */
const TIPOS_DE_MIDIA = ['video']
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
  // PDF, DOCX e HTML rodam num processo filho que o prazo encerra de verdade (PR-107); o resto, no servidor.
  const extrair = opcoes.extrair ?? ((entrada: Parameters<typeof extrairTexto>[0]) => extrairParaFila(entrada, opcoes.extrairIsolado))
  const transcrever = opcoes.transcreverMidia ?? transcreverMidia
  const lerLegendas = opcoes.legendas ?? obterLegendas
  const armazenamento = () => opcoes.armazenamento ?? criarArmazenamento(ambiente.storageDir)

  async function gravarErro(fonteId: string, mensagem: string): Promise<void> {
    // updateMany: se a fonte foi excluída no meio do caminho, não há o que atualizar.
    await prisma.fonte.updateMany({
      where: { id: fonteId },
      data: { status: 'erro', mensagemErro: mensagem, processadoEm: relogio(), etapa: null, progresso: null },
    })
  }

  /** Etapa e progresso de um vídeo em processamento; updateMany: fonte excluída ou já terminada não é tocada. */
  async function gravarAndamento(fonteId: string, a: { etapa: string; progresso: number; duracaoSegundos?: number }) {
    await prisma.fonte.updateMany({
      where: { id: fonteId, status: 'processando' },
      data: {
        etapa: a.etapa,
        progresso: Math.max(0, Math.min(100, Math.round(a.progresso))),
        ...(a.duracaoSegundos !== undefined && { duracaoSegundos: a.duracaoSegundos }),
      },
    })
  }

  async function gravarResultado(
    fonteId: string,
    agenteId: string,
    trechos: string[],
    caracteres: number,
    extra: { duracaoSegundos?: number; titulo?: string; tamanhoBytes?: number } = {},
  ) {
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
            etapa: null,
            progresso: null,
            ...(extra.duracaoSegundos !== undefined && { duracaoSegundos: extra.duracaoSegundos }),
            ...(extra.titulo !== undefined && { titulo: extra.titulo }),
            ...(extra.tamanhoBytes !== undefined && { tamanhoBytes: extra.tamanhoBytes }),
          },
        })
      },
      { timeout: 60_000, maxWait: 60_000 },
    )
  }

  /** Vídeo e áudio: transcrição por parte (PR-72 a PR-74). O original só é lido pelo ffmpeg, nunca em memória. */
  async function processarVideo(fonte: { id: string; agenteId: string; caminhoArquivo: string | null }): Promise<void> {
    if (!fonte.caminhoArquivo) {
      throw new ErroDeAplicacao('Esta fonte não tem arquivo original para processar.', 422, 'arquivo_ausente')
    }
    const chave = await obterChaveDoOpenrouter()
    if (!chave) throw erroSemChave()
    const modelo = await modeloDeTranscricaoEfetivo()
    const { texto: bruto, duracaoSegundos } = await transcrever({
      fonte: { id: fonte.id, agenteId: fonte.agenteId },
      chave,
      modelo,
      armazenamento: armazenamento(),
      segundosPorParte: opcoes.segundosPorParte,
      aoAndar: (a) => gravarAndamento(fonte.id, a),
      fonteExiste: async () => (await prisma.fonte.findUnique({ where: { id: fonte.id }, select: { id: true } })) !== null,
    })
    const texto = normalizarTexto(bruto)
    if (texto === '') {
      throw new ErroDeAplicacao('Não encontrei fala neste arquivo para transcrever.', 422, 'transcricao_vazia')
    }
    // O trecho feito só de marcadores de tempo e de [sem fala] não vai ao índice de busca (PR-105).
    const trechos = dividirEmTrechos(texto).filter((t) => !trechoSoDeMarcadores(t))
    await gravarResultado(fonte.id, fonte.agenteId, trechos, texto.length, { duracaoSegundos })
    // Concluída: o áudio e os segmentos já cumpriram o papel; o original fica (PR-74).
    await armazenamento().apagarTrabalho(fonte.agenteId, fonte.id).catch(() => undefined)
  }

  /** Link do YouTube: lê as legendas (sem baixar o vídeo e sem gastar crédito) e segue o caminho comum (PR-75). */
  async function processarYoutube(fonte: { id: string; agenteId: string; titulo: string; urlOrigem: string | null }): Promise<void> {
    if (!fonte.urlOrigem) throw new ErroDeAplicacao('Esta fonte não tem o link do vídeo.', 422, 'url_invalida')
    await gravarAndamento(fonte.id, { etapa: 'Lendo as legendas do vídeo', progresso: 10 })
    const legendas = await lerLegendas(fonte.urlOrigem)
    const texto = normalizarTexto(montarTextoDeLegenda(legendas.falas))
    if (texto === '') {
      throw new ErroDeAplicacao(
        'Este vídeo não tem legendas disponíveis. Baixe o vídeo e envie o arquivo para transcrever.',
        422,
        'sem_legendas',
      )
    }
    // O título do vídeo só substitui o provisório: o que o usuário digitou fica.
    const provisorio = fonte.titulo === tituloProvisorioDoYoutube(extrairIdDoYoutube(fonte.urlOrigem))
    await gravarResultado(fonte.id, fonte.agenteId, dividirEmTrechos(texto), texto.length, {
      ...(legendas.duracaoSegundos !== null && { duracaoSegundos: legendas.duracaoSegundos }),
      ...(provisorio && { titulo: legendas.titulo.slice(0, LIMITES.tituloDoTexto) }),
      tamanhoBytes: Buffer.byteLength(texto),
    })
  }

  async function processar(fonte: {
    id: string
    agenteId: string
    tipo: string
    titulo: string
    urlOrigem: string | null
    nomeOriginal: string | null
    caminhoArquivo: string | null
  }): Promise<void> {
    try {
      if (fonte.tipo === 'video') {
        await processarVideo(fonte)
        return
      }
      if (fonte.tipo === 'youtube') {
        await processarYoutube(fonte)
        return
      }
      const formato = formatoDaFonte(fonte)
      if (!fonte.caminhoArquivo) {
        throw new ErroDeAplicacao('Esta fonte não tem arquivo original para processar.', 422, 'arquivo_ausente')
      }
      const bytes = await armazenamento().ler(fonte.caminhoArquivo)
      const texto = normalizarTexto(await extrair({ formato, bytes }))
      await gravarResultado(fonte.id, fonte.agenteId, dividirEmTrechos(texto), texto.length)
    } catch (erro) {
      // Fonte excluída durante a transcrição: não há mais o que gravar nem o que reportar.
      if (erro instanceof ErroDeAplicacao && erro.codigo === 'fonte_excluida') return
      if (erro instanceof ErroDeAplicacao) {
        await gravarErro(fonte.id, erro.message)
        return
      }
      // Só identificadores e o tipo do erro: nunca o conteúdo do arquivo (PR-21).
      log.erro('fonte_falhou', { fonteId: fonte.id, agenteId: fonte.agenteId, ...camposDoErro(erro) })
      await gravarErro(fonte.id, MENSAGEM_GENERICA).catch(() => undefined)
    }
  }

  const concorrencia = opcoes.concorrencia ?? 2
  const concorrenciaDeMidia = opcoes.concorrenciaDeMidia ?? 1
  let ativa = false
  let parada = false
  let drenagem: Promise<void> | null = null
  let reexecutar = false
  /** O processamento de cada fonte em curso: o desligamento espera por ele. */
  const emCurso = new Set<Promise<void>>()

  async function trabalhador(midia: boolean): Promise<number> {
    let feitas = 0
    for (;;) {
      if (parada) return feitas
      const proxima = await prisma.fonte.findFirst({
        where: { status: 'pendente', tipo: midia ? { in: TIPOS_DE_MIDIA } : { notIn: TIPOS_DE_MIDIA } },
        orderBy: { criadoEm: 'asc' },
        select: { id: true },
      })
      if (!proxima) return feitas
      if (await processarUma(proxima.id)) feitas += 1
    }
  }

  async function processarPendentes(): Promise<number> {
    // Duas raias ao mesmo tempo: um vídeo longo não segura texto nem arquivos (PR-74).
    const parciais = await Promise.all([
      ...Array.from({ length: concorrencia }, () => trabalhador(false)),
      ...Array.from({ length: concorrenciaDeMidia }, () => trabalhador(true)),
    ])
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
    if (parada) return false
    // Reivindicação atômica: só uma execução passa de `pendente` para `processando`.
    const { count } = await prisma.fonte.updateMany({
      where: { id: fonteId, status: 'pendente' },
      data: { status: 'processando', mensagemErro: null },
    })
    if (count === 0) return false
    const fonte = await prisma.fonte.findUnique({ where: { id: fonteId } })
    if (!fonte) return true
    // Cada fonte tem a própria correlação: todas as linhas do log do processamento dela a levam.
    const tarefa = comCorrelacao(novaCorrelacao(), () => processar(fonte))
    emCurso.add(tarefa)
    try {
      await tarefa
    } finally {
      emCurso.delete(tarefa)
    }
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
      if (parada) return
      ativa = true
      acordar()
    },
    acordar,
    async ocioso() {
      while (drenagem) await drenagem
    },
    parar() {
      parada = true
      ativa = false
    },
    async aguardarEncerramento(prazoMs: number) {
      const ocupada = async () => {
        while (emCurso.size > 0 || drenagem) await Promise.allSettled([...emCurso, ...(drenagem ? [drenagem] : [])])
      }
      let relogio: ReturnType<typeof setTimeout> | undefined
      const prazo = new Promise<false>((resolver) => {
        relogio = setTimeout(() => resolver(false), prazoMs)
        relogio.unref?.()
      })
      const terminou = await Promise.race([ocupada().then(() => true as const), prazo])
      if (relogio) clearTimeout(relogio)
      if (!terminou) await prisma.fonte.updateMany({ where: { status: 'processando' }, data: { status: 'pendente' } })
      return terminou
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
