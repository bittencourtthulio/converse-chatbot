/**
 * T-04.04 (FT-08): a fila ganha duas raias (leve: texto e arquivo, concorrência
 * 2; mídia: vídeo, concorrência 1), trata o tipo `video` e grava `etapa` e
 * `progresso` no banco por atualização condicional (PR-74). A transcrição é
 * injetada: nenhum ffmpeg e nenhuma rede.
 */
import { describe, it, expect, beforeEach, afterAll, vi, afterEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { MODELO_DE_TRANSCRICAO_PADRAO } from '@/lib/ambiente'
import { ErroDeAplicacao } from '@/lib/erros'
import { criarFila, type OpcoesDaFila } from '@/servicos/fontes-fila'
import { salvarChaveDoOpenrouter } from '@/servicos/integracoes'
import { criarAdmin, limparBanco } from './ajuda'
import { armazenamentoDeTeste, criarAgenteDeTeste, criarFonteDeTeste } from './apoio/fontes'

const AGORA = new Date('2026-09-30T12:00:00.000Z')
let agenteId: string
beforeEach(async () => {
  await limparBanco()
  agenteId = (await criarAgenteDeTeste()).agente.id
  await salvarChaveDoOpenrouter(await criarAdmin(), { chave: 'sk-or-v1-chave-de-teste-fila' })
})
afterEach(() => vi.restoreAllMocks())
afterAll(limparBanco)

const pausa = (ms: number) => new Promise((r) => setTimeout(r, ms))
type Transcrever = NonNullable<OpcoesDaFila['transcreverMidia']>
const fila = (transcreverMidia: Transcrever, extra: OpcoesDaFila = {}) =>
  criarFila({ relogio: () => AGORA, armazenamento: armazenamentoDeTeste(), transcreverMidia, ...extra })
const video = (extra: Partial<Parameters<typeof criarFonteDeTeste>[0]> = {}) =>
  criarFonteDeTeste({ agenteId, tipo: 'video', titulo: 'Aula', nomeOriginal: 'aula.mp3', bytes: Buffer.from('midia'), ...extra })
const ler = (id: string) => prisma.fonte.findUniqueOrThrow({ where: { id } })

describe('fonte de vídeo na fila', () => {
  it('vai de pendente a pronto, grava etapa e progresso durante o trabalho e limpa os dois ao concluir, mantendo a duração', async () => {
    const fonte = await video()
    await armazenamentoDeTeste().gravarSegmento(agenteId, fonte.id, 0, 'sobra de parte')
    const vistos: Array<{ status: string; etapa: string | null; progresso: number | null; duracaoSegundos: number | null }> = []
    const transcreverMidia: Transcrever = async (p) => {
      await p.aoAndar({ etapa: 'Verificando o arquivo', progresso: 4, duracaoSegundos: 1500 })
      vistos.push(await ler(fonte.id))
      await p.aoAndar({ etapa: 'Transcrevendo parte 2 de 3', progresso: 50 })
      vistos.push(await ler(fonte.id))
      return { texto: '[00:00] primeira fala da aula.\n\n[10:00] segunda fala da aula.', duracaoSegundos: 1500 }
    }
    const recebido: unknown[] = []
    const f = fila(async (p) => {
      recebido.push({ chave: p.chave, modelo: p.modelo, fonte: p.fonte })
      return transcreverMidia(p)
    })

    expect(await f.processarUma(fonte.id)).toBe(true)

    expect(recebido).toEqual([{ chave: 'sk-or-v1-chave-de-teste-fila', modelo: MODELO_DE_TRANSCRICAO_PADRAO, fonte: { id: fonte.id, agenteId } }])
    expect(vistos[0]).toMatchObject({ status: 'processando', etapa: 'Verificando o arquivo', progresso: 4, duracaoSegundos: 1500 })
    expect(vistos[1]).toMatchObject({ status: 'processando', etapa: 'Transcrevendo parte 2 de 3', progresso: 50 })
    const depois = await ler(fonte.id)
    expect(depois).toMatchObject({ status: 'pronto', etapa: null, progresso: null, duracaoSegundos: 1500, mensagemErro: null })
    expect(depois.processadoEm).toEqual(AGORA)
    const trechos = await prisma.trecho.findMany({ where: { fonteId: fonte.id }, orderBy: { indice: 'asc' } })
    expect(trechos.map((t) => t.texto).join('\n')).toContain('[00:00] primeira fala da aula.')
    expect(depois.totalTrechos).toBe(trechos.length)
    // o original fica; os segmentos e o áudio saem
    expect(await armazenamentoDeTeste().ler(depois.caminhoArquivo!)).toEqual(Buffer.from('midia'))
    expect(await armazenamentoDeTeste().listarSegmentos(agenteId, fonte.id)).toEqual([])
  })

  it('um vídeo lento não impede um texto de ficar pronto, e o vídeo termina depois', async () => {
    const lento = await video({ criadoEm: new Date(Date.UTC(2026, 0, 1, 0, 0, 0)) })
    const texto = await criarFonteDeTeste({ agenteId, tipo: 'texto', nomeOriginal: null, bytes: Buffer.from('Texto curto.'), criadoEm: new Date(Date.UTC(2026, 0, 1, 0, 0, 1)) })
    let liberar!: () => void
    const portao = new Promise<void>((r) => (liberar = r))
    const f = fila(async () => {
      await portao
      return { texto: '[00:00] fala', duracaoSegundos: 10 }
    })
    const tudo = f.processarPendentes()
    for (let i = 0; i < 100 && (await ler(texto.id)).status !== 'pronto'; i += 1) await pausa(20)
    expect((await ler(texto.id)).status).toBe('pronto')
    expect((await ler(lento.id)).status).toBe('processando')
    liberar()
    expect(await tudo).toBe(2)
    expect((await ler(lento.id)).status).toBe('pronto')
  })

  it('dois vídeos nunca rodam ao mesmo tempo', async () => {
    const a = await video({ criadoEm: new Date(Date.UTC(2026, 0, 1, 0, 0, 0)) })
    const b = await video({ criadoEm: new Date(Date.UTC(2026, 0, 1, 0, 0, 1)) })
    let ativos = 0
    let maximo = 0
    const f = fila(async () => {
      ativos += 1
      maximo = Math.max(maximo, ativos)
      await pausa(60)
      ativos -= 1
      return { texto: 'fala', duracaoSegundos: 5 }
    })
    expect(await f.processarPendentes()).toBe(2)
    expect(maximo).toBe(1)
    expect((await ler(a.id)).status).toBe('pronto')
    expect((await ler(b.id)).status).toBe('pronto')
  })

  it('falha de uma parte vira erro com a parte indicada, limpa etapa e progresso e mantém segmentos e original', async () => {
    const fonte = await video()
    await armazenamentoDeTeste().gravarSegmento(agenteId, fonte.id, 0, 'parte feita')
    const f = fila(async (p) => {
      await p.aoAndar({ etapa: 'Transcrevendo parte 2 de 3', progresso: 50 })
      throw new ErroDeAplicacao('Falha na parte 2 de 3: Saldo insuficiente no OpenRouter.', 502, 'provedor_sem_saldo')
    })
    await f.processarUma(fonte.id)
    const depois = await ler(fonte.id)
    expect(depois).toMatchObject({ status: 'erro', etapa: null, progresso: null })
    expect(depois.mensagemErro).toBe('Falha na parte 2 de 3: Saldo insuficiente no OpenRouter.')
    expect(await armazenamentoDeTeste().listarSegmentos(agenteId, fonte.id)).toEqual([0])
    expect(await armazenamentoDeTeste().ler(depois.caminhoArquivo!)).toEqual(Buffer.from('midia'))
  })

  it('erro inesperado vira frase genérica e linha de log com correlação, sem conteúdo', async () => {
    const fonte = await video()
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await fila(async () => {
      throw new Error('falha interna em /var/dados/segredo')
    }).processarUma(fonte.id)
    const depois = await ler(fonte.id)
    expect(depois.status).toBe('erro')
    expect(depois.mensagemErro).not.toMatch(/segredo|\/var/)
    const linha = JSON.parse(log.mock.calls.map((c) => String(c[0])).find((l) => l.includes('fonte_falhou'))!)
    expect(linha).toMatchObject({ nivel: 'erro', msg: 'fonte_falhou', fonteId: fonte.id })
    expect(JSON.stringify(linha)).not.toMatch(/segredo/)
  })

  it('sem chave do OpenRouter a fonte vira erro claro e a transcrição nem é chamada', async () => {
    await prisma.configuracaoDoWorkspace.deleteMany()
    const fonte = await video()
    const transcrever = vi.fn()
    await fila(transcrever as unknown as Transcrever).processarUma(fonte.id)
    expect(transcrever).not.toHaveBeenCalled()
    const depois = await ler(fonte.id)
    expect(depois.status).toBe('erro')
    expect(depois.mensagemErro).toMatch(/OpenRouter/)
  })

  it('transcrição sem nenhum texto vira erro claro', async () => {
    const fonte = await video()
    await fila(async () => ({ texto: '  \n ', duracaoSegundos: 5 })).processarUma(fonte.id)
    const depois = await ler(fonte.id)
    expect(depois.status).toBe('erro')
    expect(depois.mensagemErro).toMatch(/fala/)
  })
})

describe('exclusão e tipos', () => {
  it('fonte excluída no meio do trabalho não é recriada nem reanimada pelo andamento nem pelo resultado', async () => {
    const fonte = await video()
    const f = fila(async (p) => {
      await prisma.fonte.delete({ where: { id: fonte.id } })
      await p.aoAndar({ etapa: 'Transcrevendo parte 1 de 1', progresso: 50 })
      return { texto: 'fala que ninguém vai ler', duracaoSegundos: 5 }
    })
    await expect(f.processarUma(fonte.id)).resolves.toBe(true)
    expect(await prisma.fonte.count()).toBe(0)
    expect(await prisma.trecho.count()).toBe(0)
  })

  it('o erro fonte_excluida da transcrição é engolido: sem erro, sem log, sem linha', async () => {
    const fonte = await video()
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await fila(async () => {
      await prisma.fonte.delete({ where: { id: fonte.id } })
      throw new ErroDeAplicacao('excluída', 410, 'fonte_excluida')
    }).processarUma(fonte.id)
    expect(await prisma.fonte.count()).toBe(0)
    expect(log).not.toHaveBeenCalled()
  })

  it('um tipo desconhecido segue dando tipo_nao_suportado e o texto ainda funciona', async () => {
    const estranha = await criarFonteDeTeste({ agenteId, tipo: 'planilha' as never, bytes: Buffer.from('x') })
    const texto = await criarFonteDeTeste({ agenteId, tipo: 'texto', nomeOriginal: null, bytes: Buffer.from('Olá, mundo.') })
    const f = fila(vi.fn() as unknown as Transcrever)
    await f.processarUma(estranha.id)
    await f.processarUma(texto.id)
    expect((await ler(estranha.id)).mensagemErro).toBe('Este tipo de fonte ainda não pode ser processado.')
    expect((await ler(texto.id)).status).toBe('pronto')
  })
})
