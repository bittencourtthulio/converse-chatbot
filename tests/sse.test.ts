import { describe, it, expect, vi } from 'vitest'
import { lerTrechosDeSSE } from '@/lib/sse'
import { ErroDeAplicacao } from '@/lib/erros'

/** Um corpo de resposta a partir de pacotes de bytes já cortados como a rede corta. */
function corpo(...pacotes: Array<string | Uint8Array>): ReadableStream<Uint8Array> {
  const codificador = new TextEncoder()
  return new ReadableStream({
    start(controle) {
      for (const p of pacotes) {
        controle.enqueue(typeof p === 'string' ? codificador.encode(p) : p)
      }
      controle.close()
    },
  })
}

async function coletar(fluxo: ReadableStream<Uint8Array>) {
  const trechos: string[] = []
  try {
    for await (const t of lerTrechosDeSSE(fluxo)) trechos.push(t)
  } catch (erro) {
    return { trechos, erro: erro as ErroDeAplicacao }
  }
  return { trechos, erro: undefined }
}

const evento = (texto: string, extra: Record<string, unknown> = {}) =>
  `data: ${JSON.stringify({ choices: [{ delta: { content: texto }, finish_reason: null }], ...extra })}\n\n`
const fim = `data: ${JSON.stringify({ choices: [{ delta: { content: '' }, finish_reason: 'stop' }] })}\n\n`

describe('lerTrechosDeSSE', () => {
  it('entrega o delta.content de cada linha data: na ordem', async () => {
    const { trechos, erro } = await coletar(
      corpo(evento('Olá'), evento(', '), evento('mundo'), fim, 'data: [DONE]\n\n'),
    )
    expect(trechos).toEqual(['Olá', ', ', 'mundo'])
    expect(erro).toBeUndefined()
  })

  it('ignora comentário e nunca o passa ao JSON.parse', async () => {
    const espiao = vi.spyOn(JSON, 'parse')
    const { trechos } = await coletar(
      corpo(': OPENROUTER PROCESSING\n\n', evento('a'), ': OPENROUTER PROCESSING\n\n', fim, 'data: [DONE]\n\n'),
    )
    expect(trechos).toEqual(['a'])
    const chamadas = espiao.mock.calls.map((c) => String(c[0]))
    expect(chamadas.some((c) => c.includes('OPENROUTER'))).toBe(false)
    espiao.mockRestore()
  })

  it('[DONE] encerra: o que vier depois não é entregue', async () => {
    const { trechos } = await coletar(corpo(evento('a'), fim, 'data: [DONE]\n\n', evento('depois')))
    expect(trechos).toEqual(['a'])
  })

  it('junta JSON partido entre pacotes de rede', async () => {
    const inteiro = evento('partido') + fim + 'data: [DONE]\n\n'
    const corte = inteiro.indexOf('"content":"par') + 12
    const { trechos } = await coletar(corpo(inteiro.slice(0, corte), inteiro.slice(corte)))
    expect(trechos).toEqual(['partido'])
  })

  it('junta um caractere UTF-8 partido no meio dos bytes', async () => {
    const bytes = new TextEncoder().encode(evento('ação') + fim + 'data: [DONE]\n\n')
    const meio = bytes.indexOf(0xc3) + 1 // entre os dois bytes de "ç"
    const { trechos } = await coletar(corpo(bytes.slice(0, meio), bytes.slice(meio)))
    expect(trechos).toEqual(['ação'])
  })

  it('aceita fim de linha CRLF', async () => {
    const { trechos } = await coletar(
      corpo((evento('crlf') + fim + 'data: [DONE]\n\n').replaceAll('\n', '\r\n')),
    )
    expect(trechos).toEqual(['crlf'])
  })

  it('ignora trecho vazio (o chunk final com usage)', async () => {
    const { trechos } = await coletar(
      corpo(evento('x'), evento('', { usage: { total_tokens: 3 } }), fim, 'data: [DONE]\n\n'),
    )
    expect(trechos).toEqual(['x'])
  })

  it('erro no meio do stream lança depois dos trechos já entregues', async () => {
    const erroNoMeio = `data: ${JSON.stringify({
      error: { code: 'server_error', message: 'segredo do provedor' },
      choices: [{ delta: { content: '' }, finish_reason: 'error' }],
    })}\n\n`
    const { trechos, erro } = await coletar(corpo(evento('um'), evento('dois'), erroNoMeio))
    expect(trechos).toEqual(['um', 'dois'])
    expect(erro).toBeInstanceOf(ErroDeAplicacao)
    expect(erro?.codigo).toBe('provedor_indisponivel')
    expect(erro?.message).not.toContain('segredo do provedor')
  })

  it('erro como primeiro e único evento é falha, não sucesso vazio', async () => {
    const soErro = `data: ${JSON.stringify({ error: { code: 429, message: 'x' }, choices: [{ delta: { content: '' }, finish_reason: 'error' }] })}\n\n`
    const { trechos, erro } = await coletar(corpo(soErro))
    expect(trechos).toEqual([])
    expect(erro?.codigo).toBe('provedor_limite')
  })

  it('finish_reason error sem campo error também é falha', async () => {
    const semCampo = `data: ${JSON.stringify({ choices: [{ delta: { content: '' }, finish_reason: 'error' }] })}\n\n`
    const { erro } = await coletar(corpo(evento('a'), semCampo))
    expect(erro?.codigo).toBe('provedor_indisponivel')
  })

  it('stream cortado sem finish_reason nem [DONE] é falha', async () => {
    const { trechos, erro } = await coletar(corpo(evento('a')))
    expect(trechos).toEqual(['a'])
    expect(erro?.codigo).toBe('provedor_indisponivel')
  })

  it('finish_reason stop sem [DONE] termina bem', async () => {
    const { trechos, erro } = await coletar(corpo(evento('a'), fim))
    expect(trechos).toEqual(['a'])
    expect(erro).toBeUndefined()
  })

  it('linha data: que não é JSON é falha do provedor', async () => {
    const { erro } = await coletar(corpo('data: isto não é json\n\n'))
    expect(erro?.codigo).toBe('provedor_indisponivel')
  })

  it('a última linha sem quebra de linha ainda é lida', async () => {
    const { trechos } = await coletar(corpo(evento('a') + 'data: [DONE]'))
    expect(trechos).toEqual(['a'])
  })
})
