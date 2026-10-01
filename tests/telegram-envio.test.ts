/**
 * T-02.02 (FT-07): envio de mensagem pelo adaptador (PR-64): divisão acima de
 * 4096 caracteres respeitando quebras, nunca `parse_mode`, `retry_after` do 429
 * respeitado uma única vez e o indicador "digitando".
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { iniciarTelegramFalso, TOKEN_VALIDO, type TelegramFalso } from './apoio/telegram-falso'
import { ErroDeAplicacao } from '@/lib/erros'
import { dividirTexto, sendMessage, sendChatAction } from '@/lib/telegram'

let falso: TelegramFalso
const baseOriginal = process.env.TELEGRAM_API_BASE

beforeEach(async () => {
  falso = await iniciarTelegramFalso()
  process.env.TELEGRAM_API_BASE = falso.url
})
afterEach(async () => {
  await falso.fechar()
  if (baseOriginal === undefined) delete process.env.TELEGRAM_API_BASE
  else process.env.TELEGRAM_API_BASE = baseOriginal
})

describe('dividirTexto', () => {
  it('texto que cabe fica inteiro; vazio não gera pedaço', () => {
    expect(dividirTexto('olá')).toEqual(['olá'])
    expect(dividirTexto('   ')).toEqual([])
  })

  it('prefere linha em branco, depois quebra de linha, depois espaço e só por fim o limite', () => {
    const paragrafos = 'a'.repeat(3000) + '\n\n' + 'b'.repeat(3000) + '\n\n' + 'c'.repeat(3000)
    expect(dividirTexto(paragrafos)).toEqual(['a'.repeat(3000), 'b'.repeat(3000), 'c'.repeat(3000)])

    const linhas = 'a'.repeat(3000) + '\n' + 'b'.repeat(3000)
    expect(dividirTexto(linhas)).toEqual(['a'.repeat(3000), 'b'.repeat(3000)])

    const palavras = 'a'.repeat(3000) + ' ' + 'b'.repeat(3000)
    expect(dividirTexto(palavras)).toEqual(['a'.repeat(3000), 'b'.repeat(3000)])

    const seco = 'x'.repeat(5000)
    expect(dividirTexto(seco)).toEqual(['x'.repeat(4096), 'x'.repeat(904)])
  })

  it('nenhum pedaço passa do limite e nada se perde, mesmo sem ponto de corte bom', () => {
    const texto = ('palavra '.repeat(1200) + '\n').repeat(3)
    const pedacos = dividirTexto(texto)
    expect(pedacos.every((p) => p.length > 0 && p.length <= 4096)).toBe(true)
    expect(pedacos.join(' ').replace(/\s+/g, ' ').trim()).toBe(texto.replace(/\s+/g, ' ').trim())
  })

  it('não parte um par substituto (emoji) ao meio no corte seco', () => {
    const texto = 'x'.repeat(4095) + '😀' + 'y'.repeat(10)
    const [primeiro, segundo] = dividirTexto(texto)
    expect(primeiro).toBe('x'.repeat(4095))
    expect(segundo).toBe('😀' + 'y'.repeat(10))
  })
})

describe('sendMessage', () => {
  it('um texto de 9000 caracteres chega em três chamadas de até 4096, na ordem, sem parse_mode', async () => {
    const texto = 'a'.repeat(3000) + '\n\n' + 'b'.repeat(3000) + '\n\n' + 'c'.repeat(3000)
    await sendMessage(TOKEN_VALIDO, 42, texto)
    const enviadas = falso.requisicoes.filter((r) => r.metodo === 'sendMessage')
    expect(enviadas).toHaveLength(3)
    expect(enviadas.map((r) => (r.corpo.text as string)[0])).toEqual(['a', 'b', 'c'])
    for (const r of enviadas) {
      expect((r.corpo.text as string).length).toBeLessThanOrEqual(4096)
      expect(r.corpo.chat_id).toBe(42)
      expect(Object.keys(r.corpo).sort()).toEqual(['chat_id', 'text'])
    }
  })

  it('texto vazio não chama o Telegram', async () => {
    await sendMessage(TOKEN_VALIDO, 42, '  \n ')
    expect(falso.requisicoes).toHaveLength(0)
  })

  it('429 com retry_after de 1 segundo espera e repete uma única vez', async () => {
    falso.configurar({ falhas: { sendMessage: { status: 429, retryAfter: 1, vezes: 1 } } })
    const esperas: number[] = []
    await sendMessage(TOKEN_VALIDO, 42, 'olá', { esperar: async (ms) => void esperas.push(ms) })
    expect(esperas).toEqual([1000])
    expect(falso.requisicoes.filter((r) => r.metodo === 'sendMessage')).toHaveLength(2)
    expect(falso.mensagensEnviadas()).toEqual([{ chat_id: 42, text: 'olá' }])
  })

  it('um segundo 429 seguido vira telegram_limite, sem terceira tentativa', async () => {
    falso.configurar({ falhas: { sendMessage: { status: 429, retryAfter: 1 } } })
    const e = await sendMessage(TOKEN_VALIDO, 42, 'olá', { esperar: async () => undefined }).catch((x) => x)
    expect(e).toBeInstanceOf(ErroDeAplicacao)
    expect((e as ErroDeAplicacao).codigo).toBe('telegram_limite')
    expect(falso.requisicoes.filter((r) => r.metodo === 'sendMessage')).toHaveLength(2)
  })

  it('retry_after acima de 30 segundos ou ausente não repete', async () => {
    falso.configurar({ falhas: { sendMessage: { status: 429, retryAfter: 120 } } })
    await expect(sendMessage(TOKEN_VALIDO, 42, 'a', { esperar: async () => undefined })).rejects.toMatchObject({ codigo: 'telegram_limite' })
    expect(falso.requisicoes).toHaveLength(1)
    falso.requisicoes.length = 0
    falso.configurar({ falhas: { sendMessage: { status: 429 } } })
    await expect(sendMessage(TOKEN_VALIDO, 42, 'a', { esperar: async () => undefined })).rejects.toMatchObject({ codigo: 'telegram_limite' })
    expect(falso.requisicoes).toHaveLength(1)
  })

  it('bot bloqueado pelo usuário vira telegram_sem_acesso', async () => {
    falso.configurar({ falhas: { sendMessage: { status: 403 } } })
    await expect(sendMessage(TOKEN_VALIDO, 42, 'a')).rejects.toMatchObject({ codigo: 'telegram_sem_acesso' })
  })
})

describe('sendChatAction', () => {
  it('envia action typing para o chat certo', async () => {
    await sendChatAction(TOKEN_VALIDO, 77)
    expect(falso.requisicoes[0]).toMatchObject({ metodo: 'sendChatAction', corpo: { chat_id: 77, action: 'typing' } })
  })
})
