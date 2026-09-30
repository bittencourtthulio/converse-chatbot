/**
 * Excluir e reprocessar fonte pela API (PR-49) contra o servidor de produção.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { ambiente } from '@/lib/ambiente'
import { hashDeSenha } from '@/lib/senha'
import { limparBanco } from './ajuda'
import { cookieDe, esperar, subirServidor, type Servidor } from './apoio/servidor'
import { armazenamentoDeTeste, criarFonteDeTeste } from './apoio/fontes'

const SENHA = 'senha-de-rota-123'
let servidor: Servidor
let cookie: string
let agenteId: string
let outroAgenteId: string

const rota = (aid: string, fid: string, sufixo = '') => `${servidor.base}/api/agentes/${aid}/fontes/${fid}${sufixo}`
const statusDe = async (id: string) => (await prisma.fonte.findUniqueOrThrow({ where: { id } })).status

beforeAll(async () => {
  await limparBanco()
  const admin = await prisma.usuario.create({
    data: { nome: 'Admin', email: 'admin.ciclo@teste.local', senhaHash: await hashDeSenha(SENHA), papel: 'admin' },
  })
  const criar = (nome: string) =>
    prisma.agente.create({ data: { nome, modelo: 'openai/gpt-4o-mini', criadoPorId: admin.id } })
  agenteId = (await criar('A')).id
  outroAgenteId = (await criar('B')).id
  cookie = await cookieDe('admin.ciclo@teste.local', SENHA)
  servidor = await subirServidor(3182)
}, 120_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

describe('DELETE /fontes/[fonteId]', () => {
  it('fonte pronta: 204, some da lista e o diretório some do STORAGE_DIR', async () => {
    const fonte = await criarFonteDeTeste({ agenteId, status: 'pronto', bytes: Buffer.from('x') })
    const pasta = path.join(ambiente.storageDir, 'fontes', agenteId, fonte.id)
    expect(existsSync(pasta)).toBe(true)

    const r = await fetch(rota(agenteId, fonte.id), { method: 'DELETE', headers: { cookie } })

    expect(r.status).toBe(204)
    expect(await r.text()).toBe('')
    const lista = (await (await fetch(`${servidor.base}/api/agentes/${agenteId}/fontes`, { headers: { cookie } })).json()) as {
      fontes: Array<{ id: string }>
    }
    expect(lista.fontes.map((f) => f.id)).not.toContain(fonte.id)
    expect(existsSync(pasta)).toBe(false)
  })

  it('sem sessão é 401; fonte inexistente ou de outro agente é 404 e nada é apagado', async () => {
    const fonte = await criarFonteDeTeste({ agenteId, bytes: Buffer.from('x') })
    expect((await fetch(rota(agenteId, fonte.id), { method: 'DELETE' })).status).toBe(401)
    expect((await fetch(rota(agenteId, 'nao-existe'), { method: 'DELETE', headers: { cookie } })).status).toBe(404)
    const alheia = await fetch(rota(outroAgenteId, fonte.id), { method: 'DELETE', headers: { cookie } })
    expect(alheia.status).toBe(404)
    expect(await alheia.json()).toMatchObject({ codigo: 'nao_encontrado' })
    expect(await prisma.fonte.findUnique({ where: { id: fonte.id } })).not.toBeNull()
  })
})

describe('POST /fontes/[fonteId]/reprocessar', () => {
  it('fonte em erro: 202, volta a pendente e chega a pronto pelo processamento real', async () => {
    const fonte = await criarFonteDeTeste({ agenteId, status: 'erro', bytes: Buffer.from('Agora está certo.') })
    await prisma.fonte.update({ where: { id: fonte.id }, data: { mensagemErro: 'Falhou antes.' } })

    const r = await fetch(rota(agenteId, fonte.id, '/reprocessar'), { method: 'POST', headers: { cookie } })

    expect(r.status).toBe(202)
    const { fonte: devolvida } = (await r.json()) as { fonte: Record<string, unknown> }
    expect(devolvida).toMatchObject({ id: fonte.id, mensagemErro: null })
    expect(devolvida).not.toHaveProperty('caminhoArquivo')
    await esperar(async () => (await statusDe(fonte.id)) === 'pronto')
    expect(await prisma.trecho.count({ where: { fonteId: fonte.id } })).toBe(1)
  })

  it('fonte pronta: 409; de outro agente: 404; sem sessão: 401', async () => {
    const pronta = await criarFonteDeTeste({ agenteId, status: 'pronto' })
    const erro = await criarFonteDeTeste({ agenteId, status: 'erro' })
    const r = await fetch(rota(agenteId, pronta.id, '/reprocessar'), { method: 'POST', headers: { cookie } })
    expect(r.status).toBe(409)
    expect(await r.json()).toMatchObject({ codigo: 'conflito' })
    expect((await fetch(rota(outroAgenteId, erro.id, '/reprocessar'), { method: 'POST', headers: { cookie } })).status).toBe(404)
    expect((await fetch(rota(agenteId, erro.id, '/reprocessar'), { method: 'POST' })).status).toBe(401)
    expect(await statusDe(erro.id)).toBe('erro')
  })

  it('arquivo original que sumiu volta a dar erro claro, sem caminho', async () => {
    const fonte = await criarFonteDeTeste({ agenteId, status: 'erro', bytes: Buffer.from('x') })
    await armazenamentoDeTeste().apagarFonte(agenteId, fonte.id)
    await fetch(rota(agenteId, fonte.id, '/reprocessar'), { method: 'POST', headers: { cookie } })
    await esperar(async () => (await statusDe(fonte.id)) === 'erro' && (await prisma.fonte.findUniqueOrThrow({ where: { id: fonte.id } })).mensagemErro?.includes('arquivo original'))
    const depois = await prisma.fonte.findUniqueOrThrow({ where: { id: fonte.id } })
    expect(depois.mensagemErro).not.toMatch(/\/|storage/)
  })
})
