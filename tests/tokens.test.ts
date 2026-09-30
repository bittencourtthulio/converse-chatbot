/**
 * PR-23: temas claro e escuro sobre tokens semânticos, contraste 4,5:1 e
 * nenhuma cor literal fora de tokens.css. O teste lê os arquivos reais.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const raiz = process.cwd()
const tokens = readFileSync(path.join(raiz, 'src/estilos/tokens.css'), 'utf8')

/** Extrai as declarações `--nome: valor;` do bloco que começa em `abertura`. */
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
  const corpo = tokens.slice(abre + 1, fim)
  const mapa: Record<string, string> = {}
  for (const m of corpo.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)) {
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
  const cheio = h.length === 3 ? [...h].map((c) => c + c).join('') : h
  const canais = [0, 2, 4].map((i) => Number.parseInt(cheio.slice(i, i + 2), 16) / 255)
  const [r, g, b] = canais.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function razao(a: string, b: string): number {
  const [maior, menor] = [luminancia(a), luminancia(b)].sort((x, y) => y - x) as [number, number]
  return (maior + 0.05) / (menor + 0.05)
}

/** [texto, fundo] que a interface realmente combina. */
const PARES: Array<[string, string]> = [
  ['--fg-default', '--bg-app'],
  ['--fg-default', '--bg-surface'],
  ['--fg-default', '--bg-subtle'],
  ['--fg-muted', '--bg-app'],
  ['--fg-muted', '--bg-surface'],
  ['--fg-muted', '--bg-subtle'],
  ['--fg-subtle', '--bg-app'],
  ['--fg-subtle', '--bg-surface'],
  ['--accent-fg', '--accent'],
  ['--accent-fg', '--accent-hover'],
  ['--accent-text', '--bg-app'],
  ['--accent-text', '--bg-surface'],
  ['--accent-text', '--bg-selected'],
  ['--accent-soft-fg', '--accent-soft'],
  ['--fg-on-danger', '--danger'],
  ['--fg-on-danger', '--danger-hover'],
  ['--danger-fg', '--danger-bg'],
  ['--danger-fg', '--bg-surface'],
  ['--success-fg', '--success-bg'],
  ['--warning-fg', '--warning-bg'],
  ['--info-fg', '--info-bg'],
  ['--fg-default', '--bg-hover'],
]

describe('tokens: temas', () => {
  it('tem tema claro base, escuro explícito e escuro por preferência do sistema', () => {
    expect(Object.keys(claro).length).toBeGreaterThan(30)
    expect(Object.keys(escuroExplicito).length).toBeGreaterThan(15)
    expect(tokens).toContain('prefers-color-scheme: dark')
    expect(escuroPorPreferencia).toEqual(escuroExplicito)
  })

  it('declara a fonte de sistema com Inter na frente, sem carregar fonte de rede', () => {
    expect(claro['--font-ui']).toMatch(/^['"]?Inter/)
    expect(claro['--font-ui']).toContain('system-ui')
    expect(tokens).not.toMatch(/@import\s+url|https?:\/\//)
  })

  it('usa raios de 8 a 12px nos cartões e controles', () => {
    for (const nome of ['--raio-controle', '--raio-cartao']) {
      const px = Number.parseInt(claro[nome] ?? '', 10)
      expect(px, nome).toBeGreaterThanOrEqual(8)
      expect(px, nome).toBeLessThanOrEqual(12)
    }
  })
})

describe.each([
  ['claro', claro],
  ['escuro', escuro],
])('contraste 4,5:1 no tema %s', (_nome, tema) => {
  it.each(PARES)('%s sobre %s', (texto, fundo) => {
    const t = tema[texto]
    const f = tema[fundo]
    expect(t, `token ausente: ${texto}`).toBeDefined()
    expect(f, `token ausente: ${fundo}`).toBeDefined()
    expect(razao(t as string, f as string), `${texto} ${t} sobre ${fundo} ${f}`).toBeGreaterThanOrEqual(4.5)
  })

  it('o anel de foco tem 3:1 contra o fundo e a superfície', () => {
    expect(razao(tema['--border-focus'] as string, tema['--bg-app'] as string)).toBeGreaterThanOrEqual(3)
    expect(razao(tema['--border-focus'] as string, tema['--bg-surface'] as string)).toBeGreaterThanOrEqual(3)
  })
})

describe('nenhuma cor literal fora de tokens.css', () => {
  function arquivos(dir: string): string[] {
    return readdirSync(dir).flatMap((nome) => {
      const caminho = path.join(dir, nome)
      if (nome === 'gerado' || nome === 'node_modules') return []
      return statSync(caminho).isDirectory() ? arquivos(caminho) : [caminho]
    })
  }

  const literal = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/

  it('componentes, páginas e global.css só usam var(--token)', () => {
    const suspeitos = arquivos(path.join(raiz, 'src'))
      .filter((f) => /\.(tsx?|css)$/.test(f))
      .filter((f) => !f.endsWith(path.join('estilos', 'tokens.css')))
      .filter((f) => literal.test(readFileSync(f, 'utf8')))
      .map((f) => path.relative(raiz, f))
    expect(suspeitos).toEqual([])
  })
})
