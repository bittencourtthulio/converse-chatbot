// Exercita a inicialização real do Next em produção: o polling precisa funcionar
// sem página aberta, sem túnel e sem chamar manualmente o serviço de recebimento.
import { afterAll, beforeAll, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma'
import { conectar } from '@/servicos/canal-telegram'
import { limparBanco } from './ajuda'
import { cenarioDeChatComBase } from './apoio/chat'
import { iniciarOpenRouterFalso, type OpenRouterFalso } from './apoio/openrouter-falso'
import { iniciarTelegramFalso, TOKEN_VALIDO, updateDeTexto, type TelegramFalso } from './apoio/telegram-falso'
import { esperar, subirServidor, type Servidor } from './apoio/servidor'

let servidor: Servidor
let telegram: TelegramFalso
let openrouter: OpenRouterFalso
const original = { ...process.env }

beforeAll(async () => {
  await limparBanco()
  const { admin, agente } = await cenarioDeChatComBase()
  telegram = await iniciarTelegramFalso()
  openrouter = await iniciarOpenRouterFalso({ resposta: 'Aceitamos trocas em sete dias [1].' })
  process.env.TELEGRAM_API_BASE = telegram.url
  process.env.APP_URL = 'http://localhost:3217'
  await conectar(admin, agente.id, TOKEN_VALIDO)
  telegram.configurar({ updates: [updateDeTexto({ updateId: 1001, chatId: 42, texto: 'Qual o prazo de troca?' })] })
  servidor = await subirServidor(3217, {
    TELEGRAM_API_BASE: telegram.url,
    OPENROUTER_BASE_URL: openrouter.url,
    APP_URL: 'http://localhost:3217',
  }, { capturarLogs: true })
})

afterAll(async () => {
  servidor?.parar()
  await telegram?.fechar()
  await openrouter?.fechar()
  await limparBanco()
  for (const chave of ['APP_URL', 'TELEGRAM_API_BASE']) {
    if (original[chave] === undefined) delete process.env[chave]
    else process.env[chave] = original[chave]
  }
})

it('recebe pergunta e responde com a base de conhecimento no servidor persistente sem HTTPS', async () => {
  const mensagem = await esperar(async () => telegram.mensagensEnviadas()[0], 15_000)
  expect(mensagem).toEqual({ chat_id: 42, text: 'Aceitamos trocas em sete dias [1].\n\nFontes: Política de troca' })
  expect(await prisma.mensagem.count()).toBe(2)
  expect(await prisma.conversa.findFirstOrThrow()).toMatchObject({ canal: 'telegram', identificadorExterno: '42' })
  await esperar(async () => telegram.requisicoes.some((r) => r.metodo === 'getUpdates' && r.corpo.offset === 1002))
  expect(telegram.mensagensEnviadas()).toHaveLength(1)
  expect(servidor.logs()).not.toContain(TOKEN_VALIDO)
})
