import { describe, it, expect, vi } from 'vitest'
import { ErroDeAplicacao, erroDoProvedor } from '@/lib/erros'
import type { EventoDoChat } from '@/servicos/chat'
import { fluxoDeEventos, formatarEvento } from '@/app/eventos-sse'
import { MENSAGEM_PARA_VISITANTE } from '@/servicos/chat-erros'
import { quadroDeErroParaVisitante } from '@/servicos/chat-publico'

async function* gerar(eventos: EventoDoChat[], erro?: unknown): AsyncGenerator<EventoDoChat> {
  for (const e of eventos) yield e
  if (erro !== undefined) throw erro
}

async function ler(fluxo: ReadableStream<Uint8Array>): Promise<string> {
  const leitor = fluxo.getReader()
  const decodificador = new TextDecoder()
  let texto = ''
  for (;;) {
    const { done, value } = await leitor.read()
    if (done) return texto
    texto += decodificador.decode(value, { stream: true })
  }
}

/** Separa o texto SSE em [evento, dados já convertidos de JSON]. */
function eventosDe(texto: string): Array<[string, unknown]> {
  return texto
    .split('\n\n')
    .filter((bloco) => bloco.trim() !== '')
    .map((bloco) => {
      const linhas = bloco.split('\n')
      const nome = linhas.find((l) => l.startsWith('event: '))!.slice(7)
      const dados = linhas.filter((l) => l.startsWith('data: ')).map((l) => l.slice(6)).join('\n')
      return [nome, JSON.parse(dados)]
    })
}

describe('formatarEvento', () => {
  it('escreve event, data em uma linha e a linha em branco final', () => {
    expect(formatarEvento('trecho', { texto: 'oi' })).toBe('event: trecho\ndata: {"texto":"oi"}\n\n')
  })

  it('quebras de linha e aspas do texto sobrevivem, sem quebrar o quadro do evento', () => {
    const texto = 'linha 1\n\nlinha "2"\r\nfim'
    const quadro = formatarEvento('trecho', { texto })
    expect(quadro.match(/\n\n/g)).toHaveLength(1)
    expect(eventosDe(quadro)).toEqual([['trecho', { texto }]])
  })
})

describe('fluxoDeEventos com fontes (FT-05)', () => {
  const fontes = [
    { fonteId: 'f1', titulo: 'Política', citada: true, trechos: [{ n: 1, posicao: 1, trechoTexto: 'Troca em sete dias.' }] },
  ]

  it('trecho, fontes e fim saem nessa ordem e só o fim encerra o fluxo', async () => {
    const texto = await ler(
      fluxoDeEventos(
        gerar([
          { tipo: 'inicio', conversaId: 'c1' },
          { tipo: 'trecho', texto: 'Sete dias [1].' },
          { tipo: 'fontes', fontes },
          { tipo: 'fim', conversaId: 'c1', mensagemId: 'm1', tamanho: 14 },
        ]),
      ),
    )
    expect(eventosDe(texto)).toEqual([
      ['trecho', { texto: 'Sete dias [1].' }],
      ['fontes', { fontes }],
      ['fim', { conversaId: 'c1', mensagemId: 'm1', tamanho: 14 }],
    ])
  })

  it('o evento fontes não é tratado como fim: o que vem depois ainda é lido', async () => {
    const texto = await ler(
      fluxoDeEventos(gerar([{ tipo: 'fontes', fontes }, { tipo: 'fim', conversaId: 'c1', mensagemId: 'm1', tamanho: 0 }])),
    )
    expect(eventosDe(texto).map(([nome]) => nome)).toEqual(['fontes', 'fim'])
  })

  it('erro depois das fontes ainda vira evento erro', async () => {
    const texto = await ler(fluxoDeEventos(gerar([{ tipo: 'fontes', fontes }], new ErroDeAplicacao('falhou', 500, 'x'))))
    expect(eventosDe(texto).map(([nome]) => nome)).toEqual(['fontes', 'erro'])
  })
})

describe('fluxoDeEventos', () => {
  it('trecho e fim viram eventos e o fim encerra o fluxo', async () => {
    const texto = await ler(
      fluxoDeEventos(
        gerar([
          { tipo: 'trecho', texto: 'Olá' },
          { tipo: 'trecho', texto: ', mundo' },
          { tipo: 'fim', conversaId: 'c1', mensagemId: 'm1', tamanho: 9 },
        ]),
      ),
    )
    expect(eventosDe(texto)).toEqual([
      ['trecho', { texto: 'Olá' }],
      ['trecho', { texto: ', mundo' }],
      ['fim', { conversaId: 'c1', mensagemId: 'm1', tamanho: 9 }],
    ])
  })

  it('o evento inicio não vai ao navegador (o id segue no cabeçalho)', async () => {
    const texto = await ler(
      fluxoDeEventos(gerar([{ tipo: 'inicio', conversaId: 'c1' }, { tipo: 'trecho', texto: 'x' }])),
    )
    expect(eventosDe(texto).map(([nome]) => nome)).toEqual(['trecho'])
  })

  it('erro do gerador vira evento erro com a mensagem do operador e encerra', async () => {
    const texto = await ler(
      fluxoDeEventos(gerar([{ tipo: 'trecho', texto: 'parcial' }], erroDoProvedor(402))),
    )
    const eventos = eventosDe(texto)
    expect(eventos[0]).toEqual(['trecho', { texto: 'parcial' }])
    const [nome, dados] = eventos[1] as [string, { codigo: string; mensagem: string }]
    expect(nome).toBe('erro')
    expect(dados.codigo).toBe('provedor_sem_saldo')
    expect(dados.mensagem).toMatch(/saldo/i)
    expect(eventos).toHaveLength(2)
  })

  it('erro que não é de aplicação vira código de referência, sem o texto do erro', async () => {
    const texto = await ler(fluxoDeEventos(gerar([], new Error('SELECT * FROM segredo'))))
    const eventos = eventosDe(texto) as Array<[string, { codigo: string; mensagem: string }]>
    const [nome, dados] = eventos[0]!
    expect(nome).toBe('erro')
    expect(dados.codigo).toBe('erro_inesperado')
    expect(dados.mensagem).toMatch(/referência/)
    expect(texto).not.toContain('SELECT')
  })

  it('erro de aplicação sem status de provedor mantém a própria mensagem', async () => {
    const texto = await ler(fluxoDeEventos(gerar([], new ErroDeAplicacao('Falhou assim.', 500, 'erro_x'))))
    expect(eventosDe(texto)).toEqual([['erro', { codigo: 'erro_x', mensagem: 'Falhou assim.' }]])
  })

  it('cancelar a leitura aborta o gerador', async () => {
    let encerrado = false
    async function* longo(): AsyncGenerator<EventoDoChat> {
      try {
        for (let i = 0; i < 100; i += 1) {
          yield { tipo: 'trecho', texto: String(i) }
          await new Promise((r) => setTimeout(r, 5))
        }
      } finally {
        encerrado = true
      }
    }
    const leitor = fluxoDeEventos(longo()).getReader()
    await leitor.read()
    await leitor.cancel()
    for (let i = 0; i < 20 && !encerrado; i += 1) await new Promise((r) => setTimeout(r, 10))
    expect(encerrado).toBe(true)
  })
})

describe('fluxoDeEventos com mapeador de erro (FT-06, PR-56)', () => {
  it('com mapeador público o erro do provedor vira a frase do visitante, sem saldo nem correlação', async () => {
    const texto = await ler(
      fluxoDeEventos(gerar([{ tipo: 'trecho', texto: 'parcial' }], erroDoProvedor(402)), {
        mapearErro: quadroDeErroParaVisitante,
      }),
    )
    const eventos = eventosDe(texto)
    expect(eventos[1]).toEqual(['erro', { codigo: 'indisponivel', mensagem: MENSAGEM_PARA_VISITANTE }])
    expect(texto).not.toMatch(/saldo|provedor_|correlacao|OpenRouter/i)
  })

  it('erro inesperado com mapeador público não grava log com correlação nem vaza o texto', async () => {
    const espiao = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const texto = await ler(
      fluxoDeEventos(gerar([], new Error('SELECT * FROM segredo')), { mapearErro: quadroDeErroParaVisitante }),
    )
    expect(eventosDe(texto)).toEqual([['erro', { codigo: 'indisponivel', mensagem: MENSAGEM_PARA_VISITANTE }]])
    expect(texto).not.toContain('SELECT')
    espiao.mockRestore()
  })

  it('o mapeador recebe o erro original', async () => {
    const recebidos: unknown[] = []
    const erro = new Error('x')
    await ler(
      fluxoDeEventos(gerar([], erro), {
        mapearErro: (e) => {
          recebidos.push(e)
          return { codigo: 'c', mensagem: 'm' }
        },
      }),
    )
    expect(recebidos).toEqual([erro])
  })

  it('sem mapeador o comportamento do painel não mudou', async () => {
    const texto = await ler(fluxoDeEventos(gerar([], erroDoProvedor(402))))
    const [nome, dados] = eventosDe(texto)[0] as [string, { codigo: string }]
    expect(nome).toBe('erro')
    expect(dados.codigo).toBe('provedor_sem_saldo')
  })
})
