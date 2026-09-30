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

describe('servidor OpenRouter simulado: stream', () => {
  async function pedirStream(url: string, extra: Record<string, unknown> = {}) {
    return fetch(`${url}/chat/completions`, {
      method: 'POST',
      headers: { ...autorizacao(CHAVE_VALIDA), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: 'oi' }],
        stream: true,
        ...extra,
      }),
    })
  }

  it('com stream true devolve SSE com delta.content, comentário e [DONE]', async () => {
    falso = await iniciarOpenRouterFalso({ trechos: ['Olá', ', ', 'mundo'] })
    const resposta = await pedirStream(falso.url)
    expect(resposta.status).toBe(200)
    expect(resposta.headers.get('content-type')).toContain('text/event-stream')
    const texto = await resposta.text()
    expect(texto.startsWith(': OPENROUTER PROCESSING')).toBe(true)
    const linhas = texto.split('\n').filter((l) => l.startsWith('data: ') && l !== 'data: [DONE]')
    const conteudo = linhas
      .map((l) => JSON.parse(l.slice(6)) as { choices: { delta: { content?: string } }[] })
      .map((c) => c.choices[0]?.delta.content ?? '')
      .join('')
    expect(conteudo).toBe('Olá, mundo')
    expect(texto.trimEnd().endsWith('data: [DONE]')).toBe(true)
  })

  it('comentarioDeProcessamento false não emite o comentário', async () => {
    falso = await iniciarOpenRouterFalso({ comentarioDeProcessamento: false })
    const texto = await (await pedirStream(falso.url)).text()
    expect(texto).not.toContain('OPENROUTER PROCESSING')
  })

  it('erroNoMeioApos emite dois trechos e depois um evento com error e finish_reason error, sem [DONE]', async () => {
    falso = await iniciarOpenRouterFalso({ trechos: ['a', 'b', 'c', 'd'], erroNoMeioApos: 2 })
    const texto = await (await pedirStream(falso.url)).text()
    expect(texto).toContain('"finish_reason":"error"')
    expect(texto).toContain('"error":{')
    expect(texto).not.toContain('"content":"c"')
    expect(texto).not.toContain('[DONE]')
  })

  it('partirChunks corta o evento em dois pacotes de rede', async () => {
    falso = await iniciarOpenRouterFalso({ trechos: ['inteiro'], partirChunks: true })
    const resposta = await pedirStream(falso.url)
    const leitor = resposta.body!.getReader()
    const pacotes: string[] = []
    for (;;) {
      const { done, value } = await leitor.read()
      if (done) break
      pacotes.push(new TextDecoder().decode(value))
    }
    // Algum pacote termina no meio de um JSON (sem o \n\n que fecha o evento).
    expect(pacotes.some((p) => p.includes('{') && !p.endsWith('\n\n'))).toBe(true)
    expect(pacotes.join('')).toContain('"content":"inteiro"')
  })

  it('conta o cancelamento quando o cliente aborta um stream lento', async () => {
    falso = await iniciarOpenRouterFalso({
      trechos: Array.from({ length: 50 }, (_, i) => `t${i} `),
      intervaloEntreTrechosMs: 30,
    })
    const controle = new AbortController()
    const resposta = await fetch(`${falso.url}/chat/completions`, {
      method: 'POST',
      headers: { ...autorizacao(CHAVE_VALIDA), 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'openai/gpt-4o-mini', messages: [], stream: true }),
      signal: controle.signal,
    })
    const leitor = resposta.body!.getReader()
    await leitor.read()
    controle.abort()
    await new Promise((r) => setTimeout(r, 150))
    expect(falso.cancelamentos).toBe(1)
  })
})
