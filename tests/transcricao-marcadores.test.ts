/**
 * T-04.01 (FT-08): marcadores de tempo `[MM:SS]` no começo de cada parte da
 * transcrição e a montagem do texto das legendas do YouTube com um marcador a
 * cada cerca de 60 segundos (PR-74, PR-75). Funções puras.
 */
import { describe, it, expect } from 'vitest'
import { MARCADOR_SEM_FALA, ehSemFala, formatarMarcador, juntarPartes, montarTextoDeLegenda, trechoSoDeMarcadores } from '@/servicos/transcricao-marcadores'
import { dividirEmTrechos, normalizarTexto } from '@/servicos/trechos'

describe('formatarMarcador', () => {
  it('usa MM:SS abaixo de uma hora e H:MM:SS a partir dela', () => {
    expect(formatarMarcador(0)).toBe('[00:00]')
    expect(formatarMarcador(65)).toBe('[01:05]')
    expect(formatarMarcador(600)).toBe('[10:00]')
    expect(formatarMarcador(3599)).toBe('[59:59]')
    expect(formatarMarcador(3600)).toBe('[1:00:00]')
    expect(formatarMarcador(3725)).toBe('[1:02:05]')
  })

  it('valor negativo, fracionário ou inválido não quebra: vira o segundo inteiro mais próximo abaixo', () => {
    expect(formatarMarcador(-5)).toBe('[00:00]')
    expect(formatarMarcador(61.9)).toBe('[01:01]')
    expect(formatarMarcador(Number.NaN)).toBe('[00:00]')
  })
})

describe('juntarPartes', () => {
  it('três partes de 600 segundos geram [00:00], [10:00] e [20:00] separados por linha em branco', () => {
    const texto = juntarPartes([
      { inicioSegundos: 0, texto: 'primeira fala' },
      { inicioSegundos: 600, texto: 'segunda fala' },
      { inicioSegundos: 1200, texto: 'terceira fala' },
    ])
    expect(texto).toBe('[00:00] primeira fala\n\n[10:00] segunda fala\n\n[20:00] terceira fala')
  })

  it('o marcador da primeira parte sobrevive à divisão em trechos', () => {
    const longa = 'palavra '.repeat(400).trim()
    const texto = normalizarTexto(
      juntarPartes([
        { inicioSegundos: 0, texto: longa },
        { inicioSegundos: 600, texto: longa },
      ]),
    )
    const trechos = dividirEmTrechos(texto)
    expect(trechos.length).toBeGreaterThan(2)
    expect(trechos[0]!.startsWith('[00:00] ')).toBe(true)
    expect(trechos.some((t) => t.includes('[10:00]'))).toBe(true)
  })

  it('parte vazia ou só de espaços é ignorada, sem marcador, e o texto é aparado', () => {
    const texto = juntarPartes([
      { inicioSegundos: 0, texto: '  \n ' },
      { inicioSegundos: 600, texto: '  fala com espaços  \n' },
      { inicioSegundos: 1200, texto: '' },
    ])
    expect(texto).toBe('[10:00] fala com espaços')
    expect(juntarPartes([])).toBe('')
  })
})

describe('montarTextoDeLegenda', () => {
  const falas = [
    { inicio: 0, texto: 'Olá a todos.' },
    { inicio: 4, texto: 'Hoje vamos falar de reembolso.' },
    { inicio: 61, texto: 'O prazo é de trinta dias.' },
    { inicio: 130, texto: 'Obrigado.' },
  ]

  it('falas de 0 a 130 segundos recebem marcadores em 00:00, 01:00 e 02:00', () => {
    expect(montarTextoDeLegenda(falas)).toBe(
      '[00:00] Olá a todos. Hoje vamos falar de reembolso.\n\n[01:00] O prazo é de trinta dias.\n\n[02:00] Obrigado.',
    )
  })

  it('minuto sem fala não ganha marcador, a ordem vem do tempo e quebras de linha viram espaço', () => {
    const texto = montarTextoDeLegenda([
      { inicio: 185, texto: 'depois' },
      { inicio: 2, texto: 'linha um\nlinha   dois' },
    ])
    expect(texto).toBe('[00:00] linha um linha dois\n\n[03:00] depois')
  })

  it('texto vazio das falas é ignorado e sem falas o texto é vazio', () => {
    expect(montarTextoDeLegenda([{ inicio: 0, texto: '   ' }])).toBe('')
    expect(montarTextoDeLegenda([])).toBe('')
  })
})

describe('trecho sem fala (FT-13, PR-105)', () => {
  it('juntarPartes escreve o segmento sem fala com o marcador de tempo entre as falas e ignora o segmento vazio', () => {
    const texto = juntarPartes([
      { inicioSegundos: 0, texto: 'Olá' },
      { inicioSegundos: 600, texto: MARCADOR_SEM_FALA },
      { inicioSegundos: 1200, texto: 'Fim' },
      { inicioSegundos: 1800, texto: '   ' },
    ])
    expect(texto).toBe('[00:00] Olá\n\n[10:00] [sem fala]\n\n[20:00] Fim')
  })

  it('o marcador é o texto [sem fala] e ehSemFala só o reconhece sozinho', () => {
    expect(MARCADOR_SEM_FALA).toBe('[sem fala]')
    expect(ehSemFala('[sem fala]')).toBe(true)
    expect(ehSemFala('  [sem fala]\n')).toBe(true)
    expect(ehSemFala('[sem fala] e depois alguém falou')).toBe(false)
    expect(ehSemFala('')).toBe(false)
  })

  it('trechoSoDeMarcadores reconhece o trecho feito só de marcadores de tempo e [sem fala]', () => {
    expect(trechoSoDeMarcadores('[10:00] [sem fala]')).toBe(true)
    expect(trechoSoDeMarcadores('[10:00] [sem fala]\n\n[20:00] [sem fala]')).toBe(true)
    expect(trechoSoDeMarcadores('[1:00:00] [sem fala]')).toBe(true)
    expect(trechoSoDeMarcadores('[10:00] [sem fala] Oi')).toBe(false)
    expect(trechoSoDeMarcadores('[10:00]')).toBe(true)
    expect(trechoSoDeMarcadores('Texto qualquer')).toBe(false)
    expect(trechoSoDeMarcadores('')).toBe(true)
    // A sobreposição entre trechos corta marcador ao meio: fragmento no começo ou no fim não conta como palavra.
    expect(trechoSoDeMarcadores('fala]\n\n[20:00] [sem fala]\n\n[30:00] [sem')).toBe(true)
    expect(trechoSoDeMarcadores('sem fala]\n\n[20:00] [sem fala]')).toBe(true)
    expect(trechoSoDeMarcadores('00:00]\n\n[10:00] [sem fala]')).toBe(true)
    expect(trechoSoDeMarcadores('fala]\n\n[20:00] Olá')).toBe(false)
  })

  it('aplicado a dividirEmTrechos, descarta o trecho só de marcadores e mantém o que mistura fala', () => {
    const fala = 'palavra '.repeat(30).trim()
    const partes = [{ inicioSegundos: 0, texto: fala }]
    for (let i = 1; i <= 12; i += 1) partes.push({ inicioSegundos: 600 * i, texto: MARCADOR_SEM_FALA })
    const texto = normalizarTexto(juntarPartes(partes))
    // Trechos pequenos para o último cair só em marcadores (com o alvo de 1000 caracteres seriam precisos uns 50 trechos mudos seguidos).
    const trechos = dividirEmTrechos(texto, { alvo: 100, sobreposicao: 10 })
    const mantidos = trechos.filter((t) => !trechoSoDeMarcadores(t))
    expect(trechos.length).toBeGreaterThan(mantidos.length)
    expect(mantidos.length).toBeGreaterThan(0)
    expect(mantidos.join(' ')).toContain('palavra')
    // O trecho que mistura fala e marcador continua: o marcador sozinho não o descarta.
    expect(trechoSoDeMarcadores(`${fala.slice(0, 30)} [10:00] [sem fala]`)).toBe(false)
  })
})
