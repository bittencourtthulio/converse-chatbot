import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import {
  listarModelos,
  verificarChave,
  limparCacheDeModelos,
  MODELOS_DE_RESERVA,
} from '@/lib/openrouter'
import { ErroDeAplicacao } from '@/lib/erros'
import {
  iniciarOpenRouterFalso,
  CHAVE_VALIDA,
  type OpenRouterFalso,
} from './apoio/openrouter-falso'

let falso: OpenRouterFalso
const baseOriginal = process.env.OPENROUTER_BASE_URL
const appOriginal = process.env.APP_NAME

beforeEach(async () => {
  limparCacheDeModelos()
  falso = await iniciarOpenRouterFalso()
  process.env.OPENROUTER_BASE_URL = falso.url
})
afterEach(async () => {
  vi.useRealTimers()
  await falso.fechar()
  if (baseOriginal === undefined) delete process.env.OPENROUTER_BASE_URL
  else process.env.OPENROUTER_BASE_URL = baseOriginal
  if (appOriginal === undefined) delete process.env.APP_NAME
  else process.env.APP_NAME = appOriginal
})

describe('listarModelos', () => {
  it('devolve id e nome dos modelos ordenados por nome, sem marca de reserva', async () => {
    const lista = await listarModelos(CHAVE_VALIDA)
    expect(lista.reserva).toBe(false)
    expect(lista.modelos.map((m) => m.id)).toContain('openai/gpt-4o-mini')
    const nomes = lista.modelos.map((m) => m.nome)
    expect(nomes).toEqual([...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR')))
    expect(lista.modelos.find((m) => m.id === 'openai/gpt-4o-mini')?.contexto).toBe(128000)
  })

  it('usa o cache na segunda chamada', async () => {
    await listarModelos(CHAVE_VALIDA)
    await listarModelos(CHAVE_VALIDA)
    expect(falso.requisicoes.filter((r) => r.caminho.endsWith('/models'))).toHaveLength(1)
  })

  it('inclui modelos multimodais que conversam por texto e exclui saída só de imagem, áudio e embeddings', async () => {
    falso.configurar({ modelos: [
      { id: 'texto', name: 'Z Texto', context_length: 100, architecture: { input_modalities: ['text'], output_modalities: ['text'] } },
      { id: 'multimodal', name: 'A Multimodal', context_length: 200, architecture: { input_modalities: ['text', 'image'], output_modalities: ['text', 'image'] } },
      { id: 'imagem', name: 'Imagem', context_length: 100, architecture: { input_modalities: ['text'], output_modalities: ['image'] } },
      { id: 'audio', name: 'Áudio', context_length: 100, architecture: { input_modalities: ['text'], output_modalities: ['audio'] } },
      { id: 'embedding', name: 'Embedding', context_length: 100, architecture: { input_modalities: ['text'], output_modalities: ['embeddings'] } },
      { id: 'transcricao', name: 'Transcrição', context_length: 100, architecture: { input_modalities: ['audio'], output_modalities: ['text'] } },
    ] })
    const lista = await listarModelos()
    expect(lista.reserva).toBe(false)
    expect(lista.modelos.map((m) => m.id)).toEqual(['multimodal', 'texto'])
  })

  it('não limita a quantidade de modelos do catálogo', async () => {
    falso.configurar({ modelos: Array.from({ length: 600 }, (_, i) => ({
      id: `provedor/modelo-${i}`, name: `Modelo ${i}`, context_length: 100,
      architecture: { input_modalities: ['text'], output_modalities: ['text'] },
    })) })
    expect((await listarModelos()).modelos).toHaveLength(600)
  })

  it('a lista de reserva também está em ordem alfabética', () => {
    const nomes = MODELOS_DE_RESERVA.map((m) => m.nome)
    expect(nomes).toEqual([...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR')))
  })

  it('o cache expira depois de 5 minutos', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    await listarModelos(CHAVE_VALIDA)
    vi.setSystemTime(Date.now() + 5 * 60_000 + 1000)
    await listarModelos(CHAVE_VALIDA)
    expect(falso.requisicoes.filter((r) => r.caminho.endsWith('/models'))).toHaveLength(2)
  })

  it('cai na lista de reserva, com reserva true, quando o servidor falha', async () => {
    falso.configurar({ modelosFalham: true })
    const lista = await listarModelos(CHAVE_VALIDA)
    expect(lista.reserva).toBe(true)
    expect(lista.modelos).toEqual(MODELOS_DE_RESERVA)
    expect(MODELOS_DE_RESERVA.map((m) => m.id)).toContain('openai/gpt-4o-mini')
  })

  it('a lista de reserva não fica em cache: a próxima chamada tenta de novo', async () => {
    falso.configurar({ modelosFalham: true })
    await listarModelos(CHAVE_VALIDA)
    falso.configurar({ modelosFalham: false })
    expect((await listarModelos(CHAVE_VALIDA)).reserva).toBe(false)
  })

  it('cai na reserva também com o servidor fora do ar', async () => {
    await falso.fechar()
    const lista = await listarModelos(CHAVE_VALIDA)
    expect(lista.reserva).toBe(true)
    // religa para o afterEach fechar sem erro
    falso = await iniciarOpenRouterFalso()
  })

  it('envia Authorization, HTTP-Referer e X-Title (nome do produto)', async () => {
    process.env.APP_NAME = 'Acme Atende'
    await listarModelos(CHAVE_VALIDA)
    const cab = falso.requisicoes[0]!.cabecalhos
    expect(cab.authorization).toBe(`Bearer ${CHAVE_VALIDA}`)
    expect(cab['http-referer']).toMatch(/^http/)
    expect(cab['x-title']).toBe('Acme Atende')
  })
})

describe('verificarChave', () => {
  it('aceita a chave válida e informa o saldo restante', async () => {
    const resultado = await verificarChave(CHAVE_VALIDA)
    expect(resultado.valida).toBe(true)
    expect(resultado.saldoRestante).toBeNull()
  })

  it('lança provedor_chave_invalida no 401', async () => {
    await expect(verificarChave('sk-or-v1-errada-1234')).rejects.toMatchObject({
      codigo: 'provedor_chave_invalida',
    })
  })

  it('o texto da chave não aparece em nenhuma mensagem de erro', async () => {
    const chave = 'sk-or-v1-muito-secreta-9999'
    try {
      await verificarChave(chave)
      throw new Error('deveria falhar')
    } catch (erro) {
      expect(erro).toBeInstanceOf(ErroDeAplicacao)
      expect((erro as Error).message).not.toContain('muito-secreta')
      expect(JSON.stringify(erro)).not.toContain('muito-secreta')
    }
  })

  it('servidor fora do ar vira provedor_indisponivel', async () => {
    await falso.fechar()
    await expect(verificarChave(CHAVE_VALIDA)).rejects.toMatchObject({
      codigo: 'provedor_indisponivel',
    })
    falso = await iniciarOpenRouterFalso()
  })

  it('resposta lenta demais vira provedor_tempo_esgotado', async () => {
    falso.configurar({ latenciaMs: 300 })
    await expect(verificarChave(CHAVE_VALIDA, { tempoLimiteMs: 50 })).rejects.toMatchObject({
      codigo: 'provedor_tempo_esgotado',
    })
  })
})
