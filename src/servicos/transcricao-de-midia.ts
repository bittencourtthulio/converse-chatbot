// Transcrição de vídeo e áudio por parte (FT-08, PR-72, PR-73, PR-74): sonda o
// original, confere os limites, extrai o áudio, divide em partes de 10 minutos
// e transcreve cada parte pelo OpenRouter. O texto de cada parte vai para
// `segmentos/NN.txt` assim que volta do modelo, para a retomada depois de falha
// ou reinício não pagar de novo o que já foi transcrito. A mídia e o
// transcritor são injetáveis (testes sem ffmpeg e sem rede). Quem grava o
// resultado final, os trechos e o status é a fila (`fontes-fila.ts`).
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Armazenamento } from '@/lib/armazenamento'
import { ErroDeAplicacao } from '@/lib/erros'
import {
  SEGUNDOS_POR_PARTE,
  dividirEmSegmentos,
  exigirAudio,
  extrairAudio,
  sondar,
  type Sonda,
} from '@/lib/midia'
import { transcreverAudio, type PedidoDeTranscricao } from '@/lib/openrouter'
import { juntarPartes } from '@/servicos/transcricao-marcadores'

export interface Andamento {
  etapa: string
  /** De 0 a 100. */
  progresso: number
  duracaoSegundos?: number
}

export interface DependenciasDeMidia {
  sondar: (caminho: string) => Promise<Sonda>
  extrairAudio: (entrada: string, saida: string) => Promise<void>
  dividirEmSegmentos: (audio: string, diretorio: string, opcoes?: { segundosPorParte?: number }) => Promise<string[]>
  transcrever: (pedido: PedidoDeTranscricao) => Promise<string>
  esperar: (ms: number) => Promise<void>
  lerBytes: (caminho: string) => Promise<Buffer>
}

export interface PedidoDeMidia {
  fonte: { id: string; agenteId: string }
  chave: string
  modelo: string
  armazenamento: Armazenamento
  /** Chamado a cada passo, para a fila gravar `etapa` e `progresso` no banco. */
  aoAndar: (andamento: Andamento) => void | Promise<void>
  /** A fonte ainda existe? Conferido antes de cada parte, para parar de gastar crédito se foi excluída. */
  fonteExiste: () => Promise<boolean>
  segundosPorParte?: number
  /** Repetições de uma parte com falha transitória (padrão 2, ou seja, até 3 chamadas). */
  repeticoes?: number
  esperaEntreTentativasMs?: number
  sinal?: AbortSignal
  dependencias?: Partial<DependenciasDeMidia>
}

export interface TextoDeMidia {
  texto: string
  duracaoSegundos: number
}

const TRANSITORIOS = new Set(['provedor_indisponivel', 'provedor_tempo_esgotado', 'provedor_limite', 'transcricao_vazia'])

const dependenciasReais: DependenciasDeMidia = {
  sondar: (caminho) => sondar(caminho),
  extrairAudio: (entrada, saida) => extrairAudio(entrada, saida),
  dividirEmSegmentos: (audio, diretorio, opcoes) => dividirEmSegmentos(audio, diretorio, opcoes),
  transcrever: transcreverAudio,
  esperar: (ms) => new Promise((resolver) => setTimeout(resolver, ms)),
  lerBytes: (caminho) => readFile(caminho),
}

export const erroDeFonteExcluida = () =>
  new ErroDeAplicacao('A fonte foi excluída durante o processamento.', 410, 'fonte_excluida')

/**
 * Transcreve a mídia da fonte e devolve o texto com o marcador de tempo no
 * começo de cada parte. Falha de uma parte lança `Falha na parte N de M: ...`
 * e mantém os segmentos já gravados. O áudio extraído é sempre apagado ao fim.
 */
export async function transcreverMidia(pedido: PedidoDeMidia): Promise<TextoDeMidia> {
  const d: DependenciasDeMidia = { ...dependenciasReais, ...pedido.dependencias }
  const { fonte, armazenamento } = pedido
  const segundos = pedido.segundosPorParte ?? SEGUNDOS_POR_PARTE
  const andar = async (etapa: string, progresso: number, duracaoSegundos?: number) =>
    pedido.aoAndar({ etapa, progresso, ...(duracaoSegundos !== undefined && { duracaoSegundos }) })

  try {
    await andar('Verificando o arquivo', 2)
    const sonda = await d.sondar(armazenamento.caminhoDoOriginal(fonte.agenteId, fonte.id))
    exigirAudio(sonda)
    await andar('Verificando o arquivo', 4, Math.round(sonda.duracaoSegundos))

    // Sem pasta de áudio quando todas as partes esperadas já estão em disco.
    const esperadas = Math.max(1, Math.ceil(sonda.duracaoSegundos / segundos - 1e-6))
    const existentes = new Set(await armazenamento.listarSegmentos(fonte.agenteId, fonte.id))
    const tudoPronto = Array.from({ length: esperadas }, (_, i) => existentes.has(i)).every(Boolean)

    let partes: string[] = []
    let total = esperadas
    if (!tudoPronto) {
      const pasta = armazenamento.pastaDeTrabalho(fonte.agenteId, fonte.id, 'audio')
      const audio = path.join(pasta, 'audio.mp3')
      await andar('Extraindo áudio', 5)
      await d.extrairAudio(armazenamento.caminhoDoOriginal(fonte.agenteId, fonte.id), audio)
      await andar('Dividindo em partes', 15)
      partes = await d.dividirEmSegmentos(audio, path.join(pasta, 'partes'), { segundosPorParte: segundos })
      total = partes.length
    }

    for (let i = 0; i < total; i += 1) {
      await andar(`Transcrevendo parte ${i + 1} de ${total}`, 15 + Math.floor((80 * i) / total))
      if (existentes.has(i)) continue
      if (!(await pedido.fonteExiste())) throw erroDeFonteExcluida()
      const caminho = partes[i]!
      const texto = await transcreverParte(pedido, d, caminho, i, total)
      await armazenamento.gravarSegmento(fonte.agenteId, fonte.id, i, texto)
    }

    await andar('Montando o texto', 95)
    const lidas: Array<{ inicioSegundos: number; texto: string }> = []
    for (let i = 0; i < total; i += 1) {
      lidas.push({ inicioSegundos: i * segundos, texto: (await armazenamento.lerSegmento(fonte.agenteId, fonte.id, i)) ?? '' })
    }
    return { texto: juntarPartes(lidas), duracaoSegundos: Math.round(sonda.duracaoSegundos) }
  } finally {
    await armazenamento.apagarAudio(fonte.agenteId, fonte.id).catch(() => undefined)
  }
}

async function transcreverParte(
  pedido: PedidoDeMidia,
  d: DependenciasDeMidia,
  caminho: string,
  indice: number,
  total: number,
): Promise<string> {
  const repeticoes = pedido.repeticoes ?? 2
  const espera = pedido.esperaEntreTentativasMs ?? 2000
  const bytes = await d.lerBytes(caminho)
  const audioBase64 = bytes.toString('base64')
  for (let tentativa = 1; ; tentativa += 1) {
    try {
      return await d.transcrever({
        chave: pedido.chave,
        modelo: pedido.modelo,
        audioBase64,
        formato: 'mp3',
        sinal: pedido.sinal,
      })
    } catch (erro) {
      if (pedido.sinal?.aborted) throw erro
      const transitorio = erro instanceof ErroDeAplicacao && TRANSITORIOS.has(erro.codigo)
      if (transitorio && tentativa <= repeticoes) {
        await d.esperar(espera * tentativa)
        continue
      }
      // Só identificadores e o código: nunca o áudio nem o texto transcrito (PR-21).
      console.error(
        JSON.stringify({
          evento: 'transcricao_falhou',
          fonteId: pedido.fonte.id,
          agenteId: pedido.fonte.agenteId,
          parte: indice + 1,
          codigo: erro instanceof ErroDeAplicacao ? erro.codigo : 'erro_inesperado',
        }),
      )
      const rotulo = `Falha na parte ${indice + 1} de ${total}`
      if (erro instanceof ErroDeAplicacao) throw new ErroDeAplicacao(`${rotulo}: ${erro.message}`, erro.status, erro.codigo)
      throw new ErroDeAplicacao(`${rotulo}: ocorreu um erro inesperado.`, 500, 'erro_inesperado')
    }
  }
}
