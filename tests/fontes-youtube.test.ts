/**
 * T-05.04 (FT-08): `adicionarYoutube` valida a URL com zod, cria a fonte
 * `pendente` do tipo `youtube` com a origem normalizada e acorda a fila, sem
 * falar com o YouTube (PR-75, PR-76).
 */
import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { ambiente } from '@/lib/ambiente'
import { adicionarYoutube } from '@/servicos/fontes'
import { obterFila } from '@/servicos/fontes-fila'
import { criarUsuario, limparBanco } from './ajuda'
import { criarAgenteDeTeste } from './apoio/fontes'
import { iniciarYoutubeFalso, type YoutubeFalso } from './apoio/youtube-falso'

let autor: Awaited<ReturnType<typeof criarUsuario>>
let agenteId: string
let falso: YoutubeFalso
const baseOriginal = process.env.YOUTUBE_BASE

beforeEach(async () => {
  await limparBanco()
  autor = await criarUsuario()
  agenteId = (await criarAgenteDeTeste()).agente.id
  falso = await iniciarYoutubeFalso()
  process.env.YOUTUBE_BASE = falso.url
})
afterEach(async () => {
  vi.restoreAllMocks()
  await falso.fechar()
  if (baseOriginal === undefined) delete process.env.YOUTUBE_BASE
  else process.env.YOUTUBE_BASE = baseOriginal
})
afterAll(limparBanco)

describe('adicionarYoutube', () => {
  it('uma URL válida cria fonte pendente de tipo youtube com a origem normalizada, sem arquivo, e acorda a fila', async () => {
    const acordar = vi.spyOn(obterFila(), 'acordar')
    const fonte = await adicionarYoutube(autor, agenteId, { url: '  https://youtu.be/abcdefghijk?si=xyz  ' })
    expect(fonte).toMatchObject({
      agenteId,
      tipo: 'youtube',
      status: 'pendente',
      titulo: 'YouTube: abcdefghijk',
      nomeOriginal: null,
      tipoMime: null,
      tamanhoBytes: 0,
      urlOrigem: 'https://www.youtube.com/watch?v=abcdefghijk',
      progresso: null,
      etapa: null,
      duracaoSegundos: null,
    })
    expect(fonte).not.toHaveProperty('caminhoArquivo')
    const linha = await prisma.fonte.findUniqueOrThrow({ where: { id: fonte.id } })
    expect(linha.caminhoArquivo).toBeNull()
    expect(linha.criadoPorId).toBe(autor.id)
    expect(existsSync(path.join(ambiente.storageDir, 'fontes', agenteId))).toBe(false)
    expect(acordar).toHaveBeenCalledTimes(1)
    // criar a fonte não fala com o YouTube: a leitura é da fila
    expect(falso.requisicoes).toHaveLength(0)
  })

  it('o mesmo link duas vezes cria duas fontes (sem deduplicação)', async () => {
    await adicionarYoutube(autor, agenteId, { url: 'https://youtu.be/abcdefghijk' })
    await adicionarYoutube(autor, agenteId, { url: 'https://youtu.be/abcdefghijk' })
    expect(await prisma.fonte.count({ where: { tipo: 'youtube' } })).toBe(2)
  })

  it('URL de outro host dá 422, URL ausente ou acima de 300 caracteres dá 422, e nada é criado', async () => {
    const tentar = (entrada: unknown) => adicionarYoutube(autor, agenteId, entrada)
    await expect(tentar({ url: 'https://evil.com/watch?v=abcdefghijk' })).rejects.toMatchObject({ status: 422, codigo: 'url_invalida' })
    await expect(tentar({ url: 'https://www.youtube.com/watch?v=curto' })).rejects.toMatchObject({ status: 422 })
    await expect(tentar({})).rejects.toMatchObject({ status: 422 })
    await expect(tentar(undefined)).rejects.toMatchObject({ status: 422 })
    await expect(tentar({ url: 7 })).rejects.toMatchObject({ status: 422 })
    await expect(tentar({ url: '   ' })).rejects.toMatchObject({ status: 422 })
    const longa = `https://www.youtube.com/watch?v=abcdefghijk&x=${'a'.repeat(300)}`
    await expect(tentar({ url: longa })).rejects.toMatchObject({ status: 422, message: /300/ })
    expect(await prisma.fonte.count()).toBe(0)
  })

  it('agente inexistente dá 404 e usuário sem sessão dá 401', async () => {
    await expect(adicionarYoutube(autor, 'agente-que-nao-existe', { url: 'https://youtu.be/abcdefghijk' })).rejects.toMatchObject({ status: 404 })
    await expect(adicionarYoutube(null as never, agenteId, { url: 'https://youtu.be/abcdefghijk' })).rejects.toMatchObject({ status: 401 })
    expect(await prisma.fonte.count()).toBe(0)
  })
})
