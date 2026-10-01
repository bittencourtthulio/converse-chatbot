// T-04.03 (FT-11): o CSS da tela Sistema: grade que cai para uma coluna a 375px, lista que quebra
// valores longos, e só tokens. Lê o global.css real (o ambiente de teste não tem navegador).
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const css = readFileSync(path.join(process.cwd(), 'src/estilos/global.css'), 'utf8')
const inicio = css.indexOf('/* ---------- sistema (FT-11')
const fim = css.indexOf('/* ---------- fim do sistema')
const secao = css.slice(inicio, fim)

describe('estilos da tela Sistema', () => {
  it('tem a seção própria, delimitada', () => {
    expect(inicio).toBeGreaterThanOrEqual(0)
    expect(fim).toBeGreaterThan(inicio)
    expect(secao.length).toBeGreaterThan(300)
  })

  it('a grade se adapta sozinha: nunca pede mais largura que o contêiner, então cabe a 375px sem rolagem lateral', () => {
    expect(secao).toMatch(/\.sistema-grade\s*\{[^}]*grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*\d+px\),\s*1fr\)\)/)
    expect(secao).toMatch(/\.sistema-cartao\s*\{[^}]*min-width:\s*0/)
  })

  it('o cartão de estado geral ocupa a largura toda', () => {
    expect(secao).toMatch(/\.sistema-grade\s*>\s*\.sistema-cartao:first-child\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/)
  })

  it('abaixo de 480px a lista de rótulo e valor vira uma coluna, e o valor longo (nome de migration) quebra', () => {
    const m = secao.slice(secao.indexOf('@media (max-width: 480px)'))
    expect(m).toMatch(/\.sistema-lista\s*>\s*div\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/)
    expect(secao).toMatch(/\.sistema-lista\s+dd\s*\{[^}]*overflow-wrap:\s*anywhere/)
  })

  it('usa só tokens: nenhuma cor literal na seção', () => {
    expect(secao).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/)
    expect(secao).toMatch(/var\(--border\)/)
    expect(secao).toMatch(/var\(--fg-muted\)/)
  })

  it('todo nome de classe sistema-* que o painel usa tem regra no CSS', () => {
    const fonte = readFileSync(path.join(process.cwd(), 'src/componentes/PainelDoSistema.tsx'), 'utf8')
    const usadas = new Set([...fonte.matchAll(/className="([^"]+)"/g)].flatMap((m) => m[1]!.split(/\s+/)).filter((c) => c.startsWith('sistema-')))
    expect(usadas.size).toBeGreaterThan(0)
    for (const classe of usadas) expect(secao, classe).toContain(`.${classe}`)
  })
})
