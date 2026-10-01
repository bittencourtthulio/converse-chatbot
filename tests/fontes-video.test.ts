/**
 * T-03.03 (FT-08): `adicionarVideo` recebe o corpo como stream, confere
 * extensão, assinatura e tamanho, grava em disco e cria a fonte `pendente` do
 * tipo `video` (PR-71). Nenhuma falha deixa diretório nem linha.
 */
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { ambiente } from '@/lib/ambiente'
import { adicionarVideo } from '@/servicos/fontes'
import { criarUsuario, limparBanco } from './ajuda'
import { criarAgenteDeTeste } from './apoio/fontes'
import { descreverComFfmpeg, gerarMidia } from './apoio/ffmpeg'

let autor: Awaited<ReturnType<typeof criarUsuario>>
let agenteId: string
const original = process.env.MAX_VIDEO_MB

beforeEach(async () => {
  await limparBanco()
  autor = await criarUsuario()
  agenteId = (await criarAgenteDeTeste()).agente.id
})
afterEach(() => {
  if (original === undefined) delete process.env.MAX_VIDEO_MB
  else process.env.MAX_VIDEO_MB = original
})
afterAll(limparBanco)

function fluxo(bytes: Uint8Array, pedaco = 32768) {
  const estado = { lidos: 0 }
  let i = 0
  // highWaterMark 0: nada é lido enquanto ninguém pedir (o `pull` não roda na criação).
  const stream = new ReadableStream<Uint8Array>(
    {
      pull(c) {
        if (i >= bytes.length) return c.close()
        estado.lidos += 1
        c.enqueue(bytes.subarray(i, i + pedaco))
        i += pedaco
      },
    },
    { highWaterMark: 0 },
  )
  return { stream, estado }
}
const mp3Sintetico = (tamanho = 100_000) => Buffer.concat([Buffer.from('ID3'), Buffer.from([3, 0, 0, 0, 0, 0, 0, 0, 0]), randomBytes(tamanho)])
const pastaDoAgente = () => path.join(ambiente.storageDir, 'fontes', agenteId)
const nadaEmDisco = () => !existsSync(pastaDoAgente()) || readdirSync(pastaDoAgente()).length === 0

describe('adicionarVideo', () => {
  it('um MP3 em stream vira fonte pendente de tipo video com o original em disco e o nome sanitizado', async () => {
    const bytes = mp3Sintetico()
    const fonte = await adicionarVideo(autor, agenteId, { nome: '../../Aula  1\u0000.mp3', corpo: fluxo(bytes).stream })
    expect(fonte).toMatchObject({
      agenteId,
      tipo: 'video',
      status: 'pendente',
      titulo: 'Aula 1.mp3',
      nomeOriginal: 'Aula 1.mp3',
      tipoMime: 'audio/mpeg',
      tamanhoBytes: bytes.length,
      progresso: null,
      etapa: null,
      duracaoSegundos: null,
      urlOrigem: null,
    })
    expect(fonte).not.toHaveProperty('caminhoArquivo')
    const linha = await prisma.fonte.findUniqueOrThrow({ where: { id: fonte.id } })
    expect(linha.criadoPorId).toBe(autor.id)
    expect(linha.caminhoArquivo).toBe(`fontes/${agenteId}/${fonte.id}/original`)
    expect(linha.caminhoArquivo).not.toMatch(/Aula|mp3/)
    expect(readFileSync(path.join(ambiente.storageDir, linha.caminhoArquivo!)).equals(bytes)).toBe(true)
  })

  descreverComFfmpeg('com mídia gerada pelo ffmpeg', () => {
    it('um MP3 gerado pelo ffmpeg é aceito com o tamanho real', async () => {
      const pasta = mkdtempSync(path.join(os.tmpdir(), 'fontes-video-'))
      try {
        const arquivo = gerarMidia({ formato: 'mp3', segundos: 3, diretorio: pasta })
        const bytes = readFileSync(arquivo)
        const fonte = await adicionarVideo(autor, agenteId, { nome: 'fala.mp3', corpo: fluxo(bytes).stream })
        expect(fonte.tamanhoBytes).toBe(bytes.length)
        expect(fonte.status).toBe('pendente')
      } finally {
        rmSync(pasta, { recursive: true, force: true })
      }
    })
  })

  it('extensão fora da lista dá formato_nao_aceito 415 sem tocar o disco', async () => {
    const { stream, estado } = fluxo(mp3Sintetico())
    const erro = await adicionarVideo(autor, agenteId, { nome: 'documento.pdf', corpo: stream }).catch((e) => e)
    expect(erro).toMatchObject({ status: 415, codigo: 'formato_nao_aceito' })
    expect(erro.message).toMatch(/\.mp4/)
    expect(estado.lidos).toBe(0)
    expect(nadaEmDisco()).toBe(true)
    expect(await prisma.fonte.count()).toBe(0)
  })

  it('assinatura incoerente dá assinatura_incoerente 415 e não deixa diretório nem linha', async () => {
    const texto = Buffer.from('isto é um texto qualquer, não um vídeo mp4. '.repeat(100))
    const erro = await adicionarVideo(autor, agenteId, { nome: 'falso.mp4', corpo: fluxo(texto).stream }).catch((e) => e)
    expect(erro).toMatchObject({ status: 415, codigo: 'assinatura_incoerente' })
    expect(nadaEmDisco()).toBe(true)
    expect(await prisma.fonte.count()).toBe(0)
  })

  it('corpo vazio dá arquivo_vazio 422', async () => {
    const erro = await adicionarVideo(autor, agenteId, { nome: 'vazio.mp3', corpo: fluxo(new Uint8Array(0)).stream }).catch((e) => e)
    expect(erro).toMatchObject({ status: 422, codigo: 'arquivo_vazio' })
    expect(nadaEmDisco()).toBe(true)
  })

  it('acima do limite dá arquivo_grande_demais 413: por tamanho declarado sem ler o corpo e por contagem de bytes', async () => {
    process.env.MAX_VIDEO_MB = '1'
    const declarado = fluxo(mp3Sintetico(10))
    const erro1 = await adicionarVideo(autor, agenteId, {
      nome: 'grande.mp3',
      corpo: declarado.stream,
      tamanhoDeclarado: 5 * 1024 * 1024,
    }).catch((e) => e)
    expect(erro1).toMatchObject({ status: 413, codigo: 'arquivo_grande_demais' })
    expect(declarado.estado.lidos).toBe(0)

    const contado = fluxo(mp3Sintetico(1_500_000))
    const erro2 = await adicionarVideo(autor, agenteId, { nome: 'grande.mp3', corpo: contado.stream }).catch((e) => e)
    expect(erro2).toMatchObject({ status: 413, codigo: 'arquivo_grande_demais' })
    expect(nadaEmDisco()).toBe(true)
    expect(await prisma.fonte.count()).toBe(0)
  })

  it('sem sessão dá 401, agente inexistente 404, nome ausente ou vazio 422, e nada é gravado', async () => {
    const corpo = () => fluxo(mp3Sintetico()).stream
    await expect(adicionarVideo(null as never, agenteId, { nome: 'a.mp3', corpo: corpo() })).rejects.toMatchObject({ status: 401 })
    await expect(adicionarVideo(autor, 'agente-que-nao-existe', { nome: 'a.mp3', corpo: corpo() })).rejects.toMatchObject({ status: 404 })
    for (const nome of [undefined, '', '   ', 42]) {
      await expect(adicionarVideo(autor, agenteId, { nome, corpo: corpo() }), String(nome)).rejects.toMatchObject({ status: 422 })
    }
    await expect(adicionarVideo(autor, agenteId, { nome: 'a.mp3', corpo: null })).rejects.toMatchObject({ status: 422 })
    expect(nadaEmDisco()).toBe(true)
    expect(await prisma.fonte.count()).toBe(0)
  })
})
