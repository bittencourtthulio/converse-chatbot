// T-04.02: o CSS da lista de conversas: cartões abaixo de 768px, badges por token, alvos de
// toque e foco visível. Lê o global.css real (o ambiente de teste não tem navegador).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const css = readFileSync(path.join(process.cwd(), 'src/estilos/global.css'), 'utf8')

const secao = css.slice(css.indexOf('/* ---------- conversas'), css.indexOf('/* ---------- fim das conversas'))

/** O corpo do `@media (max-width: <largura>px) { ... }` da seção das conversas. */
function midia(largura: number): string {
  const inicio = secao.indexOf(`@media (max-width: ${largura}px)`)
  expect(inicio, `@media ${largura}px ausente`).toBeGreaterThanOrEqual(0)
  const abre = secao.indexOf('{', inicio)
  let nivel = 0
  for (let i = abre; i < secao.length; i += 1) {
    if (secao[i] === '{') nivel += 1
    if (secao[i] === '}') nivel -= 1
    if (nivel === 0) return secao.slice(abre, i)
  }
  return ''
}

describe('estilos das conversas', () => {
  it('tem a seção própria, delimitada', () => {
    expect(css).toContain('/* ---------- conversas')
    expect(css).toContain('/* ---------- fim das conversas')
    expect(secao.length).toBeGreaterThan(500)
  })

  it('as badges dos três canais usam os tokens do canal', () => {
    for (const canal of ['painel', 'widget', 'telegram']) {
      expect(secao).toMatch(new RegExp(`\\.badge-de-canal-${canal}[^}]*var\\(--canal-${canal}-bg\\)`))
      expect(secao).toMatch(new RegExp(`\\.badge-de-canal-${canal}[^}]*var\\(--canal-${canal}-fg\\)`))
    }
  })

  it('abaixo de 768px a tabela vira cartões, sem rolagem lateral', () => {
    const m = midia(768)
    expect(m).toMatch(/\.tabela-de-conversas\s+tr\s*\{[^}]*display:\s*(grid|flex|block)/)
    expect(m).toMatch(/\.tabela-de-conversas\s+thead\s*\{[^}]*(display:\s*none|position:\s*absolute)/)
    expect(m).toMatch(/\.tabela-de-conversas\s+td::before\s*\{[^}]*attr\(data-rotulo\)/)
  })

  it('a linha inteira é clicável por um link esticado e o foco é visível', () => {
    expect(secao).toMatch(/\.link-da-conversa::after\s*\{[^}]*position:\s*absolute[^}]*inset:\s*0/)
    expect(secao).toMatch(/\.link-da-conversa:focus-visible/)
  })

  it('alvos de toque de 44px no celular', () => {
    expect(midia(768)).toMatch(/\.filtros-de-conversas[^}]*\{[^}]*min-height:\s*var\(--alvo-toque\)/)
  })

  it('só usa tokens: nenhuma cor literal na seção', () => {
    expect(secao).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/)
  })
})
