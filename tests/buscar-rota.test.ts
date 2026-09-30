/**
 * POST /api/agentes/[id]/buscar contra o servidor de produção (FT-05, PR-54):
 * a busca do cartão "Testar busca". Sessão no servidor, validação da pergunta e
 * o formato dos trechos devolvidos.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { COOKIE_SESSAO } from '@/lib/sessao'
import { limparBanco } from './ajuda'
import { criarBase } from './apoio/conhecimento'
import { cookieDe, subirServidor, type Servidor } from './apoio/servidor'

const SENHA = 'senha-de-rota-123'
let servidor: Servidor
let cookie: string
let agenteId: string
let fonteId: string

const buscar = (corpo: unknown, opcoes: { cookie?: string; id?: string } = {}) =>
  fetch(`${servidor.base}/api/agentes/${opcoes.id ?? agenteId}/buscar`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(('cookie' in opcoes ? opcoes.cookie : cookie) ? { cookie: ('cookie' in opcoes ? opcoes.cookie : cookie)! } : {}),
    },
    body: typeof corpo === 'string' ? corpo : JSON.stringify(corpo),
  })

beforeAll(async () => {
  await limparBanco()
  const admin = await prisma.usuario.create({
    data: { nome: 'Admin', email: 'admin.buscar@teste.local', senhaHash: await hashDeSenha(SENHA), papel: 'admin' },
  })
  agenteId = (await prisma.agente.create({ data: { nome: 'Agente', modelo: 'openai/gpt-4o-mini', criadoPorId: admin.id } })).id
  const base = await criarBase({
    agenteId,
    titulo: 'Política de troca e horário',
    textos: ['Aceitamos a troca em até sete dias corridos.', 'O horário de atendimento é das 9h às 18h.'],
  })
  fonteId = base.fonteId
  cookie = await cookieDe('admin.buscar@teste.local', SENHA)
  servidor = await subirServidor(3184)
}, 120_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

describe('busca do agente', () => {
  it('com sessão devolve 200 e os trechos com fonte, posição, texto e pontuação', async () => {
    const r = await buscar({ pergunta: 'Qual o horário de atendimento?' })
    expect(r.status).toBe(200)
    expect(r.headers.get('cache-control')).toContain('no-store')
    const corpo = (await r.json()) as { trechos: Array<Record<string, unknown>> }
    expect(corpo.trechos).toHaveLength(1)
    expect(corpo.trechos[0]).toMatchObject({
      fonteId,
      titulo: 'Política de troca e horário',
      posicao: 2,
      texto: 'O horário de atendimento é das 9h às 18h.',
    })
    expect(corpo.trechos[0]!.pontuacao).toEqual(expect.any(Number))
    expect(Object.keys(corpo.trechos[0]!).sort()).toEqual(['fonteId', 'pontuacao', 'posicao', 'texto', 'titulo', 'trechoId'])
  })

  it('pergunta sem nada na base devolve 200 com lista vazia', async () => {
    const r = await buscar({ pergunta: 'Qual a capital da Austrália?' })
    expect(r.status).toBe(200)
    expect(await r.json()).toEqual({ trechos: [] })
  })

  it('pergunta hostil não derruba o servidor nem a consulta', async () => {
    const r = await buscar({ pergunta: `troca" OR NEAR(a b) col:x * '; DROP TABLE trechos; --` })
    expect(r.status).toBe(200)
    expect(await prisma.trecho.count()).toBe(2)
  })
})

describe('erros', () => {
  it('sem sessão e com cookie inválido é 401 em JSON', async () => {
    for (const c of ['', `${COOKIE_SESSAO}=lixo`]) {
      const r = await buscar({ pergunta: 'troca' }, { cookie: c })
      expect(r.status).toBe(401)
      expect(r.headers.get('content-type')).toContain('application/json')
      expect(await r.json()).toMatchObject({ codigo: 'nao_autenticado' })
    }
  })

  it('agente inexistente é 404', async () => {
    const r = await buscar({ pergunta: 'troca' }, { id: 'nao-existe' })
    expect(r.status).toBe(404)
    expect(await r.json()).toMatchObject({ codigo: 'nao_encontrado' })
  })

  it.each([
    ['vazia', { pergunta: '' }],
    ['só espaços', { pergunta: '   ' }],
    ['acima de 500 caracteres', { pergunta: 'a'.repeat(501) }],
    ['ausente', {}],
    ['que não é texto', { pergunta: 42 }],
    ['com corpo que não é JSON', 'isto não é json'],
  ])('pergunta %s é 422', async (_nome, corpo) => {
    const r = await buscar(corpo)
    expect(r.status).toBe(422)
    expect(await r.json()).toMatchObject({ codigo: 'entrada_invalida' })
  })
})
