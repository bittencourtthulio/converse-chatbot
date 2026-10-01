/**
 * DELETE /api/conversas/[id] e POST /api/conversas/apagar contra o servidor de produção
 * (FT-09, PR-80, PR-83): sessão no servidor, 401, 404, 422 e a exclusão de verdade no banco.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarConversaDeTeste } from './apoio/historico'
import { cookieDe, subirServidor, type Servidor } from './apoio/servidor'

const SENHA = 'senha-de-rota-123'
let servidor: Servidor
let cookie: string
let agenteId: string

async function conversa(canal: 'painel' | 'widget' | 'telegram' = 'widget') {
  return criarConversaDeTeste({
    agenteId,
    canal,
    mensagens: [{ papel: 'user', conteudo: 'oi' }, { papel: 'assistant', conteudo: 'olá' }],
  })
}

const apagar = (id: string, c: string | undefined = cookie) =>
  fetch(`${servidor.base}/api/conversas/${id}`, { method: 'DELETE', headers: c ? { cookie: c } : {} })

const lote = (corpo: unknown, c: string | undefined = cookie) =>
  fetch(`${servidor.base}/api/conversas/apagar`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(c ? { cookie: c } : {}) },
    body: typeof corpo === 'string' ? corpo : JSON.stringify(corpo),
  })

beforeAll(async () => {
  await limparBanco()
  const comum = await prisma.usuario.create({
    data: { nome: 'Comum', email: 'comum.apagar@teste.local', senhaHash: await hashDeSenha(SENHA), papel: 'usuario' },
  })
  agenteId = (await criarAgenteDeTeste({ criadoPorId: comum.id })).id
  cookie = await cookieDe('comum.apagar@teste.local', SENHA)
  servidor = await subirServidor(3201)
}, 120_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

beforeEach(async () => {
  await prisma.conversa.deleteMany()
})

describe('sessão e erros (integração)', () => {
  it('DELETE e POST sem sessão dão 401 e não apagam nada', async () => {
    const c = await conversa()
    expect((await apagar(c.id, '')).status).toBe(401)
    expect((await lote({ ids: [c.id] }, '')).status).toBe(401)
    expect(await prisma.conversa.count()).toBe(1)
  })

  it('DELETE de id inexistente dá 404 em JSON', async () => {
    const r = await apagar('nao-existe')
    expect(r.status).toBe(404)
    expect(r.headers.get('cache-control')).toContain('no-store')
    expect(await r.json()).toMatchObject({ codigo: 'nao_encontrado' })
  })

  it('POST com lote vazio, com 51 ids, com id que não é texto ou com corpo ilegível dá 422', async () => {
    const cinquentaEUm = Array.from({ length: 51 }, (_, i) => `id-${i}`)
    for (const corpo of [{ ids: [] }, { ids: cinquentaEUm }, { ids: [1] }, { ids: 'abc' }, {}, 'não é json', '[]']) {
      const r = await lote(corpo)
      expect(r.status, JSON.stringify(corpo).slice(0, 40)).toBe(422)
      expect(await r.json()).toMatchObject({ codigo: 'entrada_invalida' })
    }
  })
})

describe('apagar de verdade (funcional)', () => {
  it('DELETE remove a conversa e as mensagens e devolve a contagem', async () => {
    const a = await conversa()
    const b = await conversa('telegram')
    const r = await apagar(a.id)
    expect(r.status).toBe(200)
    expect(await r.json()).toEqual({ apagadas: 1 })
    expect(await prisma.conversa.findUnique({ where: { id: a.id } })).toBeNull()
    expect(await prisma.mensagem.count({ where: { conversaId: a.id } })).toBe(0)
    expect(await prisma.conversa.findUnique({ where: { id: b.id } })).not.toBeNull()
  })

  it('POST apaga só as que existem e devolve quantas apagou', async () => {
    const a = await conversa()
    const b = await conversa('painel')
    const r = await lote({ ids: [a.id, 'nao-existe', b.id] })
    expect(r.status).toBe(200)
    expect(await r.json()).toEqual({ apagadas: 2 })
    expect(await prisma.conversa.count()).toBe(0)
    expect(await prisma.mensagem.count()).toBe(0)
  })
})
