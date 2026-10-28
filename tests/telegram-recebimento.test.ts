import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { conectar, desconectar, pausar, retomar, verificar } from '@/servicos/canal-telegram'
import { criarRecebimentoTelegram } from '@/servicos/telegram-recebimento'
import { criarAdmin, limparBanco } from './ajuda'
import { iniciarTelegramFalso, TOKEN_VALIDO, updateDeTexto, type TelegramFalso } from './apoio/telegram-falso'
import type { UsuarioAutenticado } from '@/servicos/autenticacao'

let falso: TelegramFalso
let autor: UsuarioAutenticado
let agenteId: string
let recebimento: ReturnType<typeof criarRecebimentoTelegram>
const original = { ...process.env }

beforeEach(async () => {
  await limparBanco()
  autor = await criarAdmin()
  agenteId = (await prisma.agente.create({ data: { nome: 'Telegram local', modelo: 'openai/gpt-4o-mini', criadoPorId: autor.id } })).id
  falso = await iniciarTelegramFalso()
  process.env.TELEGRAM_API_BASE = falso.url
  process.env.APP_URL = 'http://localhost:3000'
  recebimento = criarRecebimentoTelegram()
})
afterEach(async () => {
  recebimento.parar()
  await recebimento.ocioso()
  await falso.fechar()
  vi.restoreAllMocks()
  for (const chave of ['APP_URL', 'TELEGRAM_API_BASE']) {
    if (original[chave] === undefined) delete process.env[chave]
    else process.env[chave] = original[chave]
  }
  await limparBanco()
})

function mensagem(id: number, texto = '/start') {
  return updateDeTexto({ updateId: id, chatId: 42, texto })
}

describe('Telegram sem túnel', () => {
  it('conecta, recebe /start e responde; confirma offset, deduplica e sobrevive ao reinício do recebimento', async () => {
    await conectar(autor, agenteId, TOKEN_VALIDO)
    falso.configurar({ updates: [mensagem(100)] })
    await recebimento.processar()
    expect(falso.mensagensEnviadas()).toHaveLength(1)
    expect(await prisma.atualizacaoTelegram.count()).toBe(1)
    // Outro processo começa em zero; a deduplicação persistida protege a resposta.
    const reiniciado = criarRecebimentoTelegram()
    await reiniciado.processar()
    expect(falso.mensagensEnviadas()).toHaveLength(1)
    await recebimento.processar()
    expect(falso.requisicoes.filter((r) => r.metodo === 'getUpdates').at(-1)?.corpo.offset).toBe(101)
    expect(await verificar(autor, agenteId)).toMatchObject({ urlConfere: true, urlEsperada: '', urlRegistrada: '' })
  })

  it('pausado consome sem responder; retomar só responde mensagens novas; desconectar encerra as consultas', async () => {
    await conectar(autor, agenteId, TOKEN_VALIDO)
    await pausar(autor, agenteId)
    falso.configurar({ updates: [mensagem(200)] })
    await recebimento.processar()
    await retomar(autor, agenteId)
    falso.configurar({ updates: [mensagem(200), mensagem(201)] })
    await recebimento.processar()
    expect(falso.mensagensEnviadas()).toHaveLength(1)
    await desconectar(autor, agenteId)
    falso.requisicoes.length = 0
    await recebimento.processar()
    expect(falso.requisicoes).toHaveLength(0)
  })

  it('nuvem usa webhook, não consulta getUpdates; reconectar muda de modo e Verificar detecta mudança do domínio', async () => {
    await conectar(autor, agenteId, TOKEN_VALIDO)
    process.env.APP_URL = 'https://chat.exemplo.com'
    await conectar(autor, agenteId, TOKEN_VALIDO)
    expect(falso.webhook?.url).toContain('https://chat.exemplo.com/')
    falso.requisicoes.length = 0
    await recebimento.processar()
    expect(falso.requisicoes).toHaveLength(0)
    process.env.APP_URL = 'https://novo.exemplo.com'
    expect(await verificar(autor, agenteId)).toMatchObject({ urlConfere: false })
    process.env.APP_URL = 'http://localhost:3000'
    await conectar(autor, agenteId, TOKEN_VALIDO)
    expect(falso.webhook).toBeNull()
    falso.configurar({ updates: [mensagem(300)] })
    await recebimento.processar()
    expect(falso.mensagensEnviadas()).toHaveLength(1)
  })

  it('reconsulta a pausa durante uma entrega em andamento e evita consultas sobrepostas', async () => {
    await conectar(autor, agenteId, TOKEN_VALIDO)
    falso.configurar({ latenciaMs: 150, updates: [mensagem(350)] })
    const emCurso = recebimento.processar()
    expect(recebimento.processar()).toBe(emCurso)
    await vi.waitFor(() => expect(falso.requisicoes.some((r) => r.metodo === 'getUpdates')).toBe(true))
    await pausar(autor, agenteId)
    await emCurso
    expect(falso.mensagensEnviadas()).toHaveLength(0)
    expect(falso.requisicoes.filter((r) => r.metodo === 'getUpdates')).toHaveLength(1)
    expect(await prisma.atualizacaoTelegram.count()).toBe(1)
  })

  it('parar cancela uma consulta em andamento sem registrar erro no canal', async () => {
    await conectar(autor, agenteId, TOKEN_VALIDO)
    falso.configurar({ latenciaMs: 150 })
    const emCurso = recebimento.processar()
    await vi.waitFor(() => expect(falso.requisicoes.some((r) => r.metodo === 'getUpdates')).toBe(true))
    recebimento.parar()
    await emCurso
    expect((await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })).ultimoErro).toBeNull()
  })

  it('falha na API não expõe token e a próxima consulta volta a atender', async () => {
    await conectar(autor, agenteId, TOKEN_VALIDO)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    falso.configurar({ falhas: { getUpdates: { status: 409, vezes: 1 } }, updates: [mensagem(400)] })
    await recebimento.processar()
    const canal = await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })
    expect(canal.ultimoErro).toMatch(/outro servidor/)
    expect(canal.ultimoErro).not.toContain(TOKEN_VALIDO)
    await recebimento.processar()
    expect(falso.mensagensEnviadas()).toHaveLength(1)
    expect((await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })).ultimoErro).toBeNull()
  })
})
