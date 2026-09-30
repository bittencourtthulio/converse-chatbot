import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { conversar } from '@/lib/openrouter'
import { ErroDeAplicacao } from '@/lib/erros'
import {
  iniciarOpenRouterFalso,
  CHAVE_VALIDA,
  type OpenRouterFalso,
} from './apoio/openrouter-falso'

let falso: OpenRouterFalso
const baseOriginal = process.env.OPENROUTER_BASE_URL

beforeEach(async () => {
  falso = await iniciarOpenRouterFalso({ trechos: ['Olá', ', ', 'mundo'] })
  process.env.OPENROUTER_BASE_URL = falso.url
})
afterEach(async () => {
  await falso.fechar()
  if (baseOriginal === undefined) delete process.env.OPENROUTER_BASE_URL
  else process.env.OPENROUTER_BASE_URL = baseOriginal
})

const pedido = {
  chave: CHAVE_VALIDA,
  modelo: 'openai/gpt-4o-mini',
  mensagens: [
    { role: 'system' as const, content: 'Seja breve.' },
    { role: 'user' as const, content: 'Oi' },
  ],
  temperatura: 0.4,
  maxTokens: 200,
}

async function coletar(iteravel: AsyncIterable<string>) {
  const trechos: string[] = []
  try {
    for await (const t of iteravel) trechos.push(t)
  } catch (erro) {
    return { trechos, erro: erro as ErroDeAplicacao }
  }
  return { trechos, erro: undefined }
}

describe('conversar', () => {
  it('entrega os trechos na ordem e envia o corpo esperado', async () => {
    const { trechos, erro } = await coletar(conversar(pedido))
    expect(trechos).toEqual(['Olá', ', ', 'mundo'])
    expect(erro).toBeUndefined()
    const enviada = falso.requisicoes.at(-1)!
    expect(enviada.cabecalhos.authorization).toBe(`Bearer ${CHAVE_VALIDA}`)
    expect(enviada.corpo).toEqual({
      model: 'openai/gpt-4o-mini',
      messages: pedido.mensagens,
      temperature: 0.4,
      max_tokens: 200,
      stream: true,
    })
  })

  it('omite temperatura e max_tokens quando não informados', async () => {
    await coletar(conversar({ chave: CHAVE_VALIDA, modelo: 'openai/gpt-4o-mini', mensagens: [] }))
    const corpo = falso.requisicoes.at(-1)!.corpo as Record<string, unknown>
    expect(corpo).not.toHaveProperty('temperature')
    expect(corpo).not.toHaveProperty('max_tokens')
    expect(corpo.stream).toBe(true)
  })

  it('erro no meio do stream lança depois dos trechos já entregues', async () => {
    falso.configurar({ trechos: ['a', 'b', 'c'], erroNoMeioApos: 2 })
    const { trechos, erro } = await coletar(conversar(pedido))
    expect(trechos).toEqual(['a', 'b'])
    expect(erro?.codigo).toBe('provedor_indisponivel')
  })

  it.each([
    [402, 'provedor_sem_saldo'],
    [429, 'provedor_limite'],
    [503, 'provedor_indisponivel'],
  ])('HTTP %i vira %s', async (status, codigo) => {
    falso.configurar({ erroHttp: status })
    const { trechos, erro } = await coletar(conversar(pedido))
    expect(trechos).toEqual([])
    expect(erro?.codigo).toBe(codigo)
  })

  it('chave inválida vira provedor_chave_invalida e a mensagem não a repete', async () => {
    const { erro } = await coletar(conversar({ ...pedido, chave: 'sk-or-v1-segredo-4321' }))
    expect(erro?.codigo).toBe('provedor_chave_invalida')
    expect(erro?.message).not.toContain('segredo-4321')
  })

  it('modelo desconhecido vira provedor_modelo_invalido', async () => {
    const { erro } = await coletar(conversar({ ...pedido, modelo: 'nao/existe' }))
    expect(erro?.codigo).toBe('provedor_modelo_invalido')
  })

  it('AbortSignal encerra a leitura sem erro e fecha a conexão', async () => {
    falso.configurar({
      trechos: Array.from({ length: 50 }, (_, i) => `t${i} `),
      intervaloEntreTrechosMs: 30,
    })
    const controle = new AbortController()
    const trechos: string[] = []
    for await (const t of conversar({ ...pedido, sinal: controle.signal })) {
      trechos.push(t)
      if (trechos.length === 2) controle.abort()
    }
    expect(trechos.length).toBeLessThan(50)
    await new Promise((r) => setTimeout(r, 150))
    expect(falso.cancelamentos).toBe(1)
  })

  it('primeiro byte lento demais vira provedor_tempo_esgotado', async () => {
    falso.configurar({ latenciaMs: 300 })
    const { erro } = await coletar(conversar({ ...pedido, tempoPrimeiroByteMs: 50 }))
    expect(erro?.codigo).toBe('provedor_tempo_esgotado')
    expect(erro?.status).toBe(504)
  })

  it('o tempo total esgotado no meio do stream lança depois dos trechos entregues', async () => {
    falso.configurar({
      trechos: Array.from({ length: 50 }, (_, i) => `t${i} `),
      intervaloEntreTrechosMs: 40,
    })
    const { trechos, erro } = await coletar(conversar({ ...pedido, tempoTotalMs: 200 }))
    expect(trechos.length).toBeGreaterThan(0)
    expect(trechos.length).toBeLessThan(50)
    expect(erro?.codigo).toBe('provedor_tempo_esgotado')
  })

  it('servidor fora do ar vira provedor_indisponivel', async () => {
    await falso.fechar()
    const { erro } = await coletar(conversar(pedido))
    expect(erro?.codigo).toBe('provedor_indisponivel')
    falso = await iniciarOpenRouterFalso()
  })
})
