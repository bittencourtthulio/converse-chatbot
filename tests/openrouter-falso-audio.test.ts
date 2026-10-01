/**
 * T-01.03 (FT-08): o servidor OpenRouter simulado reconhece a parte
 * `input_audio` e devolve uma transcrição configurável por parte, com falha e
 * latência por parte (PR-77). A "parte" é o áudio distinto, na ordem em que
 * aparece pela primeira vez: o mesmo áudio repetido (nova tentativa) é a mesma
 * parte.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { iniciarOpenRouterFalso, CHAVE_VALIDA, type OpenRouterFalso } from './apoio/openrouter-falso'

let falso: OpenRouterFalso | undefined
afterEach(async () => {
  await falso?.fechar()
  falso = undefined
})

function pedido(base64: string, formato = 'mp3', modelo = 'google/gemini-2.5-flash') {
  return {
    model: modelo,
    stream: false,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Transcreva.' },
          { type: 'input_audio', input_audio: { data: base64, format: formato } },
        ],
      },
    ],
  }
}

async function enviar(corpo: unknown, chave = CHAVE_VALIDA) {
  return fetch(`${falso!.url}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${chave}` },
    body: JSON.stringify(corpo),
  })
}
const texto = async (r: Response) =>
  ((await r.json()) as { choices: { message: { content: string } }[] }).choices[0]!.message.content

describe('simulado do OpenRouter com áudio', () => {
  it('registra cada pedido de áudio com modelo, formato, tamanho do base64 e parte', async () => {
    falso = await iniciarOpenRouterFalso({ transcricoes: ['primeira', 'segunda'] })
    await enviar(pedido('AAAA'))
    await enviar(pedido('BBBBBB', 'wav'))
    expect(falso.audios).toEqual([
      expect.objectContaining({ modelo: 'google/gemini-2.5-flash', formato: 'mp3', tamanhoBase64: 4, parte: 0, tentativa: 1 }),
      expect.objectContaining({ formato: 'wav', tamanhoBase64: 6, parte: 1, tentativa: 1 }),
    ])
  })

  it('devolve a transcrição configurada da parte, e o mesmo áudio repetido é a mesma parte', async () => {
    falso = await iniciarOpenRouterFalso({ transcricoes: ['primeira', 'segunda'] })
    expect(await texto(await enviar(pedido('AAAA')))).toBe('primeira')
    expect(await texto(await enviar(pedido('BBBB')))).toBe('segunda')
    expect(await texto(await enviar(pedido('AAAA')))).toBe('primeira')
    expect(falso.audios.map((a) => [a.parte, a.tentativa])).toEqual([[0, 1], [1, 1], [0, 2]])
  })

  it('sem transcrição configurada para a parte, usa o texto padrão numerado', async () => {
    falso = await iniciarOpenRouterFalso()
    expect(await texto(await enviar(pedido('AAAA')))).toBe('Transcrição simulada da parte 1.')
    expect(await texto(await enviar(pedido('BBBB')))).toBe('Transcrição simulada da parte 2.')
  })

  it('uma falha configurada para a parte devolve o status pedido e some com configurar', async () => {
    falso = await iniciarOpenRouterFalso({ falhasPorParte: { 1: 500 } })
    expect((await enviar(pedido('AAAA'))).status).toBe(200)
    expect((await enviar(pedido('BBBB'))).status).toBe(500)
    expect((await enviar(pedido('BBBB'))).status).toBe(500)
    falso.configurar({ falhasPorParte: {} })
    expect((await enviar(pedido('BBBB'))).status).toBe(200)
  })

  it('a resposta vazia configurada devolve texto vazio', async () => {
    falso = await iniciarOpenRouterFalso({ transcricoes: [''] })
    expect(await texto(await enviar(pedido('AAAA')))).toBe('')
  })

  it('a latência por parte atrasa só aquela parte', async () => {
    falso = await iniciarOpenRouterFalso({ latenciaPorParteMs: { 1: 250 } })
    const t0 = Date.now()
    await enviar(pedido('AAAA'))
    const rapida = Date.now() - t0
    const t1 = Date.now()
    await enviar(pedido('BBBB'))
    expect(Date.now() - t1).toBeGreaterThanOrEqual(240)
    expect(rapida).toBeLessThan(200)
  })

  it('chave inválida dá 401 também para áudio', async () => {
    falso = await iniciarOpenRouterFalso()
    expect((await enviar(pedido('AAAA'), 'outra')).status).toBe(401)
    expect(falso.audios).toHaveLength(0)
  })

  it('um pedido de texto continua devolvendo a resposta de texto e não conta como áudio', async () => {
    falso = await iniciarOpenRouterFalso({ resposta: 'só texto' })
    const r = await enviar({ model: 'openai/gpt-4o-mini', stream: false, messages: [{ role: 'user', content: 'oi' }] })
    expect(await texto(r)).toBe('só texto')
    expect(falso.audios).toHaveLength(0)
  })
})
