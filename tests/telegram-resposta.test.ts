/**
 * T-04.03 (FT-07): a resposta do agente no Telegram (PR-67): `responderMensagem`
 * com canal `telegram`, texto puro, `[n]` mantidos, linha "Fontes:" só com os
 * títulos citados, "digitando" durante a geração, falha pela frase única e o
 * estado do canal (última mensagem, último erro).
 */
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { limparBanco } from './ajuda'
import { iniciarOpenRouterFalso, type OpenRouterFalso } from './apoio/openrouter-falso'
import { iniciarTelegramFalso, TOKEN_VALIDO, updateDeTexto, type TelegramFalso } from './apoio/telegram-falso'
import { cenarioDeChat } from './apoio/chat'
import { criarBase } from './apoio/conhecimento'
import { conectar } from '@/servicos/canal-telegram'
import { MENSAGEM_PARA_VISITANTE } from '@/servicos/chat-erros'
import { autenticarWebhook, lerUpdate, type CanalAutenticado } from '@/servicos/telegram-webhook'
import { atenderUpdate, type OpcoesDeAtendimento } from '@/servicos/telegram-atendimento'

let openrouter: OpenRouterFalso
let falso: TelegramFalso
let canal: CanalAutenticado
let agenteId: string
const original = { ...process.env }

async function atender(texto: string, opcoes: OpcoesDeAtendimento = {}, extra: { updateId?: number; chatId?: number } = {}) {
  const lido = lerUpdate(updateDeTexto({ updateId: extra.updateId ?? Math.floor(Math.random() * 1e9), chatId: extra.chatId ?? 42, texto, nome: 'Maria' }))
  if (!lido) throw new Error('update de teste inválido')
  await atenderUpdate(canal, lido, opcoes)
}

async function preparar(opcoesOpenRouter: Parameters<typeof iniciarOpenRouterFalso>[0] = {}, comChave = true) {
  openrouter = await iniciarOpenRouterFalso({ resposta: 'Claro, posso ajudar.', ...opcoesOpenRouter })
  process.env.OPENROUTER_BASE_URL = openrouter.url
  const { admin, agente } = await cenarioDeChat({ comChave })
  agenteId = agente.id
  falso = await iniciarTelegramFalso()
  process.env.TELEGRAM_API_BASE = falso.url
  process.env.APP_URL = 'https://converse.exemplo.com'
  await conectar(admin, agente.id, TOKEN_VALIDO)
  canal = (await autenticarWebhook(agente.id, falso.webhook?.secret_token as string)) as CanalAutenticado
  falso.requisicoes.length = 0
  return { admin, agente }
}

beforeEach(limparBanco)
afterEach(async () => {
  await falso?.fechar()
  await openrouter?.fechar()
  for (const chave of ['TELEGRAM_API_BASE', 'APP_URL', 'OPENROUTER_BASE_URL']) {
    if (original[chave] === undefined) delete process.env[chave]
    else process.env[chave] = original[chave]
  }
})
afterAll(limparBanco)

const chamadasDeChat = () => openrouter.requisicoes.filter((r) => r.caminho.endsWith('/chat/completions'))

describe('resposta do agente', () => {
  it('uma pergunta gera conversa do canal telegram com o chat id, grava as duas mensagens e envia a resposta em texto puro', async () => {
    await preparar()
    await atender('Oi, tudo bem?')

    const conversa = await prisma.conversa.findFirstOrThrow()
    expect(conversa).toMatchObject({ agenteId, canal: 'telegram', identificadorExterno: '42', titulo: 'Telegram: Maria', criadoPorId: null })
    const mensagens = await prisma.mensagem.findMany({ orderBy: { criadoEm: 'asc' } })
    expect(mensagens.map((m) => [m.papel, m.conteudo])).toEqual([
      ['user', 'Oi, tudo bem?'],
      ['assistant', 'Claro, posso ajudar.'],
    ])
    expect(falso.mensagensEnviadas()).toEqual([{ chat_id: 42, text: 'Claro, posso ajudar.' }])
    const envio = falso.requisicoes.find((r) => r.metodo === 'sendMessage')
    expect(Object.keys(envio?.corpo ?? {}).sort()).toEqual(['chat_id', 'text'])
    expect(await prisma.canalTelegram.findFirstOrThrow()).toMatchObject({ ultimoErro: null })
  })

  it('a segunda pergunta continua a mesma conversa', async () => {
    await preparar()
    await atender('primeira')
    await atender('segunda')
    expect(await prisma.conversa.count()).toBe(1)
    expect(await prisma.mensagem.count()).toBe(4)
  })

  it('o texto vai sem marcação: nada é interpretado, mesmo com asteriscos e HTML na resposta', async () => {
    await preparar({ resposta: '**negrito** <b>html</b> _x_' })
    await atender('oi')
    expect(falso.mensagensEnviadas()[0]?.text).toBe('**negrito** <b>html</b> _x_')
    expect(falso.requisicoes.find((r) => r.metodo === 'sendMessage')?.corpo).not.toHaveProperty('parse_mode')
  })

  it('com fonte citada, a última linha é "Fontes:" só com os títulos citados e o [n] fica no texto', async () => {
    const { agente } = await preparar({ trechos: ['Você pode trocar em sete dias ', '[1]', '.'] })
    await criarBase({ agenteId: agente.id, titulo: 'Política de troca', textos: ['Aceitamos a troca em até sete dias corridos.'] })
    await criarBase({ agenteId: agente.id, titulo: 'Entrega', textos: ['A troca do endereço de entrega é grátis.'] })
    await atender('Qual o prazo de troca?')

    const texto = falso.mensagensEnviadas().map((m) => m.text).join('')
    expect(texto).toBe('Você pode trocar em sete dias [1].\n\nFontes: Política de troca')
    expect(texto).not.toContain('Entrega')
    const gravada = await prisma.mensagem.findFirstOrThrow({ where: { papel: 'assistant' } })
    expect(gravada.conteudo).toBe('Você pode trocar em sete dias [1].')
  })

  it('com base mas sem citação não há linha de Fontes', async () => {
    const { agente } = await preparar({ resposta: 'Não encontrei isso na base.' })
    await criarBase({ agenteId: agente.id, titulo: 'Cadernos', textos: ['Vendemos cadernos.'] })
    await atender('Qual a capital da Austrália?')
    expect(falso.mensagensEnviadas()[0]?.text).toBe('Não encontrei isso na base.')
  })

  it('resposta acima de 4096 caracteres sai em mais de uma mensagem, em ordem, e a gravada é inteira', async () => {
    const longa = 'a'.repeat(3000) + '\n\n' + 'b'.repeat(3000)
    await preparar({ resposta: longa, trechos: [longa] })
    await atender('conte tudo')
    const enviadas = falso.mensagensEnviadas().map((m) => m.text)
    expect(enviadas).toHaveLength(2)
    expect(enviadas[0]?.startsWith('a')).toBe(true)
    expect(enviadas[1]?.startsWith('b')).toBe(true)
    expect((await prisma.mensagem.findFirstOrThrow({ where: { papel: 'assistant' } })).conteudo).toBe(longa)
  })
})

describe('falhas', () => {
  it('falha do provedor responde a frase única ao chat e grava um último erro seguro para quem opera', async () => {
    await preparar()
    openrouter.configurar({ erroHttp: 402 })
    await atender('oi')
    expect(falso.mensagensEnviadas()).toEqual([{ chat_id: 42, text: MENSAGEM_PARA_VISITANTE }])
    const texto = falso.mensagensEnviadas()[0]?.text ?? ''
    expect(texto).not.toMatch(/OpenRouter|saldo|provedor|402|Insufficient/i)
    const c = await prisma.canalTelegram.findFirstOrThrow()
    expect(c.ultimoErro).toMatch(/saldo|OpenRouter/i)
    expect(c.ultimoErro).not.toContain('Insufficient credits')
    expect(c.ultimoErroEm).toBeInstanceOf(Date)
  })

  it('sem chave do OpenRouter também responde a frase única', async () => {
    await preparar({}, false)
    await atender('oi')
    expect(falso.mensagensEnviadas()).toEqual([{ chat_id: 42, text: MENSAGEM_PARA_VISITANTE }])
    expect((await prisma.canalTelegram.findFirstOrThrow()).ultimoErro).toMatch(/OpenRouter/)
  })

  it('uma resposta bem-sucedida limpa o último erro', async () => {
    await preparar()
    await prisma.canalTelegram.updateMany({ data: { ultimoErro: 'erro antigo', ultimoErroEm: new Date() } })
    await atender('oi')
    expect(await prisma.canalTelegram.findFirstOrThrow()).toMatchObject({ ultimoErro: null, ultimoErroEm: null })
  })

  it('o Telegram recusando o envio da resposta vira último erro e não propaga', async () => {
    await preparar()
    falso.configurar({ falhas: { sendMessage: { status: 403 } } })
    await expect(atender('oi')).resolves.toBeUndefined()
    const c = await prisma.canalTelegram.findFirstOrThrow()
    expect(c.ultimoErro).toBeTruthy()
    expect(c.ultimoErro).not.toContain(TOKEN_VALIDO)
    expect(await prisma.mensagem.count({ where: { papel: 'assistant' } })).toBe(1)
  })

  it('mensagem acima de 4000 caracteres recebe aviso, não chama o OpenRouter e não é gravada', async () => {
    await preparar()
    await atender('x'.repeat(4001))
    expect(chamadasDeChat()).toHaveLength(0)
    expect(falso.mensagensEnviadas()[0]?.text).toMatch(/longa demais/i)
    expect(await prisma.mensagem.count()).toBe(0)
  })

  it('nenhum texto enviado ao Telegram contém o token nem o segredo do webhook', async () => {
    await preparar()
    await atender('oi')
    openrouter.configurar({ erroHttp: 500 })
    await atender('de novo')
    const tudo = falso.requisicoes.map((r) => JSON.stringify(r.corpo)).join('\n')
    expect(tudo).not.toContain(TOKEN_VALIDO)
    expect(tudo).not.toContain(falso.webhook?.secret_token ?? 'nunca-vazio')
  })
})

describe('digitando', () => {
  it('renova o indicador enquanto o modelo gera e para ao responder', async () => {
    await preparar({ resposta: 'um dois três quatro cinco seis', intervaloEntreTrechosMs: 150 })
    await atender('oi', { intervaloDigitandoMs: 100 })
    const acoes = falso.requisicoes.filter((r) => r.metodo === 'sendChatAction')
    expect(acoes.length).toBeGreaterThanOrEqual(3)
    for (const a of acoes) expect(a.corpo).toEqual({ chat_id: 42, action: 'typing' })
    const indiceDoEnvio = falso.requisicoes.findIndex((r) => r.metodo === 'sendMessage')
    expect(falso.requisicoes.slice(indiceDoEnvio).some((r) => r.metodo === 'sendChatAction')).toBe(false)
    const antes = falso.requisicoes.length
    await new Promise((r) => setTimeout(r, 250))
    expect(falso.requisicoes).toHaveLength(antes)
  })

  it('o indicador falhar não derruba a resposta', async () => {
    await preparar()
    falso.configurar({ falhas: { sendChatAction: { status: 500 } } })
    await atender('oi', { intervaloDigitandoMs: 50 })
    expect(falso.mensagensEnviadas()).toEqual([{ chat_id: 42, text: 'Claro, posso ajudar.' }])
  })
})
