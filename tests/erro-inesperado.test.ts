/**
 * Erro inesperado na camada de apresentação (FT-11, PR-93): rota de API, ação de servidor e fluxo
 * SSE devolvem o código de referência (a correlação da requisição) e a mensagem genérica, e gravam
 * no log só o nome do erro, nunca a mensagem, a pilha nem o objeto.
 */
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { ErroDeAplicacao } from '../src/lib/erros.js'

const CORRELACAO = 'abcd1234'
const SEGREDO_DO_ERRO = 'segredo-xyz-que-nao-pode-vazar'

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-correlacao': 'abcd1234' }),
  cookies: async () => ({ get: () => undefined, set: () => undefined, delete: () => undefined }),
}))
vi.mock('next/navigation', () => ({ redirect: () => undefined }))
vi.mock('next/cache', () => ({ revalidatePath: () => undefined }))
vi.mock('@/app/sessao-servidor', () => ({
  exigirUsuario: async () => ({ id: 'u1', nome: 'Maria', email: 'maria@exemplo.local', papel: 'admin' }),
  exigirUsuarioAdmin: async () => ({ id: 'u1', nome: 'Maria', email: 'maria@exemplo.local', papel: 'admin' }),
  usuarioAtual: async () => null,
  gravarCookieDeSessao: async () => undefined,
  apagarCookieDeSessao: async () => undefined,
}))
vi.mock('@/servicos/perfil', () => ({
  atualizarPerfil: vi.fn(async () => {
    throw new Error(SEGREDO_DO_ERRO)
  }),
  trocarSenha: vi.fn(),
}))
vi.mock('@/servicos/integracoes', () => ({
  salvarChaveDoOpenrouter: vi.fn(async () => {
    throw new Error(SEGREDO_DO_ERRO)
  }),
  removerChaveDoOpenrouter: vi.fn(),
  salvarModeloDeTranscricao: vi.fn(),
  testarConexaoDoOpenrouter: vi.fn(),
}))

let erro: MockInstance<typeof console.error>
beforeEach(() => {
  erro = vi.spyOn(console, 'error').mockImplementation(() => undefined)
})
afterEach(() => vi.restoreAllMocks())

const linhasDeErro = () => erro.mock.calls.map((c) => JSON.parse(String((c as unknown as [string])[0])) as Record<string, unknown>)
const formulario = (campos: Record<string, string>) => {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) f.set(k, v)
  return f
}

describe('rotas de API', () => {
  it.each([
    ['conversas', async () => (await import('../src/app/api/conversas/resposta.js')).erroEmJson],
    ['fontes', async () => (await import('../src/app/api/agentes/[id]/fontes/resposta.js')).erroEmJson],
  ])('%s: erro inesperado devolve 500 com o código de referência e o X-Correlacao, e grava só o nome do erro', async (rota, obter) => {
    const erroEmJson = await obter()
    const resposta = await erroEmJson(new Error(SEGREDO_DO_ERRO))
    expect(resposta.status).toBe(500)
    expect(resposta.headers.get('X-Correlacao')).toBe(CORRELACAO)
    expect(resposta.headers.get('Cache-Control')).toBe('no-store')
    const corpo = (await resposta.json()) as Record<string, string>
    expect(corpo.codigo).toBe('erro_inesperado')
    expect(corpo.mensagem).toBe(`Não foi possível concluir. Código de referência: ${CORRELACAO}.`)
    expect(JSON.stringify(corpo)).not.toContain(SEGREDO_DO_ERRO)

    const linhas = linhasDeErro()
    expect(linhas).toHaveLength(1)
    expect(linhas[0]).toMatchObject({ nivel: 'erro', msg: 'erro_inesperado', rota, correlacao: CORRELACAO, erro: 'Error' })
    expect(JSON.stringify(linhas)).not.toContain(SEGREDO_DO_ERRO)
  })

  it('erro de aplicação mantém o status e a mensagem segura e não grava log de erro', async () => {
    const { erroEmJson } = await import('../src/app/api/conversas/resposta.js')
    const resposta = await erroEmJson(new ErroDeAplicacao('Conversa não encontrada.', 404, 'nao_encontrado'))
    expect(resposta.status).toBe(404)
    expect(await resposta.json()).toEqual({ codigo: 'nao_encontrado', mensagem: 'Conversa não encontrada.' })
    expect(erro).not.toHaveBeenCalled()
  })

  it('o erro público inesperado devolve a frase única do visitante e grava a linha com o nome do erro', async () => {
    const { erroPublico } = await import('../src/app/api/publico/resposta.js')
    const resposta = erroPublico(new Error(SEGREDO_DO_ERRO))
    expect(resposta.status).toBe(503)
    const corpo = JSON.stringify(await resposta.json())
    expect(corpo).not.toContain(SEGREDO_DO_ERRO)
    expect(corpo).not.toContain('Código de referência')
    const linha = linhasDeErro().find((l) => l.msg === 'erro_inesperado')!
    expect(linha).toMatchObject({ nivel: 'erro', rota: 'publico', erro: 'Error' })
    expect(JSON.stringify(linha)).not.toContain(SEGREDO_DO_ERRO)
  })
})

describe('ações de servidor', () => {
  it('erro inesperado devolve a mensagem com o código de referência da requisição e grava só o nome', async () => {
    const { salvarPerfil } = await import('../src/app/acoes.js')
    const r = await salvarPerfil({}, formulario({ nome: 'Maria', email: 'maria@exemplo.local' }))
    expect(r.erro).toBe(`Não foi possível concluir. Código de referência: ${CORRELACAO}.`)
    const linhas = linhasDeErro()
    expect(linhas).toHaveLength(1)
    expect(linhas[0]).toMatchObject({ nivel: 'erro', msg: 'erro_inesperado_na_acao', correlacao: CORRELACAO, erro: 'Error' })
    expect(JSON.stringify(linhas)).not.toContain(SEGREDO_DO_ERRO)
  })

  it('a ação que lida com segredo grava só o nome do erro e devolve o mesmo código', async () => {
    const { salvarChaveOpenrouter } = await import('../src/app/acoes.js')
    const r = await salvarChaveOpenrouter({}, formulario({ chave: 'valor-da-chave-que-nao-pode-vazar' }))
    expect(r.erro).toBe(`Não foi possível concluir. Código de referência: ${CORRELACAO}.`)
    expect(JSON.stringify(erro.mock.calls)).not.toContain('valor-da-chave-que-nao-pode-vazar')
    expect(JSON.stringify(erro.mock.calls)).not.toContain(SEGREDO_DO_ERRO)
  })
})

describe('fluxo SSE', () => {
  it('erro inesperado no gerador vira o evento erro com a correlação e o log com o nome do erro', async () => {
    const { fluxoDeEventos } = await import('../src/app/eventos-sse.js')
    async function* falha(): AsyncGenerator<never> {
      throw new Error(SEGREDO_DO_ERRO)
    }
    const leitor = fluxoDeEventos(falha() as never).getReader()
    let texto = ''
    for (;;) {
      const { value, done } = await leitor.read()
      if (done) break
      texto += new TextDecoder().decode(value)
    }
    const dados = JSON.parse(/data: (.*)\n/.exec(texto)![1]!) as Record<string, string>
    expect(dados.correlacao).toMatch(/^[0-9a-f]{8}$/)
    expect(dados.mensagem).toContain(`Código de referência: ${dados.correlacao}`)
    expect(texto).not.toContain(SEGREDO_DO_ERRO)
    const linha = linhasDeErro().find((l) => l.msg === 'chat_erro_no_fluxo')!
    expect(linha).toMatchObject({ nivel: 'erro', correlacao: dados.correlacao, erro: 'Error' })
    expect(JSON.stringify(linha)).not.toContain(SEGREDO_DO_ERRO)
  })
})
