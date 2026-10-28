/**
 * Rota de conversa do painel contra o servidor de produção (PR-43): sessão no
 * servidor, erros antes do stream em JSON, stream SSE com trecho, fim e erro.
 * O provedor é o OpenRouter simulado; o banco é o de teste.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { entrar } from '@/servicos/autenticacao'
import { salvarChaveDoOpenrouter, removerChaveDoOpenrouter } from '@/servicos/integracoes'
import { COOKIE_SESSAO } from '@/lib/sessao'
import { hashDeSenha } from '@/lib/senha'
import { prisma } from '@/lib/prisma'
import { limparBanco } from './ajuda'
import { criarBase } from './apoio/conhecimento'
import {
  CHAVE_VALIDA,
  iniciarOpenRouterFalso,
  type OpenRouterFalso,
} from './apoio/openrouter-falso'

const PORTA = 3179
const BASE = `http://localhost:${PORTA}`
const SENHA = 'senha-de-rota-123'

let servidor: ChildProcess
let falso: OpenRouterFalso
let agenteId: string
let cookie: string
let cookieDeOutro: string
let adminId: string

async function esperarDePe(tentativas = 60): Promise<void> {
  for (let i = 0; i < tentativas; i += 1) {
    try {
      await fetch(`${BASE}/entrar`)
      return
    } catch {
      await new Promise((r) => setTimeout(r, 500))
    }
  }
  throw new Error('O servidor não subiu a tempo.')
}

const cookieDe = async (email: string) => `${COOKIE_SESSAO}=${(await entrar({ email, senha: SENHA })).token}`

beforeAll(async () => {
  await limparBanco()
  const senhaHash = await hashDeSenha(SENHA)
  const admin = await prisma.usuario.create({
    data: { nome: 'Admin', email: 'admin.conversa@teste.local', senhaHash, papel: 'admin' },
  })
  adminId = admin.id
  await prisma.usuario.create({
    data: { nome: 'Outro', email: 'outro.conversa@teste.local', senhaHash, papel: 'usuario' },
  })
  const agente = await prisma.agente.create({
    data: {
      nome: 'Agente de rota',
      modelo: 'openai/gpt-4o-mini',
      instrucoes: 'Seja simpático.',
      criadoPorId: admin.id,
    },
  })
  agenteId = agente.id
  await salvarChaveDoOpenrouter(admin, { chave: CHAVE_VALIDA })
  cookie = await cookieDe('admin.conversa@teste.local')
  cookieDeOutro = await cookieDe('outro.conversa@teste.local')

  falso = await iniciarOpenRouterFalso({ trechos: ['Olá', ', ', 'tudo ', 'bem?'] })
  servidor = spawn('npx', ['next', 'start', '-p', String(PORTA)], {
    env: { ...process.env, NODE_ENV: 'production', OPENROUTER_BASE_URL: falso.url },
    stdio: 'ignore',
  })
  await esperarDePe()
}, 120_000)

afterAll(async () => {
  servidor?.kill()
  await falso?.fechar()
  await limparBanco()
})

beforeEach(async () => {
  await prisma.mensagem.deleteMany()
  await prisma.conversa.deleteMany()
  await prisma.fonte.deleteMany()
  falso.configurar({
    erroHttp: null,
    erroNoMeioApos: null,
    intervaloEntreTrechosMs: 0,
    chavesValidas: [CHAVE_VALIDA],
  })
})

function conversar(corpo: unknown, opcoes: { cookie?: string; id?: string; sinal?: AbortSignal } = {}) {
  return fetch(`${BASE}/api/agentes/${opcoes.id ?? agenteId}/conversar`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(opcoes.cookie === undefined ? {} : opcoes.cookie === '' ? {} : { cookie: opcoes.cookie }),
    },
    body: typeof corpo === 'string' ? corpo : JSON.stringify(corpo),
    signal: opcoes.sinal,
  })
}

/** Lê o corpo SSE inteiro e o separa em [evento, dados]. */
async function eventosDe(resposta: Response): Promise<Array<[string, Record<string, unknown>]>> {
  const texto = await resposta.text()
  return texto
    .split('\n\n')
    .filter((b) => b.trim() !== '')
    .map((b) => {
      const linhas = b.split('\n')
      return [
        linhas.find((l) => l.startsWith('event: '))!.slice(7),
        JSON.parse(linhas.find((l) => l.startsWith('data: '))!.slice(6)),
      ]
    })
}

describe('antes do stream: erro em JSON com o status certo', () => {
  it('sem sessão é 401, sem redirecionar e sem tocar no provedor', async () => {
    const r = await conversar({ mensagem: 'Oi' }, { cookie: '' })
    expect(r.status).toBe(401)
    expect(r.headers.get('content-type')).toContain('application/json')
    expect(await r.json()).toMatchObject({ codigo: 'nao_autenticado' })
    expect(falso.requisicoes.filter((q) => q.caminho.endsWith('/chat/completions'))).toHaveLength(0)
  })

  it('cookie inválido também é 401', async () => {
    const r = await conversar({ mensagem: 'Oi' }, { cookie: `${COOKIE_SESSAO}=lixo` })
    expect(r.status).toBe(401)
  })

  it('agente inexistente é 404', async () => {
    const r = await conversar({ mensagem: 'Oi' }, { cookie, id: 'nao-existe' })
    expect(r.status).toBe(404)
    expect(await r.json()).toMatchObject({ codigo: 'nao_encontrado' })
  })

  it.each([
    ['vazia', { mensagem: '' }],
    ['acima de 4000 caracteres', { mensagem: 'a'.repeat(4001) }],
    ['ausente', {}],
    ['com conversaId que não é texto', { mensagem: 'Oi', conversaId: 7 }],
    ['com corpo que não é JSON', 'isto não é json'],
  ])('mensagem %s é 422', async (_nome, corpo) => {
    const r = await conversar(corpo, { cookie })
    expect(r.status).toBe(422)
    expect(await r.json()).toMatchObject({ codigo: 'entrada_invalida' })
    expect(await prisma.conversa.count()).toBe(0)
  })

  it('sem chave do OpenRouter é 409 com chat_sem_chave', async () => {
    const admin = await prisma.usuario.findUniqueOrThrow({ where: { id: adminId } })
    await removerChaveDoOpenrouter({ id: admin.id, nome: admin.nome, email: admin.email, papel: 'admin' })
    try {
      const r = await conversar({ mensagem: 'Oi' }, { cookie })
      expect(r.status).toBe(409)
      const corpo = (await r.json()) as { codigo: string; mensagem: string }
      expect(corpo.codigo).toBe('chat_sem_chave')
      expect(corpo.mensagem).toMatch(/administrador/i)
    } finally {
      await salvarChaveDoOpenrouter(
        { id: admin.id, nome: admin.nome, email: admin.email, papel: 'admin' },
        { chave: CHAVE_VALIDA },
      )
    }
  })

  it('conversa de outro usuário é 404', async () => {
    const primeira = await conversar({ mensagem: 'Minha' }, { cookie })
    const conversaId = primeira.headers.get('x-conversa-id')!
    await primeira.text()
    const r = await conversar({ mensagem: 'Intrusão', conversaId }, { cookie: cookieDeOutro })
    expect(r.status).toBe(404)
    expect(await prisma.mensagem.count()).toBe(2)
  })
})

describe('stream completo', () => {
  it('responde 200 text/event-stream com os cabeçalhos definidos e os eventos na ordem', async () => {
    const r = await conversar({ mensagem: 'Oi, tudo bem?' }, { cookie })
    expect(r.status).toBe(200)
    expect(r.headers.get('content-type')).toContain('text/event-stream')
    expect(r.headers.get('cache-control')).toContain('no-store')
    expect(r.headers.get('x-accel-buffering')).toBe('no')
    const conversaId = r.headers.get('x-conversa-id')
    expect(conversaId).toBeTruthy()

    const eventos = await eventosDe(r)
    expect(eventos.map(([nome]) => nome)).toEqual(['trecho', 'fim'])
    const saudacao = 'Olá! Como posso ajudar?'
    expect(eventos[0]![1].texto).toBe(saudacao)
    const [, fim] = eventos.at(-1)!
    expect(fim).toMatchObject({ conversaId, tamanho: saudacao.length })
    expect(typeof fim.mensagemId).toBe('string')

    const gravadas = await prisma.mensagem.findMany({
      where: { conversaId: conversaId! },
      orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }],
    })
    expect(gravadas.map((m) => [m.papel, m.conteudo])).toEqual([
      ['user', 'Oi, tudo bem?'],
      ['assistant', saudacao],
    ])
  })

  it('continuar com o conversaId grava na mesma conversa', async () => {
    const a = await conversar({ mensagem: 'Primeira' }, { cookie })
    const id = a.headers.get('x-conversa-id')!
    await a.text()
    const b = await conversar({ mensagem: 'Segunda', conversaId: id }, { cookie })
    expect(b.headers.get('x-conversa-id')).toBe(id)
    await b.text()
    expect(await prisma.conversa.count()).toBe(1)
    expect(await prisma.mensagem.count()).toBe(4)
  })
})

describe('falhas depois do início', () => {
  beforeEach(async () => {
    await criarBase({ agenteId, textos: ['Aceitamos a troca em sete dias.'] })
  })

  it('erro no meio do stream: evento erro sem texto parcial e nada do assistente gravado', async () => {
    falso.configurar({ erroNoMeioApos: 2 })
    const r = await conversar({ mensagem: 'Qual o prazo de troca?' }, { cookie })
    expect(r.status).toBe(200)
    const eventos = await eventosDe(r)
    expect(eventos.map(([nome]) => nome)).toEqual(['erro'])
    const [, erro] = eventos.at(-1)!
    expect(erro.codigo).toBe('provedor_indisponivel')
    expect(String(erro.mensagem)).toMatch(/indispon/i)
    expect(String(erro.mensagem)).not.toContain('Provider disconnected')
    expect((await prisma.mensagem.findMany()).map((m) => m.papel)).toEqual(['user'])
  })

  it('chave recusada pelo provedor: evento erro em português, sem o corpo bruto nem a chave', async () => {
    falso.configurar({ chavesValidas: ['outra-chave'] })
    const r = await conversar({ mensagem: 'Qual o prazo de troca?' }, { cookie })
    expect(r.status).toBe(200)
    const texto = await r.text()
    expect(texto).toContain('event: erro')
    expect(texto).toContain('provedor_chave_invalida')
    expect(texto).toMatch(/chave/i)
    expect(texto).not.toContain('No auth credentials found')
    expect(texto).not.toContain(CHAVE_VALIDA)
    expect(await prisma.mensagem.count()).toBe(1)
  })

  it('saldo insuficiente: evento erro com a mensagem de saldo', async () => {
    falso.configurar({ erroHttp: 402 })
    const texto = await (await conversar({ mensagem: 'Qual o prazo de troca?' }, { cookie })).text()
    expect(texto).toContain('provedor_sem_saldo')
    expect(texto).not.toContain('Insufficient credits')
  })
})

describe('cancelamento', () => {
  it('abortar a leitura no navegador aborta a chamada ao provedor e não grava a resposta', async () => {
    await criarBase({ agenteId, textos: ['Aceitamos a troca em sete dias.'] })
    falso.configurar({ intervaloEntreTrechosMs: 150 })
    const antes = falso.cancelamentos
    const chamadasAntes = falso.requisicoes.length
    const controle = new AbortController()
    const pendente = conversar({ mensagem: 'Qual o prazo de troca?' }, { cookie, sinal: controle.signal })
      .then((r) => r.body?.cancel().catch(() => undefined)).catch(() => undefined)
    // A resposta agora é retida para validação; não se espera texto parcial.
    for (let i = 0; i < 60 && falso.requisicoes.length === chamadasAntes; i += 1) {
      await new Promise((res) => setTimeout(res, 25))
    }
    controle.abort()
    await pendente
    for (let i = 0; i < 60 && falso.cancelamentos === antes; i += 1) {
      await new Promise((res) => setTimeout(res, 50))
    }
    expect(falso.cancelamentos).toBeGreaterThan(antes)
    await new Promise((res) => setTimeout(res, 300))
    expect((await prisma.mensagem.findMany()).map((m) => m.papel)).toEqual(['user'])
  })
})

describe('fontes da resposta pelo servidor de produção (FT-05)', () => {
  it('com base pronta, o SSE traz trecho, fontes e fim; a conversa retomada guarda as fontes', async () => {
    falso.configurar({ trechos: ['Troca em sete dias ', '[1]', '.'] })
    const base = await criarBase({ agenteId, titulo: 'Política de troca', textos: ['Aceitamos a troca em até sete dias corridos.'] })
    try {
      const eventos = await eventosDe(await conversar({ mensagem: 'Qual o prazo de troca?' }, { cookie }))

      expect(eventos.map(([nome]) => nome)).toEqual(['trecho', 'trecho', 'trecho', 'fontes', 'fim'])
      const [, dados] = eventos.find(([nome]) => nome === 'fontes')!
      expect(dados.fontes).toEqual([
        {
          fonteId: base.fonteId,
          titulo: 'Política de troca',
          citada: true,
          trechos: [{ n: 1, posicao: 1, trechoTexto: 'Aceitamos a troca em até sete dias corridos.' }],
        },
      ])
      const gravada = await prisma.mensagem.findFirstOrThrow({ where: { papel: 'assistant' } })
      expect(JSON.parse(gravada.fontes!)).toEqual(dados.fontes)
    } finally {
      await prisma.fonte.deleteMany({ where: { agenteId } })
    }
  })

  it('sem fonte pronta a mesma rota devolve uma recusa e fim', async () => {
    falso.configurar({ trechos: ['Olá', ', ', 'tudo ', 'bem?'] })
    const eventos = await eventosDe(await conversar({ mensagem: 'Qual o prazo de troca?' }, { cookie }))
    expect(eventos.map(([nome]) => nome)).toEqual(['trecho', 'fim'])
    expect(String(eventos[0]![1].texto)).toContain('Não encontrei essa informação na base')
  })
})
