import { describe, it, expect, afterEach } from 'vitest'
import {
  iniciarOpenRouterFalso,
  CHAVE_VALIDA,
  type OpenRouterFalso,
} from './apoio/openrouter-falso'

let falso: OpenRouterFalso | undefined
afterEach(async () => {
  await falso?.fechar()
  falso = undefined
})

const autorizacao = (chave: string) => ({ Authorization: `Bearer ${chave}` })

describe('servidor OpenRouter simulado: rotas', () => {
  it('sobe em porta livre e devolve a URL base com /api/v1', async () => {
    falso = await iniciarOpenRouterFalso()
    expect(falso.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/api\/v1$/)
    const outro = await iniciarOpenRouterFalso()
    expect(outro.url).not.toBe(falso.url)
    await outro.fechar()
  })

  it('/models lista os modelos sem exigir chave', async () => {
    falso = await iniciarOpenRouterFalso()
    const resposta = await fetch(`${falso.url}/models`)
    expect(resposta.status).toBe(200)
    const corpo = (await resposta.json()) as { data: { id: string; name: string }[] }
    expect(corpo.data.map((m) => m.id)).toContain('openai/gpt-4o-mini')
    expect(corpo.data[0]).toHaveProperty('name')
  })

  it('/key e /auth/key aceitam a chave válida e recusam a inválida com 401', async () => {
    falso = await iniciarOpenRouterFalso()
    for (const rota of ['/key', '/auth/key']) {
      const boa = await fetch(`${falso.url}${rota}`, { headers: autorizacao(CHAVE_VALIDA) })
      expect(boa.status).toBe(200)
      expect(await boa.json()).toHaveProperty('data.is_free_tier')
      const ma = await fetch(`${falso.url}${rota}`, { headers: autorizacao('outra') })
      expect(ma.status).toBe(401)
      const sem = await fetch(`${falso.url}${rota}`)
      expect(sem.status).toBe(401)
    }
  })

  it('/chat/completions sem stream devolve o texto configurado e registra a requisição', async () => {
    falso = await iniciarOpenRouterFalso({ resposta: 'Olá do falso' })
    const resposta = await fetch(`${falso.url}/chat/completions`, {
      method: 'POST',
      headers: {
        ...autorizacao(CHAVE_VALIDA),
        'Content-Type': 'application/json',
        'X-Title': 'Teste',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: 'oi' }],
        temperature: 0.3,
      }),
    })
    expect(resposta.status).toBe(200)
    const corpo = (await resposta.json()) as {
      choices: { message: { content: string } }[]
    }
    expect(corpo.choices[0]?.message.content).toBe('Olá do falso')
    const registro = falso.requisicoes.at(-1)!
    expect(registro.caminho).toBe('/api/v1/chat/completions')
    expect(registro.cabecalhos['x-title']).toBe('Teste')
    expect((registro.corpo as { temperature: number }).temperature).toBe(0.3)
  })

  it('chave inválida no chat dá 401 no formato de erro do provedor', async () => {
    falso = await iniciarOpenRouterFalso()
    const resposta = await fetch(`${falso.url}/chat/completions`, {
      method: 'POST',
      headers: { ...autorizacao('errada'), 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'openai/gpt-4o-mini', messages: [] }),
    })
    expect(resposta.status).toBe(401)
    const corpo = (await resposta.json()) as { error: { code: number; message: string } }
    expect(corpo.error.code).toBe(401)
    expect(typeof corpo.error.message).toBe('string')
  })

  it.each([402, 429, 500, 503])('erroHttp %i faz o chat responder com esse status', async (status) => {
    falso = await iniciarOpenRouterFalso({ erroHttp: status })
    const resposta = await fetch(`${falso.url}/chat/completions`, {
      method: 'POST',
      headers: { ...autorizacao(CHAVE_VALIDA), 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'openai/gpt-4o-mini', messages: [] }),
    })
    expect(resposta.status).toBe(status)
    expect(((await resposta.json()) as { error: { code: number } }).error.code).toBe(status)
  })

  it('modelo desconhecido no chat dá 400', async () => {
    falso = await iniciarOpenRouterFalso()
    const resposta = await fetch(`${falso.url}/chat/completions`, {
      method: 'POST',
      headers: { ...autorizacao(CHAVE_VALIDA), 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'nao/existe', messages: [] }),
    })
    expect(resposta.status).toBe(400)
  })

  it('modelosFalham faz /models responder 500', async () => {
    falso = await iniciarOpenRouterFalso({ modelosFalham: true })
    expect((await fetch(`${falso.url}/models`)).status).toBe(500)
  })

  it('a latência configurada atrasa a resposta', async () => {
    falso = await iniciarOpenRouterFalso({ latenciaMs: 150 })
    const inicio = Date.now()
    await fetch(`${falso.url}/models`)
    expect(Date.now() - inicio).toBeGreaterThanOrEqual(140)
  })

  it('configurar muda o comportamento no meio do teste', async () => {
    falso = await iniciarOpenRouterFalso()
    falso.configurar({ modelosFalham: true })
    expect((await fetch(`${falso.url}/models`)).status).toBe(500)
    falso.configurar({ modelosFalham: false })
    expect((await fetch(`${falso.url}/models`)).status).toBe(200)
  })

  it('fechar libera a porta: nova conexão é recusada', async () => {
    const servidor = await iniciarOpenRouterFalso()
    const url = servidor.url
    await servidor.fechar()
    await expect(fetch(`${url}/models`)).rejects.toThrow()
  })
})
