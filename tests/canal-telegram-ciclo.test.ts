/**
 * T-03.02 (FT-07): desconectar, pausar, retomar, verificar e o limite diário do
 * canal (PR-65), mais o ponto de extensão `aoAlterarCanal` para a auditoria da
 * FT-10. Qualquer usuário autenticado gerencia (PR-12).
 */
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'
import { iniciarTelegramFalso, TOKEN_VALIDO, type TelegramFalso } from './apoio/telegram-falso'
import {
  aoAlterarCanal,
  conectar,
  definirLimiteDiario,
  desconectar,
  estado,
  pausar,
  retomar,
  verificar,
  type AlteracaoDoCanal,
} from '@/servicos/canal-telegram'
import type { UsuarioAutenticado } from '@/servicos/autenticacao'

let falso: TelegramFalso
let autor: UsuarioAutenticado
let agenteId: string
const original = { ...process.env }

beforeEach(async () => {
  await limparBanco()
  autor = await criarAdmin()
  agenteId = (await prisma.agente.create({ data: { nome: 'Agente', modelo: 'openai/gpt-4o-mini', criadoPorId: autor.id } })).id
  falso = await iniciarTelegramFalso()
  process.env.TELEGRAM_API_BASE = falso.url
  process.env.APP_URL = 'https://converse.exemplo.com'
  await conectar(autor, agenteId, TOKEN_VALIDO)
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

async function erroDe(promessa: Promise<unknown>) {
  return (await promessa.then(
    () => null,
    (e: unknown) => e,
  )) as { codigo: string; status: number; message: string } | null
}

describe('desconectar', () => {
  it('chama deleteWebhook, apaga o canal e mantém as conversas do agente', async () => {
    const conversa = await prisma.conversa.create({ data: { agenteId, canal: 'telegram', identificadorExterno: '42', titulo: 'Telegram: Maria' } })
    await prisma.mensagem.create({ data: { conversaId: conversa.id, papel: 'user', conteudo: 'oi' } })
    const r = await desconectar(autor, agenteId)
    expect(r.webhookRemovido).toBe(true)
    expect(falso.requisicoes.map((x) => x.metodo)).toEqual(['deleteWebhook'])
    expect(falso.webhook).toBeNull()
    expect(await prisma.canalTelegram.count()).toBe(0)
    expect(await prisma.atualizacaoTelegram.count()).toBe(0)
    expect(await estado(autor, agenteId)).toBeNull()
    expect(await prisma.conversa.count({ where: { agenteId, canal: 'telegram' } })).toBe(1)
    expect(await prisma.mensagem.count()).toBe(1)
  })

  it('com o Telegram fora do ar ainda apaga o canal localmente e avisa que o webhook não foi removido', async () => {
    falso.configurar({ falhas: { deleteWebhook: { status: 500 } } })
    const r = await desconectar(autor, agenteId)
    expect(r.webhookRemovido).toBe(false)
    expect(await prisma.canalTelegram.count()).toBe(0)
  })

  it('agente sem canal dá 404', async () => {
    await desconectar(autor, agenteId)
    expect((await erroDe(desconectar(autor, agenteId)))?.status).toBe(404)
  })
})

describe('pausar e retomar', () => {
  it('só mudam ativo e o estado, sem falar com o Telegram', async () => {
    const pausado = await pausar(autor, agenteId)
    expect(pausado).toMatchObject({ ativo: false, estado: 'pausado' })
    expect((await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })).ativo).toBe(false)
    const retomado = await retomar(autor, agenteId)
    expect(retomado).toMatchObject({ ativo: true, estado: 'conectado' })
    expect(falso.requisicoes).toHaveLength(0)
  })

  it('canal com último erro aparece como com_erro quando ativo', async () => {
    await prisma.canalTelegram.update({ where: { agenteId }, data: { ultimoErro: 'falhou', ultimoErroEm: new Date() } })
    expect((await estado(autor, agenteId))?.estado).toBe('com_erro')
    expect((await pausar(autor, agenteId)).estado).toBe('pausado')
  })
})

describe('verificar', () => {
  it('lê o getWebhookInfo e diz que a URL confere', async () => {
    const r = await verificar(autor, agenteId)
    expect(r).toMatchObject({ urlConfere: true, pendentes: 0, ultimoErroDoTelegram: null })
    expect(r.urlRegistrada).toBe(r.urlEsperada)
    expect(falso.requisicoes.map((x) => x.metodo)).toEqual(['getWebhookInfo'])
  })

  it('diz que a URL não confere quando o Telegram devolve outra, com pendentes e o último erro dele', async () => {
    falso.configurar({
      webhookInfo: { url: 'https://outro.exemplo.com/h', pending_update_count: 4, last_error_message: 'Wrong response from the webhook: 500', last_error_date: 1_700_000_000 },
    })
    const r = await verificar(autor, agenteId)
    expect(r.urlConfere).toBe(false)
    expect(r.urlRegistrada).toBe('https://outro.exemplo.com/h')
    expect(r.pendentes).toBe(4)
    expect(r.ultimoErroDoTelegram).toBe('Wrong response from the webhook: 500')
  })

  it('token que o Telegram passou a recusar vira erro e fica gravado como último erro do canal', async () => {
    falso.configurar({ falhas: { getWebhookInfo: { status: 401 } } })
    const e = await erroDe(verificar(autor, agenteId))
    expect(e?.codigo).toBe('telegram_token_invalido')
    const canal = await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })
    expect(canal.ultimoErro).toMatch(/token/i)
    expect(canal.ultimoErroEm).toBeInstanceOf(Date)
    expect((await estado(autor, agenteId))?.estado).toBe('com_erro')
  })
})

describe('definirLimiteDiario', () => {
  it('aceita de 1 a 100000, inclusive texto numérico, e recusa o resto', async () => {
    expect((await definirLimiteDiario(autor, agenteId, 120)).limiteDiario).toBe(120)
    expect((await definirLimiteDiario(autor, agenteId, '250')).limiteDiario).toBe(250)
    expect((await definirLimiteDiario(autor, agenteId, 100000)).limiteDiario).toBe(100000)
    for (const ruim of [0, -1, 100001, 1.5, 'abc', '', null, undefined]) {
      expect((await erroDe(definirLimiteDiario(autor, agenteId, ruim)))?.codigo).toBe('entrada_invalida')
    }
    expect((await estado(autor, agenteId))?.limiteDiario).toBe(100000)
  })
})

describe('aoAlterarCanal e permissão', () => {
  it('o ouvinte recebe a ação, o agente e o usuário, nunca token, segredo ou conteúdo', async () => {
    const recebidas: AlteracaoDoCanal[] = []
    const parar = aoAlterarCanal((a) => void recebidas.push(a))
    await pausar(autor, agenteId)
    await retomar(autor, agenteId)
    await definirLimiteDiario(autor, agenteId, 10)
    await conectar(autor, agenteId, TOKEN_VALIDO)
    await desconectar(autor, agenteId)
    parar()
    await conectar(autor, agenteId, TOKEN_VALIDO)
    expect(recebidas.map((a) => a.acao)).toEqual(['pausar', 'retomar', 'limite', 'conectar', 'desconectar'])
    for (const a of recebidas) {
      expect(Object.keys(a).sort()).toEqual(['acao', 'agenteId', 'usuarioId'])
      expect(a).toMatchObject({ agenteId, usuarioId: autor.id })
    }
    expect(JSON.stringify(recebidas)).not.toContain(TOKEN_VALIDO)
  })

  it('um ouvinte que lança não derruba a operação', async () => {
    const parar = aoAlterarCanal(() => {
      throw new Error('falha do ouvinte')
    })
    try {
      await expect(pausar(autor, agenteId)).resolves.toMatchObject({ estado: 'pausado' })
    } finally {
      parar()
    }
  })

  it('qualquer usuário autenticado gerencia o canal de qualquer agente; sem autor dá 401', async () => {
    const comum = await criarUsuario({ papel: 'usuario' })
    expect((await pausar(comum, agenteId)).estado).toBe('pausado')
    expect((await verificar(comum, agenteId)).urlConfere).toBe(true)
    const sem = undefined as unknown as UsuarioAutenticado
    for (const acao of [() => pausar(sem, agenteId), () => retomar(sem, agenteId), () => desconectar(sem, agenteId), () => verificar(sem, agenteId), () => definirLimiteDiario(sem, agenteId, 5)]) {
      expect((await erroDe(acao()))?.status).toBe(401)
    }
  })
})
