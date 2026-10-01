/**
 * FT-14: as fontes são servidas pelo próprio servidor, sem rede em build nem em execução.
 * O teste de produção (`rotas.test.ts`) confere o HTML e as folhas servidas; este confere a fonte.
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const raiz = process.cwd()
const pacote = JSON.parse(readFileSync(path.join(raiz, 'package.json'), 'utf8')) as { dependencies: Record<string, string> }

function arquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = path.join(dir, nome)
    if (nome === 'gerado' || nome === 'node_modules') return []
    return statSync(caminho).isDirectory() ? arquivos(caminho) : [caminho]
  })
}

describe('fontes locais', () => {
  it.each(['geist', '@fontsource-variable/inter', '@fontsource/instrument-serif'])('%s está no package.json com versão fixa', (nome) => {
    expect(pacote.dependencies[nome], nome).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('os arquivos de fonte existem nos pacotes instalados', () => {
    for (const f of [
      'node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2',
      'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
      'node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2',
    ]) {
      expect(existsSync(path.join(raiz, f)), f).toBe(true)
    }
  })

  it('o código usa next/font/local e nunca next/font/google nem folha de fonte de terceiros', () => {
    const fontes = readFileSync(path.join(raiz, 'src/app/fontes.ts'), 'utf8')
    expect(fontes).toContain("from 'next/font/local'")
    expect(fontes).not.toContain('next/font/google')
    const hosts = /fonts\.googleapis|fonts\.gstatic|typekit|use\.fontawesome|bunny\.net|cdnjs|unpkg\.com|jsdelivr/i
    const suspeitos = arquivos(path.join(raiz, 'src'))
      .filter((f) => /\.(tsx?|css|js)$/.test(f))
      .filter((f) => hosts.test(readFileSync(f, 'utf8')))
      .map((f) => path.relative(raiz, f))
    expect(suspeitos).toEqual([])
  })

  it('a serifa itálica é usada num único lugar: o título do hero', () => {
    const usos = arquivos(path.join(raiz, 'src'))
      .filter((f) => /\.(tsx?|css)$/.test(f) && !f.endsWith('tokens.css'))
      .filter((f) => readFileSync(f, 'utf8').includes('--font-editorial'))
      .map((f) => path.relative(raiz, f))
    expect(usos).toEqual(['src/estilos/landing.css'])
    const css = readFileSync(path.join(raiz, 'src/estilos/landing.css'), 'utf8')
    expect(css.match(/var\(--font-editorial\)/g)).toHaveLength(1)
  })
})
