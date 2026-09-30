import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { dividirEmTrechos, dividirComPosicoes, normalizarTexto } from '@/servicos/trechos'

// Gerador pseudoaleatório de semente fixa: os testes de propriedade são repetíveis.
function gerador(semente: number) {
  let estado = semente >>> 0
  return () => {
    estado = (Math.imul(estado, 1664525) + 1013904223) >>> 0
    return estado / 2 ** 32
  }
}

const PALAVRAS = ['loja', 'troca', 'produto', 'atendimento', 'horário', 'nota', 'fiscal', 'caderno', 'política', 'até', 'sete', 'dias']

function textoAleatorio(semente: number): string {
  const r = gerador(semente)
  const partes: string[] = []
  const paragrafos = 1 + Math.floor(r() * 12)
  for (let p = 0; p < paragrafos; p += 1) {
    const frases = 1 + Math.floor(r() * 8)
    const paragrafo: string[] = []
    for (let f = 0; f < frases; f += 1) {
      const palavras = 3 + Math.floor(r() * 40)
      const frase: string[] = []
      for (let w = 0; w < palavras; w += 1) {
        // De vez em quando uma "palavra" gigante, sem espaço.
        frase.push(r() < 0.01 ? 'x'.repeat(1200 + Math.floor(r() * 1500)) : PALAVRAS[Math.floor(r() * PALAVRAS.length)]!)
      }
      paragrafo.push(`${frase.join(' ')}${r() < 0.8 ? '.' : ''}`)
    }
    partes.push(paragrafo.join(' '))
  }
  const separador = r() < 0.5 ? '\n\n' : '\r\n\r\n\r\n'
  return partes.join(separador)
}

describe('propriedades da divisão em trechos', () => {
  for (let semente = 1; semente <= 60; semente += 1) {
    it(`semente ${semente}: sem vazio, até 1000, em ordem e cobrindo o texto normalizado`, () => {
      const bruto = textoAleatorio(semente)
      const normal = normalizarTexto(bruto)
      const trechos = dividirComPosicoes(bruto)

      expect(trechos.length).toBeGreaterThan(0)
      let anterior: { inicio: number; fim: number } | null = null
      for (const t of trechos) {
        expect(t.texto.length).toBeGreaterThan(0)
        expect(t.texto.trim()).toBe(t.texto)
        expect(t.texto.length).toBeLessThanOrEqual(1000)
        expect(normal.slice(t.inicio, t.fim)).toBe(t.texto)
        if (anterior) {
          expect(t.inicio).toBeGreaterThan(anterior.inicio)
          expect(t.fim).toBeGreaterThan(anterior.fim)
          // Sobreposta ou encostada; se houver vão, só de espaço em branco.
          if (t.inicio > anterior.fim) {
            expect(normal.slice(anterior.fim, t.inicio).trim()).toBe('')
          }
          // A sobreposição nunca passa de 150.
          expect(anterior.fim - t.inicio).toBeLessThanOrEqual(150)
        }
        anterior = t
      }
      expect(trechos[0]!.inicio).toBe(0)
      expect(trechos[trechos.length - 1]!.fim).toBe(normal.length)
    })
  }

  it('é determinística: o mesmo texto dá os mesmos trechos', () => {
    const texto = textoAleatorio(7)
    expect(dividirEmTrechos(texto)).toEqual(dividirEmTrechos(texto))
  })
})

describe('onde corta', () => {
  it('em quebra de parágrafo, quando ela cabe na janela', () => {
    const paragrafo = (letra: string) => `${letra} `.repeat(200).trim() // 399 caracteres
    const texto = [paragrafo('a'), paragrafo('b'), paragrafo('c')].join('\n\n')
    const trechos = dividirEmTrechos(texto)
    expect(trechos[0]).toBe(`${paragrafo('a')}\n\n${paragrafo('b')}`)
    expect(trechos[1]!.endsWith(paragrafo('c'))).toBe(true)
    expect(trechos).toHaveLength(2)
  })

  it('depois de uma frase, quando não há parágrafo', () => {
    const frase = 'Esta frase tem quarenta e poucos caracteres. '
    const texto = frase.repeat(60).trim()
    const trechos = dividirEmTrechos(texto)
    expect(trechos.length).toBeGreaterThan(2)
    for (const t of trechos.slice(0, -1)) expect(t.endsWith('.')).toBe(true)
  })

  it('entre palavras, quando não há frase nem parágrafo, sem partir palavra', () => {
    const texto = Array.from({ length: 800 }, (_, i) => PALAVRAS[i % PALAVRAS.length]).join(' ')
    const trechos = dividirEmTrechos(texto)
    expect(trechos.length).toBeGreaterThan(2)
    for (const t of trechos) {
      for (const palavra of t.split(' ')) expect(PALAVRAS).toContain(palavra)
    }
  })

  it('só parte a palavra quando ela sozinha passa do tamanho, mantendo a sobreposição', () => {
    const trechos = dividirComPosicoes('x'.repeat(2500))
    expect(trechos.map((t) => t.texto.length)).toEqual([1000, 1000, 800])
    expect(trechos[1]!.inicio).toBe(850)
    expect(trechos[2]!.inicio).toBe(1700)
  })

  it('texto curto vira um trecho só; vazio e só espaço não viram nada', () => {
    expect(dividirEmTrechos('  Olá, mundo.  ')).toEqual(['Olá, mundo.'])
    expect(dividirEmTrechos('')).toEqual([])
    expect(dividirEmTrechos(' \n\n\t ')).toEqual([])
  })

  it('aceita alvo e sobreposição diferentes', () => {
    const texto = 'palavra '.repeat(100).trim()
    const trechos = dividirEmTrechos(texto, { alvo: 100, sobreposicao: 20 })
    expect(trechos.length).toBeGreaterThan(5)
    for (const t of trechos) expect(t.length).toBeLessThanOrEqual(100)
  })
})

describe('desempenho', () => {
  it('divide 3 milhões de caracteres sem parágrafo em menos de 5 segundos', () => {
    const texto = 'palavra outra coisa '.repeat(150_000)
    const inicio = Date.now()
    const trechos = dividirEmTrechos(texto)
    expect(Date.now() - inicio).toBeLessThan(5000)
    expect(trechos.length).toBeGreaterThan(3000)
  })
})

describe('normalização', () => {
  it('troca CRLF por LF, reduz três quebras ou mais a duas e apara as pontas', () => {
    expect(normalizarTexto('  a\r\nb\r\n\r\n\r\n\r\nc  ')).toBe('a\nb\n\nc')
  })
})

describe('isolamento do módulo', () => {
  it('não importa nada com alias @/ (a seed o usa)', () => {
    const fonte = readFileSync(path.resolve(process.cwd(), 'src/servicos/trechos.ts'), 'utf8')
    expect(fonte).not.toMatch(/from '@\//)
  })
})
