/**
 * T-05.01 (FT-07): POST /api/telegram/[agenteId]/webhook contra o servidor de
 * produção, o OpenRouter simulado e o Telegram simulado (PR-66): autenticação
 * pelo segredo, 200 rápido com o atendimento depois, dedupe do reenvio e
 * nenhum vazamento do token nos logs do servidor.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { conectar } from '@/servicos/canal-telegram'
import { salvarChaveDoOpenrouter } from '@/servicos/integracoes'
import { criarAdmin, limparBanco } from './ajuda'
import { CHAVE_VALIDA, iniciarOpenRouterFalso, type OpenRouterFalso } from './apoio/openrouter-falso'
import { dispararUpdate, iniciarTelegramFalso, TOKEN_VALIDO, updateDeTexto, type TelegramFalso } from './apoio/telegram-falso'
import { esperar, subirServidor, type Servidor } from './apoio/servidor'
import { criarBase } from './apoio/conhecimento'

const PORTA = 3200
const original = { ...process.env }

let servidor: Servidor
let openrouter: OpenRouterFalso
let telegram: TelegramFalso
let agenteId: string
let segredo: string
let adminId: string
let proximoUpdate = 1000

const url = (id = agenteId) => `${servidor.base}/api/telegram/${id}/webhook`
const novoUpdate = (texto = 'Oi, tudo bem?', chatId = 42) => updateDeTexto({ updateId: (proximoUpdate += 1), chatId, texto, nome: 'Maria' })
const pausa = (ms: number) => new Promise((r) => setTimeout(r, ms))

beforeAll(async () => {
  await limparBanco()
  const admin = await criarAdmin()
  adminId = admin.id
  await salvarChaveDoOpenrouter(admin, { chave: CHAVE_VALIDA })
  agenteId = (await prisma.agente.create({ data: { nome: 'Agente do Telegram', modelo: 'openai/gpt-4o-mini', instrucoes: 'Seja breve.', criadoPorId: admin.id } })).id
  await criarBase({ agenteId, titulo: 'Política de troca', textos: ['A troca pode ser feita em sete dias.'] })
  openrouter = await iniciarOpenRouterFalso({ resposta: 'Claro, posso ajudar.' })
  telegram = await iniciarTelegramFalso()
  process.env.TELEGRAM_API_BASE = telegram.url
  process.env.APP_URL = 'https://converse.exemplo.com'
  await conectar(admin, agenteId, TOKEN_VALIDO)
  segredo = telegram.webhook?.secret_token as string
  servidor = await subirServidor(
    PORTA,
    { OPENROUTER_BASE_URL: openrouter.url, TELEGRAM_API_BASE: telegram.url, APP_URL: 'https://converse.exemplo.com' },
    { capturarLogs: true },
  )
}, 180_000)

afterAll(async () => {
  servidor?.parar()
  await openrouter?.fechar()
  await telegram?.fechar()
  await limparBanco()
  for (const chave of ['TELEGRAM_API_BASE', 'APP_URL']) {
    if (original[chave] === undefined) delete process.env[chave]
    else process.env[chave] = original[chave]
  }
})

beforeEach(async () => {
  telegram.requisicoes.length = 0
  openrouter.configurar({ latenciaMs: 0 })
  await prisma.canalTelegram.updateMany({ data: { ativo: true, ultimoErro: null } })
})

describe('autenticação', () => {
  it('segredo ausente, errado e agente sem canal dão 401 sem corpo informativo e sem atender nada', async () => {
    for (const resposta of [
      await dispararUpdate({ url: url(), segredo: null, update: novoUpdate() }),
      await dispararUpdate({ url: url(), segredo: 'errado', update: novoUpdate() }),
      await dispararUpdate({ url: url('agente-sem-canal'), segredo, update: novoUpdate() }),
      await dispararUpdate({ url: url('agente-sem-canal'), segredo: null, update: novoUpdate() }),
    ]) {
      expect(resposta.status).toBe(401)
      expect(await resposta.text()).toBe('')
    }
    await pausa(300)
    expect(telegram.mensagensEnviadas()).toHaveLength(0)
    expect(await prisma.atualizacaoTelegram.count()).toBe(0)
  })

  it('só aceita POST', async () => {
    const r = await fetch(url(), { method: 'GET', headers: { 'X-Telegram-Bot-Api-Secret-Token': segredo } })
    expect(r.status).toBe(405)
  })
})

describe('resposta rápida e atendimento depois', () => {
  it('um update válido recebe 200 vazio antes da resposta do agente e a sendMessage chega ao Telegram depois', async () => {
    openrouter.configurar({ latenciaMs: 700, resposta: 'A troca pode ser feita em sete dias [1].' })
    const inicio = Date.now()
    const r = await dispararUpdate({ url: url(), segredo, update: novoUpdate('Qual o prazo de troca?') })
    const demorou = Date.now() - inicio
    expect(r.status).toBe(200)
    expect(await r.text()).toBe('')
    expect(demorou).toBeLessThan(600)
    expect(telegram.mensagensEnviadas()).toHaveLength(0)

    const enviada = await esperar(async () => telegram.mensagensEnviadas()[0], 15_000)
    expect(enviada).toEqual({ chat_id: 42, text: 'A troca pode ser feita em sete dias [1].\n\nFontes: Política de troca' })
    const conversa = await prisma.conversa.findFirstOrThrow({ where: { identificadorExterno: '42' } })
    expect(conversa).toMatchObject({ canal: 'telegram', titulo: 'Telegram: Maria' })
    expect((await prisma.canalTelegram.findFirstOrThrow()).ultimaMensagemEm).toBeInstanceOf(Date)
  })

  it('o reenvio do mesmo update_id não gera segunda resposta', async () => {
    const update = novoUpdate('Só uma vez', 77)
    const [a, b] = await Promise.all([dispararUpdate({ url: url(), segredo, update }), dispararUpdate({ url: url(), segredo, update })])
    expect([a.status, b.status]).toEqual([200, 200])
    await esperar(async () => telegram.mensagensEnviadas().length >= 1, 15_000)
    await pausa(800)
    const r = await dispararUpdate({ url: url(), segredo, update })
    expect(r.status).toBe(200)
    await pausa(800)
    expect(telegram.mensagensEnviadas().filter((m) => m.chat_id === 77)).toHaveLength(1)
    expect(await prisma.mensagem.count({ where: { conteudo: 'Só uma vez' } })).toBe(1)
    expect(await prisma.atualizacaoTelegram.count({ where: { updateId: String(update.update_id) } })).toBe(1)
  })

  it('canal pausado com o segredo certo dá 200 e não envia nada', async () => {
    await prisma.canalTelegram.updateMany({ data: { ativo: false } })
    const r = await dispararUpdate({ url: url(), segredo, update: novoUpdate('Pausado', 88) })
    expect(r.status).toBe(200)
    await pausa(500)
    expect(telegram.mensagensEnviadas().filter((m) => m.chat_id === 88)).toHaveLength(0)
    expect(await prisma.mensagem.count({ where: { conteudo: 'Pausado' } })).toBe(0)
  })

  it('/start responde a mensagem inicial e grupo é ignorado', async () => {
    await prisma.agente.update({ where: { id: agenteId }, data: { mensagemInicial: 'Bem-vinda!' } })
    await dispararUpdate({ url: url(), segredo, update: novoUpdate('/start', 55) })
    const grupo = updateDeTexto({ updateId: (proximoUpdate += 1), chatId: -900, texto: 'oi grupo', tipoDoChat: 'group' })
    expect((await dispararUpdate({ url: url(), segredo, update: grupo })).status).toBe(200)
    await esperar(async () => telegram.mensagensEnviadas().some((m) => m.chat_id === 55), 15_000)
    await pausa(400)
    expect(telegram.mensagensEnviadas().find((m) => m.chat_id === 55)?.text).toBe('Bem-vinda!')
    expect(telegram.mensagensEnviadas().some((m) => m.chat_id === -900)).toBe(false)
  })
})

describe('corpo', () => {
  it('corpo acima de 64 KB dá 413 depois da autenticação (com segredo errado, 401)', async () => {
    const grande = JSON.stringify({ update_id: (proximoUpdate += 1), message: { text: 'x'.repeat(70 * 1024), chat: { id: 1, type: 'private' } } })
    expect((await dispararUpdate({ url: url(), segredo, update: grande })).status).toBe(413)
    expect((await dispararUpdate({ url: url(), segredo: 'errado', update: grande })).status).toBe(401)
    expect(await prisma.atualizacaoTelegram.count({ where: { updateId: String(proximoUpdate) } })).toBe(0)
  })

  it('JSON inválido e update fora do formato, com o segredo certo, dão 200 e não atendem nada', async () => {
    for (const ruim of ['isto nao e json', '{"sem_update_id":true}', '[]', '{"update_id":"abc"}']) {
      const r = await dispararUpdate({ url: url(), segredo, update: ruim })
      expect(r.status).toBe(200)
    }
    await pausa(300)
    expect(telegram.requisicoes.filter((r) => r.metodo === 'sendMessage')).toHaveLength(0)
  })
})

describe('logs do servidor', () => {
  it('o log do servidor de produção não contém o token, o segredo nem o texto das conversas', async () => {
    await dispararUpdate({ url: url(), segredo, update: novoUpdate('Mensagem sigilosa do cliente 4455 sobre troca', 99) })
    await esperar(async () => telegram.mensagensEnviadas().some((m) => m.chat_id === 99), 15_000)
    openrouter.configurar({ erroHttp: 500 })
    await dispararUpdate({ url: url(), segredo, update: novoUpdate('Outra mensagem sigilosa 9988 sobre troca', 99) })
    await esperar(async () => telegram.mensagensEnviadas().filter((m) => m.chat_id === 99).length >= 2, 15_000)
    const logs = servidor.logs()
    expect(logs).not.toContain(TOKEN_VALIDO)
    expect(logs).not.toContain(TOKEN_VALIDO.split(':')[1] as string)
    expect(logs).not.toContain(segredo)
    expect(logs).not.toContain('sigilosa')
    expect(adminId).toBeTruthy()
  })
})
