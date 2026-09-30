import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { extrairHtml } from '@/lib/extracao/html'

const fixture = (nome: string) => readFileSync(path.resolve(process.cwd(), 'tests/fixtures', nome))
const html = (corpo: string) => extrairHtml(Buffer.from(`<!doctype html><html><body>${corpo}</body></html>`))

describe('HTML', () => {
  it('a fixture vira títulos com # e parágrafos separados por linha em branco', () => {
    expect(extrairHtml(fixture('exemplo.html'))).toBe(
      [
        '# Loja Exemplo',
        'A Loja Exemplo vende material de escritório.',
        '## Horário',
        'Atendimento de segunda a sexta, das 9h às 18h.',
        '- Caderno\n- Caneta azul',
      ].join('\n\n'),
    )
  })

  it('nunca devolve o conteúdo de script, style, nav, noscript nem comentário', () => {
    const texto = extrairHtml(fixture('exemplo.html'))
    for (const proibido of ['segredo', 'color: red', 'Início', 'Contato', 'Ative o JavaScript', 'comentário']) {
      expect(texto, proibido).not.toContain(proibido)
    }
  })

  it('ignora também head, template, iframe, svg e objetos embutidos', () => {
    const texto = html(
      '<p>visível</p><template><p>molde</p></template><iframe>quadro</iframe><svg><text>desenho</text></svg><object>objeto</object><canvas>tela</canvas>',
    )
    expect(texto).toBe('visível')
  })

  it('HTML quebrado ou sem fechar tag é lido do jeito que o navegador leria', () => {
    expect(html('<p>um<p>dois <b>negrito')).toBe('um\n\ndois negrito')
  })

  it('entidades viram caracteres e espaços se colapsam', () => {
    expect(html('<p>a &amp; b &lt;c&gt;   d&nbsp;e</p>')).toBe('a & b <c> d e')
  })

  it('br vira quebra de linha e células de tabela são separadas por barra', () => {
    expect(html('<p>linha um<br>linha dois</p>')).toBe('linha um\nlinha dois')
    expect(html('<table><tr><th>Item</th><th>Preço</th></tr><tr><td>Caderno</td><td>12</td></tr></table>')).toBe(
      'Item | Preço\n\nCaderno | 12',
    )
  })

  it('níveis de título e lista numerada', () => {
    expect(html('<h3>Três</h3><ol><li>a</li><li>b</li></ol>')).toBe('### Três\n\n- a\n- b')
  })

  it('não executa nada: um atributo de evento ou javascript: não aparece nem roda', () => {
    const texto = html('<p onclick="alert(1)">oi</p><a href="javascript:alert(2)">link</a><img src=x onerror="alert(3)">')
    expect(texto).toBe('oi\n\nlink')
  })

  it('texto solto direto no corpo também sai', () => {
    expect(html('solto')).toBe('solto')
  })
})
