import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { baixarLegenda, escolherFaixa, extrairIdDoYoutube } from '@/lib/youtube'
import { baixarAudioDoYoutube, inspecionarVideo } from '@/lib/youtube-download'
import { ErroDeAplicacao } from '@/lib/erros'
import { modeloDeTranscricaoEfetivo, obterChaveDoOpenrouter } from '@/servicos/integracoes'
import { montarTextoDeLegenda } from '@/servicos/transcricao-marcadores'
import { transcreverMidia, erroDeFonteExcluida, type PedidoDeMidia, type TextoDeMidia } from '@/servicos/transcricao-de-midia'

export interface TextoDoYoutube {
  texto: string
  titulo: string
  duracaoSegundos: number | null
}

export interface PedidoDoYoutube {
  url: string
  fonte: PedidoDeMidia['fonte']
  armazenamento: PedidoDeMidia['armazenamento']
  aoAndar: PedidoDeMidia['aoAndar']
  fonteExiste: PedidoDeMidia['fonteExiste']
  segundosPorParte?: number
  transcrever?: (pedido: PedidoDeMidia) => Promise<TextoDeMidia>
}

/** Recuperação após a leitura direta de legendas falhar. Só gasta IA se não obtiver legenda. */
export async function recuperarTextoDoYoutube(pedido: PedidoDoYoutube): Promise<TextoDoYoutube> {
  extrairIdDoYoutube(pedido.url)
  if (!(await pedido.fonteExiste())) throw erroDeFonteExcluida()
  await pedido.aoAndar({ etapa: 'Buscando alternativas de legenda', progresso: 10 })
  const video = await inspecionarVideo(pedido.url)
  const faixa = escolherFaixa(video.faixas)
  if (faixa) {
    try {
      const falas = await baixarLegenda(faixa)
      return { texto: montarTextoDeLegenda(falas), titulo: video.titulo, duracaoSegundos: video.duracaoSegundos }
    } catch (erro) {
      // Destino não permitido indica resposta inválida, não ausência de legenda.
      if (!(erro instanceof ErroDeAplicacao) || !['sem_legendas', 'youtube_indisponivel', 'youtube_tempo_esgotado', 'youtube_formato'].includes(erro.codigo)) throw erro
    }
  }
  const chave = await obterChaveDoOpenrouter()
  if (!chave) {
    throw new ErroDeAplicacao('Não consegui obter as legendas deste vídeo. Configure a chave do OpenRouter em Integrações para transcrever o áudio automaticamente.', 422, 'youtube_transcricao_sem_chave')
  }
  if (!(await pedido.fonteExiste())) throw erroDeFonteExcluida()
  const modelo = await modeloDeTranscricaoEfetivo()
  const pasta = await mkdtemp(path.join(os.tmpdir(), 'converse-youtube-'))
  try {
    const caminhoOriginal = path.join(pasta, 'audio')
    await pedido.aoAndar({ etapa: 'Baixando áudio para transcrição', progresso: 12 })
    await baixarAudioDoYoutube(video, caminhoOriginal)
    if (!(await pedido.fonteExiste())) throw erroDeFonteExcluida()
    const resultado = await (pedido.transcrever ?? transcreverMidia)({
      ...pedido, chave, modelo, caminhoOriginal,
      aoAndar: (a) => pedido.aoAndar({ ...a, progresso: 15 + Math.floor(a.progresso * 0.8) }),
    })
    return { ...resultado, titulo: video.titulo }
  } finally {
    await rm(pasta, { recursive: true, force: true })
  }
}
