/**
 * T-03.02 (FT-06, PR-56, PR-57, PR-58): POST conversar da API pública contra o
 * servidor de produção e o OpenRouter simulado: stream SSE sem sessão, erro
 * sempre genérico ao visitante, limites com Retry-After e conferência de Origin.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { lerEventos, type EventoDoServidor } from '@/componentes/leitor-de-sse'
import { MENSAGEM_PARA_VISITANTE } from '@/servicos/chat-erros'
import { salvarConfiguracao } from '@/servicos/chat-publico-config'
import { salvarChaveDoOpenrouter } from '@/servicos/integracoes'
import { criarAdmin, limparBanco } from './ajuda'
import { CHAVE_VALIDA, iniciarOpenRouterFalso, type OpenRouterFalso } from './apoio/openrouter-falso'
import { criarBase } from './apoio/conhecimento'
import { subirServidor, type Servidor } from './apoio/servidor'

const PORTA = 3191
const SEGREDOS = /saldo|credit|openrouter|provedor|402|chave|sk-or|stack|prisma|SELECT|administrador/i

let servidor: Servidor
let falso: OpenRouterFalso
let admin: Awaited<ReturnType<typeof criarAdmin>>
let agenteId: string
let inativoId: string
let contadorDeIp = 0

const novoIp = () => `10.1.${Math.floor(contadorDeIp / 250)}.${(contadorDeIp += 1) % 250}`
const visitante = (n: string) => `visitante-${n}-0123456789abcdef`

interface Opcoes {
  ip?: string
  origem?: string | null
  agente?: string
  corpo?: unknown
  bruto?: string
}

function postar(corpo: Record<string, unknown>, o: Opcoes = {}) {
  const cabecalhos: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Forwarded-For': o.ip ?? novoIp(),
  }
  if (o.origem) cabecalhos.Origin = o.origem
  return fetch(`${servidor.base}/api/publico/agentes/${o.agente ?? agenteId}/conversar`, {
    method: 'POST',
    headers: cabecalhos,
    body: o.bruto ?? JSON.stringify(corpo),
  })
}

async function eventosDe(r: Response): Promise<EventoDoServidor[]> {
  const lista: EventoDoServidor[] = []
  for await (const e of lerEventos(r.body as ReadableStream<Uint8Array>)) lista.push(e)
  return lista
}

beforeAll(async () => {
  await limparBanco()
  admin = await criarAdmin()
  await salvarChaveDoOpenrouter(admin, { chave: CHAVE_VALIDA })
  const a = await prisma.agente.create({
    data: { nome: 'Agente público', modelo: 'openai/gpt-4o-mini', instrucoes: 'Seja breve.', criadoPorId: admin.id },
  })
  const b = await prisma.agente.create({
    data: { nome: 'Agente inativo', modelo: 'openai/gpt-4o-mini', criadoPorId: admin.id },
  })
  agenteId = a.id
  inativoId = b.id
  await salvarConfiguracao(admin, agenteId, { ativo: true })
  await salvarConfiguracao(admin, inativoId, { ativo: false })
  falso = await iniciarOpenRouterFalso({ trechos: ['Você pode trocar em sete dias ', '[1]', '.'] })
  servidor = await subirServidor(PORTA, { TRUST_PROXY: '1', OPENROUTER_BASE_URL: falso.url })
}, 180_000)

afterAll(async () => {
  servidor?.parar()
  await falso?.fechar()
  await limparBanco()
})

beforeEach(async () => {
  falso.configurar({ erroHttp: null, erroNoMeioApos: null })
  await prisma.mensagem.deleteMany()
  await prisma.conversa.deleteMany()
  await prisma.fonte.deleteMany()
  await salvarConfiguracao(admin, agenteId, { limiteDiario: 500 })
})

describe('stream sem sessão', () => {
  it('responde text/event-stream com trecho e fim, X-Conversa-Id e sem cache, sem cookie', async () => {
    const r = await postar({ visitanteId: visitante('a'), mensagem: 'Qual o prazo de troca?' })
    expect(r.status).toBe(200)
    expect(r.headers.get('content-type')).toMatch(/text\/event-stream/)
    expect(r.headers.get('cache-control')).toMatch(/no-store/)
    expect(r.headers.get('set-cookie')).toBeNull()
    const conversaId = r.headers.get('x-conversa-id')
    expect(conversaId).toBeTruthy()
    const eventos = await eventosDe(r)
    expect(eventos.map((e) => e.tipo)).toEqual(['trecho', 'trecho', 'trecho', 'fim'])
    const fim = eventos.at(-1)
    expect(fim).toMatchObject({ tipo: 'fim', conversaId })
    const conversa = await prisma.conversa.findUniqueOrThrow({ where: { id: conversaId as string } })
    expect(conversa).toMatchObject({ canal: 'widget', identificadorExterno: visitante('a'), criadoPorId: null })
  })

  it('com base pronta o evento fontes vem antes do fim, só com título e números', async () => {
    await criarBase({
      agenteId,
      titulo: 'Política de troca',
      textos: ['Aceitamos a troca em até sete dias corridos, conteúdo interno da empresa.'],
    })
    const r = await postar({ visitanteId: visitante('b'), mensagem: 'Qual o prazo de troca?' })
    const texto = await r.text()
    expect(texto.indexOf('event: fontes')).toBeGreaterThan(-1)
    expect(texto.indexOf('event: fontes')).toBeLessThan(texto.indexOf('event: fim'))
    expect(texto).toContain('Política de troca')
    expect(texto).not.toContain('conteúdo interno')
    expect(texto).not.toContain('sete dias corridos')
  })

  it('a mesma conversa continua com o conversaId do visitante', async () => {
    const primeira = await postar({ visitanteId: visitante('c'), mensagem: 'Oi' })
    const conversaId = primeira.headers.get('x-conversa-id') as string
    await primeira.text()
    const segunda = await postar({ visitanteId: visitante('c'), conversaId, mensagem: 'E o prazo?' })
    expect(segunda.status).toBe(200)
    await segunda.text()
    expect(await prisma.mensagem.count({ where: { conversaId } })).toBe(4)
  })
})

describe('erro sempre genérico ao visitante', () => {
  it('erro do provedor vira o evento erro com a frase única, sem detalhe técnico', async () => {
    falso.configurar({ erroHttp: 402 })
    const r = await postar({ visitanteId: visitante('d'), mensagem: 'Oi' })
    // A pergunta já foi gravada quando o provedor falha: o erro vai no stream.
    expect(r.status).toBe(200)
    const texto = await r.text()
    expect(texto).toContain('event: erro')
    expect(texto).toContain(MENSAGEM_PARA_VISITANTE)
    expect(texto).not.toMatch(SEGREDOS)
    expect(texto).not.toMatch(/correlacao|stack/i)
    expect(texto).not.toContain('provedor_')
  })

  it('erro no meio do stream vira o evento erro com a frase única', async () => {
    falso.configurar({ erroNoMeioApos: 1 })
    const r = await postar({ visitanteId: visitante('e'), mensagem: 'Oi' })
    expect(r.status).toBe(200)
    const eventos = await eventosDe(r)
    const erro = eventos.at(-1)
    expect(erro).toEqual({ tipo: 'erro', codigo: 'indisponivel', mensagem: MENSAGEM_PARA_VISITANTE })
  })

  it('sem chave do OpenRouter o visitante vê a frase única, não a do operador', async () => {
    await prisma.configuracaoDoWorkspace.deleteMany()
    try {
      const r = await postar({ visitanteId: visitante('f'), mensagem: 'Oi' })
      const texto = await r.text()
      expect(texto).toContain(MENSAGEM_PARA_VISITANTE)
      expect(texto).not.toMatch(/administrador|Integrações|configurado/i)
    } finally {
      await salvarChaveDoOpenrouter(admin, { chave: CHAVE_VALIDA })
    }
  })
})

describe('validação e 404', () => {
  it.each([
    ['visitanteId curto', { visitanteId: 'curto', mensagem: 'Oi' }],
    ['visitanteId com caractere inválido', { visitanteId: 'com espaço 0123456789', mensagem: 'Oi' }],
    ['mensagem vazia', { visitanteId: visitante('g'), mensagem: '' }],
    ['mensagem de 1001 caracteres', { visitanteId: visitante('g'), mensagem: 'x'.repeat(1001) }],
    ['mensagem que não é texto', { visitanteId: visitante('g'), mensagem: 42 }],
    ['conversaId que não é texto', { visitanteId: visitante('g'), conversaId: 7, mensagem: 'Oi' }],
  ])('%s dá 422 e não grava', async (_nome, corpo) => {
    const r = await postar(corpo)
    expect(r.status).toBe(422)
    expect(await r.text()).not.toMatch(SEGREDOS)
    expect(await prisma.conversa.count()).toBe(0)
  })

  it('JSON inválido dá 422 e corpo acima de 8 KB dá 413', async () => {
    expect((await postar({}, { bruto: '{nao é json' })).status).toBe(422)
    expect((await postar({}, { bruto: JSON.stringify({ visitanteId: visitante('h'), mensagem: 'x'.repeat(9000) }) })).status).toBe(413)
    expect(await prisma.conversa.count()).toBe(0)
  })

  it('agente inativo e agente inexistente dão o mesmo 404', async () => {
    const a = await postar({ visitanteId: visitante('i'), mensagem: 'Oi' }, { agente: inativoId })
    const b = await postar({ visitanteId: visitante('i'), mensagem: 'Oi' }, { agente: 'nao-existe-0123' })
    expect(a.status).toBe(404)
    expect(b.status).toBe(404)
    expect(await a.text()).toBe(await b.text())
    expect(await prisma.conversa.count()).toBe(0)
  })

  it('conversa de outro visitante dá o mesmo 404 da conversa inexistente', async () => {
    const dona = await postar({ visitanteId: visitante('j'), mensagem: 'Oi' })
    const conversaId = dona.headers.get('x-conversa-id') as string
    await dona.text()
    const intruso = await postar({ visitanteId: visitante('k'), conversaId, mensagem: 'Oi' })
    const inexistente = await postar({ visitanteId: visitante('k'), conversaId: 'nao-existe', mensagem: 'Oi' })
    expect(intruso.status).toBe(404)
    expect(await intruso.text()).toBe(await inexistente.text())
    expect(await prisma.mensagem.count({ where: { conversaId } })).toBe(2)
  })
})

describe('limites (PR-57)', () => {
  it('a 11ª mensagem do minuto do mesmo IP dá 429 com Retry-After e mensagem amigável', async () => {
    const ip = novoIp()
    for (let i = 0; i < 10; i += 1) {
      const r = await postar({ visitanteId: visitante('l'), mensagem: `Oi ${i}` }, { ip })
      expect(r.status).toBe(200)
      await r.text()
    }
    const r = await postar({ visitanteId: visitante('l'), mensagem: 'Oi 11' }, { ip })
    expect(r.status).toBe(429)
    expect(Number(r.headers.get('retry-after'))).toBeGreaterThan(0)
    const corpo = (await r.json()) as { codigo: string; mensagem: string }
    expect(corpo.codigo).toBe('limite_excedido')
    expect(corpo.mensagem).toMatch(/aguarde/i)
    // outro IP não é afetado
    const outro = await postar({ visitanteId: visitante('l'), mensagem: 'Oi' })
    expect(outro.status).toBe(200)
    await outro.text()
  })

  it('o teto diário do agente (limiteDiario 1) dá 429 na segunda mensagem do dia', async () => {
    await salvarConfiguracao(admin, agenteId, { limiteDiario: 1 })
    const primeira = await postar({ visitanteId: visitante('m'), mensagem: 'Oi' })
    expect(primeira.status).toBe(200)
    await primeira.text()
    const segunda = await postar({ visitanteId: visitante('n'), mensagem: 'Oi' })
    expect(segunda.status).toBe(429)
    expect(Number(segunda.headers.get('retry-after'))).toBeGreaterThanOrEqual(1)
    expect(((await segunda.json()) as { codigo: string }).codigo).toBe('limite_diario')
  })

  it('a conversa com 60 mensagens do visitante dá 429 sem Retry-After', async () => {
    const c = await prisma.conversa.create({ data: { agenteId, canal: 'widget', identificadorExterno: visitante('o') } })
    await prisma.mensagem.createMany({
      data: Array.from({ length: 60 }, () => ({ conversaId: c.id, papel: 'user', conteudo: 'oi', criadoEm: new Date(Date.now() - 3 * 86_400_000) })),
    })
    const r = await postar({ visitanteId: visitante('o'), conversaId: c.id, mensagem: 'Oi' })
    expect(r.status).toBe(429)
    expect(r.headers.get('retry-after')).toBeNull()
    expect(((await r.json()) as { codigo: string }).codigo).toBe('conversa_cheia')
  })
})

describe('Origin (PR-58)', () => {
  it('a da própria plataforma e a ausência passam; a de outro site dá 403 sem gravar', async () => {
    const propria = await postar({ visitanteId: visitante('p'), mensagem: 'Oi' }, { origem: servidor.base })
    expect(propria.status).toBe(200)
    await propria.text()
    const semOrigem = await postar({ visitanteId: visitante('p'), mensagem: 'Oi' })
    expect(semOrigem.status).toBe(200)
    await semOrigem.text()
    const antes = await prisma.conversa.count()
    const fora = await postar({ visitanteId: visitante('q'), mensagem: 'Oi' }, { origem: 'https://atacante.com' })
    expect(fora.status).toBe(403)
    expect(await fora.text()).not.toMatch(SEGREDOS)
    expect(await prisma.conversa.count()).toBe(antes)
  })

  it('o pré-voo de outro site não recebe permissão de CORS', async () => {
    const r = await fetch(`${servidor.base}/api/publico/agentes/${agenteId}/conversar`, {
      method: 'OPTIONS',
      headers: { Origin: 'https://atacante.com', 'Access-Control-Request-Method': 'POST' },
    })
    expect(r.headers.get('access-control-allow-origin')).toBeNull()
  })
})
