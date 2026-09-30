import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  GRUPOS_DE_MENU,
  itensVisiveis,
  gruposVisiveis,
  migalhasDaRota,
  rotaEstaAtiva,
} from '@/componentes/itens-de-menu'
import { Icone } from '@/componentes/Icones'

describe('itens de menu', () => {
  it('usuário comum não vê Usuários; admin vê', () => {
    const comum = itensVisiveis(false).map((i) => i.rotulo)
    const admin = itensVisiveis(true).map((i) => i.rotulo)
    expect(comum).not.toContain('Usuários')
    expect(admin).toContain('Usuários')
    expect(comum).toEqual(expect.arrayContaining(['Painel', 'Meu perfil']))
  })

  it('as rotas são únicas e começam com barra', () => {
    const rotas = GRUPOS_DE_MENU.flatMap((g) => g.itens.map((i) => i.href))
    expect(new Set(rotas).size).toBe(rotas.length)
    for (const r of rotas) expect(r.startsWith('/')).toBe(true)
  })

  it('não devolve grupo vazio', () => {
    for (const admin of [true, false]) {
      for (const g of gruposVisiveis(admin)) expect(g.itens.length).toBeGreaterThan(0)
    }
  })

  it('todo ícone declarado renderiza um svg escondido dos leitores de tela', () => {
    for (const item of GRUPOS_DE_MENU.flatMap((g) => g.itens)) {
      const html = renderToStaticMarkup(createElement(Icone, { nome: item.icone }))
      expect(html, item.rotulo).toContain('<svg')
      expect(html).toContain('aria-hidden="true"')
    }
  })
})

describe('título por rota (migalhas)', () => {
  it('mostra grupo e item', () => {
    expect(migalhasDaRota('/')).toEqual(['Painel'])
    expect(migalhasDaRota('/configuracoes/usuarios')).toEqual(['Configurações', 'Usuários'])
    expect(migalhasDaRota('/perfil')).toEqual(['Configurações', 'Meu perfil'])
  })

  it('rota fora do menu herda a do pai', () => {
    expect(migalhasDaRota('/perfil/senha')).toEqual([
      'Configurações',
      'Meu perfil',
      'Trocar senha',
    ])
  })

  it('rota desconhecida não tem migalhas', () => {
    expect(migalhasDaRota('/nao-existe')).toEqual([])
  })
})

describe('item ativo', () => {
  it('a raiz só é ativa na raiz', () => {
    expect(rotaEstaAtiva('/', '/')).toBe(true)
    expect(rotaEstaAtiva('/perfil', '/')).toBe(false)
  })

  it('as demais casam por prefixo de segmento', () => {
    expect(rotaEstaAtiva('/perfil', '/perfil')).toBe(true)
    expect(rotaEstaAtiva('/perfil/senha', '/perfil')).toBe(true)
    expect(rotaEstaAtiva('/perfilx', '/perfil')).toBe(false)
  })
})
