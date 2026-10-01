/**
 * T-02.04 (FT-08): `transcreverAudio` fala com o OpenRouter simulado por
 * `chat/completions` sem stream, com a parte `input_audio`, instrução fixa e
 * erros `provedor_*` (PR-73). Nenhum teste chama a rede real.
 */
import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { INSTRUCAO_DE_TRANSCRICAO, transcreverAudio } from '@/lib/openrouter'
import { ErroDeAplicacao } from '@/lib/erros'
import { iniciarOpenRouterFalso, CHAVE_VALIDA, type OpenRouterFalso } from './apoio/openrouter-falso'

let falso: OpenRouterFalso
const baseOriginal = process.env.OPENROUTER_BASE_URL

beforeEach(async () => {
  falso = await iniciarOpenRouterFalso({ transcricoes: ['Olá, esta é a fala da parte um.'] })
  process.env.OPENROUTER_BASE_URL = falso.url
})
afterEach(async () => {
  await falso.fechar()
  if (baseOriginal === undefined) delete process.env.OPENROUTER_BASE_URL
  else process.env.OPENROUTER_BASE_URL = baseOriginal
})

const pedido = { chave: CHAVE_VALIDA, modelo: 'google/gemini-2.5-flash', audioBase64: 'QUJDRA==', formato: 'mp3' }
const falhar = (p: Promise<unknown>) => p.then(() => null, (e: ErroDeAplicacao) => e)

describe('transcreverAudio', () => {
  it('envia modelo, instrução fixa e a parte input_audio com base64 e formato, e devolve o texto', async () => {
    const texto = await transcreverAudio(pedido)
    expect(texto).toBe('Olá, esta é a fala da parte um.')
    const req = falso.requisicoes.at(-1)!
    expect(req.caminho).toBe('/api/v1/chat/completions')
    expect(req.cabecalhos.authorization).toBe(`Bearer ${CHAVE_VALIDA}`)
    const corpo = req.corpo as {
      model: string
      stream?: boolean
      messages: Array<{ role: string; content: Array<{ type: string; text?: string; input_audio?: { data: string; format: string } }> }>
    }
    expect(corpo.model).toBe('google/gemini-2.5-flash')
    expect(corpo.stream).toBeFalsy()
    const partes = corpo.messages[0]!.content
    expect(partes[0]).toEqual({ type: 'text', text: INSTRUCAO_DE_TRANSCRICAO })
    expect(partes[1]).toEqual({ type: 'input_audio', input_audio: { data: 'QUJDRA==', format: 'mp3' } })
    expect(INSTRUCAO_DE_TRANSCRICAO).toMatch(/fielmente/)
    expect(INSTRUCAO_DE_TRANSCRICAO).toMatch(/idioma/)
    expect(INSTRUCAO_DE_TRANSCRICAO).toMatch(/resum/i)
  })

  it('resposta com texto vazio lança transcricao_vazia, sem a chave na mensagem', async () => {
    falso.configurar({ transcricoes: ['   '] })
    const erro = await falhar(transcreverAudio(pedido))
    expect(erro).toBeInstanceOf(ErroDeAplicacao)
    expect(erro!.codigo).toBe('transcricao_vazia')
    expect(erro!.status).toBe(502)
    expect(JSON.stringify(erro!.message)).not.toContain(CHAVE_VALIDA)
  })

  it('os status do provedor viram os códigos provedor_*', async () => {
    const esperado: Array<[number, string]> = [[402, 'provedor_sem_saldo'], [401, 'provedor_chave_invalida'], [429, 'provedor_limite'], [500, 'provedor_indisponivel']]
    for (const [status, codigo] of esperado) {
      falso.configurar({ falhasPorParte: { 0: status } })
      const erro = await falhar(transcreverAudio(pedido))
      expect(erro?.codigo, String(status)).toBe(codigo)
    }
  })

  it('uma latência acima do prazo vira provedor_tempo_esgotado', async () => {
    falso.configurar({ latenciaPorParteMs: { 0: 600 } })
    const erro = await falhar(transcreverAudio({ ...pedido, tempoTotalMs: 150 }))
    expect(erro?.codigo).toBe('provedor_tempo_esgotado')
    expect(erro?.status).toBe(504)
  })

  it('um sinal abortado cancela o pedido sem virar erro de provedor', async () => {
    falso.configurar({ latenciaPorParteMs: { 0: 1500 } })
    const controle = new AbortController()
    setTimeout(() => controle.abort(), 100)
    const t0 = Date.now()
    const erro = await transcreverAudio({ ...pedido, sinal: controle.signal }).then(() => null, (e: Error) => e)
    expect(erro).not.toBeNull()
    expect(erro).not.toBeInstanceOf(ErroDeAplicacao)
    expect(Date.now() - t0).toBeLessThan(1200)
  })
})
