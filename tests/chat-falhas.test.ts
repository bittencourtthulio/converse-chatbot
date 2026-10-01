import { describe, it, expect, beforeEach, afterEach, vi, type MockInstance } from 'vitest'
import { prisma } from '@/lib/prisma'
import { salvarChaveDoOpenrouter } from '@/servicos/integracoes'
import { mensagemParaOperador, mensagemParaVisitante } from '@/servicos/chat'
import { limparBanco } from './ajuda'
import { iniciarOpenRouterFalso, type OpenRouterFalso } from './apoio/openrouter-falso'
import { cenarioDeChat, coletar, responderMensagem } from './apoio/chat'

let falso: OpenRouterFalso
const baseOriginal = process.env.OPENROUTER_BASE_URL
let erros: MockInstance<typeof console.error>

beforeEach(async () => {
  await limparBanco()
  falso = await iniciarOpenRouterFalso({ trechos: ['um ', 'dois ', 'tres ', 'quatro'] })
  process.env.OPENROUTER_BASE_URL = falso.url
  erros = vi.spyOn(console, 'error').mockImplementation(() => undefined)
})
afterEach(async () => {
  erros.mockRestore()
  vi.restoreAllMocks()
  await falso.fechar()
  if (baseOriginal === undefined) delete process.env.OPENROUTER_BASE_URL
  else process.env.OPENROUTER_BASE_URL = baseOriginal
})

const logado = () => erros.mock.calls.map((c: unknown[]) => c.map(String).join(' '))

async function turno(mensagem = 'Qual é o segredo do cofre 4242?') {
  const { admin, agente } = await cenarioDeChat()
  const r = await coletar(
    responderMensagem({ agenteId: agente.id, canal: 'painel', criadoPorId: admin.id, mensagem }),
  )
  return { admin, agente, ...r }
}

describe('falha do provedor', () => {
  it('chave recusada: código provedor_chave_invalida, mensagem do operador sem o corpo do provedor', async () => {
    const { admin, agente } = await cenarioDeChat()
    await salvarChaveDoOpenrouter(admin, { chave: 'sk-or-v1-chave-que-o-falso-nao-aceita' })
    const { eventos, erro } = await coletar(
      responderMensagem({ agenteId: agente.id, canal: 'painel', criadoPorId: admin.id, mensagem: 'Oi' }),
    )
    expect(erro).toMatchObject({ status: 502, codigo: 'provedor_chave_invalida' })
    const texto = mensagemParaOperador(erro).mensagem
    expect(texto).toMatch(/chave/i)
    expect(texto).not.toContain('No auth credentials found')
    expect(texto).not.toContain('sk-or-v1-chave-que-o-falso-nao-aceita')
    expect(mensagemParaVisitante(erro)).toBe('Não consegui responder agora. Tente novamente em instantes.')
    expect(eventos.map((e) => e.tipo)).toEqual(['inicio'])
    // a pergunta fica gravada; a resposta não existe
    expect((await prisma.mensagem.findMany()).map((m) => m.papel)).toEqual(['user'])
  })

  it.each([
    [402, 'provedor_sem_saldo', 'Insufficient credits'],
    [429, 'provedor_limite', 'Rate limit exceeded'],
    [503, 'provedor_indisponivel', 'No available model provider'],
  ])('status %i vira %s sem repassar "%s"', async (status, codigo, corpoDoFalso) => {
    falso.configurar({ erroHttp: status })
    const { erro } = await turno()
    expect(erro).toMatchObject({ codigo })
    expect(mensagemParaOperador(erro).mensagem).not.toContain(corpoDoFalso)
  })

  it('modelo que o provedor não conhece vira provedor_modelo_invalido', async () => {
    const { admin, agente } = await cenarioDeChat()
    await prisma.agente.update({ where: { id: agente.id }, data: { modelo: 'x/modelo-inexistente' } })
    const { erro } = await coletar(
      responderMensagem({ agenteId: agente.id, canal: 'painel', criadoPorId: admin.id, mensagem: 'Oi' }),
    )
    expect(erro).toMatchObject({ codigo: 'provedor_modelo_invalido' })
  })

  it('erro no meio do stream: entrega o que chegou, lança e não grava a resposta', async () => {
    falso.configurar({ erroNoMeioApos: 2 })
    const { eventos, erro } = await turno()
    expect(eventos.map((e) => e.tipo)).toEqual(['inicio', 'trecho', 'trecho'])
    expect(erro).toMatchObject({ status: 502 })
    expect((await prisma.mensagem.findMany()).map((m) => m.papel)).toEqual(['user'])
  })
})

describe('cancelamento', () => {
  it('abortar no meio termina sem erro, sem gravar a resposta e fecha a conexão com o provedor', async () => {
    falso.configurar({ intervaloEntreTrechosMs: 40 })
    const { admin, agente } = await cenarioDeChat()
    const controle = new AbortController()
    const eventos: string[] = []
    let erro: unknown
    try {
      for await (const e of responderMensagem({
        agenteId: agente.id,
        canal: 'painel',
        criadoPorId: admin.id,
        mensagem: 'Oi',
        sinal: controle.signal,
      })) {
        eventos.push(e.tipo)
        if (e.tipo === 'trecho') controle.abort()
      }
    } catch (e) {
      erro = e
    }
    expect(erro).toBeUndefined()
    expect(eventos).not.toContain('fim')
    expect((await prisma.mensagem.findMany()).map((m) => m.papel)).toEqual(['user'])
    for (let i = 0; i < 40 && falso.cancelamentos === 0; i += 1) await new Promise((r) => setTimeout(r, 25))
    expect(falso.cancelamentos).toBeGreaterThanOrEqual(1)
    expect(logado()).toEqual([])
  })

  it('sinal já abortado não chama o provedor nem registra erro', async () => {
    const { admin, agente } = await cenarioDeChat()
    const controle = new AbortController()
    controle.abort()
    const { erro } = await coletar(
      responderMensagem({
        agenteId: agente.id,
        canal: 'painel',
        criadoPorId: admin.id,
        mensagem: 'Oi',
        sinal: controle.signal,
      }),
    )
    expect(erro).toBeUndefined()
    expect(logado()).toEqual([])
  })
})

describe('log com correlação e sem conteúdo', () => {
  it('falha do provedor grava uma linha JSON com correlação e código, sem a mensagem nem a chave', async () => {
    falso.configurar({ erroHttp: 402 })
    await turno('Qual é o segredo do cofre 4242?')
    const linhas = logado()
    expect(linhas).toHaveLength(1)
    const registro = JSON.parse(linhas[0]!)
    expect(registro).toMatchObject({ nivel: 'erro', msg: 'chat_erro', codigo: 'provedor_sem_saldo' })
    expect(registro.correlacao).toMatch(/^[0-9a-f]{8}$/)
    expect(registro.agenteId).toBeTruthy()
    expect(registro.conversaId).toBeTruthy()
    expect(linhas[0]).not.toContain('cofre')
    expect(linhas[0]).not.toContain('4242')
    expect(linhas[0]).not.toContain('sk-or')
  })

  it('erro inesperado vira 500 com o mesmo código de referência do log, sem o texto do erro', async () => {
    const { admin, agente } = await cenarioDeChat()
    vi.spyOn(prisma.agente, 'findUnique').mockRejectedValueOnce(
      new Error('SELECT segredo FROM tabela WHERE senha=hunter2'),
    )
    const { erro } = await coletar(
      responderMensagem({ agenteId: agente.id, canal: 'painel', criadoPorId: admin.id, mensagem: 'Oi' }),
    )
    expect(erro).toMatchObject({ status: 500, codigo: 'erro_inesperado' })
    const mensagem = (erro as Error).message
    expect(mensagem).toMatch(/Código de referência: [0-9a-f]{8}/)
    expect(mensagem).not.toContain('hunter2')
    const registro = JSON.parse(logado()[0]!)
    expect(mensagem).toContain(registro.correlacao)
    expect(logado()[0]).not.toContain('hunter2')
    expect(logado()[0]).not.toContain('SELECT')
  })

  it('erro de validação, agente inexistente e falta de chave não vão ao log', async () => {
    const { agente } = await cenarioDeChat({ comChave: false })
    await coletar(responderMensagem({ agenteId: agente.id, canal: 'painel', mensagem: '' }))
    await coletar(responderMensagem({ agenteId: 'nada', canal: 'painel', mensagem: 'Oi' }))
    await coletar(responderMensagem({ agenteId: agente.id, canal: 'painel', mensagem: 'Oi' }))
    expect(logado()).toEqual([])
  })
})
