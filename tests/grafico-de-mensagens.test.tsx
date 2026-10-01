/**
 * T-05.03: o gráfico de mensagens por dia (FT-09, PR-81): SVG acessível com rótulo, tabela
 * equivalente e nunca só cor. Renderização estática; as cores vêm dos tokens, por classe.
 */
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import { GraficoDeMensagens } from '@/componentes/GraficoDeMensagens'

const quatorze = (valores: number[]) =>
  valores.map((mensagens, i) => ({ dia: `2026-03-${String(i + 2).padStart(2, '0')}`, mensagens }))

const VALORES = [0, 3, 0, 8, 1, 0, 0, 5, 2, 0, 0, 4, 0, 6]

describe('gráfico de mensagens por dia', () => {
  it('é um svg com role img e um rótulo que resume o período', () => {
    const html = renderToStaticMarkup(<GraficoDeMensagens serie={quatorze(VALORES)} />)
    expect(html).toMatch(/<svg[^>]*role="img"/)
    expect(html).toMatch(/<svg[^>]*aria-label="Mensagens por dia nos últimos 14 dias[^"]*29 mensagens/)
    expect(html).toContain('<figure')
    expect(html).toContain('<figcaption')
  })

  it('desenha uma barra por dia com mensagem e escreve o valor sobre ela (não só cor)', () => {
    const html = renderToStaticMarkup(<GraficoDeMensagens serie={quatorze(VALORES)} />)
    expect(html.match(/<rect[^>]*class="grafico-barra"/g)).toHaveLength(7)
    for (const v of [3, 8, 1, 5, 2, 4, 6]) expect(html).toMatch(new RegExp(`class="grafico-valor"[^>]*>${v}<`))
    expect(html).toContain('class="grafico-rotulo-do-dia"')
  })

  it('traz a tabela equivalente com os 14 dias e os valores', () => {
    const html = renderToStaticMarkup(<GraficoDeMensagens serie={quatorze(VALORES)} />)
    expect(html).toContain('<table')
    expect(html.match(/<tbody>.*<\/tbody>/s)?.[0].match(/<tr>/g)).toHaveLength(14)
    expect(html).toContain('<th scope="col">Dia</th>')
    expect(html).toContain('<th scope="col">Mensagens</th>')
    expect(html).toContain('<th scope="row">05/03/2026</th><td>8</td>')
    expect(html).toContain('<th scope="row">02/03/2026</th><td>0</td>')
  })

  it('sem mensagens mostra o aviso em vez de barras e não finge um gráfico', () => {
    const html = renderToStaticMarkup(<GraficoDeMensagens serie={quatorze(new Array(14).fill(0))} />)
    expect(html).toContain('Nenhuma mensagem nos últimos 14 dias')
    expect(html).not.toContain('<rect')
    expect(html).not.toContain('role="img"')
  })

  it('não usa cor literal nem estilo inline: as cores vêm dos tokens por classe', () => {
    const html = renderToStaticMarkup(<GraficoDeMensagens serie={quatorze(VALORES)} />)
    expect(html).not.toMatch(/style=|fill="#|stroke="#|rgb\(/)
    const css = readFileSync('src/estilos/global.css', 'utf8')
    expect(css).toMatch(/\.grafico-barra\s*\{[^}]*var\(--grafico-barra\)/)
    expect(css).toMatch(/\.grafico-de-mensagens svg\s*\{[^}]*width:\s*100%/)
  })
})
