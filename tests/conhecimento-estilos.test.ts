import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const css = readFileSync(path.resolve(process.cwd(), 'src/estilos/global.css'), 'utf8')
const componentes = path.resolve(process.cwd(), 'src/componentes')
const fonte = (nome: string) => readFileSync(path.join(componentes, nome), 'utf8')

/** Todas as classes citadas em className="..." dos componentes da aba Conhecimento. */
function classesUsadas(): string[] {
  const arquivos = [
    'CartoesDeResumo.tsx',
    'ListaDeTrechos.tsx',
    'PainelDeConhecimento.tsx',
    'LinhaDeFonte.tsx',
    'BotaoExcluirFonte.tsx',
    'AdicionarFontes.tsx',
    'ZonaDeArquivos.tsx',
    'FormularioDeTexto.tsx',
  ]
  const classes = new Set<string>()
  for (const nome of arquivos) {
    for (const m of fonte(nome).matchAll(/className=(?:"([^"]+)"|\{`([^`]+)`\})/g)) {
      for (const c of (m[1] ?? m[2] ?? '').split(/\s+/)) if (/^[a-z][a-z0-9-]*$/.test(c)) classes.add(c)
    }
  }
  for (const c of ['zona-de-soltar-ativa', 'envio-aceito', 'envio-recusado', 'envio-enviando', 'envio-aguardando']) classes.add(c)
  return [...classes]
}

describe('estilos da aba Conhecimento', () => {
  it('toda classe usada pelos componentes novos existe em global.css', () => {
    const faltando = classesUsadas().filter((c) => !new RegExp(`\\.${c}(?![a-z0-9-])`).test(css))
    // Classes que o estilo de outras telas já define não entram na conta: só o que falta de verdade.
    expect(faltando).toEqual([])
  })

  it('zona de soltar, opções e ações têm alvo de toque de 44px e foco visível', () => {
    expect(css).toMatch(/\.zona-de-soltar-rotulo\s*\{[^}]*min-height:\s*var\(--alvo-toque\)/)
    expect(css).toMatch(/\.opcao-de-fonte\s*\{[^}]*min-height:\s*var\(--alvo-toque\)/)
    expect(css).toMatch(/\.zona-de-soltar:focus-within/)
    expect(css).toMatch(/\.opcao-de-fonte:focus-visible/)
    expect(css).toMatch(/\.opcao-de-fonte\[aria-selected='true'\]/)
  })

  it('a 375px os cartões viram uma coluna e a linha de fonte empilha', () => {
    const bloco = css.slice(css.indexOf('@media (max-width: 480px)'))
    expect(bloco).toMatch(/\.cartoes-de-resumo\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/)
    expect(bloco).toMatch(/\.fonte-item\s*\{[^}]*grid-template-columns:\s*auto\s+minmax\(0,\s*1fr\)/)
    expect(css).toMatch(/@media \(max-width: 768px\)[\s\S]*\.fonte-acoes \.botao[\s\S]*min-height:\s*var\(--alvo-toque\)/)
  })

  it('o spinner gira e respeita a preferência por menos movimento', () => {
    expect(css).toMatch(/\.spinner\s*\{[^}]*animation:/)
    expect(css).toMatch(/@keyframes girar/)
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.spinner\s*\{[^}]*animation:\s*none/)
  })

  it('o texto do trecho quebra linha longa e preserva as quebras', () => {
    expect(css).toMatch(/\.trecho-texto\s*\{[^}]*white-space:\s*pre-wrap/)
    expect(css).toMatch(/\.trecho-texto\s*\{[^}]*overflow-wrap:\s*anywhere/)
  })

  it('só usa tokens de cor: nada de valor literal nos blocos novos', () => {
    const inicio = css.indexOf('/* ---------- aba Conhecimento')
    expect(inicio).toBeGreaterThan(0)
    expect(css.slice(inicio)).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(/)
  })
})
