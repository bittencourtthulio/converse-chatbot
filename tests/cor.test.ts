/**
 * T-01.03 (FT-06, PR-61): cor do agente. Contraste por luminância relativa
 * (WCAG), escolha do texto sobre a cor, validação do hex e amostras.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  AMOSTRAS_DE_COR,
  COR_PADRAO,
  FG_EM_COR_CLARA,
  FG_EM_COR_ESCURA,
  avisoDeBaixoContraste,
  corDoTextoSobre,
  hexParaRgb,
  normalizarCor,
  razaoDeContraste,
  rgbParaHex,
} from '@/lib/cor'

describe('normalizarCor', () => {
  it.each([
    ['#4F46E5', '#4f46e5'],
    ['#abc', '#aabbcc'],
    ['  #ABC  ', '#aabbcc'],
    ['#000000', '#000000'],
  ])('%s vira %s', (entrada, esperado) => {
    expect(normalizarCor(entrada)).toBe(esperado)
  })

  it.each(['azul', '4f46e5', '#12', '#12345', '#1234567', '#gggggg', 'rgb(1,2,3)', '', '#fff; x', null, 3])(
    'recusa %j',
    (entrada) => {
      expect(normalizarCor(entrada as string)).toBeNull()
    },
  )
})

describe('conversões', () => {
  it('hex e rgb são inversos', () => {
    expect(hexParaRgb('#4f46e5')).toEqual([79, 70, 229])
    expect(rgbParaHex([79, 70, 229])).toBe('#4f46e5')
    expect(rgbParaHex([0, 0, 0])).toBe('#000000')
  })
})

describe('razaoDeContraste', () => {
  it('preto sobre branco é 21 e cor sobre ela mesma é 1', () => {
    expect(razaoDeContraste('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(razaoDeContraste('#336699', '#336699')).toBeCloseTo(1, 5)
  })
  it('é simétrica', () => {
    expect(razaoDeContraste('#4f46e5', '#ffffff')).toBeCloseTo(razaoDeContraste('#ffffff', '#4f46e5'), 10)
  })
})

describe('corDoTextoSobre', () => {
  it('texto escuro sobre cor clara e texto claro sobre cor escura', () => {
    expect(corDoTextoSobre('#ffeb3b').token).toBe('--fg-em-cor-clara')
    expect(corDoTextoSobre('#1a237e').token).toBe('--fg-em-cor-escura')
  })

  it('o contraste escolhido é de ao menos 4,5 para qualquer cor (varredura)', () => {
    for (let r = 0; r < 256; r += 51) {
      for (let g = 0; g < 256; g += 51) {
        for (let b = 0; b < 256; b += 51) {
          const cor = rgbParaHex([r, g, b])
          const { razao } = corDoTextoSobre(cor)
          expect(razao, cor).toBeGreaterThanOrEqual(4.5)
        }
      }
    }
  })

  it('escolhe sempre o de maior contraste', () => {
    for (const cor of ['#808080', '#777777', '#999999', '#f59e0b']) {
      const escolhido = corDoTextoSobre(cor).razao
      const clara = razaoDeContraste(rgbParaHex(FG_EM_COR_CLARA), cor)
      const escura = razaoDeContraste(rgbParaHex(FG_EM_COR_ESCURA), cor)
      expect(escolhido).toBeCloseTo(Math.max(clara, escura), 10)
    }
  })

  it('as constantes do texto batem com os tokens de tokens.css', () => {
    const css = readFileSync(path.join(process.cwd(), 'src/estilos/tokens.css'), 'utf8')
    expect(css).toContain(`--fg-em-cor-clara: ${rgbParaHex(FG_EM_COR_CLARA)};`)
    expect(css).toContain(`--fg-em-cor-escura: ${rgbParaHex(FG_EM_COR_ESCURA)};`)
  })
})

describe('amostras e padrão', () => {
  it('há de 6 a 10 amostras, todas com nome, hex válido e texto legível', () => {
    expect(AMOSTRAS_DE_COR.length).toBeGreaterThanOrEqual(6)
    expect(AMOSTRAS_DE_COR.length).toBeLessThanOrEqual(10)
    for (const a of AMOSTRAS_DE_COR) {
      expect(a.nome.length).toBeGreaterThan(0)
      expect(normalizarCor(a.hex)).toBe(a.hex)
      expect(corDoTextoSobre(a.hex).razao).toBeGreaterThanOrEqual(4.5)
      expect(avisoDeBaixoContraste(a.hex), a.nome).toBeNull()
    }
  })

  it('o padrão é o azul do acento do sistema', () => {
    expect(COR_PADRAO).toBe('#2563eb')
  })
})

describe('avisoDeBaixoContraste', () => {
  it('cor quase branca avisa do fundo claro', () => {
    expect(avisoDeBaixoContraste('#fafafa')).toMatch(/claro/i)
  })
  it('cor quase preta avisa do fundo escuro', () => {
    expect(avisoDeBaixoContraste('#0b1120')).toMatch(/escuro/i)
  })
  it('cor com bom contraste nos dois temas não avisa', () => {
    expect(avisoDeBaixoContraste('#2563eb')).toBeNull()
  })
})
