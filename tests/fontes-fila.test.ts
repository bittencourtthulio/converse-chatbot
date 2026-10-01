import { describe, it, expect, beforeEach, afterAll, vi, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { criarFila } from '@/servicos/fontes-fila'
import { limparBanco } from './ajuda'
import { armazenamentoDeTeste, criarAgenteDeTeste, criarFonteDeTeste } from './apoio/fontes'

const fixture = (nome: string) => readFileSync(path.resolve(process.cwd(), 'tests/fixtures', nome))
const AGORA = new Date('2026-09-30T12:00:00.000Z')
const fila = () => criarFila({ relogio: () => AGORA, armazenamento: armazenamentoDeTeste() })

let agenteId: string
beforeEach(async () => {
  await limparBanco()
  agenteId = (await criarAgenteDeTeste()).agente.id
})
afterEach(() => vi.restoreAllMocks())
afterAll(limparBanco)

describe('processar uma fonte', () => {
  it('texto vira pronto, com trechos numerados, totais e o relógio injetado', async () => {
    const texto = `${'Uma frase de teste sobre a política de troca. '.repeat(80)}\n\n${'Outra frase, agora sobre horário. '.repeat(60)}`
    const fonte = await criarFonteDeTeste({ agenteId, tipo: 'texto', nomeOriginal: null, bytes: Buffer.from(texto) })

    expect(await fila().processarUma(fonte.id)).toBe(true)

    const depois = await prisma.fonte.findUniqueOrThrow({ where: { id: fonte.id } })
    const trechos = await prisma.trecho.findMany({ where: { fonteId: fonte.id }, orderBy: { indice: 'asc' } })
    expect(depois.status).toBe('pronto')
    expect(depois.mensagemErro).toBeNull()
    expect(depois.processadoEm).toEqual(AGORA)
    expect(trechos.length).toBeGreaterThan(3)
    expect(depois.totalTrechos).toBe(trechos.length)
    expect(depois.caracteres).toBe(texto.trim().length)
    expect(trechos.map((t) => t.indice)).toEqual(trechos.map((_, i) => i))
    for (const t of trechos) {
      expect(t.agenteId).toBe(agenteId)
      expect(t.caracteres).toBe(t.texto.length)
      expect(t.texto.length).toBeLessThanOrEqual(1000)
    }
  })

  it('PDF de verdade vira pronto com o texto extraído', async () => {
    const fonte = await criarFonteDeTeste({ agenteId, nomeOriginal: 'manual.pdf', bytes: fixture('exemplo.pdf') })
    await fila().processarUma(fonte.id)
    const trechos = await prisma.trecho.findMany({ where: { fonteId: fonte.id } })
    expect((await prisma.fonte.findUniqueOrThrow({ where: { id: fonte.id } })).status).toBe('pronto')
    expect(trechos.map((t) => t.texto).join(' ')).toContain('Loja Exemplo vende material de escritório')
  })

  it('reprocessar substitui os trechos antigos em vez de somar', async () => {
    const fonte = await criarFonteDeTeste({ agenteId, bytes: Buffer.from('Texto novo e curto.') })
    await prisma.trecho.createMany({
      data: [0, 1, 2].map((i) => ({ fonteId: fonte.id, agenteId, indice: i, texto: 'velho', caracteres: 5 })),
    })
    await fila().processarUma(fonte.id)
    const trechos = await prisma.trecho.findMany({ where: { fonteId: fonte.id } })
    expect(trechos.map((t) => t.texto)).toEqual(['Texto novo e curto.'])
  })

  it('PDF escaneado vira erro com a mensagem de OCR e nenhum trecho', async () => {
    const fonte = await criarFonteDeTeste({ agenteId, nomeOriginal: 'scan.pdf', bytes: fixture('escaneado.pdf') })
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await expect(fila().processarUma(fonte.id)).resolves.toBe(true)
    const depois = await prisma.fonte.findUniqueOrThrow({ where: { id: fonte.id } })
    expect(depois.status).toBe('erro')
    expect(depois.mensagemErro).toBe('Este PDF não tem texto selecionável (parece escaneado). OCR não é suportado.')
    expect(depois.processadoEm).toEqual(AGORA)
    expect(depois.totalTrechos).toBe(0)
    expect(await prisma.trecho.count()).toBe(0)
    expect(log).not.toHaveBeenCalled() // erro esperado, sem log de correlação
  })

  it('arquivo que sumiu do disco vira erro em português, sem caminho interno', async () => {
    const fonte = await criarFonteDeTeste({ agenteId, bytes: Buffer.from('x') })
    await armazenamentoDeTeste().apagarFonte(agenteId, fonte.id)
    await fila().processarUma(fonte.id)
    const depois = await prisma.fonte.findUniqueOrThrow({ where: { id: fonte.id } })
    expect(depois.status).toBe('erro')
    expect(depois.mensagemErro).toMatch(/arquivo original/)
    expect(depois.mensagemErro).not.toMatch(/\/|storage/)
  })

  it('fonte sem arquivo gravado e vídeo sem chave do OpenRouter viram erro, não exceção', async () => {
    const semArquivo = await criarFonteDeTeste({ agenteId, bytes: null })
    const video = await criarFonteDeTeste({ agenteId, tipo: 'video', nomeOriginal: 'a.mp4', bytes: Buffer.from('x') })
    await fila().processarUma(semArquivo.id)
    await fila().processarUma(video.id)
    for (const f of [semArquivo, video]) {
      const depois = await prisma.fonte.findUniqueOrThrow({ where: { id: f.id } })
      expect(depois.status).toBe('erro')
      expect(depois.mensagemErro).toBeTruthy()
    }
  })

  it('erro inesperado: frase genérica na fonte e linha de log com correlação, sem conteúdo', async () => {
    const fonte = await criarFonteDeTeste({ agenteId, bytes: Buffer.from('conteúdo secreto do cliente') })
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const f = criarFila({
      relogio: () => AGORA,
      armazenamento: armazenamentoDeTeste(),
      extrair: async () => {
        throw new Error('falha interna em /var/dados/segredo')
      },
    })

    await expect(f.processarUma(fonte.id)).resolves.toBe(true)

    const depois = await prisma.fonte.findUniqueOrThrow({ where: { id: fonte.id } })
    expect(depois.status).toBe('erro')
    expect(depois.mensagemErro).toMatch(/Não foi possível processar/)
    expect(depois.mensagemErro).not.toMatch(/segredo|\/var/)
    expect(log).toHaveBeenCalledTimes(1)
    const linha = JSON.parse(String(log.mock.calls[0]![0])) as Record<string, string>
    expect(linha).toMatchObject({ nivel: 'erro', msg: 'fonte_falhou', fonteId: fonte.id, agenteId, erro: 'Error' })
    expect(linha.correlacao).toMatch(/^[0-9a-f]{8}$/)
    expect(JSON.stringify(linha)).not.toMatch(/segredo|cliente|falha interna/)
  })

  it('fonte que não existe ou que não está pendente não é processada', async () => {
    expect(await fila().processarUma('nao-existe')).toBe(false)
    const pronta = await criarFonteDeTeste({ agenteId, status: 'pronto' })
    const ocupada = await criarFonteDeTeste({ agenteId, status: 'processando' })
    expect(await fila().processarUma(pronta.id)).toBe(false)
    expect(await fila().processarUma(ocupada.id)).toBe(false)
    expect((await prisma.fonte.findUniqueOrThrow({ where: { id: ocupada.id } })).status).toBe('processando')
  })
})
