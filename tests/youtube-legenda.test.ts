/**
 * T-05.03 (FT-08): o download da legenda em json3 ou XML, com o destino
 * conferido antes de qualquer conexão, no máximo um redirect, teto de tamanho e
 * prazo (SSRF, PR-75). Contra o simulado do YouTube; `obterLegendas` costura
 * URL, página, faixa e legenda.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { baixarLegenda, destinoPermitido, obterLegendas, obterPaginaDoVideo } from '@/lib/youtube'
import { ErroDeAplicacao } from '@/lib/erros'
import { ID_COM_LEGENDAS, ID_SEM_LEGENDAS, iniciarYoutubeFalso, type YoutubeFalso } from './apoio/youtube-falso'

let falso: YoutubeFalso
let proibido: YoutubeFalso
const baseOriginal = process.env.YOUTUBE_BASE

beforeEach(async () => {
  falso = await iniciarYoutubeFalso()
  proibido = await iniciarYoutubeFalso()
  process.env.YOUTUBE_BASE = falso.url
})
afterEach(async () => {
  await falso.fechar()
  await proibido.fechar()
  if (baseOriginal === undefined) delete process.env.YOUTUBE_BASE
  else process.env.YOUTUBE_BASE = baseOriginal
})
const falhar = (p: Promise<unknown>) => p.then(() => null, (e: ErroDeAplicacao) => e)
const primeiraFaixa = async () => (await obterPaginaDoVideo(ID_COM_LEGENDAS)).faixas[0]!

const FALAS_ESPERADAS = [
  { inicio: 0, texto: 'Welcome to the lesson.' },
  { inicio: 4, texto: "Today we talk about how it's done." },
  { inicio: 70, texto: 'Thanks for watching.' },
]

describe('baixarLegenda', () => {
  it('a legenda em json3 e a em XML devolvem as mesmas falas, com tempo e o apóstrofo decodificado', async () => {
    const faixa = await primeiraFaixa()
    const deJson = await baixarLegenda(faixa)
    expect(deJson.map(({ inicio, texto }) => ({ inicio, texto }))).toEqual(FALAS_ESPERADAS)
    expect(falso.requisicoes.at(-1)!.consulta).toContain('fmt=json3')

    falso.configurar({ ignorarFmt: true })
    const deXml = await baixarLegenda(faixa)
    expect(deXml.map(({ inicio, texto }) => ({ inicio, texto }))).toEqual(FALAS_ESPERADAS)
    expect(deXml[1]!.duracao).toBe(6)
  })

  it('o destino só vale na base configurada ou em youtube.com e subdomínios por HTTPS, sem credencial', () => {
    process.env.YOUTUBE_BASE = 'http://127.0.0.1:4010'
    const certos = ['http://127.0.0.1:4010/api/timedtext?v=x', 'https://www.youtube.com/api/timedtext', 'https://youtube.com/x', 'https://sub.youtube.com/x']
    const errados = [
      'http://127.0.0.1:4011/api/timedtext',
      'http://localhost:4010/api/timedtext',
      'http://www.youtube.com/api/timedtext',
      'https://youtube.com.evil.com/x',
      'https://evilyoutube.com/x',
      'https://www.youtube.com@evil.com/x',
      'https://user:pw@www.youtube.com/x',
      'https://www.youtube.com:8443/x',
      'ftp://www.youtube.com/x',
      'não é url',
    ]
    for (const u of certos) expect(destinoPermitido(u), u).toBe(true)
    for (const u of errados) expect(destinoPermitido(u), u).toBe(false)
  })

  it('uma baseUrl de host fora da lista é recusada sem nenhuma conexão àquele host', async () => {
    falso.configurar({ hostDaLegenda: proibido.url })
    const pagina = await obterPaginaDoVideo(ID_COM_LEGENDAS)
    expect(pagina.faixas[0]!.baseUrl.startsWith(proibido.url)).toBe(true)
    const erro = await falhar(baixarLegenda(pagina.faixas[0]!))
    expect(erro).toMatchObject({ status: 502, codigo: 'youtube_destino_proibido' })
    expect(proibido.requisicoes).toHaveLength(0)
  })

  it('um redirect para host fora da lista é recusado sem conectar a ele', async () => {
    falso.configurar({ redirecionarLegendaPara: `${proibido.url}/api/timedtext?v=${ID_COM_LEGENDAS}&track=0` })
    const erro = await falhar(baixarLegenda(await primeiraFaixa()))
    expect(erro).toMatchObject({ codigo: 'youtube_destino_proibido' })
    expect(proibido.requisicoes).toHaveLength(0)
    expect(falso.requisicoes.filter((r) => r.caminho === '/api/timedtext').length).toBeGreaterThan(0)
  })

  it('um redirect é seguido e dois seguidos são recusados', async () => {
    falso.configurar({ redirecionamentos: 1 })
    expect((await baixarLegenda(await primeiraFaixa())).length).toBe(3)
    falso.configurar({ redirecionamentos: 2 })
    expect(await falhar(baixarLegenda(await primeiraFaixa()))).toMatchObject({ codigo: 'youtube_redirecionamentos' })
  })

  it('resposta acima do teto aborta e a legenda lenta estoura o prazo', async () => {
    const faixa = await primeiraFaixa()
    falso.configurar({ legendaBytesExtras: 300_000 })
    expect(await falhar(baixarLegenda(faixa, { tetoDaLegendaBytes: 100_000 }))).toMatchObject({ codigo: 'youtube_resposta_grande' })
    expect((await baixarLegenda(faixa)).length).toBe(3)
    falso.configurar({ legendaBytesExtras: 0, latenciaDaLegendaMs: 700 })
    const t0 = Date.now()
    expect(await falhar(baixarLegenda(faixa, { prazoMs: 150 }))).toMatchObject({ status: 504, codigo: 'youtube_tempo_esgotado' })
    expect(Date.now() - t0).toBeLessThan(600)
  })

  it('legenda sem nenhuma fala lança sem_legendas', async () => {
    falso.configurar({ videos: { [ID_COM_LEGENDAS]: { titulo: 'T', faixas: [{ idioma: 'pt', falas: [{ inicio: 0, duracao: 1, texto: '   ' }] }] } } })
    const faixa = (await obterPaginaDoVideo(ID_COM_LEGENDAS)).faixas[0]!
    expect(await falhar(baixarLegenda(faixa))).toMatchObject({ status: 422, codigo: 'sem_legendas' })
  })
})

describe('obterLegendas', () => {
  it('da URL às falas: título, idioma da faixa preferida, duração e falas', async () => {
    const r = await obterLegendas(`https://www.youtube.com/watch?v=${ID_COM_LEGENDAS}`)
    expect(r).toMatchObject({ id: ID_COM_LEGENDAS, titulo: 'Aula de exemplo', idioma: 'en', automatica: false, duracaoSegundos: 75 })
    expect(r.falas.map((f) => f.texto)).toEqual(FALAS_ESPERADAS.map((f) => f.texto))
    // o servidor só falou com a base configurada, nunca com o host da URL do usuário
    expect(falso.requisicoes.map((q) => q.caminho)).toEqual(['/watch', '/api/timedtext'])
  })

  it('vídeo sem legendas lança a frase do briefing', async () => {
    const erro = await falhar(obterLegendas(`https://youtu.be/${ID_SEM_LEGENDAS}`))
    expect(erro).toMatchObject({ status: 422, codigo: 'sem_legendas' })
    expect(erro!.message).toBe('Este vídeo não tem legendas disponíveis. Baixe o vídeo e envie o arquivo para transcrever.')
  })

  it('URL de outro host é recusada antes de qualquer requisição', async () => {
    const erro = await falhar(obterLegendas('https://evil.com/watch?v=abcdefghijk'))
    expect(erro).toMatchObject({ status: 422, codigo: 'url_invalida' })
    expect(falso.requisicoes).toHaveLength(0)
    expect(proibido.requisicoes).toHaveLength(0)
  })
})
