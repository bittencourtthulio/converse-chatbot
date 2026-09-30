/**
 * Rotas de lista e de texto colado da base de conhecimento (PR-49) contra o
 * servidor de produção: sessão no servidor, status certos, e o processamento
 * real da fila em segundo plano (src/instrumentation.ts).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { COOKIE_SESSAO } from '@/lib/sessao'
import { limparBanco } from './ajuda'
import { cookieDe, esperar, subirServidor, type Servidor } from './apoio/servidor'

const SENHA = 'senha-de-rota-123'
let servidor: Servidor
let cookie: string
let agenteId: string

const url = (caminho = '') => `${servidor.base}/api/agentes/${agenteId}/fontes${caminho}`
const autenticado = () => ({ cookie })

beforeAll(async () => {
  await limparBanco()
  const admin = await prisma.usuario.create({
    data: { nome: 'Admin', email: 'admin.fontes@teste.local', senhaHash: await hashDeSenha(SENHA), papel: 'admin' },
  })
  agenteId = (
    await prisma.agente.create({ data: { nome: 'Agente', modelo: 'openai/gpt-4o-mini', criadoPorId: admin.id } })
  ).id
  cookie = await cookieDe('admin.fontes@teste.local', SENHA)
  servidor = await subirServidor(3180)
}, 120_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

describe('sessão e agente', () => {
  it('sem sessão ou com cookie inválido é 401 em JSON, sem redirecionar', async () => {
    for (const cabecalho of [{}, { cookie: `${COOKIE_SESSAO}=lixo` }] as Array<Record<string, string>>) {
      const lista = await fetch(url(), { headers: cabecalho })
      expect(lista.status).toBe(401)
      expect(lista.headers.get('content-type')).toContain('application/json')
      expect(await lista.json()).toMatchObject({ codigo: 'nao_autenticado' })
      const texto = await fetch(url('/texto'), {
        method: 'POST',
        headers: { ...cabecalho, 'content-type': 'application/json' },
        body: JSON.stringify({ titulo: 'T', conteudo: 'x' }),
      })
      expect(texto.status).toBe(401)
    }
    expect(await prisma.fonte.count()).toBe(0)
  })

  it('agente inexistente é 404 na lista e no texto', async () => {
    const base = `${servidor.base}/api/agentes/nao-existe/fontes`
    expect((await fetch(base, { headers: autenticado() })).status).toBe(404)
    const r = await fetch(`${base}/texto`, {
      method: 'POST',
      headers: { ...autenticado(), 'content-type': 'application/json' },
      body: JSON.stringify({ titulo: 'T', conteudo: 'x' }),
    })
    expect(r.status).toBe(404)
    expect(await r.json()).toMatchObject({ codigo: 'nao_encontrado' })
  })
})

describe('texto colado', () => {
  it('responde 202 e a fonte passa a pronta pelo processamento real, com resumo na lista', async () => {
    const r = await fetch(url('/texto'), {
      method: 'POST',
      headers: { ...autenticado(), 'content-type': 'application/json' },
      body: JSON.stringify({ titulo: 'Política de troca', conteudo: 'A troca vale por sete dias.' }),
    })
    expect(r.status).toBe(202)
    const { fonte } = (await r.json()) as { fonte: Record<string, unknown> }
    expect(fonte).toMatchObject({ titulo: 'Política de troca', tipo: 'texto', agenteId })
    expect(fonte).not.toHaveProperty('caminhoArquivo')
    expect(['pendente', 'processando', 'pronto']).toContain(fonte.status)

    const lista = await esperar(async () => {
      const l = await fetch(url(), { headers: autenticado() })
      expect(l.status).toBe(200)
      expect(l.headers.get('cache-control')).toContain('no-store')
      const corpo = (await l.json()) as { fontes: Array<{ status: string }>; resumo: Record<string, number> }
      return corpo.fontes[0]?.status === 'pronto' ? corpo : false
    })
    expect(lista.resumo).toMatchObject({ total: 1, prontas: 1, emProcessamento: 0, comErro: 0 })
    expect(lista.resumo.caracteres).toBe('A troca vale por sete dias.'.length)
    expect(JSON.stringify(lista)).not.toContain('caminhoArquivo')
  })

  it('entrada inválida: tipo errado 415, corpo que não é JSON 422, título vazio 422, corpo gigante 413', async () => {
    const cabecalhos = { ...autenticado(), 'content-type': 'application/json' }
    const tipoErrado = await fetch(url('/texto'), {
      method: 'POST',
      headers: { ...autenticado(), 'content-type': 'text/plain' },
      body: 'oi',
    })
    expect(tipoErrado.status).toBe(415)
    expect(await tipoErrado.json()).toMatchObject({ codigo: 'tipo_nao_suportado' })

    const semJson = await fetch(url('/texto'), { method: 'POST', headers: cabecalhos, body: 'não é json' })
    expect(semJson.status).toBe(422)

    const vazio = await fetch(url('/texto'), {
      method: 'POST',
      headers: cabecalhos,
      body: JSON.stringify({ titulo: '', conteudo: 'x' }),
    })
    expect(vazio.status).toBe(422)
    expect(((await vazio.json()) as { mensagem: string }).mensagem).toMatch(/título/i)

    const grande = await fetch(url('/texto'), {
      method: 'POST',
      headers: cabecalhos,
      body: JSON.stringify({ titulo: 'T', conteudo: 'a'.repeat(3 * 1024 * 1024) }),
    })
    expect(grande.status).toBe(413)

    const longo = await fetch(url('/texto'), {
      method: 'POST',
      headers: cabecalhos,
      body: JSON.stringify({ titulo: 'T', conteudo: 'a'.repeat(200_001) }),
    })
    expect(longo.status).toBe(422)
    expect(((await longo.json()) as { mensagem: string }).mensagem).toMatch(/200\.000/)
  })
})
