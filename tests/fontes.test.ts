import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { ambiente } from '@/lib/ambiente'
import { obterFila } from '@/servicos/fontes-fila'
import {
  adicionarTexto,
  listar,
  obter,
  resumo,
  trechosDaFonte,
} from '@/servicos/fontes'
import { criarUsuario, limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarFonteDeTeste } from './apoio/fontes'

let autor: Awaited<ReturnType<typeof criarUsuario>>
let agenteId: string

beforeEach(async () => {
  await limparBanco()
  autor = await criarUsuario()
  agenteId = (await criarAgenteDeTeste()).agente.id
})
afterAll(limparBanco)

describe('adicionarTexto', () => {
  it('grava o original, cria a fonte pendente e, depois da fila, fica pronta com trechos', async () => {
    const fonte = await adicionarTexto(autor, agenteId, {
      titulo: '  Política de troca  ',
      conteudo: 'A troca é aceita em até sete dias.\n\nCom nota fiscal.',
    })

    expect(fonte).toMatchObject({
      agenteId,
      tipo: 'texto',
      titulo: 'Política de troca',
      tipoMime: 'text/plain',
      status: 'pendente',
      nomeOriginal: null,
    })
    expect(fonte.tamanhoBytes).toBe(Buffer.byteLength('A troca é aceita em até sete dias.\n\nCom nota fiscal.'))
    expect(fonte).not.toHaveProperty('caminhoArquivo')
    const linha = await prisma.fonte.findUniqueOrThrow({ where: { id: fonte.id } })
    expect(linha.criadoPorId).toBe(autor.id)
    expect(linha.caminhoArquivo).toBe(`fontes/${agenteId}/${fonte.id}/original`)
    expect(existsSync(path.join(ambiente.storageDir, linha.caminhoArquivo!))).toBe(true)

    await obterFila().processarPendentes()

    const [pronta] = await listar(autor, agenteId)
    expect(pronta).toMatchObject({ id: fonte.id, status: 'pronto', totalTrechos: 1 })
    const pagina = await trechosDaFonte(autor, agenteId, fonte.id)
    expect(pagina.trechos.map((t) => t.texto)).toEqual(['A troca é aceita em até sete dias.\n\nCom nota fiscal.'])
  })

  it('recusa título vazio, título de 121, conteúdo vazio, só espaços e conteúdo de 200001', async () => {
    const tentar = (entrada: unknown) => adicionarTexto(autor, agenteId, entrada)
    await expect(tentar({ titulo: '', conteudo: 'x' })).rejects.toMatchObject({ status: 422, message: /título/i })
    await expect(tentar({ titulo: '   ', conteudo: 'x' })).rejects.toMatchObject({ status: 422 })
    await expect(tentar({ titulo: 'a'.repeat(121), conteudo: 'x' })).rejects.toMatchObject({
      status: 422,
      message: /120/,
    })
    await expect(tentar({ titulo: 'T', conteudo: '' })).rejects.toMatchObject({ status: 422, message: /conteúdo|texto/i })
    await expect(tentar({ titulo: 'T', conteudo: '  \n ' })).rejects.toMatchObject({ status: 422 })
    await expect(tentar({ titulo: 'T', conteudo: 'a'.repeat(200_001) })).rejects.toMatchObject({
      status: 422,
      message: /200\.000/,
    })
    await expect(tentar({ titulo: 'T' })).rejects.toMatchObject({ status: 422 })
    await expect(tentar(null)).rejects.toMatchObject({ status: 422 })
    expect(await prisma.fonte.count()).toBe(0)
    // No limite, aceita.
    await expect(tentar({ titulo: 'a'.repeat(120), conteudo: 'a'.repeat(200_000) })).resolves.toBeTruthy()
  })

  it('agente inexistente é 404 e nada é gravado; sem autor é 401', async () => {
    await expect(adicionarTexto(autor, 'nao-existe', { titulo: 'T', conteudo: 'x' })).rejects.toMatchObject({
      status: 404,
    })
    await expect(
      adicionarTexto(null as never, agenteId, { titulo: 'T', conteudo: 'x' }),
    ).rejects.toMatchObject({ status: 401 })
    expect(await prisma.fonte.count()).toBe(0)
  })

  it('não usa o título em caminho: título com barras fica só no banco', async () => {
    const fonte = await adicionarTexto(autor, agenteId, { titulo: '../../etc/passwd', conteudo: 'x' })
    const linha = await prisma.fonte.findUniqueOrThrow({ where: { id: fonte.id } })
    expect(linha.caminhoArquivo).not.toContain('passwd')
    expect(fonte.titulo).toBe('../../etc/passwd')
  })
})

describe('listar, obter e resumo', () => {
  it('lista do agente, a mais nova primeiro, sem as de outro agente e sem o caminho', async () => {
    const outro = (await criarAgenteDeTeste('Outro')).agente.id
    const velha = await criarFonteDeTeste({ agenteId, titulo: 'Velha', criadoEm: new Date('2026-01-01') })
    const nova = await criarFonteDeTeste({ agenteId, titulo: 'Nova', criadoEm: new Date('2026-06-01') })
    await criarFonteDeTeste({ agenteId: outro, titulo: 'Alheia' })

    const lista = await listar(autor, agenteId)

    expect(lista.map((f) => f.id)).toEqual([nova.id, velha.id])
    for (const f of lista) expect(f).not.toHaveProperty('caminhoArquivo')
    await expect(listar(autor, 'nao-existe')).rejects.toMatchObject({ status: 404 })
  })

  it('obter devolve a fonte do agente e dá 404 para fonte de outro agente ou inexistente', async () => {
    const outro = (await criarAgenteDeTeste('Outro')).agente.id
    const minha = await criarFonteDeTeste({ agenteId, titulo: 'Minha' })
    const alheia = await criarFonteDeTeste({ agenteId: outro })

    expect((await obter(autor, agenteId, minha.id)).titulo).toBe('Minha')
    await expect(obter(autor, agenteId, alheia.id)).rejects.toMatchObject({ status: 404 })
    await expect(obter(autor, agenteId, 'nao-existe')).rejects.toMatchObject({ status: 404 })
    await expect(obter(autor, outro, minha.id)).rejects.toMatchObject({ status: 404 })
  })

  it('resumo conta por situação e soma os caracteres das prontas', async () => {
    const vazio = await resumo(autor, agenteId)
    expect(vazio).toEqual({ total: 0, prontas: 0, emProcessamento: 0, comErro: 0, caracteres: 0 })

    const p1 = await criarFonteDeTeste({ agenteId, status: 'pronto' })
    const p2 = await criarFonteDeTeste({ agenteId, status: 'pronto' })
    await prisma.fonte.update({ where: { id: p1.id }, data: { caracteres: 1200 } })
    await prisma.fonte.update({ where: { id: p2.id }, data: { caracteres: 300 } })
    await criarFonteDeTeste({ agenteId, status: 'pendente' })
    await criarFonteDeTeste({ agenteId, status: 'processando' })
    await criarFonteDeTeste({ agenteId, status: 'erro' })
    const outro = (await criarAgenteDeTeste('Outro')).agente.id
    await criarFonteDeTeste({ agenteId: outro, status: 'pronto' })

    expect(await resumo(autor, agenteId)).toEqual({
      total: 5,
      prontas: 2,
      emProcessamento: 2,
      comErro: 1,
      caracteres: 1500,
    })
  })
})

describe('trechosDaFonte', () => {
  it('pagina de 20 em 20, em ordem, com o total de páginas', async () => {
    const fonte = await criarFonteDeTeste({ agenteId, status: 'pronto' })
    await prisma.trecho.createMany({
      data: Array.from({ length: 45 }, (_, i) => ({
        fonteId: fonte.id,
        agenteId,
        indice: i,
        texto: `Trecho ${i}`,
        caracteres: 8,
      })),
    })

    const p1 = await trechosDaFonte(autor, agenteId, fonte.id)
    expect(p1).toMatchObject({ pagina: 1, porPagina: 20, totalPaginas: 3, totalTrechos: 45 })
    expect(p1.trechos).toHaveLength(20)
    expect(p1.trechos[0]!.indice).toBe(0)

    const p3 = await trechosDaFonte(autor, agenteId, fonte.id, { pagina: 3 })
    expect(p3.trechos.map((t) => t.indice)).toEqual([40, 41, 42, 43, 44])

    // Página fora do intervalo ou inválida volta para uma página que existe.
    expect((await trechosDaFonte(autor, agenteId, fonte.id, { pagina: 99 })).pagina).toBe(3)
    expect((await trechosDaFonte(autor, agenteId, fonte.id, { pagina: -2 })).pagina).toBe(1)
    expect((await trechosDaFonte(autor, agenteId, fonte.id, { pagina: Number.NaN })).pagina).toBe(1)
  })

  it('fonte sem trechos devolve página 1 de 1, vazia, e fonte alheia é 404', async () => {
    const fonte = await criarFonteDeTeste({ agenteId })
    const vazia = await trechosDaFonte(autor, agenteId, fonte.id)
    expect(vazia).toMatchObject({ pagina: 1, totalPaginas: 1, totalTrechos: 0, trechos: [] })
    const outro = (await criarAgenteDeTeste('Outro')).agente.id
    await expect(trechosDaFonte(autor, outro, fonte.id)).rejects.toMatchObject({ status: 404 })
  })
})
