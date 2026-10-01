/**
 * T-04.02 (FT-07): o atendimento dos comandos e dos casos sem texto (PR-67): só
 * chat privado, `/start` com a mensagem inicial do agente, `/novo` e `/reiniciar`
 * abrindo conversa nova, aviso para mensagem que não é texto, grupos ignorados e
 * título "Telegram: Nome" com o mínimo de dado pessoal.
 */
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { criarAdmin, limparBanco } from './ajuda'
import { iniciarTelegramFalso, TOKEN_VALIDO, updateDeTexto, type TelegramFalso } from './apoio/telegram-falso'
import { conectar } from '@/servicos/canal-telegram'
import { autenticarWebhook, lerUpdate, type CanalAutenticado } from '@/servicos/telegram-webhook'
import {
  AVISO_SO_TEXTO,
  MENSAGEM_INICIAL_PADRAO,
  MENSAGEM_DE_NOVA_CONVERSA,
  atenderUpdate,
  interpretarComando,
  tituloDoChat,
} from '@/servicos/telegram-atendimento'

let falso: TelegramFalso
let canal: CanalAutenticado
let agenteId: string
const original = { ...process.env }

async function atender(update: ReturnType<typeof updateDeTexto>) {
  const lido = lerUpdate(update)
  if (!lido) throw new Error('update de teste inválido')
  await atenderUpdate(canal, lido)
}

beforeEach(async () => {
  await limparBanco()
  const autor = await criarAdmin()
  agenteId = (
    await prisma.agente.create({
      data: { nome: 'Agente', modelo: 'm', mensagemInicial: 'Olá, sou o assistente da loja!', criadoPorId: autor.id },
    })
  ).id
  falso = await iniciarTelegramFalso()
  process.env.TELEGRAM_API_BASE = falso.url
  process.env.APP_URL = 'https://converse.exemplo.com'
  await conectar(autor, agenteId, TOKEN_VALIDO)
  canal = (await autenticarWebhook(agenteId, falso.webhook?.secret_token as string)) as CanalAutenticado
  falso.requisicoes.length = 0
})
afterEach(async () => {
  await falso.fechar()
  for (const chave of ['TELEGRAM_API_BASE', 'APP_URL']) {
    if (original[chave] === undefined) delete process.env[chave]
    else process.env[chave] = original[chave]
  }
})
afterAll(limparBanco)

describe('interpretarComando', () => {
  it('reconhece /start, /novo e /reiniciar, com argumento e com o @ do próprio bot, sem caixa', () => {
    expect(interpretarComando('/start', 'meu_bot')).toBe('start')
    expect(interpretarComando('/start promo123', 'meu_bot')).toBe('start')
    expect(interpretarComando('/START@Meu_Bot', 'meu_bot')).toBe('start')
    expect(interpretarComando('  /novo  ', 'meu_bot')).toBe('novo')
    expect(interpretarComando('/reiniciar', 'meu_bot')).toBe('novo')
  })

  it('texto comum, comando de outro bot e comando desconhecido não são comandos nossos', () => {
    expect(interpretarComando('olá /start', 'meu_bot')).toBeNull()
    expect(interpretarComando('/start@outro_bot', 'meu_bot')).toBeNull()
    expect(interpretarComando('/ajuda', 'meu_bot')).toBeNull()
    expect(interpretarComando('/startx', 'meu_bot')).toBeNull()
    expect(interpretarComando('', 'meu_bot')).toBeNull()
  })
})

describe('tituloDoChat', () => {
  it('é "Telegram: Nome", sem @usuário nem id, com caracteres de controle removidos e no máximo 60', () => {
    expect(tituloDoChat('Maria Silva')).toBe('Telegram: Maria Silva')
    expect(tituloDoChat(undefined)).toBe('Telegram: contato')
    expect(tituloDoChat('   ')).toBe('Telegram: contato')
    expect(tituloDoChat('Ana\n\t\u0000Lima')).toBe('Telegram: Ana Lima')
    expect(tituloDoChat('N'.repeat(200))).toHaveLength(60)
  })
})

describe('atenderUpdate: /start', () => {
  it('responde a mensagem inicial do agente ao chat certo, sem criar conversa', async () => {
    await atender(updateDeTexto({ updateId: 1, chatId: 42, texto: '/start' }))
    expect(falso.mensagensEnviadas()).toEqual([{ chat_id: 42, text: 'Olá, sou o assistente da loja!' }])
    expect(await prisma.conversa.count()).toBe(0)
  })

  it('agente sem mensagem inicial usa a frase padrão', async () => {
    await prisma.agente.update({ where: { id: agenteId }, data: { mensagemInicial: '' } })
    await atender(updateDeTexto({ updateId: 2, chatId: 42, texto: '/start@bot_de_teste_bot' }))
    expect(falso.mensagensEnviadas()).toEqual([{ chat_id: 42, text: MENSAGEM_INICIAL_PADRAO }])
  })
})

describe('atenderUpdate: /novo e /reiniciar', () => {
  it('abre uma conversa vazia do canal telegram com o chat id e o título pelo nome público, e confirma', async () => {
    await atender(updateDeTexto({ updateId: 3, chatId: 42, texto: '/novo', nome: 'Maria', sobrenome: 'Silva' }))
    const conversas = await prisma.conversa.findMany()
    expect(conversas).toHaveLength(1)
    expect(conversas[0]).toMatchObject({ agenteId, canal: 'telegram', identificadorExterno: '42', titulo: 'Telegram: Maria Silva', criadoPorId: null })
    expect(await prisma.mensagem.count()).toBe(0)
    expect(falso.mensagensEnviadas()).toEqual([{ chat_id: 42, text: MENSAGEM_DE_NOVA_CONVERSA }])
  })

  it('o título não leva o @usuário nem o id do chat (PR-18)', async () => {
    await atender(updateDeTexto({ updateId: 4, chatId: 424242, texto: '/novo', nome: 'Maria' }))
    const { titulo } = await prisma.conversa.findFirstOrThrow()
    expect(titulo).toBe('Telegram: Maria')
    expect(titulo).not.toContain('maria_usuaria')
    expect(titulo).not.toContain('424242')
  })

  it('cada /novo e /reiniciar abre outra conversa, e chats diferentes têm conversas diferentes', async () => {
    await atender(updateDeTexto({ updateId: 5, chatId: 42, texto: '/novo' }))
    await atender(updateDeTexto({ updateId: 6, chatId: 42, texto: '/reiniciar' }))
    await atender(updateDeTexto({ updateId: 7, chatId: 43, texto: '/novo' }))
    const por = (id: string) => prisma.conversa.count({ where: { identificadorExterno: id } })
    expect(await por('42')).toBe(2)
    expect(await por('43')).toBe(1)
  })
})

describe('atenderUpdate: o que não é texto e o que não é chat privado', () => {
  it('foto em chat privado recebe o aviso de só texto e não cria conversa', async () => {
    await atender(updateDeTexto({ updateId: 8, chatId: 42, semTexto: true, extra: { photo: [{ file_id: 'x' }] } }))
    expect(falso.mensagensEnviadas()).toEqual([{ chat_id: 42, text: AVISO_SO_TEXTO }])
    expect(AVISO_SO_TEXTO).toBe('Só consigo ler mensagens de texto por enquanto.')
    expect(await prisma.conversa.count()).toBe(0)
  })

  it('grupo, supergrupo e canal são ignorados: nenhuma chamada ao Telegram e nada gravado', async () => {
    for (const [i, tipo] of (['group', 'supergroup', 'channel'] as const).entries()) {
      await atender(updateDeTexto({ updateId: 20 + i, chatId: -100 - i, texto: '/start', tipoDoChat: tipo }))
      await atender(updateDeTexto({ updateId: 30 + i, chatId: -100 - i, semTexto: true, tipoDoChat: tipo }))
    }
    expect(falso.requisicoes).toHaveLength(0)
    expect(await prisma.conversa.count()).toBe(0)
    expect((await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })).ultimaMensagemEm).toBeNull()
  })

  it('update sem message não faz nada', async () => {
    await atenderUpdate(canal, { updateId: '99' })
    expect(falso.requisicoes).toHaveLength(0)
  })
})

describe('estado do canal', () => {
  it('uma mensagem de chat privado atualiza ultimaMensagemEm', async () => {
    const antes = Date.now()
    await atender(updateDeTexto({ updateId: 40, chatId: 42, texto: '/start' }))
    const { ultimaMensagemEm } = await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })
    expect(ultimaMensagemEm?.getTime()).toBeGreaterThanOrEqual(antes - 1000)
  })

  it('falha ao enviar não propaga: vira o último erro do canal, em português e sem token', async () => {
    falso.configurar({ falhas: { sendMessage: { status: 403 } } })
    await expect(atender(updateDeTexto({ updateId: 41, chatId: 42, texto: '/start' }))).resolves.toBeUndefined()
    const c = await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })
    expect(c.ultimoErro).toMatch(/acesso|bloque/i)
    expect(c.ultimoErro).not.toContain(TOKEN_VALIDO)
    expect(c.ultimoErroEm).toBeInstanceOf(Date)
  })
})
