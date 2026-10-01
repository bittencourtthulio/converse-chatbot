/**
 * Servidor YouTube simulado (PR-75, PR-77: nenhum teste chama a rede real).
 *
 * O formato real da página e das legendas do YouTube NÃO é documentado: esta
 * fixture imita o que se conhece (`ytInitialPlayerResponse` com `videoDetails`
 * e `captions.playerCaptionsTracklistRenderer.captionTracks`; legenda em XML
 * `<transcript><text start dur>` ou, com `fmt=json3`, `events[].segs[].utf8`).
 * Se o YouTube mudar, é a fixture que precisa acompanhar.
 *
 * Uso:
 *   const falso = await iniciarYoutubeFalso()
 *   process.env.YOUTUBE_BASE = falso.url        // http://127.0.0.1:<porta>
 *   ... teste ...
 *   await falso.fechar()
 *
 * Rotas: GET /watch?v=ID (página) e GET /api/timedtext?v=ID&track=N[&fmt=json3].
 *
 * Opções (todas opcionais; `configurar(parcial)` muda no meio do teste):
 *   videos                 { id: { titulo, duracaoSegundos, faixas } }; padrão: ID_COM_LEGENDAS e ID_SEM_LEGENDAS
 *   hostDaLegenda          origem posta no `baseUrl` das faixas (padrão: este servidor)
 *   redirecionamentos      quantos 302 em sequência antes de servir a legenda
 *   redirecionarLegendaPara URL absoluta para onde o último redirect aponta (em vez de servir)
 *   paginaBytesExtras      enchimento da página (teste de teto de tamanho)
 *   legendaBytesExtras     enchimento da legenda (teste de teto de tamanho)
 *   latenciaMs, latenciaDaLegendaMs   atrasos (teste de prazo)
 *   paginaQuebrada         a página não traz `ytInitialPlayerResponse` (formato mudou)
 *   statusDaPagina         status HTTP da página (padrão 200)
 *
 * Estado observável: `requisicoes` (caminho, consulta e cabeçalho host).
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'

export const ID_COM_LEGENDAS = 'abcdefghijk'
export const ID_SEM_LEGENDAS = 'semlegenda1'

export interface FalaFalsa {
  /** Início, em segundos. */
  inicio: number
  duracao: number
  texto: string
}

export interface FaixaFalsa {
  idioma: string
  /** Legenda automática (`kind: 'asr'`). */
  automatica?: boolean
  nome?: string
  falas: FalaFalsa[]
}

export interface VideoFalso {
  titulo: string
  duracaoSegundos?: number
  faixas: FaixaFalsa[]
}

export interface OpcoesDoYoutubeFalso {
  videos?: Record<string, VideoFalso>
  hostDaLegenda?: string
  redirecionamentos?: number
  redirecionarLegendaPara?: string
  paginaBytesExtras?: number
  legendaBytesExtras?: number
  latenciaMs?: number
  latenciaDaLegendaMs?: number
  paginaQuebrada?: boolean
  statusDaPagina?: number
}

export interface RequisicaoDoYoutube {
  caminho: string
  consulta: string
  host: string
}

export interface YoutubeFalso {
  /** Origem para YOUTUBE_BASE, sem barra final. */
  url: string
  requisicoes: RequisicaoDoYoutube[]
  configurar(parcial: OpcoesDoYoutubeFalso): void
  fechar(): Promise<void>
}

export const FALAS_EM_INGLES: FalaFalsa[] = [
  { inicio: 0, duracao: 4, texto: 'Welcome to the lesson.' },
  { inicio: 4, duracao: 6, texto: "Today we talk about how it's done." },
  { inicio: 70, duracao: 5, texto: 'Thanks for watching.' },
]

export const FALAS_EM_PORTUGUES: FalaFalsa[] = [
  { inicio: 0, duracao: 4, texto: 'Bem-vindo à aula.' },
  { inicio: 4, duracao: 6, texto: 'Hoje falamos sobre o reembolso em trinta dias.' },
  { inicio: 70, duracao: 5, texto: 'Obrigado por assistir.' },
]

const VIDEOS_PADRAO: Record<string, VideoFalso> = {
  [ID_COM_LEGENDAS]: {
    titulo: 'Aula de exemplo',
    duracaoSegundos: 75,
    faixas: [
      { idioma: 'en', nome: 'English', falas: FALAS_EM_INGLES },
      { idioma: 'pt', automatica: true, nome: 'Portuguese (auto-generated)', falas: FALAS_EM_PORTUGUES },
    ],
  },
  [ID_SEM_LEGENDAS]: { titulo: 'Vídeo sem legendas', duracaoSegundos: 30, faixas: [] },
}

const dormir = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** O YouTube escapa `&`, `<` e, por cima, o apóstrofo como `&amp;#39;` (codificação dupla). */
const escaparXml = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/'/g, '&amp;#39;')

export async function iniciarYoutubeFalso(inicial: OpcoesDoYoutubeFalso = {}): Promise<YoutubeFalso> {
  const opcoes: OpcoesDoYoutubeFalso = {
    videos: VIDEOS_PADRAO,
    redirecionamentos: 0,
    paginaBytesExtras: 0,
    legendaBytesExtras: 0,
    latenciaMs: 0,
    latenciaDaLegendaMs: 0,
    paginaQuebrada: false,
    statusDaPagina: 200,
    ...inicial,
  }
  const requisicoes: RequisicaoDoYoutube[] = []
  let origem = ''

  function pagina(res: ServerResponse, id: string) {
    const video = opcoes.videos?.[id]
    res.writeHead(opcoes.statusDaPagina ?? 200, { 'Content-Type': 'text/html; charset=utf-8' })
    const enchimento = opcoes.paginaBytesExtras ? `<!--${'x'.repeat(opcoes.paginaBytesExtras)}-->` : ''
    if (opcoes.paginaQuebrada) {
      res.end(`<html><head><title>YouTube</title></head><body>página em outro formato${enchimento}</body></html>`)
      return
    }
    const player: Record<string, unknown> = {
      videoDetails: {
        videoId: id,
        title: video?.titulo ?? 'Vídeo desconhecido',
        lengthSeconds: String(video?.duracaoSegundos ?? 0),
      },
    }
    if (video && video.faixas.length > 0) {
      const base = opcoes.hostDaLegenda ?? origem
      player.captions = {
        playerCaptionsTracklistRenderer: {
          captionTracks: video.faixas.map((f, i) => ({
            baseUrl: `${base}/api/timedtext?v=${id}&track=${i}`,
            name: { simpleText: f.nome ?? f.idioma },
            languageCode: f.idioma,
            ...(f.automatica ? { kind: 'asr' } : {}),
          })),
        },
      }
    }
    res.end(
      `<html><head><title>${video?.titulo ?? 'YouTube'} - YouTube</title></head><body>` +
        `<script>var ytInitialPlayerResponse = ${JSON.stringify(player)};</script>${enchimento}</body></html>`,
    )
  }

  function legenda(res: ServerResponse, id: string, faixa: number, json3: boolean) {
    const falas = opcoes.videos?.[id]?.faixas[faixa]?.falas
    if (!falas) {
      res.writeHead(404)
      res.end()
      return
    }
    const extra = opcoes.legendaBytesExtras ?? 0
    if (json3) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(
        JSON.stringify({
          wireMagic: 'pb3',
          events: falas.map((f) => ({
            tStartMs: Math.round(f.inicio * 1000),
            dDurationMs: Math.round(f.duracao * 1000),
            segs: [{ utf8: f.texto }],
          })),
          ...(extra ? { enchimento: 'x'.repeat(extra) } : {}),
        }),
      )
      return
    }
    res.writeHead(200, { 'Content-Type': 'text/xml; charset=utf-8' })
    res.end(
      `<?xml version="1.0" encoding="utf-8" ?><transcript>` +
        falas.map((f) => `<text start="${f.inicio}" dur="${f.duracao}">${escaparXml(f.texto)}</text>`).join('') +
        (extra ? `<!--${'x'.repeat(extra)}-->` : '') +
        `</transcript>`,
    )
  }

  async function tratar(req: IncomingMessage, res: ServerResponse) {
    const url = new URL(req.url ?? '/', 'http://localhost')
    requisicoes.push({ caminho: url.pathname, consulta: url.searchParams.toString(), host: String(req.headers.host ?? '') })
    if (url.pathname === '/watch') {
      if (opcoes.latenciaMs) await dormir(opcoes.latenciaMs)
      return pagina(res, url.searchParams.get('v') ?? '')
    }
    if (url.pathname === '/api/timedtext') {
      if (opcoes.latenciaDaLegendaMs) await dormir(opcoes.latenciaDaLegendaMs)
      const salto = Number(url.searchParams.get('salto') ?? 0)
      const total = opcoes.redirecionamentos ?? 0
      if (salto < total) {
        url.searchParams.set('salto', String(salto + 1))
        res.writeHead(302, { Location: `${url.pathname}?${url.searchParams.toString()}` })
        return void res.end()
      }
      if (opcoes.redirecionarLegendaPara && salto === total && !url.searchParams.has('fim')) {
        res.writeHead(302, { Location: opcoes.redirecionarLegendaPara })
        return void res.end()
      }
      return legenda(
        res,
        url.searchParams.get('v') ?? '',
        Number(url.searchParams.get('track') ?? 0),
        url.searchParams.get('fmt') === 'json3',
      )
    }
    res.writeHead(404)
    res.end()
  }

  const servidor: Server = createServer((req, res) => {
    tratar(req, res).catch(() => {
      if (!res.headersSent) res.writeHead(500)
      res.end()
    })
  })
  await new Promise<void>((resolve) => servidor.listen(0, '127.0.0.1', resolve))
  origem = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`

  return {
    url: origem,
    requisicoes,
    configurar(parcial) {
      Object.assign(opcoes, parcial)
    },
    async fechar() {
      servidor.closeAllConnections()
      await new Promise<void>((resolve) => servidor.close(() => resolve()))
    },
  }
}
