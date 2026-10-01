/**
 * T-04.02 (FT-12, PEND-17, PR-56, PR-57, achado 4 de premissas-35-70.md): o GET público da conversa do
 * visitante passa a ter o limite por IP e agente do POST e do DELETE. Serviço com limitador e relógio
 * injetados, e a rota real contra o servidor de produção (porta 3251). O bloqueio não vaza nada.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { criarLimitador } from '@/lib/limite-de-uso'
import { retomarConversaDoVisitante } from '@/servicos/chat-publico'
import { LIMITES_DO_CHAT } from '@/servicos/chat-publico-limites'
import { salvarConfiguracao } from '@/servicos/chat-publico-config'
import { criarAdmin, limparBanco } from './ajuda'
import { subirServidor, type Servidor } from './apoio/servidor'

const VISITANTE = 'visitante-a-0123456789abcdef'
const NOME_DO_AGENTE = 'Agente Secreto do Limite'
let servidor: Servidor
let agenteId: string

beforeAll(async () => {
  await limparBanco()
  const admin = await criarAdmin()
  agenteId = (await prisma.agente.create({ data: { nome: NOME_DO_AGENTE, modelo: 'm', criadoPorId: admin.id } })).id
  await salvarConfiguracao(admin, agenteId, { ativo: true })
  servidor = await subirServidor(3251)
}, 180_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

function relogioFalso() {
  let agora = 5_000_000
  return { agora: () => agora, avancar: (ms: number) => (agora += ms) }
}

describe('retomarConversaDoVisitante com o limite por IP e agente (integração)', () => {
  it('a 11a leitura do mesmo IP e agente no minuto recebe 429; 61 s depois volta a passar; outro IP não é afetado', async () => {
    const r = relogioFalso()
    const limitador = criarLimitador(r.agora)
    const ler = (ip: string) => retomarConversaDoVisitante(agenteId, VISITANTE, { ip, limitador })

    for (let i = 1; i <= LIMITES_DO_CHAT.ipEAgentePorMinuto; i += 1) expect(await ler('203.0.113.5'), `leitura ${i}`).toEqual({ conversa: null })
    await expect(ler('203.0.113.5')).rejects.toMatchObject({ status: 429, codigo: 'limite_excedido' })
    expect(await ler('203.0.113.6')).toEqual({ conversa: null })

    r.avancar(61_000)
    expect(await ler('203.0.113.5')).toEqual({ conversa: null })
  })

  it('visitante inválido dá 422 sem gastar o limite, e agente inexistente dá 404 depois do limite', async () => {
    const limitador = criarLimitador(relogioFalso().agora)
    for (let i = 0; i < 15; i += 1) {
      await expect(retomarConversaDoVisitante(agenteId, 'curto', { ip: 'x', limitador })).rejects.toMatchObject({ status: 422 })
    }
    await expect(retomarConversaDoVisitante('nao-existe-0123', VISITANTE, { ip: 'x', limitador })).rejects.toMatchObject({ status: 404 })
  })
})

describe('GET /api/publico/agentes/[id]/conversa no servidor de produção (funcional)', () => {
  it('as 10 primeiras leituras passam e a 11a recebe 429 com Retry-After, sem dado do agente', async () => {
    const ler = () => fetch(`${servidor.base}/api/publico/agentes/${agenteId}/conversa`, { headers: { 'X-Visitante-Id': VISITANTE } })
    for (let i = 1; i <= LIMITES_DO_CHAT.ipEAgentePorMinuto; i += 1) expect((await ler()).status, `leitura ${i}`).toBe(200)

    const bloqueada = await ler()
    expect(bloqueada.status).toBe(429)
    expect(Number(bloqueada.headers.get('retry-after'))).toBeGreaterThanOrEqual(1)
    expect(bloqueada.headers.get('cache-control')).toBe('no-store')
    const texto = await bloqueada.text()
    expect(Object.keys(JSON.parse(texto) as object).sort()).toEqual(['codigo', 'mensagem'])
    expect(JSON.parse(texto)).toMatchObject({ codigo: 'limite_excedido' })
    expect(texto).not.toContain(NOME_DO_AGENTE)
    expect(texto).not.toContain(agenteId)
    expect(texto).not.toContain(VISITANTE)
  })
})
