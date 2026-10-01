// Legendas de vídeos do YouTube (FT-08, PR-75). NÃO há API oficial aqui: o
// mecanismo lê a página do vídeo e as legendas que ela aponta, o que o YouTube
// pode mudar sem aviso (fragilidade assumida, lacuna registrada). SSRF: a URL
// do usuário só serve para extrair o id e precisa ter host do YouTube; o
// servidor nunca conecta ao host que o usuário digitou, só à base configurada
// (`YOUTUBE_BASE`, padrão `https://www.youtube.com`).
import { ambiente } from '@/lib/ambiente'
import { ErroDeAplicacao } from '@/lib/erros'

const HOSTS_DE_URL = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'])
const ID_DO_VIDEO = /^[A-Za-z0-9_-]{11}$/

const urlInvalida = () =>
  new ErroDeAplicacao(
    'Informe o link de um vídeo do YouTube (youtube.com ou youtu.be), como https://www.youtube.com/watch?v=...',
    422,
    'url_invalida',
  )

/**
 * O id de 11 caracteres de um link de `youtube.com/watch?v=`, `youtu.be/`,
 * `/shorts/` ou `/embed/`. Outro host, outro esquema que não http ou https,
 * credencial ou porta na URL e id fora do formato são `url_invalida` (422).
 */
export function extrairIdDoYoutube(entrada: unknown): string {
  if (typeof entrada !== 'string' || entrada.trim() === '') throw urlInvalida()
  let url: URL
  try {
    url = new URL(entrada.trim())
  } catch {
    throw urlInvalida()
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw urlInvalida()
  if (url.username !== '' || url.password !== '' || url.port !== '') throw urlInvalida()
  const host = url.hostname.toLowerCase()
  if (!HOSTS_DE_URL.has(host)) throw urlInvalida()

  const partes = url.pathname.split('/').filter(Boolean)
  let candidato: string | null | undefined
  if (host === 'youtu.be') candidato = partes[0]
  else if (url.pathname === '/watch') candidato = url.searchParams.get('v')
  else if (partes.length >= 2 && (partes[0] === 'shorts' || partes[0] === 'embed')) candidato = partes[1]
  if (!candidato || !ID_DO_VIDEO.test(candidato)) throw urlInvalida()
  return candidato
}

/** A URL da página do vídeo na base configurada: única origem das requisições. */
export function urlDoVideo(id: string): string {
  return `${ambiente.youtubeBase}/watch?v=${encodeURIComponent(id)}`
}

/** O link que a tela mostra ao usuário: sempre o endereço oficial, mesmo com base de teste. */
export function urlDeOrigem(id: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`
}

export interface OpcoesDeLeitura {
  /** Prazo de cada requisição inteira, cabeçalhos e corpo (padrão 15 s). */
  prazoMs?: number
  /** Teto da página do vídeo, em bytes (padrão 3 MB). */
  tetoDaPaginaBytes?: number
  /** Teto da legenda, em bytes (padrão 5 MB). */
  tetoDaLegendaBytes?: number
}

export const PRAZO_DO_YOUTUBE_MS = 15_000
export const TETO_DA_PAGINA_BYTES = 3 * 1024 * 1024
export const TETO_DA_LEGENDA_BYTES = 5 * 1024 * 1024

const erroIndisponivel = () =>
  new ErroDeAplicacao('Não foi possível abrir este vídeo no YouTube agora. Tente de novo mais tarde.', 502, 'youtube_indisponivel')
const erroDePrazo = () =>
  new ErroDeAplicacao('O YouTube demorou demais para responder. Tente de novo mais tarde.', 504, 'youtube_tempo_esgotado')
const erroDeTamanho = () =>
  new ErroDeAplicacao('A resposta do YouTube é maior que o limite aceito.', 502, 'youtube_resposta_grande')
const erroDeFormato = () =>
  new ErroDeAplicacao(
    'Não foi possível ler as informações deste vídeo. O YouTube pode ter mudado o formato da página; envie o arquivo do vídeo para transcrever.',
    502,
    'youtube_formato',
  )
const erroDeDestino = () =>
  new ErroDeAplicacao('Endereço de legenda não permitido.', 502, 'youtube_destino_proibido')
const erroDeRedirecionamentos = () =>
  new ErroDeAplicacao('O YouTube redirecionou a requisição mais vezes que o permitido.', 502, 'youtube_redirecionamentos')

/**
 * A requisição só vai para a base configurada (mesmo esquema e mesmo host com
 * porta) ou para `youtube.com` e seus subdomínios, sempre por HTTPS, sem
 * credencial na URL (SSRF, PR-75).
 */
export function destinoPermitido(alvo: string | URL): boolean {
  let url: URL
  try {
    url = typeof alvo === 'string' ? new URL(alvo) : alvo
  } catch {
    return false
  }
  if (url.username !== '' || url.password !== '') return false
  const base = new URL(ambiente.youtubeBase)
  if (url.protocol === base.protocol && url.host === base.host) return true
  const host = url.hostname.toLowerCase()
  return url.protocol === 'https:' && url.port === '' && (host === 'youtube.com' || host.endsWith('.youtube.com'))
}

const REDIRECIONAMENTOS = new Set([301, 302, 303, 307, 308])

/**
 * Lê um texto com prazo e teto de tamanho, em stream, conferindo o destino a
 * cada passo e seguindo no máximo um redirect (PR-75). Nunca devolve o corpo
 * de erro nem repassa a mensagem de uma exceção de rede.
 */
async function lerComLimite(inicial: string, o: { tetoBytes: number; prazoMs: number }): Promise<string> {
  const controle = new AbortController()
  const temporizador = setTimeout(() => controle.abort(), o.prazoMs)
  try {
    let atual = new URL(inicial)
    for (let saltos = 0; ; saltos += 1) {
      if (!destinoPermitido(atual)) throw erroDeDestino()
      const resposta = await fetch(atual, {
        redirect: 'manual',
        signal: controle.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Converse/1.0)',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        },
      })
      if (REDIRECIONAMENTOS.has(resposta.status)) {
        await resposta.body?.cancel().catch(() => undefined)
        const destino = resposta.headers.get('location')
        if (!destino) throw erroIndisponivel()
        if (saltos >= 1) throw erroDeRedirecionamentos()
        atual = new URL(destino, atual)
        continue
      }
      if (!resposta.ok || !resposta.body) {
        await resposta.body?.cancel().catch(() => undefined)
        throw erroIndisponivel()
      }
      const declarado = Number(resposta.headers.get('content-length'))
      if (Number.isFinite(declarado) && declarado > o.tetoBytes) {
        await resposta.body.cancel().catch(() => undefined)
        throw erroDeTamanho()
      }
      const leitor = resposta.body.getReader()
      const partes: Uint8Array[] = []
      let total = 0
      for (;;) {
        const { done, value } = await leitor.read()
        if (done) break
        total += value.length
        if (total > o.tetoBytes) {
          await leitor.cancel().catch(() => undefined)
          throw erroDeTamanho()
        }
        partes.push(value)
      }
      return Buffer.concat(partes).toString('utf8')
    }
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao) throw erro
    if (controle.signal.aborted) throw erroDePrazo()
    throw erroIndisponivel()
  } finally {
    clearTimeout(temporizador)
  }
}

export interface FaixaDeLegenda {
  /** Código de idioma da faixa (`pt`, `pt-BR`, `en`...). */
  idioma: string
  /** Legenda gerada automaticamente (`kind: asr`). */
  automatica: boolean
  nome: string
  baseUrl: string
}

export interface PaginaDoVideo {
  id: string
  titulo: string
  duracaoSegundos: number | null
  faixas: FaixaDeLegenda[]
}

/** O objeto JSON que começa em `marcador`, achado por contagem de chaves, ciente de texto entre aspas. */
function extrairObjetoJson(texto: string, marcador: string): unknown {
  const inicioDoMarcador = texto.indexOf(marcador)
  if (inicioDoMarcador < 0) return null
  const abre = texto.indexOf('{', inicioDoMarcador + marcador.length)
  if (abre < 0) return null
  let nivel = 0
  let emTexto = false
  let escapado = false
  for (let i = abre; i < texto.length; i += 1) {
    const c = texto[i]
    if (emTexto) {
      if (escapado) escapado = false
      else if (c === '\\') escapado = true
      else if (c === '"') emTexto = false
      continue
    }
    if (c === '"') emTexto = true
    else if (c === '{') nivel += 1
    else if (c === '}') {
      nivel -= 1
      if (nivel === 0) {
        try {
          return JSON.parse(texto.slice(abre, i + 1))
        } catch {
          return null
        }
      }
    }
  }
  return null
}

type RespostaDoPlayer = {
  videoDetails?: { title?: unknown; lengthSeconds?: unknown }
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: Array<{
        baseUrl?: unknown
        languageCode?: unknown
        kind?: unknown
        name?: { simpleText?: unknown; runs?: Array<{ text?: unknown }> }
      }>
    }
  }
}

/**
 * Lê a página do vídeo na base configurada e devolve título, duração e faixas
 * de legenda. Formato desconhecido é `youtube_formato`: o YouTube pode mudar a
 * página sem aviso (PR-75).
 */
export async function obterPaginaDoVideo(id: string, opcoes: OpcoesDeLeitura = {}): Promise<PaginaDoVideo> {
  const html = await lerComLimite(urlDoVideo(id), {
    tetoBytes: opcoes.tetoDaPaginaBytes ?? TETO_DA_PAGINA_BYTES,
    prazoMs: opcoes.prazoMs ?? PRAZO_DO_YOUTUBE_MS,
  })
  const player = extrairObjetoJson(html, 'ytInitialPlayerResponse') as RespostaDoPlayer | null
  if (!player || typeof player !== 'object') throw erroDeFormato()
  const titulo = typeof player.videoDetails?.title === 'string' && player.videoDetails.title.trim() !== '' ? player.videoDetails.title.trim() : 'Vídeo do YouTube'
  const duracao = Number(player.videoDetails?.lengthSeconds)
  const brutas = player.captions?.playerCaptionsTracklistRenderer?.captionTracks
  const faixas: FaixaDeLegenda[] = (Array.isArray(brutas) ? brutas : []).flatMap((t) => {
    if (typeof t?.baseUrl !== 'string' || typeof t.languageCode !== 'string') return []
    const nome =
      typeof t.name?.simpleText === 'string' ? t.name.simpleText : typeof t.name?.runs?.[0]?.text === 'string' ? t.name.runs[0].text : t.languageCode
    return [{ idioma: t.languageCode, automatica: t.kind === 'asr', nome, baseUrl: t.baseUrl }]
  })
  return { id, titulo, duracaoSegundos: Number.isFinite(duracao) && duracao > 0 ? Math.round(duracao) : null, faixas }
}

const comIdioma = (faixas: FaixaDeLegenda[], prefixo: string) => faixas.find((f) => f.idioma.toLowerCase().startsWith(prefixo))

/**
 * A faixa preferida: manual em português, manual em inglês, a primeira manual,
 * e só então a automática, na mesma ordem de idioma (PR-75). `null` sem faixas.
 */
export function escolherFaixa(faixas: FaixaDeLegenda[]): FaixaDeLegenda | null {
  const manuais = faixas.filter((f) => !f.automatica)
  const automaticas = faixas.filter((f) => f.automatica)
  for (const grupo of [manuais, automaticas]) {
    const escolhida = comIdioma(grupo, 'pt') ?? comIdioma(grupo, 'en') ?? grupo[0]
    if (escolhida) return escolhida
  }
  return null
}
