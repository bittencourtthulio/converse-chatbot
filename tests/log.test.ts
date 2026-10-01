/**
 * O log estruturado (FT-11, PR-92): uma linha JSON por evento, nível mínimo por LOG_LEVEL,
 * redação central de segredo e de texto de conversa, e correlação por contexto. O teste injeta
 * valores sensíveis de todo tipo e prova que nenhum chega à linha.
 */
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { camposDoErro, comCorrelacao, correlacaoAtual, log, novaCorrelacao, redigir } from '../src/lib/log.js'
import { ErroDeAplicacao } from '../src/lib/erros.js'

let erro: MockInstance<typeof console.error>
let aviso: MockInstance<typeof console.warn>
let info: MockInstance<typeof console.info>
let debug: MockInstance<typeof console.debug>
const nivelOriginal = process.env.LOG_LEVEL

beforeEach(() => {
  delete process.env.LOG_LEVEL
  erro = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  aviso = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  info = vi.spyOn(console, 'info').mockImplementation(() => undefined)
  debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined)
})
afterEach(() => {
  vi.restoreAllMocks()
  if (nivelOriginal === undefined) delete process.env.LOG_LEVEL
  else process.env.LOG_LEVEL = nivelOriginal
})

const linhaDe = (espiao: MockInstance<(...args: never[]) => void>): Record<string, unknown> => {
  expect(espiao).toHaveBeenCalledTimes(1)
  const [texto] = espiao.mock.calls[0] as unknown as [string]
  expect(typeof texto).toBe('string')
  expect(texto).not.toContain('\n')
  return JSON.parse(texto) as Record<string, unknown>
}

describe('formato e níveis', () => {
  it('cada nível escreve uma única linha JSON pelo console do nível, com nivel, quando, msg e os campos', () => {
    process.env.LOG_LEVEL = 'debug'
    log.debug('evento_debug', { a: 1 })
    log.info('evento_info', { agenteId: 'ag1' })
    log.aviso('evento_aviso')
    log.erro('evento_erro', { codigo: 'x', total: 3 })

    expect(linhaDe(debug)).toMatchObject({ nivel: 'debug', msg: 'evento_debug', a: 1 })
    expect(linhaDe(info)).toMatchObject({ nivel: 'info', msg: 'evento_info', agenteId: 'ag1' })
    expect(linhaDe(aviso)).toMatchObject({ nivel: 'aviso', msg: 'evento_aviso' })
    const e = linhaDe(erro)
    expect(e).toMatchObject({ nivel: 'erro', msg: 'evento_erro', codigo: 'x', total: 3 })
    expect(new Date(e.quando as string).toISOString()).toBe(e.quando)
  })

  it('abaixo do nível de LOG_LEVEL não escreve nada e o padrão é info', () => {
    log.debug('some')
    expect(debug).not.toHaveBeenCalled()
    log.info('aparece')
    expect(info).toHaveBeenCalledTimes(1)

    process.env.LOG_LEVEL = 'aviso'
    log.info('some')
    expect(info).toHaveBeenCalledTimes(1)
    log.aviso('aparece')
    log.erro('aparece')
    expect(aviso).toHaveBeenCalledTimes(1)
    expect(erro).toHaveBeenCalledTimes(1)

    process.env.LOG_LEVEL = 'erro'
    log.aviso('some')
    expect(aviso).toHaveBeenCalledTimes(1)
  })

  it('LOG_LEVEL inválido não derruba o log: volta ao padrão info', () => {
    process.env.LOG_LEVEL = 'barulhento'
    expect(() => log.info('segue')).not.toThrow()
    expect(info).toHaveBeenCalledTimes(1)
  })

  it('campos reservados não sobrescrevem nivel, quando e msg', () => {
    log.info('verdadeira', { nivel: 'erro', quando: 'ontem', msg: 'falsa' })
    expect(linhaDe(info)).toMatchObject({ nivel: 'info', msg: 'verdadeira' })
  })

  it('nunca lança, nem com campo circular, BigInt ou getter que falha', () => {
    const circular: Record<string, unknown> = {}
    circular.eu = circular
    const armadilha = {
      get ruim(): string {
        throw new Error('getter')
      },
    }
    expect(() => log.erro('x', { circular, grande: BigInt(10), armadilha })).not.toThrow()
    expect(erro).toHaveBeenCalledTimes(1)
  })
})

describe('redação central', () => {
  // Montados na hora: o formato é o de cada provedor, mas nenhum valor existe no repositório.
  const SEGREDOS = [
    ['sk', 'or', 'v1', 'abcdef0123456789abcdef0123456789'].join('-'),
    ['v1', 'AAAAAAAAAAAAAAAA', 'BBBBBBBBBBBBBBBBBBBB', 'CCCCCCCCCCCCCCCC'].join(':'),
    ['123456789', 'AAEhBOweik6ad9r_QXMENQjcrGbqCr4K-bs'].join(':'),
    ['eyJhbGciOiJIUzI1NiJ9', 'eyJzdWIiOiIxMjM0NTY3ODkwIn0', 'abc123def456'].join('.'),
    ['Bearer', 'abcdefghijklmnopqrstuvwxyz0123456789'].join(' '),
  ]

  it('valor de chave sensível sai oculto, qualquer que seja o valor', () => {
    log.erro('x', {
      senha: 'minha-senha-123',
      password: 'hunter2hunter2',
      senhaHash: '$2a$10$abcdefghijklmnopqrstuv',
      token: 'abc',
      tokenCifrado: 'cifrado-xxxx',
      chave: 'k',
      apiKey: 'k2',
      authorization: 'valor-do-cabecalho-zzzzzzzzzzzz',
      cookie: 'sessao=abc',
      secret: 's',
      segredoDoWebhook: 'w',
      aninhado: { senha: 'x', ok: 'visivel' },
    })
    const l = linhaDe(erro)
    const texto = JSON.stringify(l)
    for (const proibido of ['minha-senha-123', 'hunter2hunter2', '$2a$10$', 'sessao=abc', 'zzzzzzzzzzzz']) {
      expect(texto).not.toContain(proibido)
    }
    expect(l.senha).toBe('[oculto]')
    expect(l.authorization).toBe('[oculto]')
    expect(l.aninhado).toEqual({ senha: '[oculto]', ok: 'visivel' })
  })

  it('texto de mensagem de conversa sai oculto', () => {
    log.info('x', { conteudo: 'Meu CPF é 123.456.789-00', texto: 'olá', mensagem: 'oi', pergunta: 'qual?', resposta: 'sim', prompt: 'p', trechoTexto: 'trecho' })
    const l = linhaDe(info)
    for (const chave of ['conteudo', 'texto', 'mensagem', 'pergunta', 'resposta', 'prompt', 'trechoTexto']) {
      expect(l[chave], chave).toBe('[oculto]')
    }
    expect(JSON.stringify(l)).not.toContain('123.456.789-00')
  })

  it('valor com cara de segredo é ocultado mesmo numa chave inocente', () => {
    for (const segredo of SEGREDOS) {
      log.info('x', { detalhe: `falhou com ${segredo} no meio`, outro: segredo, lista: [segredo] })
    }
    expect(info).toHaveBeenCalledTimes(SEGREDOS.length)
    for (const chamada of info.mock.calls) {
      const texto = chamada[0] as string
      for (const segredo of SEGREDOS) expect(texto).not.toContain(segredo)
      expect(texto).toContain('[oculto]')
    }
  })

  it('e-mail sai mascarado, na chave email e dentro de um texto', () => {
    log.info('x', { email: 'maria.souza@empresa.com.br', nota: 'contato: joao@exemplo.org, obrigado' })
    const l = linhaDe(info)
    expect(l.email).toBe('m***@empresa.com.br')
    expect(l.nota).toBe('contato: j***@exemplo.org, obrigado')
    expect(JSON.stringify(l)).not.toContain('maria.souza')
    expect(JSON.stringify(l)).not.toContain('joao@')
  })

  it('um Error sai só com o nome e o código, nunca a mensagem nem a pilha', () => {
    const e = new Error(`falhou com ${SEGREDOS[0]} e senha=123`)
    log.erro('x', { erro: e, causa: new ErroDeAplicacao('mensagem segura do usuário', 409, 'conflito') })
    const l = linhaDe(erro)
    expect(l.erro).toEqual({ nome: 'Error' })
    expect(l.causa).toEqual({ nome: 'ErroDeAplicacao', codigo: 'conflito' })
    const texto = JSON.stringify(l)
    expect(texto).not.toContain('falhou com')
    expect(texto).not.toContain('mensagem segura')
    expect(texto).not.toContain('at ')
    expect(texto).not.toContain('node_modules')
  })

  it('camposDoErro devolve o nome e o código para quem registra o erro de um catch', () => {
    expect(camposDoErro(new TypeError('x'))).toEqual({ erro: 'TypeError' })
    expect(camposDoErro(new ErroDeAplicacao('m', 500, 'cod'))).toEqual({ erro: 'ErroDeAplicacao', codigo: 'cod' })
    expect(camposDoErro('texto solto com segredo')).toEqual({ erro: 'desconhecido' })
  })

  it('limita a profundidade, o tamanho das listas e o tamanho dos textos', () => {
    const fundo = { a: { b: { c: { d: { e: { f: 1 } } } } } }
    const longo = 'x'.repeat(2000)
    const lista = Array.from({ length: 100 }, (_, i) => i)
    const r = redigir({ fundo, longo, lista }) as Record<string, unknown>
    expect(JSON.stringify(r.fundo)).toContain('[fundo]')
    expect((r.longo as string).length).toBeLessThan(600)
    expect((r.lista as unknown[]).length).toBeLessThanOrEqual(21)
  })
})

describe('correlação', () => {
  it('novaCorrelacao gera 8 caracteres hexadecimais diferentes a cada chamada', () => {
    const a = novaCorrelacao()
    expect(a).toMatch(/^[0-9a-f]{8}$/)
    expect(novaCorrelacao()).not.toBe(a)
  })

  it('dentro de comCorrelacao a linha leva o campo correlacao e fora dele não', () => {
    log.info('fora')
    expect(linhaDe(info).correlacao).toBeUndefined()
    info.mockClear()

    const resultado = comCorrelacao('abc12345', () => {
      expect(correlacaoAtual()).toBe('abc12345')
      log.info('dentro')
      return 42
    })
    expect(resultado).toBe(42)
    expect(linhaDe(info).correlacao).toBe('abc12345')
    expect(correlacaoAtual()).toBeUndefined()
  })

  it('a correlação atravessa await e timers e um contexto de dentro não vaza para o de fora', async () => {
    await Promise.all([
      comCorrelacao('aaaaaaaa', async () => {
        await new Promise((r) => setTimeout(r, 10))
        expect(correlacaoAtual()).toBe('aaaaaaaa')
      }),
      comCorrelacao('bbbbbbbb', async () => {
        await new Promise((r) => setTimeout(r, 5))
        expect(correlacaoAtual()).toBe('bbbbbbbb')
      }),
    ])
  })

  it('a correlação passada como campo vale mais que a do contexto', () => {
    comCorrelacao('contexto1', () => log.info('x', { correlacao: 'explicita' }))
    expect(linhaDe(info).correlacao).toBe('explicita')
  })
})
