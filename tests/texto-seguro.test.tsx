import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { TextoDoModelo } from '@/componentes/TextoDoModelo'
import { analisarTexto, urlSegura } from '@/componentes/texto-seguro'

const html = (texto: string) => renderToStaticMarkup(<TextoDoModelo texto={texto} />)

describe('blocos', () => {
  it('parágrafos separados por linha em branco', () => {
    expect(html('Primeiro.\n\nSegundo.')).toBe(
      '<div class="texto-do-modelo"><p>Primeiro.</p><p>Segundo.</p></div>',
    )
  })

  it('linhas seguidas ficam no mesmo parágrafo, com a quebra preservada', () => {
    expect(html('a\nb')).toContain('<p>a\nb</p>')
  })

  it('lista com marcador e lista numerada', () => {
    expect(html('- um\n- dois')).toContain('<ul><li>um</li><li>dois</li></ul>')
    expect(html('1. um\n2. dois')).toContain('<ol><li>um</li><li>dois</li></ol>')
    expect(analisarTexto('- a\n1. b').map((b) => b.tipo)).toEqual(['lista', 'lista'])
  })

  it('bloco de código preserva o texto e não interpreta o que há dentro', () => {
    const saida = html('Antes\n```js\nconst a = **1**\n<b>x</b>\n```\nDepois')
    expect(saida).toContain('<pre><code>const a = **1**\n&lt;b&gt;x&lt;/b&gt;</code></pre>')
    expect(saida).toContain('<p>Antes</p>')
    expect(saida).toContain('<p>Depois</p>')
  })

  it('cerca de código ainda aberta (resposta chegando) vai até o fim', () => {
    expect(html('```\nlinha 1\nlinha 2')).toContain('<pre><code>linha 1\nlinha 2</code></pre>')
  })

  it('título vira parágrafo em negrito', () => {
    expect(html('## Resumo')).toContain('<p><strong>Resumo</strong></p>')
  })
})

describe('inline', () => {
  it('negrito e código em linha', () => {
    expect(html('um **forte** e `codigo` aqui')).toContain(
      '<p>um <strong>forte</strong> e <code>codigo</code> aqui</p>',
    )
  })

  it('link https ganha rel noopener noreferrer e target _blank', () => {
    const saida = html('veja [o site](https://exemplo.com/a?b=1)')
    expect(saida).toContain('<a href="https://exemplo.com/a?b=1" target="_blank" rel="noopener noreferrer">o site</a>')
  })

  it('link http também vale', () => {
    expect(html('[x](http://exemplo.com)')).toContain('href="http://exemplo.com/"')
  })

  it.each(['javascript:alert(1)', 'data:text/html,<b>x</b>', 'vbscript:x', 'file:///etc/passwd', '//exemplo.com', '/relativo'])(
    'esquema ou caminho %s não vira link',
    (alvo) => {
      const saida = html(`[clique](${alvo})`)
      expect(saida).not.toContain('<a ')
      expect(saida).not.toContain('href=')
      expect(saida).toContain('clique')
    },
  )

  it('urlSegura só aceita http e https', () => {
    expect(urlSegura('https://a.com')).toBe('https://a.com/')
    expect(urlSegura('JAVASCRIPT:alert(1)')).toBeNull()
    expect(urlSegura('nada')).toBeNull()
  })
})

describe('referências [n] às fontes (FT-05)', () => {
  const comRef = (texto: string, referencias: number[]) =>
    renderToStaticMarkup(<TextoDoModelo texto={texto} referencias={referencias} />)

  it('[1] e [2] da lista viram botões de referência com rótulo acessível', () => {
    const saida = comRef('Troca em sete dias [1] e frete grátis [2].', [1, 2])
    expect(saida).toContain(
      '<button type="button" class="referencia-de-fonte" data-referencia="1" aria-label="Ver a fonte do trecho [1]">[1]</button>',
    )
    expect(saida).toContain('data-referencia="2"')
    expect(saida).toContain('Troca em sete dias ')
    expect(saida).toContain(' e frete grátis ')
  })

  it('número fora da lista fica texto comum', () => {
    const saida = comRef('veja [1] e [7]', [1])
    expect(saida).toContain('data-referencia="1"')
    expect(saida).not.toContain('data-referencia="7"')
    expect(saida).toContain(' e [7]')
  })

  it('sem a lista nada muda em relação à FT-03', () => {
    expect(html('veja [1] e [2]')).toBe('<div class="texto-do-modelo"><p>veja [1] e [2]</p></div>')
    expect(comRef('veja [1]', [])).not.toContain('referencia-de-fonte')
  })

  it('[1](https://x.com) continua sendo link, não referência', () => {
    const saida = comRef('[1](https://x.com/a)', [1])
    expect(saida).toContain('<a href="https://x.com/a"')
    expect(saida).not.toContain('referencia-de-fonte')
  })

  it('a referência dentro de negrito e de lista funciona, e dentro de código fica código', () => {
    expect(comRef('**atenção [1]**', [1])).toContain('<strong>atenção <button')
    expect(comRef('- item [2]', [2])).toContain('<li>item <button')
    const codigo = comRef('`a[1]`', [1])
    expect(codigo).toContain('<code>a[1]</code>')
    expect(codigo).not.toContain('referencia-de-fonte')
  })

  it('o número é o do texto, nunca HTML: [1] com lixo em volta continua escapado', () => {
    const saida = comRef('<b>[1]</b>', [1])
    expect(saida).toContain('&lt;b&gt;')
    expect(saida).not.toContain('<b>')
  })

  it('analisarTexto entrega o nó referencia só para números da lista', () => {
    const [bloco] = analisarTexto('a [3] b [4]', { referencias: [3] })
    expect(bloco).toMatchObject({ tipo: 'paragrafo' })
    const filhos = (bloco as { filhos: Array<{ tipo: string }> }).filhos
    expect(filhos.map((f) => f.tipo)).toEqual(['texto', 'referencia', 'texto'])
  })
})

describe('HTML do modelo é texto', () => {
  it('<script> e <img onerror> saem escapados', () => {
    const saida = html('<script>alert(1)</script>\n\n<img src=x onerror="alert(2)">')
    expect(saida).not.toContain('<script')
    expect(saida).not.toContain('<img')
    expect(saida).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(saida).toContain('&lt;img src=x onerror=&quot;alert(2)&quot;&gt;')
  })

  it('aspas e sinais no texto do link não escapam do atributo', () => {
    const saida = html('[x](https://a.com/"onmouseover="alert(1))')
    // o endereço é normalizado (aspas viram %22) e continua dentro do atributo href
    expect(saida).toContain('href="https://a.com/%22onmouseover=%22alert(1"')
    expect(saida).not.toMatch(/\sonmouseover=/)
  })
})

describe('código-fonte', () => {
  it('só o script constante do tema (layout.tsx) usa dangerouslySetInnerHTML; nenhum componente usa', () => {
    const achados: string[] = []
    const varrer = (pasta: string) => {
      for (const nome of readdirSync(pasta)) {
        if (nome === 'gerado') continue
        const caminho = path.join(pasta, nome)
        if (statSync(caminho).isDirectory()) varrer(caminho)
        else if (/\.(ts|tsx)$/.test(nome) && readFileSync(caminho, 'utf8').includes('dangerouslySetInnerHTML')) {
          achados.push(caminho)
        }
      }
    }
    varrer(path.join(process.cwd(), 'src'))
    expect(achados.map((a) => path.relative(process.cwd(), a))).toEqual(['src/app/layout.tsx'])
  })
})
