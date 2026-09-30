import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { AbasDoAgente } from '@/componentes/AbasDoAgente'
import { ABAS_DO_AGENTE, hrefDaAba } from '@/componentes/abas-do-agente'

describe('lista de abas do agente', () => {
  it('tem Configurações, na raiz do agente, e Testar (FT-03)', () => {
    expect(ABAS_DO_AGENTE.map((a) => a.rotulo)).toEqual(['Configurações', 'Testar'])
    expect(hrefDaAba('abc', ABAS_DO_AGENTE[0]!)).toBe('/agentes/abc')
    expect(hrefDaAba('abc', ABAS_DO_AGENTE[1]!)).toBe('/agentes/abc/testar')
  })

  it('aba com caminho vira subrota do agente', () => {
    expect(hrefDaAba('abc', { rotulo: 'Conhecimento', caminho: 'conhecimento' })).toBe(
      '/agentes/abc/conhecimento',
    )
  })
})

describe('AbasDoAgente', () => {
  it('rende a navegação com um link por aba e marca a aba atual', () => {
    const html = renderToStaticMarkup(
      <AbasDoAgente agenteId="abc" caminhoAtual="/agentes/abc" />,
    )
    expect(html).toContain('<nav')
    expect(html).toContain('aria-label="Seções do agente"')
    expect(html).toContain('href="/agentes/abc"')
    expect(html).toContain('Configurações')
    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
  })

  it('acrescentar uma entrada na lista faz aparecer outra aba sem mudar o componente', () => {
    const abas = [
      ...ABAS_DO_AGENTE,
      { rotulo: 'Conhecimento', caminho: 'conhecimento' },
      { rotulo: 'Canais', caminho: 'canais' },
    ]
    const html = renderToStaticMarkup(
      <AbasDoAgente agenteId="abc" abas={abas} caminhoAtual="/agentes/abc/conhecimento" />,
    )
    expect(html).toContain('href="/agentes/abc/conhecimento"')
    expect(html).toContain('href="/agentes/abc/canais"')
    const marcadas = html.match(/<a [^>]*aria-current="page"[^>]*>/g) ?? []
    expect(marcadas).toHaveLength(1)
    expect(marcadas[0]).toContain('/agentes/abc/conhecimento')
  })

  it('a aba raiz não fica marcada numa subrota', () => {
    const html = renderToStaticMarkup(
      <AbasDoAgente
        agenteId="abc"
        abas={[...ABAS_DO_AGENTE, { rotulo: 'Canais', caminho: 'canais' }]}
        caminhoAtual="/agentes/abc/canais"
      />,
    )
    const marcadas = html.match(/<a [^>]*aria-current="page"[^>]*>/g) ?? []
    expect(marcadas).toHaveLength(1)
    expect(marcadas[0]).toContain('/agentes/abc/canais')
  })
})
