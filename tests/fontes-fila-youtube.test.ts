/**
 * T-05.06 (FT-08): a fila trata o tipo `youtube`: lê as legendas na base
 * configurada, troca o título provisório pelo do vídeo, grava duração e
 * tamanho e monta o texto com marcadores de tempo (PR-74, PR-75). Contra o
 * simulado do YouTube.
 */
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest'
import { ErroDeAplicacao } from '@/lib/erros'
import { prisma } from '@/lib/prisma'
import { criarFila } from '@/servicos/fontes-fila'
import { reprocessar } from '@/servicos/fontes'
import { criarAdmin, limparBanco } from './ajuda'
import { armazenamentoDeTeste, criarAgenteDeTeste, criarFonteDeTeste } from './apoio/fontes'
import { ID_COM_LEGENDAS, ID_SEM_LEGENDAS, iniciarYoutubeFalso, type YoutubeFalso } from './apoio/youtube-falso'

let falso: YoutubeFalso
let agenteId: string
const baseOriginal = process.env.YOUTUBE_BASE
const AGORA = new Date('2026-09-30T12:00:00.000Z')

beforeEach(async () => {
  recuperarYoutube.mockReset()
  recuperarYoutube.mockRejectedValue(new ErroDeAplicacao('Falha simulada na recuperação do vídeo.', 502, 'youtube_download_falhou'))
  await limparBanco()
  agenteId = (await criarAgenteDeTeste()).agente.id
  falso = await iniciarYoutubeFalso()
  process.env.YOUTUBE_BASE = falso.url
})
afterEach(async () => {
  await falso.fechar()
  if (baseOriginal === undefined) delete process.env.YOUTUBE_BASE
  else process.env.YOUTUBE_BASE = baseOriginal
})
afterAll(limparBanco)

const recuperarYoutube = vi.fn(async () => { throw new ErroDeAplicacao('Falha simulada na recuperação do vídeo.', 502, 'youtube_download_falhou') })
const fila = () => criarFila({ relogio: () => AGORA, armazenamento: armazenamentoDeTeste(), recuperarYoutube })
const ler = (id: string) => prisma.fonte.findUniqueOrThrow({ where: { id } })
async function youtube(id = ID_COM_LEGENDAS, titulo = `YouTube: ${id}`, urlOrigem = `https://www.youtube.com/watch?v=${id}`) {
  const f = await criarFonteDeTeste({ agenteId, tipo: 'youtube', titulo, nomeOriginal: null, bytes: null })
  return prisma.fonte.update({ where: { id: f.id }, data: { urlOrigem, tamanhoBytes: 0 } })
}

describe('fonte do YouTube na fila', () => {
  it('vai a pronta com trechos que começam com [00:00], título do vídeo, duração e tamanho preenchidos', async () => {
    const fonte = await youtube()
    expect(await fila().processarUma(fonte.id)).toBe(true)
    const depois = await ler(fonte.id)
    expect(depois).toMatchObject({
      status: 'pronto',
      titulo: 'Aula de exemplo',
      duracaoSegundos: 75,
      etapa: null,
      progresso: null,
      mensagemErro: null,
      caminhoArquivo: null,
      urlOrigem: `https://www.youtube.com/watch?v=${ID_COM_LEGENDAS}`,
    })
    expect(depois.processadoEm).toEqual(AGORA)
    expect(depois.tamanhoBytes).toBeGreaterThan(50)
    const trechos = await prisma.trecho.findMany({ where: { fonteId: fonte.id }, orderBy: { indice: 'asc' } })
    const texto = trechos.map((t) => t.texto).join('\n')
    expect(trechos[0]!.texto.startsWith('[00:00] Welcome to the lesson.')).toBe(true)
    expect(texto).toContain("[01:00] Thanks for watching.")
    expect(depois.totalTrechos).toBe(trechos.length)
    expect(depois.caracteres).toBeGreaterThan(40)
    expect(falso.requisicoes.map((r) => r.caminho)).toEqual(['/watch', '/api/timedtext'])
  })

  it('sem legendas tenta recuperação e preserva a mensagem de falha', async () => {
    const fonte = await youtube(ID_SEM_LEGENDAS)
    await fila().processarUma(fonte.id)
    const depois = await ler(fonte.id)
    expect(depois.status).toBe('erro')
    expect(recuperarYoutube).toHaveBeenCalledOnce()
    expect(depois.mensagemErro).toBe('Falha simulada na recuperação do vídeo.')
  })

  it('anexa a transcrição recuperada à fonte, mantém o link e grava os trechos', async () => {
    const fonte = await youtube(ID_SEM_LEGENDAS)
    const recuperar = vi.fn(async () => ({ texto: '[00:00] Conteúdo transcrito do áudio.', titulo: 'Aula transcrita', duracaoSegundos: 90 }))
    const f = criarFila({ armazenamento: armazenamentoDeTeste(), recuperarYoutube: recuperar })
    await f.processarUma(fonte.id)
    expect(await ler(fonte.id)).toMatchObject({ status: 'pronto', titulo: 'Aula transcrita', duracaoSegundos: 90, caminhoArquivo: null, urlOrigem: fonte.urlOrigem })
    expect(await prisma.trecho.findMany({ where: { fonteId: fonte.id } })).toEqual([expect.objectContaining({ texto: '[00:00] Conteúdo transcrito do áudio.' })])
  })

  it('legenda válida não aciona a recuperação nem a transcrição', async () => {
    await fila().processarUma((await youtube()).id)
    expect(recuperarYoutube).not.toHaveBeenCalled()
  })

  it('um título dado pelo usuário não é trocado pelo do vídeo', async () => {
    const fonte = await youtube(ID_COM_LEGENDAS, 'Minha aula de reembolso')
    await fila().processarUma(fonte.id)
    expect((await ler(fonte.id)).titulo).toBe('Minha aula de reembolso')
  })

  it('uma página em outro formato dá erro de leitura sem vazar detalhe do conteúdo', async () => {
    falso.configurar({ paginaBytesExtras: 0, paginaQuebrada: true })
    const fonte = await youtube()
    await fila().processarUma(fonte.id)
    const depois = await ler(fonte.id)
    expect(depois.status).toBe('erro')
    expect(recuperarYoutube).toHaveBeenCalledOnce()
    expect(depois.mensagemErro).toBe('Falha simulada na recuperação do vídeo.')
    expect(depois.mensagemErro).not.toContain('página em outro formato')
  })

  it('Reprocessar volta a buscar as legendas', async () => {
    const fonte = await youtube()
    falso.configurar({ statusDaPagina: 500 })
    await fila().processarUma(fonte.id)
    expect((await ler(fonte.id)).status).toBe('erro')
    falso.configurar({ statusDaPagina: 200 })
    await reprocessar(await criarAdmin(), agenteId, fonte.id)
    await fila().processarUma(fonte.id)
    const depois = await ler(fonte.id)
    expect(depois).toMatchObject({ status: 'pronto', titulo: 'Aula de exemplo' })
    expect(falso.requisicoes.filter((r) => r.caminho === '/watch')).toHaveLength(2)
  })

  it('uma urlOrigem adulterada para outro host vira erro e o simulado não recebe nenhuma conexão', async () => {
    const fonte = await youtube(ID_COM_LEGENDAS, 'Adulterada', 'https://evil.com/watch?v=abcdefghijk')
    await fila().processarUma(fonte.id)
    const depois = await ler(fonte.id)
    expect(depois.status).toBe('erro')
    expect(depois.mensagemErro).toMatch(/YouTube/)
    expect(falso.requisicoes).toHaveLength(0)
  })

  it('a fila drena YouTube na raia de mídia e texto na leve', async () => {
    const yt = await youtube()
    const texto = await criarFonteDeTeste({ agenteId, tipo: 'texto', nomeOriginal: null, bytes: Buffer.from('Texto.') })
    expect(await fila().processarPendentes()).toBe(2)
    expect((await ler(yt.id)).status).toBe('pronto')
    expect((await ler(texto.id)).status).toBe('pronto')
  })
})
