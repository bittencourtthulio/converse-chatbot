/**
 * T-04.04 (FT-07): os limites do Telegram (PR-16, PR-68): 10 mensagens por minuto
 * por chat, 60 por conversa, o teto diário do canal e a ordem de atendimento de um
 * chat. Excedeu: resposta amigável no lugar do silêncio, sem gastar o provedor.
 */
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { criarLimitador } from '@/lib/limite-de-uso'
import { limparBanco } from './ajuda'
import { iniciarOpenRouterFalso, type OpenRouterFalso } from './apoio/openrouter-falso'
import { iniciarTelegramFalso, TOKEN_VALIDO, updateDeTexto, type TelegramFalso } from './apoio/telegram-falso'
import { cenarioDeChat } from './apoio/chat'
import { conectar } from '@/servicos/canal-telegram'
import { autenticarWebhook, lerUpdate, type CanalAutenticado } from '@/servicos/telegram-webhook'
import { atenderUpdate, MENSAGEM_DE_NOVA_CONVERSA, type OpcoesDeAtendimento } from '@/servicos/telegram-atendimento'
import { LIMITES_DO_TELEGRAM, MENSAGENS_DE_LIMITE } from '@/servicos/telegram-limites'

let openrouter: OpenRouterFalso
let falso: TelegramFalso
let canal: CanalAutenticado
let agenteId: string
let relogio = 1_000_000
const limitador = () => criarLimitador(() => relogio)
const original = { ...process.env }
let contadorDeUpdate = 1

async function atender(texto: string, chatId = 42, opcoes: OpcoesDeAtendimento = {}) {
  contadorDeUpdate += 1
  const lido = lerUpdate(updateDeTexto({ updateId: contadorDeUpdate, chatId, texto, nome: 'Maria' }))
  if (!lido) throw new Error('update de teste inválido')
  await atenderUpdate(canal, lido, opcoes)
}
const chamadasAoProvedor = () => openrouter.requisicoes.filter((r) => r.caminho.endsWith('/chat/completions')).length
const textosAoChat = (chatId: number) => falso.mensagensEnviadas().filter((m) => m.chat_id === chatId).map((m) => m.text)

beforeEach(async () => {
  await limparBanco()
  relogio = 1_000_000
  openrouter = await iniciarOpenRouterFalso({ resposta: 'ok' })
  process.env.OPENROUTER_BASE_URL = openrouter.url
  const { admin, agente } = await cenarioDeChat()
  agenteId = agente.id
  falso = await iniciarTelegramFalso()
  process.env.TELEGRAM_API_BASE = falso.url
  process.env.APP_URL = 'https://converse.exemplo.com'
  await conectar(admin, agente.id, TOKEN_VALIDO)
  canal = (await autenticarWebhook(agente.id, falso.webhook?.secret_token as string)) as CanalAutenticado
  falso.requisicoes.length = 0
})
afterEach(async () => {
  await falso.fechar()
  await openrouter.fechar()
  for (const chave of ['TELEGRAM_API_BASE', 'APP_URL', 'OPENROUTER_BASE_URL']) {
    if (original[chave] === undefined) delete process.env[chave]
    else process.env[chave] = original[chave]
  }
})
afterAll(limparBanco)

describe('por chat, por minuto', () => {
  it('a 11ª mensagem do mesmo chat no minuto recebe a frase de limite sem chamar o provedor; outro chat não é afetado', async () => {
    const lim = limitador()
    for (let i = 0; i < LIMITES_DO_TELEGRAM.porChatPorMinuto; i += 1) await atender(`pergunta ${i}`, 42, { limitador: lim })
    expect(chamadasAoProvedor()).toBe(10)

    await atender('pergunta demais', 42, { limitador: lim })
    expect(chamadasAoProvedor()).toBe(10)
    expect(textosAoChat(42).at(-1)).toBe(MENSAGENS_DE_LIMITE.porChat)
    expect(await prisma.mensagem.count({ where: { conteudo: 'pergunta demais' } })).toBe(0)

    await atender('outro chat', 43, { limitador: lim })
    expect(chamadasAoProvedor()).toBe(11)
    expect(textosAoChat(43)).toEqual(['ok'])
  })

  it('passado o minuto o chat volta a ser atendido', async () => {
    const lim = limitador()
    for (let i = 0; i < 11; i += 1) await atender(`p${i}`, 42, { limitador: lim })
    expect(textosAoChat(42).at(-1)).toBe(MENSAGENS_DE_LIMITE.porChat)
    relogio += 61_000
    await atender('de volta', 42, { limitador: lim })
    expect(textosAoChat(42).at(-1)).toBe('ok')
  })

  it('o limite de um canal não vaza para outro agente com o mesmo chat id', async () => {
    const lim = limitador()
    for (let i = 0; i < 10; i += 1) await atender(`p${i}`, 42, { limitador: lim })
    const { chave } = { chave: `telegram:chat:${canal.id}:42` }
    expect(lim.verificarLimite(chave, { max: 10, janelaMs: 60_000 }).permitido).toBe(false)
    expect(lim.verificarLimite(`telegram:chat:outro-canal:42`, { max: 10, janelaMs: 60_000 }).permitido).toBe(true)
  })
})

describe('por conversa', () => {
  it('a 61ª mensagem de uma conversa pede /novo, sem chamar o provedor, e /novo destrava', async () => {
    const conversa = await prisma.conversa.create({ data: { agenteId, canal: 'telegram', identificadorExterno: '42', titulo: 'Telegram: Maria' } })
    await prisma.mensagem.createMany({
      data: Array.from({ length: LIMITES_DO_TELEGRAM.mensagensPorConversa }, (_, i) => ({ conversaId: conversa.id, papel: 'user', conteudo: `m${i}` })),
    })
    await atender('mais uma', 42, { limitador: limitador() })
    expect(chamadasAoProvedor()).toBe(0)
    expect(textosAoChat(42)).toEqual([MENSAGENS_DE_LIMITE.conversaCheia])
    expect(MENSAGENS_DE_LIMITE.conversaCheia).toContain('/novo')

    await atender('/novo', 42, { limitador: limitador() })
    await atender('agora vai', 42, { limitador: limitador() })
    expect(textosAoChat(42)).toEqual([MENSAGENS_DE_LIMITE.conversaCheia, MENSAGEM_DE_NOVA_CONVERSA, 'ok'])
    expect(await prisma.conversa.count({ where: { identificadorExterno: '42' } })).toBe(2)
  })
})

describe('teto diário do canal', () => {
  it('o teto do canal responde que volta amanhã, sem chamar o provedor', async () => {
    await prisma.canalTelegram.update({ where: { id: canal.id }, data: { limiteDiario: 3 } })
    const outra = await prisma.conversa.create({ data: { agenteId, canal: 'telegram', identificadorExterno: '99' } })
    await prisma.mensagem.createMany({ data: [1, 2, 3].map((i) => ({ conversaId: outra.id, papel: 'user', conteudo: `u${i}` })) })
    canal = { ...canal, limiteDiario: 3 }
    await atender('oi', 42, { limitador: limitador() })
    expect(chamadasAoProvedor()).toBe(0)
    expect(textosAoChat(42)).toEqual([MENSAGENS_DE_LIMITE.tetoDiario])
    expect(MENSAGENS_DE_LIMITE.tetoDiario).toMatch(/amanhã/)
  })

  it('só conta mensagens de hoje do canal telegram: o widget e ontem não pesam', async () => {
    canal = { ...canal, limiteDiario: 2 }
    const widget = await prisma.conversa.create({ data: { agenteId, canal: 'widget', identificadorExterno: 'visitante-de-teste-0001' } })
    await prisma.mensagem.createMany({ data: [1, 2, 3].map((i) => ({ conversaId: widget.id, papel: 'user', conteudo: `w${i}` })) })
    const ontem = new Date(Date.now() - 36 * 3600 * 1000)
    const velha = await prisma.conversa.create({ data: { agenteId, canal: 'telegram', identificadorExterno: '7' } })
    await prisma.mensagem.createMany({ data: [1, 2, 3].map((i) => ({ conversaId: velha.id, papel: 'user', conteudo: `v${i}`, criadoEm: ontem })) })
    await atender('oi', 42, { limitador: limitador() })
    expect(textosAoChat(42)).toEqual(['ok'])
  })
})

describe('mensagens de limite e ordem', () => {
  it('as frases são amigáveis: sem número técnico nem código', () => {
    for (const frase of Object.values(MENSAGENS_DE_LIMITE)) {
      expect(frase).not.toMatch(/\d/)
      expect(frase).not.toMatch(/limite_|429|_/)
    }
  })

  it('duas mensagens simultâneas do mesmo chat são atendidas em ordem, sem intercalar', async () => {
    openrouter.configurar({ intervaloEntreTrechosMs: 40, resposta: 'um dois três' })
    contadorDeUpdate += 2
    const a = lerUpdate(updateDeTexto({ updateId: contadorDeUpdate, chatId: 42, texto: 'primeira', nome: 'Maria' }))!
    const b = lerUpdate(updateDeTexto({ updateId: contadorDeUpdate + 1, chatId: 42, texto: 'segunda', nome: 'Maria' }))!
    const lim = limitador()
    await Promise.all([atenderUpdate(canal, a, { limitador: lim }), atenderUpdate(canal, b, { limitador: lim })])
    const mensagens = await prisma.mensagem.findMany({ orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }] })
    expect(mensagens.map((m) => `${m.papel}:${m.conteudo}`)).toEqual(['user:primeira', 'assistant:um dois três', 'user:segunda', 'assistant:um dois três'])
    expect(await prisma.conversa.count()).toBe(1)
  })
})
