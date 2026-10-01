// T-06.03 (FT-10): o CSS das telas de Privacidade e Auditoria: cartões abaixo de 768px com
// data-rotulo, alvos de toque de 44px, foco visível e só tokens. Lê o global.css real (o
// ambiente de teste não tem navegador).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const css = readFileSync(path.join(process.cwd(), 'src/estilos/global.css'), 'utf8')
const secao = css.slice(css.indexOf('/* ---------- privacidade e auditoria'), css.indexOf('/* ---------- fim da privacidade e auditoria'))

/** O corpo do `@media (max-width: <largura>px) { ... }` da seção. */
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

describe('estilos de privacidade e auditoria', () => {
  it('tem a seção própria, delimitada', () => {
    expect(css).toContain('/* ---------- privacidade e auditoria')
    expect(css).toContain('/* ---------- fim da privacidade e auditoria')
    expect(secao.length).toBeGreaterThan(300)
  })

  it('abaixo de 768px a tabela de auditoria vira cartões com o rótulo de cada célula, sem rolagem lateral', () => {
    const m = midia(768)
    expect(m).toMatch(/\.tabela-de-auditoria\s+tr\s*\{[^}]*display:\s*(grid|flex|block)/)
    expect(m).toMatch(/\.tabela-de-auditoria\s+thead\s*\{[^}]*position:\s*absolute/)
    expect(m).toMatch(/\.tabela-de-auditoria\s+td::before\s*\{[^}]*attr\(data-rotulo\)/)
    expect(m).toMatch(/\.tabela-de-auditoria\s+td\s*\{[^}]*min-width:\s*0/)
    expect(secao).toMatch(/\.tabela-de-auditoria\s+\.celula-detalhe\s*\{[^}]*overflow-wrap:\s*anywhere/)
  })

  it('alvos de toque de 44px nos filtros no celular', () => {
    expect(midia(768)).toMatch(/\.filtros-de-auditoria[^}]*\{[^}]*min-height:\s*var\(--alvo-toque\)/)
  })

  it('só usa tokens: nenhuma cor literal na seção', () => {
    expect(secao).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/)
  })

  it('só as tabelas que viram cartões deixam de rolar no celular: a de Usuários segue rolando no envoltório', () => {
    const geral = css.slice(css.indexOf('/* ---------- conversas'), css.indexOf('/* ---------- fim das conversas'))
    expect(geral).toMatch(/\.tabela-envoltorio:has\(>\s*\.tabela-de-conversas,\s*>\s*\.tabela-de-auditoria\)\s*\{\s*overflow-x:\s*visible/)
    expect(css).not.toMatch(/(^|\n)\s*\.tabela-envoltorio\s*\{\s*overflow-x:\s*visible/)
    expect(css).toMatch(/\n\.tabela-envoltorio\s*\{\s*overflow-x:\s*auto;\s*position:\s*relative/)
  })

  it('o campo de dias dentro do rádio não herda o tamanho de 18px do rádio (achado da verificação)', () => {
    expect(secao).toMatch(/\.campo-radio\s+\.campo-numerico\s*\{[^}]*width:\s*7rem[^}]*height:\s*auto[^}]*min-height:\s*var\(--altura-controle\)/)
  })
})
