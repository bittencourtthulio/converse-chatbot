/**
 * DELETE /api/publico/agentes/[id]/conversa contra o servidor de produção (FT-10, PR-90): o
 * visitante apaga a própria conversa; id no cabeçalho, Origin da plataforma, agente ativo,
 * limite de uso por IP e agente, e a auditoria gravada pelos ouvintes ligados na subida.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { salvarConfiguracao } from '@/servicos/chat-publico-config'
import { criarAdmin, limparBanco } from './ajuda'
import { criarConversaDeTeste } from './apoio/historico'
import { esperar, subirServidor, type Servidor } from './apoio/servidor'

const A = 'visitante-a-0123456789abcdef'
const B = 'visitante-b-0123456789abcdef'
let servidor: Servidor
let agenteId: string
let inativoId: string
let contadorDeIp = 0

/** Cada chamada usa um IP novo (TRUST_PROXY=1): os testes não gastam o limite um do outro. */
function apagar(visitante: string | null, opcoes: { agente?: string; ip?: string; origin?: string } = {}) {
  contadorDeIp += 1
  return fetch(`${servidor.base}/api/publico/agentes/${opcoes.agente ?? agenteId}/conversa`, {
    method: 'DELETE',
    headers: {
      'X-Forwarded-For': opcoes.ip ?? `10.1.0.${contadorDeIp}`,
      ...(visitante !== null && { 'X-Visitante-Id': visitante }),
      ...(opcoes.origin && { Origin: opcoes.origin }),
    },
  })
}

async function semear() {
  await prisma.registroDeAuditoria.deleteMany()
  await prisma.mensagem.deleteMany()
  await prisma.conversa.deleteMany()
  const msgs = [{ papel: 'user' as const, conteudo: 'texto privado' }, { papel: 'assistant' as const, conteudo: 'resposta' }]
  await criarConversaDeTeste({ agenteId, canal: 'widget', identificadorExterno: A, mensagens: msgs })
  await criarConversaDeTeste({ agenteId, canal: 'widget', identificadorExterno: B, mensagens: msgs })
}

beforeAll(async () => {
  await limparBanco()
  const admin = await criarAdmin()
  agenteId = (await prisma.agente.create({ data: { nome: 'Agente', modelo: 'm', criadoPorId: admin.id } })).id
  inativoId = (await prisma.agente.create({ data: { nome: 'Inativo', modelo: 'm', criadoPorId: admin.id } })).id
  await salvarConfiguracao(admin, agenteId, { ativo: true })
  await salvarConfiguracao(admin, inativoId, { ativo: false })
  servidor = await subirServidor(3207, { TRUST_PROXY: '1' })
}, 180_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

describe('DELETE conversa (integração com o servidor)', () => {
  it('apaga só as conversas do visitante, sem cache, e o outro visitante continua com a dele', async () => {
    await semear()
    const r = await apagar(A)
    expect(r.status).toBe(200)
    expect(r.headers.get('cache-control')).toBe('no-store')
    expect(await r.json()).toEqual({ apagadas: 1 })
    const restantes = await prisma.conversa.findMany()
    expect(restantes).toHaveLength(1)
    expect(restantes[0]?.identificadorExterno).toBe(B)
    expect(await prisma.mensagem.count()).toBe(2)
  })

  it('a auditoria registra conversa_apagada do visitante (ouvintes ligados pela subida do servidor)', async () => {
    await semear()
    await apagar(B)
    const registro = await esperar(async () => (await prisma.registroDeAuditoria.findFirst({ where: { acao: 'conversa_apagada' } })) ?? false)
    expect(registro).toMatchObject({ usuarioId: null, usuarioRotulo: 'Visitante (chat embutido)' })
    expect(registro.detalhes).not.toMatch(/visitante-b|texto privado/)
  })

  it('sem o cabeçalho do visitante ou com um inválido dá 422', async () => {
    await semear()
    expect((await apagar(null)).status).toBe(422)
    expect((await apagar('curto')).status).toBe(422)
    expect(await prisma.conversa.count()).toBe(2)
  })

  it('agente inativo e agente inexistente dão o mesmo 404', async () => {
    await semear()
    const a = await apagar(A, { agente: inativoId })
    const b = await apagar(A, { agente: 'nao-existe' })
    expect(a.status).toBe(404)
    expect(b.status).toBe(404)
    expect(await a.json()).toEqual(await b.json())
    expect(await prisma.conversa.count()).toBe(2)
  })

  it('Origin de outro site dá 403 e nada é apagado; a da própria plataforma é aceita', async () => {
    await semear()
    const de_fora = await apagar(A, { origin: 'https://site-malicioso.example' })
    expect(de_fora.status).toBe(403)
    expect(await prisma.conversa.count()).toBe(2)
    const propria = await apagar(A, { origin: servidor.base })
    expect(propria.status).toBe(200)
    expect(await prisma.conversa.count()).toBe(1)
  })
})

describe('DELETE conversa (funcional: limite de uso)', () => {
  it('a 11a chamada no minuto do mesmo IP dá 429 com Retry-After', async () => {
    await semear()
    const ip = '10.9.9.9'
    for (let i = 0; i < 10; i += 1) expect((await apagar(B, { ip })).status).toBe(200)
    const r = await apagar(B, { ip })
    expect(r.status).toBe(429)
    expect(Number(r.headers.get('retry-after'))).toBeGreaterThan(0)
  })
})
