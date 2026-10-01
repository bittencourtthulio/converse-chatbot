import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { AbasDoAgente } from '@/componentes/AbasDoAgente'
import { Icone } from '@/componentes/Icones'
import { ABAS_DO_AGENTE, hrefDaAba } from '@/componentes/abas-do-agente'

describe('lista de abas do agente', () => {
  it('tem Configurações, na raiz do agente, Conhecimento (FT-04), Testar (FT-03), Publicar (FT-06) e Canais (FT-07)', () => {
    expect(ABAS_DO_AGENTE.map((a) => a.rotulo)).toEqual(['Configurações', 'Conhecimento', 'Testar', 'Publicar', 'Canais'])
    expect(hrefDaAba('abc', ABAS_DO_AGENTE[3]!)).toBe('/agentes/abc/publicar')
    expect(hrefDaAba('abc', ABAS_DO_AGENTE[4]!)).toBe('/agentes/abc/canais')
    expect(hrefDaAba('abc', ABAS_DO_AGENTE[0]!)).toBe('/agentes/abc')
    expect(hrefDaAba('abc', ABAS_DO_AGENTE[1]!)).toBe('/agentes/abc/conhecimento')
    expect(hrefDaAba('abc', ABAS_DO_AGENTE[2]!)).toBe('/agentes/abc/testar')
  })

  it('aba com caminho vira subrota do agente', () => {
    expect(hrefDaAba('abc', { rotulo: 'Conhecimento', caminho: 'conhecimento' })).toBe(
      '/agentes/abc/conhecimento',
    )
  })
})

describe('AbasDoAgente', () => {
  it('lista as cinco abas e marca Conhecimento na página de uma fonte', () => {
    const html = renderToStaticMarkup(
      <AbasDoAgente agenteId="x" caminhoAtual="/agentes/x/conhecimento/fonte9" />,
    )
    for (const rotulo of ['Configurações', 'Conhecimento', 'Testar', 'Publicar', 'Canais']) expect(html).toContain(rotulo)
    const marcadas = html.match(/<a [^>]*aria-current="page"[^>]*>/g) ?? []
    expect(marcadas).toHaveLength(1)
    expect(marcadas[0]).toContain('href="/agentes/x/conhecimento"')
  })

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
      { rotulo: 'Conversas', caminho: 'conversas' },
      { rotulo: 'Histórico', caminho: 'historico' },
    ]
    const html = renderToStaticMarkup(
      <AbasDoAgente agenteId="abc" abas={abas} caminhoAtual="/agentes/abc/conversas" />,
    )
    expect(html).toContain('href="/agentes/abc/conversas"')
    expect(html).toContain('href="/agentes/abc/historico"')
    const marcadas = html.match(/<a [^>]*aria-current="page"[^>]*>/g) ?? []
    expect(marcadas).toHaveLength(1)
    expect(marcadas[0]).toContain('/agentes/abc/conversas')
  })

  it('a aba raiz não fica marcada numa subrota', () => {
    const html = renderToStaticMarkup(
      <AbasDoAgente
        agenteId="abc"
        abas={ABAS_DO_AGENTE}
        caminhoAtual="/agentes/abc/canais"
      />,
    )
    const marcadas = html.match(/<a [^>]*aria-current="page"[^>]*>/g) ?? []
    expect(marcadas).toHaveLength(1)
    expect(marcadas[0]).toContain('/agentes/abc/canais')
  })
})

describe('ícones da base de conhecimento', () => {
  it.each(['arquivo', 'texto', 'lixeira', 'upload', 'relogio', 'atualizar', 'voltar'] as const)(
    '%s renderiza um svg decorativo',
    (nome) => {
      const html = renderToStaticMarkup(<Icone nome={nome} />)
      expect(html).toMatch(/^<svg /)
      expect(html).toContain('aria-hidden="true"')
      expect(html.length).toBeGreaterThan(200)
    },
  )
})

describe('aba Publicar (FT-06)', () => {
  it('fica marcada na página de publicar e só nela', () => {
    const html = renderToStaticMarkup(<AbasDoAgente agenteId="x" caminhoAtual="/agentes/x/publicar" />)
    const marcadas = html.match(/<a [^>]*aria-current="page"[^>]*>/g) ?? []
    expect(marcadas).toHaveLength(1)
    expect(marcadas[0]).toContain('href="/agentes/x/publicar"')
  })
})
