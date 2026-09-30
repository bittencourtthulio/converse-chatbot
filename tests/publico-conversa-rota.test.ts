/**
 * T-03.03 (FT-06, PR-56): GET conversa, a retomada das últimas 50 mensagens do
 * visitante, contra o servidor de produção. O visitante vai no cabeçalho.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { salvarConfiguracao } from '@/servicos/chat-publico-config'
import { criarAdmin, limparBanco } from './ajuda'
import { criarBase } from './apoio/conhecimento'
import { subirServidor, type Servidor } from './apoio/servidor'

let servidor: Servidor
let agenteId: string
let inativoId: string

const A = 'visitante-a-0123456789abcdef'
const B = 'visitante-b-0123456789abcdef'

const retomar = (visitante: string | null, agente = agenteId) =>
  fetch(`${servidor.base}/api/publico/agentes/${agente}/conversa`, {
    headers: visitante === null ? {} : { 'X-Visitante-Id': visitante },
  })

beforeAll(async () => {
  await limparBanco()
  const admin = await criarAdmin()
  agenteId = (await prisma.agente.create({ data: { nome: 'Agente', modelo: 'm', criadoPorId: admin.id } })).id
  inativoId = (await prisma.agente.create({ data: { nome: 'Inativo', modelo: 'm', criadoPorId: admin.id } })).id
  await salvarConfiguracao(admin, agenteId, { ativo: true })
  await salvarConfiguracao(admin, inativoId, { ativo: false })
  servidor = await subirServidor(3192)
}, 180_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

beforeEach(async () => {
  await prisma.mensagem.deleteMany()
  await prisma.conversa.deleteMany()
  await prisma.fonte.deleteMany()
})

async function conversaCom(visitante: string, mensagens: number, extra: { fontes?: string } = {}) {
  const c = await prisma.conversa.create({ data: { agenteId, canal: 'widget', identificadorExterno: visitante } })
  const t0 = Date.now() - 100_000_000
  await prisma.mensagem.createMany({
    data: Array.from({ length: mensagens }, (_, i) => ({
      conversaId: c.id,
      papel: i % 2 === 0 ? 'user' : 'assistant',
      conteudo: `mensagem ${i} de ${visitante.slice(0, 11)}`,
      criadoEm: new Date(t0 + i * 1000),
      ...(i === 1 && extra.fontes ? { fontes: extra.fontes } : {}),
    })),
  })
  return c
}

describe('GET conversa', () => {
  it('sem conversa devolve conversa nula, sem cache', async () => {
    const r = await retomar(A)
    expect(r.status).toBe(200)
    expect(r.headers.get('cache-control')).toBe('no-store')
    expect(await r.json()).toEqual({ conversa: null })
  })

  it('devolve as mensagens do próprio visitante e nada do outro', async () => {
    const minha = await conversaCom(A, 4)
    await conversaCom(B, 4)
    const corpo = (await (await retomar(A)).json()) as { conversa: { conversaId: string; mensagens: Array<{ papel: string; conteudo: string }>; truncada: boolean } }
    expect(corpo.conversa.conversaId).toBe(minha.id)
    expect(corpo.conversa.truncada).toBe(false)
    expect(corpo.conversa.mensagens.map((m) => m.papel)).toEqual(['user', 'assistant', 'user', 'assistant'])
    expect(JSON.stringify(corpo)).not.toContain('de visitante-b')
  })

  it('com 60 mensagens devolve as últimas 50, em ordem, e truncada true', async () => {
    await conversaCom(A, 60)
    const corpo = (await (await retomar(A)).json()) as { conversa: { mensagens: Array<{ conteudo: string }>; truncada: boolean } }
    expect(corpo.conversa.truncada).toBe(true)
    expect(corpo.conversa.mensagens).toHaveLength(50)
    expect(corpo.conversa.mensagens[0]!.conteudo).toMatch(/^mensagem 10 /)
    expect(corpo.conversa.mensagens.at(-1)!.conteudo).toMatch(/^mensagem 59 /)
  })

  it('as fontes voltam reduzidas: título e números, sem trecho nem id real', async () => {
    const base = await criarBase({ agenteId, titulo: 'Política de troca', textos: ['Conteúdo interno da política.'] })
    const gravadas = JSON.stringify([
      { fonteId: base.fonteId, titulo: 'Política de troca', citada: true, trechos: [{ n: 1, posicao: 1, trechoTexto: 'Conteúdo interno da política.' }] },
    ])
    await conversaCom(A, 2, { fontes: gravadas })
    const texto = await (await retomar(A)).text()
    expect(texto).toContain('Política de troca')
    expect(texto).not.toContain('Conteúdo interno')
    expect(texto).not.toContain(base.fonteId)
  })

  it('cabeçalho ausente ou inválido dá 422; agente inativo e inexistente dão o mesmo 404', async () => {
    expect((await retomar(null)).status).toBe(422)
    expect((await retomar('curto')).status).toBe(422)
    const a = await retomar(A, inativoId)
    const b = await retomar(A, 'nao-existe-0123')
    expect(a.status).toBe(404)
    expect(await a.text()).toBe(await b.text())
  })

  it('o id do visitante na URL não é lido', async () => {
    await conversaCom(A, 2)
    const r = await fetch(`${servidor.base}/api/publico/agentes/${agenteId}/conversa?visitanteId=${A}`)
    expect(r.status).toBe(422)
  })
})
