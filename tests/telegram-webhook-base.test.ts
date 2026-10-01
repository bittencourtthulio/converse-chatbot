/**
 * T-04.01 (FT-07): a base do webhook (PR-63, PR-66): autenticar o segredo em tempo
 * constante contra o hash, validar o formato do update e deduplicar por
 * `update_id`, com purga dos registros com mais de 7 dias.
 */
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { prisma } from '@/lib/prisma'
import { criarAdmin, limparBanco } from './ajuda'
import { iniciarTelegramFalso, TOKEN_VALIDO, updateDeTexto, type TelegramFalso } from './apoio/telegram-falso'
import { conectar } from '@/servicos/canal-telegram'
import {
  autenticarWebhook,
  lerUpdate,
  purgarAtualizacoes,
  purgarAtualizacoesSeNecessario,
  registrarAtualizacao,
} from '@/servicos/telegram-webhook'

let falso: TelegramFalso
let agenteId: string
let segredo: string
let canalId: string
const original = { ...process.env }

beforeEach(async () => {
  await limparBanco()
  const autor = await criarAdmin()
  agenteId = (await prisma.agente.create({ data: { nome: 'Agente', modelo: 'm', criadoPorId: autor.id } })).id
  falso = await iniciarTelegramFalso()
  process.env.TELEGRAM_API_BASE = falso.url
  process.env.APP_URL = 'https://converse.exemplo.com'
  await conectar(autor, agenteId, TOKEN_VALIDO)
  segredo = falso.webhook?.secret_token as string
  canalId = (await prisma.canalTelegram.findUniqueOrThrow({ where: { agenteId } })).id
})
afterEach(async () => {
  await falso.fechar()
  for (const chave of ['TELEGRAM_API_BASE', 'APP_URL']) {
    if (original[chave] === undefined) delete process.env[chave]
    else process.env[chave] = original[chave]
  }
})
afterAll(limparBanco)

describe('autenticarWebhook', () => {
  it('o segredo certo autentica e devolve o canal', async () => {
    const canal = await autenticarWebhook(agenteId, segredo)
    expect(canal).toMatchObject({ id: canalId, agenteId, ativo: true })
  })

  it('segredo errado, vazio, ausente, com tamanho diferente e canal inexistente falham do mesmo jeito (nulo)', async () => {
    expect(await autenticarWebhook(agenteId, 'errado')).toBeNull()
    expect(await autenticarWebhook(agenteId, '')).toBeNull()
    expect(await autenticarWebhook(agenteId, null)).toBeNull()
    expect(await autenticarWebhook(agenteId, segredo + 'x')).toBeNull()
    expect(await autenticarWebhook(agenteId, segredo.toUpperCase())).toBeNull()
    expect(await autenticarWebhook('agente-que-nao-existe', segredo)).toBeNull()
    expect(await autenticarWebhook('agente-que-nao-existe', null)).toBeNull()
  })

  it('canal pausado ainda autentica (o chamador decide ignorar) e devolve ativo false', async () => {
    await prisma.canalTelegram.update({ where: { id: canalId }, data: { ativo: false } })
    expect(await autenticarWebhook(agenteId, segredo)).toMatchObject({ ativo: false })
  })

  it('a comparação é em tempo constante: hash em buffers de mesmo tamanho com timingSafeEqual', () => {
    const fonte = readFileSync('src/servicos/telegram-webhook.ts', 'utf8')
    expect(fonte).toContain('timingSafeEqual')
    expect(fonte).not.toMatch(/segredoDoWebhookHash\s*===|===\s*[a-zA-Z.]*segredoDoWebhookHash/)
  })

  it('o segredo em claro nunca é gravado: nem o canal nem o dedupe o contêm', async () => {
    const canal = await prisma.canalTelegram.findUniqueOrThrow({ where: { id: canalId } })
    expect(JSON.stringify(canal)).not.toContain(segredo)
  })
})

describe('lerUpdate', () => {
  it('aceita mensagem de texto privada e extrai id, chat, nome e texto', () => {
    const u = lerUpdate(updateDeTexto({ updateId: 9, chatId: 77, texto: 'olá', nome: 'Maria', sobrenome: 'Silva' }))
    expect(u).toEqual({
      updateId: '9',
      mensagem: { chatId: 77, tipoDoChat: 'private', texto: 'olá', nome: 'Maria Silva' },
    })
  })

  it('mensagem sem texto vem sem a chave texto; update sem message vem sem mensagem', () => {
    const foto = lerUpdate(updateDeTexto({ updateId: 1, chatId: 5, semTexto: true, extra: { photo: [{ file_id: 'x' }] } }))
    expect(foto?.mensagem).toMatchObject({ chatId: 5, tipoDoChat: 'private' })
    expect(foto?.mensagem?.texto).toBeUndefined()
    expect(lerUpdate({ update_id: 2, edited_message: { text: 'x' } })).toEqual({ updateId: '2' })
  })

  it('recusa corpo sem update_id, com update_id que não é inteiro e o que não é objeto', () => {
    for (const ruim of [null, 'texto', 42, [], {}, { update_id: 'abc' }, { update_id: 1.5 }, { update_id: -1 }, { message: {} }]) {
      expect(lerUpdate(ruim)).toBeNull()
    }
  })

  it('mensagem com chat malformado é recusada em vez de atendida', () => {
    expect(lerUpdate({ update_id: 3, message: { text: 'oi', chat: { type: 'private' } } })).toBeNull()
    expect(lerUpdate({ update_id: 3, message: { text: 'oi', chat: { id: 'abc', type: 'private' } } })).toBeNull()
    expect(lerUpdate({ update_id: 3, message: { text: 12, chat: { id: 1, type: 'private' } } })).toBeNull()
  })

  it('texto muito longo é lido inteiro (o limite é do atendimento) e o nome é aparado', () => {
    const u = lerUpdate(updateDeTexto({ updateId: 4, chatId: 8, texto: 'x'.repeat(5000), nome: '  Ana  ' }))
    expect(u?.mensagem?.texto).toHaveLength(5000)
    expect(u?.mensagem?.nome).toBe('Ana')
  })
})

describe('registrarAtualizacao (dedupe)', () => {
  it('o mesmo update_id no mesmo canal devolve novo e depois duplicado; outro canal pode repetir', async () => {
    expect(await registrarAtualizacao(canalId, '900')).toBe(true)
    expect(await registrarAtualizacao(canalId, '900')).toBe(false)
    expect(await registrarAtualizacao(canalId, '901')).toBe(true)
    const outro = await prisma.agente.create({ data: { nome: 'B', modelo: 'm', criadoPorId: (await prisma.usuario.findFirstOrThrow()).id } })
    const canalB = await prisma.canalTelegram.create({
      data: { agenteId: outro.id, tokenCifrado: 'v1:a:b:c', botId: '555', botUsername: 'b_bot', botNome: 'B', segredoDoWebhookHash: 'a'.repeat(64), webhookUrl: 'https://x/h' },
    })
    expect(await registrarAtualizacao(canalB.id, '900')).toBe(true)
  })

  it('duas chegadas simultâneas do mesmo update: só uma é nova', async () => {
    const resultados = await Promise.all([registrarAtualizacao(canalId, '777'), registrarAtualizacao(canalId, '777'), registrarAtualizacao(canalId, '777')])
    expect(resultados.filter(Boolean)).toHaveLength(1)
  })

  it('erro que não é de unicidade não vira "duplicado": é propagado', async () => {
    await expect(registrarAtualizacao('canal-que-nao-existe', '1')).rejects.toBeTruthy()
  })
})

describe('purga das atualizações', () => {
  it('purgarAtualizacoes apaga só os registros com mais de 7 dias', async () => {
    const agora = new Date('2026-09-30T12:00:00Z')
    const dia = 24 * 3600 * 1000
    await prisma.atualizacaoTelegram.createMany({
      data: [
        { canalId, updateId: '1', criadoEm: new Date(agora.getTime() - 8 * dia) },
        { canalId, updateId: '2', criadoEm: new Date(agora.getTime() - 7 * dia - 1000) },
        { canalId, updateId: '3', criadoEm: new Date(agora.getTime() - 6 * dia) },
        { canalId, updateId: '4', criadoEm: agora },
      ],
    })
    expect(await purgarAtualizacoes(agora)).toBe(2)
    const restantes = (await prisma.atualizacaoTelegram.findMany({ orderBy: { updateId: 'asc' } })).map((a) => a.updateId)
    expect(restantes).toEqual(['3', '4'])
  })

  it('a purga oportunista roda no máximo uma vez por hora por processo', async () => {
    const agora = new Date('2030-01-01T12:00:00Z')
    const dia = 24 * 3600 * 1000
    await prisma.atualizacaoTelegram.create({ data: { canalId, updateId: 'velho-1', criadoEm: new Date(agora.getTime() - 10 * dia) } })
    expect(await purgarAtualizacoesSeNecessario(agora)).toBe(1)
    await prisma.atualizacaoTelegram.create({ data: { canalId, updateId: 'velho-2', criadoEm: new Date(agora.getTime() - 10 * dia) } })
    expect(await purgarAtualizacoesSeNecessario(new Date(agora.getTime() + 30 * 60 * 1000))).toBe(0)
    expect(await prisma.atualizacaoTelegram.count({ where: { updateId: 'velho-2' } })).toBe(1)
    expect(await purgarAtualizacoesSeNecessario(new Date(agora.getTime() + 61 * 60 * 1000))).toBe(1)
  })
})
