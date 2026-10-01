/**
 * T-04.05 (FT-08): o caminho completo de um áudio, com ffmpeg de verdade e o
 * OpenRouter simulado: envio por `adicionarVideo`, fila com partes de 10
 * segundos, texto com marcadores de tempo, busca pelo texto, falha de uma
 * parte e Reprocessar retomando só das partes que faltam (PR-71 a PR-74).
 */
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { ambiente } from '@/lib/ambiente'
import { adicionarVideo, reprocessar } from '@/servicos/fontes'
import { criarFila } from '@/servicos/fontes-fila'
import { salvarChaveDoOpenrouter } from '@/servicos/integracoes'
import { buscarTrechos } from '@/servicos/recuperacao'
import { criarAdmin, limparBanco } from './ajuda'
import { armazenamentoDeTeste, criarAgenteDeTeste } from './apoio/fontes'
import { descreverComFfmpeg, gerarAudioComSilencio, gerarMidia } from './apoio/ffmpeg'
import { CHAVE_VALIDA, iniciarOpenRouterFalso, type OpenRouterFalso } from './apoio/openrouter-falso'

let falso: OpenRouterFalso
let pasta: string
let autor: Awaited<ReturnType<typeof criarAdmin>>
let agenteId: string
const baseOriginal = process.env.OPENROUTER_BASE_URL

const FALAS = [
  'A política de reembolso vale por trinta dias corridos.',
  'O atendimento funciona de segunda a sexta.',
  'Entregas acontecem em até cinco dias úteis.',
]

beforeEach(async () => {
  await limparBanco()
  falso = await iniciarOpenRouterFalso({ transcricoes: FALAS })
  process.env.OPENROUTER_BASE_URL = falso.url
  autor = await criarAdmin()
  agenteId = (await criarAgenteDeTeste()).agente.id
  await salvarChaveDoOpenrouter(autor, { chave: CHAVE_VALIDA })
  pasta = mkdtempSync(path.join(os.tmpdir(), 'video-fim-a-fim-'))
})
afterEach(async () => {
  await falso.fechar()
  rmSync(pasta, { recursive: true, force: true })
  if (baseOriginal === undefined) delete process.env.OPENROUTER_BASE_URL
  else process.env.OPENROUTER_BASE_URL = baseOriginal
})
afterAll(limparBanco)

async function enviarAudio(segundos = 25) {
  const bytes = readFileSync(gerarMidia({ formato: 'mp3', segundos, diretorio: pasta, ruido: true, nome: 'fala' }))
  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      c.enqueue(bytes)
      c.close()
    },
  })
  return adicionarVideo(autor, agenteId, { nome: 'Aula de reembolso.mp3', corpo: stream })
}
const fila = () =>
  criarFila({ armazenamento: armazenamentoDeTeste(), segundosPorParte: 10, relogio: () => new Date('2026-09-30T12:00:00Z') })
const ler = (id: string) => prisma.fonte.findUniqueOrThrow({ where: { id } })
const pastaDaFonte = (id: string) => path.join(ambiente.storageDir, 'fontes', agenteId, id)

descreverComFfmpeg('vídeo e áudio de ponta a ponta', () => {
  it('um áudio de 25 segundos vira fonte pronta com trechos que começam em [00:00], e a busca acha uma palavra da transcrição', async () => {
    const enviada = await enviarAudio()
    expect(enviada.status).toBe('pendente')

    await fila().processarPendentes()

    const pronta = await ler(enviada.id)
    expect(pronta).toMatchObject({ status: 'pronto', etapa: null, progresso: null, mensagemErro: null })
    expect(pronta.duracaoSegundos).toBeGreaterThanOrEqual(24)
    expect(pronta.duracaoSegundos).toBeLessThanOrEqual(26)
    const trechos = await prisma.trecho.findMany({ where: { fonteId: enviada.id }, orderBy: { indice: 'asc' } })
    expect(trechos[0]!.texto.startsWith('[00:00] ')).toBe(true)
    const todo = trechos.map((t) => t.texto).join('\n')
    expect(todo).toContain('[00:10] O atendimento funciona de segunda a sexta.')
    expect(todo).toContain('[00:20] Entregas acontecem')
    expect(falso.audios.map((a) => [a.parte, a.formato, a.modelo])).toEqual([
      [0, 'mp3', 'google/gemini-2.5-flash'],
      [1, 'mp3', 'google/gemini-2.5-flash'],
      [2, 'mp3', 'google/gemini-2.5-flash'],
    ])

    const achados = await buscarTrechos(agenteId, 'qual o prazo do reembolso?')
    expect(achados.length).toBeGreaterThan(0)
    expect(achados[0]!.texto).toContain('reembolso')
    expect(achados[0]!.titulo).toBe('Aula de reembolso.mp3')

    // o original fica; o áudio e os segmentos saíram
    expect(existsSync(path.join(pastaDaFonte(enviada.id), 'original'))).toBe(true)
    expect(existsSync(path.join(pastaDaFonte(enviada.id), 'audio'))).toBe(false)
    expect(existsSync(path.join(pastaDaFonte(enviada.id), 'segmentos'))).toBe(false)
  })

  it('falha na parte 2 deixa erro com a parte; Reprocessar zera etapa e progresso e só as partes 2 e 3 chamam o simulado', async () => {
    const enviada = await enviarAudio()
    falso.configurar({ falhasPorParte: { 1: 402 } })

    await fila().processarPendentes()

    const falhou = await ler(enviada.id)
    expect(falhou.status).toBe('erro')
    expect(falhou.mensagemErro).toMatch(/^Falha na parte 2 de 3: /)
    expect(falhou.mensagemErro).toMatch(/Saldo insuficiente/)
    expect(falso.audios.map((a) => a.parte)).toEqual([0, 1])
    expect(await armazenamentoDeTeste().listarSegmentos(agenteId, enviada.id)).toEqual([0])
    expect(existsSync(path.join(pastaDaFonte(enviada.id), 'audio'))).toBe(false)

    // sobra de andamento de uma tentativa anterior: o Reprocessar zera
    await prisma.fonte.update({ where: { id: enviada.id }, data: { etapa: 'Transcrevendo parte 2 de 3', progresso: 50 } })
    const reaberta = await reprocessar(autor, agenteId, enviada.id)
    expect(reaberta).toMatchObject({ status: 'pendente', etapa: null, progresso: null, mensagemErro: null })

    falso.configurar({ falhasPorParte: {} })
    await fila().processarPendentes()

    const pronta = await ler(enviada.id)
    expect(pronta.status).toBe('pronto')
    const chamadas = falso.audios.map((a) => [a.parte, a.tentativa])
    // a parte 0 não foi paga de novo: depois das duas primeiras chamadas só a 1 (segunda tentativa) e a 2
    expect(chamadas).toEqual([[0, 1], [1, 1], [1, 2], [2, 1]])
    const todo = (await prisma.trecho.findMany({ where: { fonteId: enviada.id }, orderBy: { indice: 'asc' } })).map((t) => t.texto).join('\n')
    expect(todo).toContain('[00:00] A política de reembolso')
    expect(todo).toContain('[00:10] O atendimento')
    expect(existsSync(path.join(pastaDaFonte(enviada.id), 'segmentos'))).toBe(false)
  })

  it('um arquivo mp3 que só tem a assinatura mas não é áudio vira erro claro, sem chamar o simulado', async () => {
    const lixo = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(Buffer.concat([Buffer.from('ID3'), Buffer.from([3, 0, 0, 0, 0, 0, 0, 0, 0]), Buffer.from('isto não é áudio '.repeat(200))]))
        c.close()
      },
    })
    const enviada = await adicionarVideo(autor, agenteId, { nome: 'lixo.mp3', corpo: lixo })
    await fila().processarPendentes()
    const depois = await ler(enviada.id)
    expect(depois.status).toBe('erro')
    expect(depois.mensagemErro).toMatch(/áudio ou vídeo|corrompido|faixa de áudio/)
    expect(falso.audios).toHaveLength(0)
  })
})

async function enviarArquivo(caminho: string, nome: string) {
  const bytes = readFileSync(caminho)
  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      c.enqueue(bytes)
      c.close()
    },
  })
  return adicionarVideo(autor, agenteId, { nome, corpo: stream })
}

descreverComFfmpeg('áudio com trecho sem fala de ponta a ponta (FT-13, PR-09, PR-105)', () => {
  it('fala, 10 s de silêncio e ruído: a fonte fica pronta com [sem fala] no texto, a busca acha a fala e a retomada não repaga nada', async () => {
    // Três partes de 10 s com conteúdos diferentes (fala, silêncio, ruído); o simulado responde vazio à parte 2 (índice 1).
    falso.configurar({ silencios: [1] })
    const arquivo = gerarAudioComSilencio({ diretorio: pasta, fala: 10, silencio: 10, ruido: 5, nome: 'aula-com-silencio' })
    const enviada = await enviarArquivo(arquivo, 'Aula com silêncio.mp3')

    await fila().processarPendentes()

    const pronta = await ler(enviada.id)
    expect(pronta).toMatchObject({ status: 'pronto', mensagemErro: null })
    const trechos = await prisma.trecho.findMany({ where: { fonteId: enviada.id }, orderBy: { indice: 'asc' } })
    const todo = trechos.map((t) => t.texto).join('\n')
    expect(todo).toContain('[00:00] A política de reembolso')
    expect(todo).toContain('[00:10] [sem fala]')
    expect(todo).toContain('[00:20] Entregas acontecem')
    // O texto do silêncio não é uma fala inventada e a parte muda foi chamada duas vezes (uma repetição), nunca três.
    expect(falso.audios.filter((a) => a.parte === 1).map((a) => a.tentativa)).toEqual([1, 2])
    const achados = await buscarTrechos(agenteId, 'qual o prazo do reembolso?')
    expect(achados.length).toBeGreaterThan(0)
    expect(achados[0]!.texto).toContain('reembolso')
  })

  it('áudio sem fala nenhuma vira fonte em erro com Não encontrei fala neste áudio., e Reprocessar não repete as partes já gravadas', async () => {
    falso.configurar({ silencios: [0, 1, 2] })
    const arquivo = gerarAudioComSilencio({ diretorio: pasta, fala: 0, silencio: 25, ruido: 0, nome: 'mudo' })
    const enviada = await enviarArquivo(arquivo, 'Só silêncio.mp3')

    await fila().processarPendentes()

    const falhou = await ler(enviada.id)
    expect(falhou.status).toBe('erro')
    expect(falhou.mensagemErro).toBe('Não encontrei fala neste áudio.')
    const chamadasAntes = falso.audios.length
    expect(chamadasAntes).toBeGreaterThan(0)
    expect(await armazenamentoDeTeste().listarSegmentos(agenteId, enviada.id)).toEqual([0, 1, 2])

    await reprocessar(autor, agenteId, enviada.id)
    await fila().processarPendentes()
    expect((await ler(enviada.id)).mensagemErro).toBe('Não encontrei fala neste áudio.')
    expect(falso.audios).toHaveLength(chamadasAntes)
  })
})
