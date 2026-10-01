/**
 * T-05.02 (FT-08): a página do vídeo é lida só na base configurada, com prazo e
 * teto de tamanho; título e faixas saem de `ytInitialPlayerResponse`; a faixa é
 * escolhida por preferência de idioma (PR-75). Contra o simulado do YouTube.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { escolherFaixa, obterPaginaDoVideo, type FaixaDeLegenda } from '@/lib/youtube'
import { ErroDeAplicacao } from '@/lib/erros'
import { ID_COM_LEGENDAS, ID_SEM_LEGENDAS, iniciarYoutubeFalso, type YoutubeFalso, type FaixaFalsa } from './apoio/youtube-falso'

let falso: YoutubeFalso
const baseOriginal = process.env.YOUTUBE_BASE
const falas = [{ inicio: 0, duracao: 3, texto: 'olá' }]
const faixa = (idioma: string, automatica = false): FaixaFalsa => ({ idioma, automatica, falas })

beforeEach(async () => {
  falso = await iniciarYoutubeFalso()
  process.env.YOUTUBE_BASE = falso.url
})
afterEach(async () => {
  await falso.fechar()
  if (baseOriginal === undefined) delete process.env.YOUTUBE_BASE
  else process.env.YOUTUBE_BASE = baseOriginal
})

const falhar = (p: Promise<unknown>) => p.then(() => null, (e: ErroDeAplicacao) => e)

describe('obterPaginaDoVideo', () => {
  it('devolve o título, a duração e as faixas com idioma e se é automática', async () => {
    const pagina = await obterPaginaDoVideo(ID_COM_LEGENDAS)
    expect(pagina).toMatchObject({ id: ID_COM_LEGENDAS, titulo: 'Aula de exemplo', duracaoSegundos: 75 })
    expect(pagina.faixas.map((f) => [f.idioma, f.automatica, f.nome])).toEqual([
      ['en', false, 'English'],
      ['pt', true, 'Portuguese (auto-generated)'],
    ])
    expect(pagina.faixas[0]!.baseUrl).toContain('/api/timedtext')
    // só falou com a base configurada, na rota da página
    expect(falso.requisicoes.map((r) => r.caminho)).toEqual(['/watch'])
    expect(falso.requisicoes[0]!.consulta).toBe(`v=${ID_COM_LEGENDAS}`)
  })

  it('um vídeo sem faixas devolve a lista vazia e o título', async () => {
    const pagina = await obterPaginaDoVideo(ID_SEM_LEGENDAS)
    expect(pagina.titulo).toBe('Vídeo sem legendas')
    expect(pagina.faixas).toEqual([])
  })

  it('página sem ytInitialPlayerResponse lança youtube_formato, sem repassar o conteúdo', async () => {
    falso.configurar({ paginaQuebrada: true })
    const erro = await falhar(obterPaginaDoVideo(ID_COM_LEGENDAS))
    expect(erro).toMatchObject({ status: 502, codigo: 'youtube_formato' })
    expect(erro!.message).toMatch(/formato/)
    expect(erro!.message).not.toContain('página em outro formato')
  })

  it('status de erro da página vira youtube_indisponivel e a rede fora do ar também', async () => {
    falso.configurar({ statusDaPagina: 500 })
    expect(await falhar(obterPaginaDoVideo(ID_COM_LEGENDAS))).toMatchObject({ status: 502, codigo: 'youtube_indisponivel' })
    await falso.fechar()
    expect(await falhar(obterPaginaDoVideo(ID_COM_LEGENDAS))).toMatchObject({ codigo: 'youtube_indisponivel' })
    falso = await iniciarYoutubeFalso()
    process.env.YOUTUBE_BASE = falso.url
  })

  it('página acima do teto aborta com youtube_resposta_grande e lenta estoura o prazo', async () => {
    falso.configurar({ paginaBytesExtras: 600_000 })
    expect(await falhar(obterPaginaDoVideo(ID_COM_LEGENDAS, { tetoDaPaginaBytes: 100_000 }))).toMatchObject({ codigo: 'youtube_resposta_grande' })
    // o teto padrão é 3 MB: 600 KB passam
    expect((await obterPaginaDoVideo(ID_COM_LEGENDAS)).titulo).toBe('Aula de exemplo')
    falso.configurar({ latenciaMs: 700 })
    const t0 = Date.now()
    expect(await falhar(obterPaginaDoVideo(ID_COM_LEGENDAS, { prazoMs: 150 }))).toMatchObject({ status: 504, codigo: 'youtube_tempo_esgotado' })
    expect(Date.now() - t0).toBeLessThan(600)
  })
})

describe('escolherFaixa', () => {
  const f = (idioma: string, automatica = false): FaixaDeLegenda => ({ idioma, automatica, nome: idioma, baseUrl: `http://x/${idioma}${automatica ? 'a' : ''}` })

  it('prefere manual em português, depois manual em inglês, depois a primeira manual', () => {
    expect(escolherFaixa([f('en'), f('pt-BR'), f('pt', true)])?.baseUrl).toBe('http://x/pt-BR')
    expect(escolherFaixa([f('fr'), f('pt', true), f('en')])?.baseUrl).toBe('http://x/en')
    expect(escolherFaixa([f('de'), f('fr'), f('pt', true), f('en', true)])?.baseUrl).toBe('http://x/de')
  })

  it('sem manual usa a automática, também por preferência: português, inglês, a primeira', () => {
    expect(escolherFaixa([f('en', true), f('pt', true)])?.baseUrl).toBe('http://x/pta')
    expect(escolherFaixa([f('de', true), f('en', true)])?.baseUrl).toBe('http://x/ena')
    expect(escolherFaixa([f('de', true), f('fr', true)])?.baseUrl).toBe('http://x/dea')
  })

  it('sem faixa nenhuma devolve nulo', () => {
    expect(escolherFaixa([])).toBeNull()
  })

  it('a escolha vale também a partir da página do simulado (manual pt contra automática pt)', async () => {
    falso.configurar({ videos: { [ID_COM_LEGENDAS]: { titulo: 'T', faixas: [faixa('en'), faixa('pt', true), faixa('pt-BR')] } } })
    const pagina = await obterPaginaDoVideo(ID_COM_LEGENDAS)
    expect(escolherFaixa(pagina.faixas)).toMatchObject({ idioma: 'pt-BR', automatica: false })
  })
})
