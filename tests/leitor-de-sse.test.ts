import { describe, it, expect } from 'vitest'
import { lerEventos, type EventoDoServidor } from '@/componentes/leitor-de-sse'
import { fluxoDeEventos, formatarEvento } from '@/app/eventos-sse'

const codificador = new TextEncoder()

function fluxoDe(pacotes: Array<string | Uint8Array>, erroNoFim?: Error): ReadableStream<Uint8Array> {
  let i = 0
  return new ReadableStream<Uint8Array>({
    pull(controle) {
      if (i < pacotes.length) {
        const p = pacotes[i++]!
        controle.enqueue(typeof p === 'string' ? codificador.encode(p) : p)
      } else if (erroNoFim) controle.error(erroNoFim)
      else controle.close()
    },
  })
}

async function coletar(
  corpo: ReadableStream<Uint8Array>,
  sinal?: AbortSignal,
): Promise<EventoDoServidor[]> {
  const eventos: EventoDoServidor[] = []
  for await (const e of lerEventos(corpo, sinal)) eventos.push(e)
  return eventos
}

const trecho = (texto: string) => formatarEvento('trecho', { texto })
const fim = formatarEvento('fim', { conversaId: 'c1', mensagemId: 'm1', tamanho: 3 })

describe('lerEventos', () => {
  it('lê trecho e fim na ordem', async () => {
    const eventos = await coletar(fluxoDe([trecho('Olá'), trecho(', mundo'), fim]))
    expect(eventos).toEqual([
      { tipo: 'trecho', texto: 'Olá' },
      { tipo: 'trecho', texto: ', mundo' },
      { tipo: 'fim', conversaId: 'c1', mensagemId: 'm1', tamanho: 3 },
    ])
  })

  it('lê o evento erro, com correlação quando vem', async () => {
    const erro = formatarEvento('erro', { codigo: 'provedor_sem_saldo', mensagem: 'Sem saldo.', correlacao: 'ab12cd34' })
    expect(await coletar(fluxoDe([erro]))).toEqual([
      { tipo: 'erro', codigo: 'provedor_sem_saldo', mensagem: 'Sem saldo.', correlacao: 'ab12cd34' },
    ])
  })

  it('junta um evento partido em dois pacotes, em qualquer ponto', async () => {
    const tudo = trecho('abc') + fim
    for (let corte = 1; corte < tudo.length; corte += 7) {
      const eventos = await coletar(fluxoDe([tudo.slice(0, corte), tudo.slice(corte)]))
      expect(eventos.map((e) => e.tipo)).toEqual(['trecho', 'fim'])
    }
  })

  it('junta uma letra UTF-8 partida no meio', async () => {
    const bytes = codificador.encode(trecho('ação é ✓') + fim)
    const meio = bytes.indexOf(0xc3) + 1 // entre os dois bytes de "ç"
    const eventos = await coletar(fluxoDe([bytes.slice(0, meio), bytes.slice(meio)]))
    expect(eventos[0]).toEqual({ tipo: 'trecho', texto: 'ação é ✓' })
  })

  it('aceita CRLF, comentários e eventos desconhecidos', async () => {
    const corpo = ': keep-alive\n\nevent: outro\ndata: {}\n\n' + trecho('ok').replace(/\n/g, '\r\n') + fim
    const eventos = await coletar(fluxoDe([corpo]))
    expect(eventos.map((e) => e.tipo)).toEqual(['trecho', 'fim'])
  })

  it('JSON inválido vira evento erro local e para', async () => {
    const eventos = await coletar(fluxoDe(['event: trecho\ndata: {quebrado\n\n', trecho('x')]))
    expect(eventos).toHaveLength(1)
    expect(eventos[0]).toMatchObject({ tipo: 'erro', codigo: 'resposta_invalida' })
  })

  it('carga com formato errado também é ilegível', async () => {
    const eventos = await coletar(fluxoDe([formatarEvento('trecho', { texto: 42 })]))
    expect(eventos[0]).toMatchObject({ tipo: 'erro', codigo: 'resposta_invalida' })
  })

  it('corpo que acaba sem fim nem erro devolve erro de conexão', async () => {
    const eventos = await coletar(fluxoDe([trecho('parcial')]))
    expect(eventos).toEqual([
      { tipo: 'trecho', texto: 'parcial' },
      expect.objectContaining({ tipo: 'erro', codigo: 'conexao_interrompida' }),
    ])
  })

  it('falha de rede no meio devolve erro de conexão; com o usuário tendo parado, fica em silêncio', async () => {
    const falha = await coletar(fluxoDe([trecho('a')], new Error('rede caiu')))
    expect(falha.at(-1)).toMatchObject({ tipo: 'erro', codigo: 'conexao_interrompida' })
    const controle = new AbortController()
    controle.abort()
    expect(await coletar(fluxoDe([trecho('a')], new Error('abortado')), controle.signal)).toEqual([
      { tipo: 'trecho', texto: 'a' },
    ])
  })

  it('lê o que o próprio servidor gera (contrato do formato SSE)', async () => {
    async function* servico() {
      yield { tipo: 'inicio' as const, conversaId: 'c9' }
      yield { tipo: 'trecho' as const, texto: 'linha 1\nlinha "2"' }
      yield { tipo: 'fim' as const, conversaId: 'c9', mensagemId: 'm9', tamanho: 16 }
    }
    const eventos = await coletar(fluxoDeEventos(servico()))
    expect(eventos).toEqual([
      { tipo: 'trecho', texto: 'linha 1\nlinha "2"' },
      { tipo: 'fim', conversaId: 'c9', mensagemId: 'm9', tamanho: 16 },
    ])
  })

  it('o módulo não usa fetch', async () => {
    const { readFileSync } = await import('node:fs')
    expect(readFileSync('src/componentes/leitor-de-sse.ts', 'utf8')).not.toMatch(/\bfetch\s*\(/)
  })
})
