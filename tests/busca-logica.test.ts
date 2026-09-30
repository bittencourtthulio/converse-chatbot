/**
 * Lógica do cartão "Testar busca" (FT-05, PR-54), sem React nem rede: validar a
 * pergunta, os quatro estados da tela e a pontuação.
 */
import { describe, it, expect } from 'vitest'
import {
  LIMITE_DA_PERGUNTA,
  estadoInicialDaBusca,
  formatarPontuacao,
  reduzirBusca,
  validarPergunta,
  type TrechoDaBusca,
} from '@/componentes/busca-logica'
import { LIMITE_DA_PERGUNTA_DA_BUSCA } from '@/servicos/recuperacao'

const TRECHO: TrechoDaBusca = {
  trechoId: 't1',
  fonteId: 'f1',
  titulo: 'Política',
  posicao: 2,
  texto: 'Troca em sete dias.',
  pontuacao: 1.23456,
}

describe('validarPergunta', () => {
  it('aceita texto de 1 a 500 caracteres e devolve a pergunta sem as pontas', () => {
    expect(validarPergunta('  Qual o prazo?  ')).toEqual({ ok: true, pergunta: 'Qual o prazo?' })
    expect(validarPergunta('a'.repeat(500)).ok).toBe(true)
  })

  it('recusa vazia, só espaços e acima do limite, com a mensagem da tela', () => {
    expect(validarPergunta('')).toEqual({ ok: false, erro: 'Escreva uma pergunta.' })
    expect(validarPergunta('   ')).toEqual({ ok: false, erro: 'Escreva uma pergunta.' })
    expect(validarPergunta('a'.repeat(501))).toEqual({ ok: false, erro: 'A pergunta pode ter até 500 caracteres.' })
  })

  it('o limite espelha o do serviço, que o cliente não importa', () => {
    expect(LIMITE_DA_PERGUNTA).toBe(LIMITE_DA_PERGUNTA_DA_BUSCA)
  })
})

describe('reduzirBusca: inicial, carregando, erro, vazio e resultado', () => {
  it('começa no estado inicial, sem resultado', () => {
    expect(estadoInicialDaBusca()).toEqual({ fase: 'inicial' })
  })

  it('buscar vai a carregando e limpa o erro e o resultado anteriores', () => {
    const antes = reduzirBusca(estadoInicialDaBusca(), { tipo: 'erro', mensagem: 'falhou' })
    expect(reduzirBusca(antes, { tipo: 'buscar', pergunta: 'troca' })).toEqual({ fase: 'carregando', pergunta: 'troca' })
  })

  it('o resultado com trechos guarda a pergunta e a lista', () => {
    const e = reduzirBusca({ fase: 'carregando', pergunta: 'troca' }, { tipo: 'resultado', trechos: [TRECHO] })
    expect(e).toEqual({ fase: 'resultado', pergunta: 'troca', trechos: [TRECHO] })
  })

  it('o resultado sem trechos é o estado vazio', () => {
    const e = reduzirBusca({ fase: 'carregando', pergunta: 'lua' }, { tipo: 'resultado', trechos: [] })
    expect(e).toEqual({ fase: 'vazio', pergunta: 'lua' })
  })

  it('o erro guarda a mensagem', () => {
    const e = reduzirBusca({ fase: 'carregando', pergunta: 'x' }, { tipo: 'erro', mensagem: 'Sem conexão.' })
    expect(e).toEqual({ fase: 'erro', mensagem: 'Sem conexão.' })
  })

  it('resposta que chega fora de uma busca em curso é ignorada', () => {
    const inicial = estadoInicialDaBusca()
    expect(reduzirBusca(inicial, { tipo: 'resultado', trechos: [TRECHO] })).toBe(inicial)
    expect(reduzirBusca(inicial, { tipo: 'erro', mensagem: 'x' })).toBe(inicial)
  })
})

describe('formatarPontuacao', () => {
  it('usa duas casas com vírgula', () => {
    expect(formatarPontuacao(1.23456)).toBe('1,23')
    expect(formatarPontuacao(0)).toBe('0,00')
    expect(formatarPontuacao(12)).toBe('12,00')
  })

  it('pontuação minúscula não vira "0,00" enganoso: aparece em notação curta', () => {
    expect(formatarPontuacao(0.0000024)).toBe('< 0,01')
  })
})
