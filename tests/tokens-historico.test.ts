// T-01.04 (PR-85): tokens de canal e de série do gráfico, nos três blocos de tema, com contraste.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const tokens = readFileSync(path.join(process.cwd(), 'src/estilos/tokens.css'), 'utf8')

function bloco(abertura: string): Record<string, string> {
  const inicio = tokens.indexOf(abertura)
  expect(inicio, `bloco ausente: ${abertura}`).toBeGreaterThanOrEqual(0)
  const abre = tokens.indexOf('{', inicio)
  let nivel = 0
  let fim = abre
  for (let i = abre; i < tokens.length; i += 1) {
    if (tokens[i] === '{') nivel += 1
    if (tokens[i] === '}') nivel -= 1
    if (nivel === 0) {
      fim = i
      break
    }
  }
  const mapa: Record<string, string> = {}
  for (const m of tokens.slice(abre + 1, fim).matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)) {
    mapa[m[1] as string] = (m[2] as string).trim()
  }
  return mapa
}

const claro = bloco(':root {')
const escuroExplicito = bloco(":root[data-theme='dark']")
const escuroPorPreferencia = bloco(":root:not([data-theme='light'])")
const escuro = { ...claro, ...escuroExplicito }

function luminancia(hex: string): number {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4]
    .map((i) => Number.parseInt(h.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const razao = (a: string, b: string) => {
  const [maior, menor] = [luminancia(a), luminancia(b)].sort((x, y) => y - x) as [number, number]
  return (maior + 0.05) / (menor + 0.05)
}

const CANAIS = ['painel', 'widget', 'telegram']
const NOVOS = [
  ...CANAIS.flatMap((c) => [`--canal-${c}-bg`, `--canal-${c}-fg`, `--canal-${c}-borda`]),
  '--grafico-barra',
  '--grafico-barra-fraca',
  '--grafico-eixo',
]

describe('tokens de canal e de gráfico (integração com tokens.css)', () => {
  it.each(NOVOS)('%s existe no claro e nos dois blocos escuros', (nome) => {
    expect(claro[nome], 'claro').toMatch(/^#[0-9a-f]{6}$/i)
    expect(escuroExplicito[nome], 'escuro explícito').toMatch(/^#[0-9a-f]{6}$/i)
    expect(escuroPorPreferencia[nome], 'escuro por preferência').toBe(escuroExplicito[nome])
  })
})

describe.each([
  ['claro', claro],
  ['escuro', escuro],
])('contraste no tema %s (funcional)', (_n, tema) => {
  it.each(CANAIS)('o texto da badge do canal %s tem 4,5:1 sobre o fundo dela', (c) => {
    expect(razao(tema[`--canal-${c}-fg`] as string, tema[`--canal-${c}-bg`] as string)).toBeGreaterThanOrEqual(4.5)
  })

  it('a barra do gráfico tem 3:1 sobre a superfície e o eixo tem 4,5:1', () => {
    expect(razao(tema['--grafico-barra'] as string, tema['--bg-surface'] as string)).toBeGreaterThanOrEqual(3)
    expect(razao(tema['--grafico-barra-fraca'] as string, tema['--bg-surface'] as string)).toBeGreaterThanOrEqual(3)
    expect(razao(tema['--grafico-eixo'] as string, tema['--bg-surface'] as string)).toBeGreaterThanOrEqual(4.5)
  })

  it('as três badges de canal são visualmente distintas entre si', () => {
    const fundos = CANAIS.map((c) => tema[`--canal-${c}-bg`])
    expect(new Set(fundos).size).toBe(3)
  })
})
