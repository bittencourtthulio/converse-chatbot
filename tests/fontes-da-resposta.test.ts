/**
 * Fontes da resposta (FT-05, PR-53): agrupar os trechos consultados por fonte,
 * resumir o texto, detectar as citações [n] e ler com segurança o JSON gravado
 * em `Mensagem.fontes`. Funções puras.
 */
import { describe, it, expect } from 'vitest'
import {
  LIMITE_DO_RESUMO,
  citacoesNaResposta,
  lerFontesGravadas,
  montarFontes,
  serializarFontes,
} from '@/servicos/fontes-da-resposta'
import type { TrechoIncluido } from '@/servicos/chat-prompt'

const incluido = (n: number, fonteId: string, titulo: string, posicao: number, texto = `texto ${n}`): TrechoIncluido => ({
  n,
  trecho: { trechoId: `t${n}`, fonteId, titulo, posicao, texto, pontuacao: 1 },
})

const TRES = [
  incluido(1, 'fA', 'Política', 1),
  incluido(2, 'fB', 'Entrega', 4),
  incluido(3, 'fA', 'Política', 2),
]

describe('citacoesNaResposta', () => {
  it('acha [n] de um ou dois dígitos, sem repetir, e ignora o resto', () => {
    expect([...citacoesNaResposta('Veja [2] e [2], também [10]. Não [a], [123], [ 1 ] nem [1](http://x) (link não é citação).')]).toEqual([2, 10])
  })
})

describe('montarFontes', () => {
  it('uma entrada por fonte, na ordem do primeiro trecho, com os trechos dela', () => {
    const fontes = montarFontes(TRES, 'sem citação')
    expect(fontes.map((f) => f.fonteId)).toEqual(['fA', 'fB'])
    expect(fontes[0]!.trechos).toEqual([
      { n: 1, posicao: 1, trechoTexto: 'texto 1' },
      { n: 3, posicao: 2, trechoTexto: 'texto 3' },
    ])
    expect(fontes[1]!.titulo).toBe('Entrega')
  })

  it('só a fonte cujo trecho foi citado fica citada; número inexistente é ignorado', () => {
    const fontes = montarFontes(TRES, 'Veja [2] e [9].')
    expect(fontes.map((f) => [f.fonteId, f.citada])).toEqual([['fA', false], ['fB', true]])
  })

  it('citar qualquer trecho da fonte a marca como citada', () => {
    expect(montarFontes(TRES, 'Conforme [3].').map((f) => f.citada)).toEqual([true, false])
  })

  it('resposta sem colchetes deixa todas as fontes como não citadas', () => {
    expect(montarFontes(TRES, 'Aceitamos troca em sete dias.').every((f) => !f.citada)).toBe(true)
  })

  it('o trecho é resumido em até 300 caracteres, com espaços colapsados', () => {
    const [fonte] = montarFontes([incluido(1, 'fA', 'P', 1, `linha um\n\n   linha dois ${'x'.repeat(500)}`)], '')
    const resumo = fonte!.trechos[0]!.trechoTexto
    expect(LIMITE_DO_RESUMO).toBe(300)
    expect(resumo.length).toBeLessThanOrEqual(LIMITE_DO_RESUMO)
    expect(resumo.startsWith('linha um linha dois')).toBe(true)
    expect(resumo.endsWith('…')).toBe(true)
  })

  it('sem trechos, lista vazia', () => {
    expect(montarFontes([], 'x')).toEqual([])
  })
})

describe('serializar e ler o JSON gravado', () => {
  it('o que se grava volta igual', () => {
    const fontes = montarFontes(TRES, '[1]')
    expect(lerFontesGravadas(serializarFontes(fontes))).toEqual(fontes)
  })

  it.each([
    [null],
    [undefined],
    [''],
    ['json invalido'],
    ['{"a":1}'],
    ['[{"fonteId":1}]'],
    ['[{"fonteId":"f","titulo":"t","citada":true,"trechos":[{"n":"1"}]}]'],
  ])('%j vira lista vazia, sem lançar', (entrada) => {
    expect(lerFontesGravadas(entrada as string | null | undefined)).toEqual([])
  })

  it('descarta só o item inválido e guarda os bons', () => {
    const bom = montarFontes([incluido(1, 'fA', 'P', 1)], '')[0]!
    expect(lerFontesGravadas(JSON.stringify([bom, { fonteId: 5 }]))).toEqual([bom])
  })
})
