/**
 * T-04.03 (FT-08): `transcreverMidia` sonda, confere limites, extrai, divide,
 * transcreve cada parte (repetindo só o transitório), grava os segmentos em
 * disco, informa etapa e progresso e devolve o texto montado (PR-72, PR-73,
 * PR-74). A mídia e o transcritor são injetados: nenhum ffmpeg nem rede.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { criarArmazenamento, type Armazenamento } from '@/lib/armazenamento'
import { ErroDeAplicacao } from '@/lib/erros'
import { transcreverMidia, type DependenciasDeMidia, type Andamento } from '@/servicos/transcricao-de-midia'
import { MARCADOR_SEM_FALA } from '@/servicos/transcricao-marcadores'

let raiz: string
let armazenamento: Armazenamento
const fonte = { id: 'fonte1', agenteId: 'agente1' }

beforeEach(async () => {
  raiz = mkdtempSync(path.join(os.tmpdir(), 'transcricao-midia-'))
  armazenamento = criarArmazenamento(raiz)
  await armazenamento.gravar(fonte.agenteId, fonte.id, Buffer.from('original-qualquer'))
})
afterEach(() => rmSync(raiz, { recursive: true, force: true }))

/** Mídia falsa: a sonda diz a duração, a extração e a divisão escrevem arquivos distintos. */
function midiaFalsa(opcoes: { duracao?: number; partes?: number; temAudio?: boolean } = {}): Pick<DependenciasDeMidia, 'sondar' | 'extrairAudio' | 'dividirEmSegmentos'> & { chamadas: string[] } {
  const chamadas: string[] = []
  return {
    chamadas,
    sondar: vi.fn(async () => {
      chamadas.push('sondar')
      return { duracaoSegundos: opcoes.duracao ?? 1500, temAudio: opcoes.temAudio ?? true }
    }),
    extrairAudio: vi.fn(async (_entrada: string, saida: string) => {
      chamadas.push('extrair')
      await mkdir(path.dirname(saida), { recursive: true })
      writeFileSync(saida, 'audio-extraido')
    }),
    dividirEmSegmentos: vi.fn(async (_audio: string, diretorio: string) => {
      chamadas.push('dividir')
      await mkdir(diretorio, { recursive: true })
      return Array.from({ length: opcoes.partes ?? 3 }, (_, i) => {
        const arquivo = path.join(diretorio, `${String(i).padStart(3, '0')}.mp3`)
        writeFileSync(arquivo, `conteudo-da-parte-${i}`)
        return arquivo
      })
    }),
  }
}

function pedido(extra: Partial<Parameters<typeof transcreverMidia>[0]> & { dependencias: Partial<DependenciasDeMidia> }) {
  const andamentos: Andamento[] = []
  return {
    andamentos,
    p: {
      fonte,
      chave: 'chave-de-teste',
      modelo: 'google/gemini-2.5-flash',
      armazenamento,
      aoAndar: (a: Andamento) => void andamentos.push(a),
      fonteExiste: async () => true,
      esperaEntreTentativasMs: 0,
      ...extra,
    },
  }
}

const transcritorPadrao = () =>
  vi.fn(async (p: { audioBase64: string }) => `fala de ${Buffer.from(p.audioBase64, 'base64').toString().replace('conteudo-da-', '')}`)

describe('transcreverMidia', () => {
  it('três partes geram três segmentos, o texto com marcadores, as etapas em ordem e o progresso crescente', async () => {
    const midia = midiaFalsa()
    const transcrever = transcritorPadrao()
    const { p, andamentos } = pedido({ dependencias: { ...midia, transcrever } })
    const r = await transcreverMidia(p)

    expect(r.duracaoSegundos).toBe(1500)
    expect(r.texto).toBe('[00:00] fala de parte-0\n\n[10:00] fala de parte-1\n\n[20:00] fala de parte-2')
    expect(await armazenamento.listarSegmentos(fonte.agenteId, fonte.id)).toEqual([0, 1, 2])
    expect(await armazenamento.lerSegmento(fonte.agenteId, fonte.id, 1)).toBe('fala de parte-1')
    expect(midia.chamadas).toEqual(['sondar', 'extrair', 'dividir'])
    expect(transcrever).toHaveBeenCalledTimes(3)
    expect(transcrever.mock.calls[0]![0]).toMatchObject({ chave: 'chave-de-teste', modelo: 'google/gemini-2.5-flash', formato: 'mp3' })

    const etapas = andamentos.map((a) => a.etapa)
    const unicas = etapas.filter((e, i) => e !== etapas[i - 1])
    expect(unicas).toEqual([
      'Verificando o arquivo',
      'Extraindo áudio',
      'Dividindo em partes',
      'Transcrevendo parte 1 de 3',
      'Transcrevendo parte 2 de 3',
      'Transcrevendo parte 3 de 3',
      'Montando o texto',
    ])
    const progressos = andamentos.map((a) => a.progresso)
    expect(progressos).toEqual([...progressos].sort((a, b) => a - b))
    expect(progressos[0]).toBeGreaterThanOrEqual(0)
    expect(progressos.at(-1)).toBeGreaterThanOrEqual(90)
    expect(progressos.at(-1)).toBeLessThanOrEqual(99)
    expect(andamentos.some((a) => a.duracaoSegundos === 1500)).toBe(true)
    // o áudio temporário sai ao fim; o original e os segmentos ficam para a fila decidir
    expect(existsSync(armazenamento.pastaDeTrabalho(fonte.agenteId, fonte.id, 'audio'))).toBe(false)
    expect(existsSync(armazenamento.caminhoDoOriginal(fonte.agenteId, fonte.id))).toBe(true)
  })

  it('usa o arquivo temporário do YouTube para sondar e extrair o áudio', async () => {
    const midia = midiaFalsa({ duracao: 20, partes: 1 })
    const caminhoOriginal = path.join(raiz, 'audio-youtube')
    const { p } = pedido({ caminhoOriginal, dependencias: { ...midia, transcrever: transcritorPadrao() } })
    await transcreverMidia(p)
    expect(midia.sondar).toHaveBeenCalledWith(caminhoOriginal)
    expect(midia.extrairAudio).toHaveBeenCalledWith(caminhoOriginal, expect.any(String))
  })

  it('com o segmento 1 já em disco o transcritor não é chamado para a parte 1', async () => {
    await armazenamento.gravarSegmento(fonte.agenteId, fonte.id, 1, 'fala guardada da parte 2')
    const transcrever = transcritorPadrao()
    const { p, andamentos } = pedido({ dependencias: { ...midiaFalsa(), transcrever } })
    const r = await transcreverMidia(p)
    expect(transcrever).toHaveBeenCalledTimes(2)
    const partesChamadas = transcrever.mock.calls.map((c) => Buffer.from(c[0].audioBase64, 'base64').toString())
    expect(partesChamadas).toEqual(['conteudo-da-parte-0', 'conteudo-da-parte-2'])
    expect(r.texto).toContain('[10:00] fala guardada da parte 2')
    expect(andamentos.map((a) => a.etapa)).toContain('Transcrevendo parte 3 de 3')
  })

  it('com todas as partes já em disco nem extrai nem transcreve', async () => {
    for (const i of [0, 1, 2]) await armazenamento.gravarSegmento(fonte.agenteId, fonte.id, i, `guardada ${i}`)
    const midia = midiaFalsa()
    const transcrever = transcritorPadrao()
    const { p } = pedido({ dependencias: { ...midia, transcrever } })
    const r = await transcreverMidia(p)
    expect(r.texto).toBe('[00:00] guardada 0\n\n[10:00] guardada 1\n\n[20:00] guardada 2')
    expect(midia.chamadas).toEqual(['sondar'])
    expect(transcrever).not.toHaveBeenCalled()
  })

  it('uma falha permanente na parte 2 lança erro com a parte indicada, mantém os segmentos feitos e apaga o áudio', async () => {
    const transcrever = vi
      .fn()
      .mockResolvedValueOnce('fala da parte 1')
      .mockRejectedValueOnce(new ErroDeAplicacao('Saldo insuficiente no OpenRouter.', 502, 'provedor_sem_saldo'))
    const { p } = pedido({ dependencias: { ...midiaFalsa(), transcrever } })
    const erro = await transcreverMidia(p).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroDeAplicacao)
    expect(erro.message).toMatch(/^Falha na parte 2 de 3: /)
    expect(erro.message).toContain('Saldo insuficiente')
    expect(erro.codigo).toBe('provedor_sem_saldo')
    expect(transcrever).toHaveBeenCalledTimes(2)
    expect(await armazenamento.listarSegmentos(fonte.agenteId, fonte.id)).toEqual([0])
    expect(existsSync(armazenamento.pastaDeTrabalho(fonte.agenteId, fonte.id, 'audio'))).toBe(false)
  })

  it('uma falha transitória é repetida até duas vezes e a terceira falha seguida encerra', async () => {
    const transitoria = () => new ErroDeAplicacao('O OpenRouter está indisponível.', 502, 'provedor_indisponivel')
    const esperar = vi.fn(async () => undefined)
    const ok = vi
      .fn()
      .mockRejectedValueOnce(transitoria())
      .mockRejectedValueOnce(new ErroDeAplicacao('vazio', 502, 'transcricao_vazia'))
      .mockResolvedValue('fala')
    const a = pedido({ dependencias: { ...midiaFalsa({ partes: 1, duracao: 300 }), transcrever: ok, esperar } })
    const r = await transcreverMidia(a.p)
    expect(ok).toHaveBeenCalledTimes(3)
    expect(esperar).toHaveBeenCalledTimes(2)
    expect(r.texto).toBe('[00:00] fala')

    await rmSync(armazenamento.pastaDeTrabalho(fonte.agenteId, fonte.id, 'segmentos'), { recursive: true, force: true })
    const sempre = vi.fn().mockRejectedValue(transitoria())
    const b = pedido({ dependencias: { ...midiaFalsa({ partes: 1, duracao: 300 }), transcrever: sempre, esperar } })
    const erro = await transcreverMidia(b.p).catch((e) => e)
    expect(sempre).toHaveBeenCalledTimes(3)
    expect(erro.message).toMatch(/^Falha na parte 1 de 1: /)
    expect(erro.codigo).toBe('provedor_indisponivel')
  })

  it('chave inválida e modelo inválido não são repetidos', async () => {
    for (const codigo of ['provedor_chave_invalida', 'provedor_modelo_invalido', 'provedor_sem_saldo']) {
      const t = vi.fn().mockRejectedValue(new ErroDeAplicacao('x', 502, codigo))
      const { p } = pedido({ dependencias: { ...midiaFalsa({ partes: 1, duracao: 300 }), transcrever: t } })
      await transcreverMidia(p).catch(() => undefined)
      expect(t, codigo).toHaveBeenCalledTimes(1)
    }
  })

  it('a fonte excluída entre as partes interrompe sem novo gasto', async () => {
    const transcrever = transcritorPadrao()
    const existe = vi.fn().mockResolvedValueOnce(true).mockResolvedValue(false)
    const { p } = pedido({ fonteExiste: existe, dependencias: { ...midiaFalsa(), transcrever } })
    const erro = await transcreverMidia(p).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroDeAplicacao)
    expect(erro.codigo).toBe('fonte_excluida')
    expect(transcrever).toHaveBeenCalledTimes(1)
    expect(existsSync(armazenamento.pastaDeTrabalho(fonte.agenteId, fonte.id, 'audio'))).toBe(false)
  })

  it('sem faixa de áudio lança sem_audio sem extrair nem transcrever, e o erro da sonda sobe como veio', async () => {
    const midia = midiaFalsa({ temAudio: false })
    const transcrever = transcritorPadrao()
    const { p } = pedido({ dependencias: { ...midia, transcrever } })
    await expect(transcreverMidia(p)).rejects.toMatchObject({ codigo: 'sem_audio' })
    expect(midia.chamadas).toEqual(['sondar'])
    expect(transcrever).not.toHaveBeenCalled()

    const longa = new ErroDeAplicacao('O arquivo tem 200 min e o limite é de 180 min.', 422, 'midia_longa_demais')
    const { p: p2 } = pedido({ dependencias: { sondar: vi.fn().mockRejectedValue(longa), transcrever } })
    await expect(transcreverMidia(p2)).rejects.toBe(longa)
  })

  it('a pasta de trabalho não deixa nada de mais: só os segmentos e o original', async () => {
    const { p } = pedido({ dependencias: { ...midiaFalsa(), transcrever: transcritorPadrao() } })
    await transcreverMidia(p)
    expect(readdirSync(path.join(raiz, 'fontes/agente1/fonte1')).sort()).toEqual(['original', 'segmentos'])
  })
})

describe('trecho sem fala (FT-13, PR-09, PR-105)', () => {
  const vazio = () => new ErroDeAplicacao('O modelo não devolveu texto para este trecho do áudio.', 502, 'transcricao_vazia')
  /** A parte 2 de 3 (conteúdo `conteudo-da-parte-1`) volta sempre vazia; as outras têm fala. */
  const transcritorComParteMuda = () =>
    vi.fn(async (p: { audioBase64: string }) => {
      const nome = Buffer.from(p.audioBase64, 'base64').toString()
      if (nome === 'conteudo-da-parte-1') throw vazio()
      return `fala de ${nome.replace('conteudo-da-', '')}`
    })

  it('a parte vazia nas duas chamadas grava [sem fala] no segmento, o texto traz as três partes e a fonte não falha', async () => {
    const transcrever = transcritorComParteMuda()
    const esperar = vi.fn(async () => undefined)
    const { p } = pedido({ dependencias: { ...midiaFalsa(), transcrever, esperar } })
    const r = await transcreverMidia(p)

    expect(r.texto).toBe('[00:00] fala de parte-0\n\n[10:00] [sem fala]\n\n[20:00] fala de parte-2')
    expect(await armazenamento.lerSegmento(fonte.agenteId, fonte.id, 1)).toBe(MARCADOR_SEM_FALA)
    expect(await armazenamento.listarSegmentos(fonte.agenteId, fonte.id)).toEqual([0, 1, 2])
    // A parte muda é chamada duas vezes (uma repetição), nunca três.
    expect(transcrever).toHaveBeenCalledTimes(4)
    expect(esperar).toHaveBeenCalledTimes(1)
  })

  it('a retomada não chama o transcritor para os segmentos já gravados, inclusive o sem fala', async () => {
    const primeira = transcritorComParteMuda()
    const { p } = pedido({ dependencias: { ...midiaFalsa(), transcrever: primeira } })
    await transcreverMidia(p)

    const segunda = transcritorComParteMuda()
    const midia = midiaFalsa()
    const { p: p2 } = pedido({ dependencias: { ...midia, transcrever: segunda } })
    const r = await transcreverMidia(p2)
    expect(segunda).not.toHaveBeenCalled()
    expect(midia.chamadas).toEqual(['sondar'])
    expect(r.texto).toContain('[10:00] [sem fala]')
  })

  it('com todas as partes vazias lança Não encontrei fala neste áudio. (422, transcricao_vazia) e guarda os segmentos', async () => {
    const transcrever = vi.fn().mockRejectedValue(vazio())
    const { p } = pedido({ dependencias: { ...midiaFalsa({ partes: 2, duracao: 1200 }), transcrever } })
    const erro = await transcreverMidia(p).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroDeAplicacao)
    expect(erro.message).toBe('Não encontrei fala neste áudio.')
    expect(erro.status).toBe(422)
    expect(erro.codigo).toBe('transcricao_vazia')
    expect(await armazenamento.listarSegmentos(fonte.agenteId, fonte.id)).toEqual([0, 1])
  })

  it('vazio seguido de fala devolve a fala (uma repetição basta) e outras falhas continuam derrubando a fonte', async () => {
    const transcrever = vi.fn().mockRejectedValueOnce(vazio()).mockResolvedValue('fala')
    const { p } = pedido({ dependencias: { ...midiaFalsa({ partes: 1, duracao: 300 }), transcrever } })
    expect((await transcreverMidia(p)).texto).toBe('[00:00] fala')
    expect(transcrever).toHaveBeenCalledTimes(2)

    const semSaldo = vi.fn().mockRejectedValue(new ErroDeAplicacao('Saldo insuficiente', 402, 'provedor_sem_saldo'))
    const { p: p2 } = pedido({ dependencias: { ...midiaFalsa({ partes: 2, duracao: 1200 }), transcrever: semSaldo } })
    await expect(transcreverMidia(p2)).rejects.toMatchObject({ codigo: 'provedor_sem_saldo' })
  })
})
