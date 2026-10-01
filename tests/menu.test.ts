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

  it('só admin vê Integrações, em /configuracoes/integracoes, no grupo Configurações', () => {
    const doGrupo = (admin: boolean) =>
      gruposVisiveis(admin).find((g) => g.titulo === 'Configurações')?.itens ?? []
    expect(doGrupo(false).map((i) => i.rotulo)).not.toContain('Integrações')
    const item = doGrupo(true).find((i) => i.rotulo === 'Integrações')
    expect(item?.href).toBe('/configuracoes/integracoes')
    expect(item?.somenteAdmin).toBe(true)
  })

  it('só admin vê Privacidade, Auditoria e Sistema, no grupo Configurações, entre Integrações e Meu perfil (FT-10, FT-11)', () => {
    const doGrupo = (admin: boolean) =>
      gruposVisiveis(admin).find((g) => g.titulo === 'Configurações')?.itens ?? []
    expect(doGrupo(false).map((i) => i.rotulo)).not.toContain('Privacidade')
    expect(doGrupo(false).map((i) => i.rotulo)).not.toContain('Auditoria')
    expect(doGrupo(false).map((i) => i.rotulo)).not.toContain('Sistema')
    expect(doGrupo(true).map((i) => [i.rotulo, i.href])).toEqual([
      ['Usuários', '/configuracoes/usuarios'],
      ['Integrações', '/configuracoes/integracoes'],
      ['Privacidade', '/configuracoes/privacidade'],
      ['Auditoria', '/configuracoes/auditoria'],
      ['Sistema', '/configuracoes/sistema'],
      ['Meu perfil', '/perfil'],
    ])
    for (const rotulo of ['Privacidade', 'Auditoria', 'Sistema']) {
      expect(doGrupo(true).find((i) => i.rotulo === rotulo)?.somenteAdmin).toBe(true)
    }
  })

  it('Painel vem primeiro, Agentes logo abaixo e Conversas depois, para todos os papéis', () => {
    for (const admin of [true, false]) {
      const semTitulo = gruposVisiveis(admin).find((g) => g.titulo === null)!
      expect(semTitulo.itens.map((i) => [i.rotulo, i.href])).toEqual([
        ['Painel', '/'],
        ['Agentes', '/agentes'],
        ['Conversas', '/conversas'],
      ])
    }
  })

  it('Conversas não é só do admin e usa o ícone de conversa', () => {
    const item = GRUPOS_DE_MENU.flatMap((g) => g.itens).find((i) => i.href === '/conversas')
    expect(item?.somenteAdmin).toBeUndefined()
    expect(item?.icone).toBe('conversa')
  })

  it('o título do cabeçalho de /conversas e do detalhe é Conversas, e o item fica ativo no detalhe', () => {
    expect(migalhasDaRota('/conversas')).toEqual(['Conversas'])
    expect(migalhasDaRota('/conversas/abc123')).toEqual(['Conversas'])
    expect(rotaEstaAtiva('/conversas/abc123', '/conversas')).toBe(true)
    expect(rotaEstaAtiva('/conversas', '/agentes')).toBe(false)
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
    expect(migalhasDaRota('/configuracoes/integracoes')).toEqual([
      'Configurações',
      'Integrações',
    ])
    expect(migalhasDaRota('/configuracoes/privacidade')).toEqual(['Configurações', 'Privacidade'])
    expect(migalhasDaRota('/configuracoes/auditoria')).toEqual(['Configurações', 'Auditoria'])
  })

  it('rota fora do menu herda a do pai', () => {
    expect(migalhasDaRota('/perfil/senha')).toEqual([
      'Configurações',
      'Meu perfil',
      'Trocar senha',
    ])
  })

  it('as rotas de agente herdam o título Agentes', () => {
    expect(migalhasDaRota('/agentes')).toEqual(['Agentes'])
    expect(migalhasDaRota('/agentes/novo')).toEqual(['Agentes', 'Novo agente'])
    expect(migalhasDaRota('/agentes/ckabc123')).toEqual(['Agentes'])
    expect(migalhasDaRota('/agentes/ckabc123/conhecimento')).toEqual(['Agentes'])
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

  it('/agentes fica ativo nas rotas do agente', () => {
    expect(rotaEstaAtiva('/agentes/novo', '/agentes')).toBe(true)
    expect(rotaEstaAtiva('/agentes/abc', '/agentes')).toBe(true)
    expect(rotaEstaAtiva('/agentesx', '/agentes')).toBe(false)
  })

  it('as demais casam por prefixo de segmento', () => {
    expect(rotaEstaAtiva('/perfil', '/perfil')).toBe(true)
    expect(rotaEstaAtiva('/perfil/senha', '/perfil')).toBe(true)
    expect(rotaEstaAtiva('/perfilx', '/perfil')).toBe(false)
  })
})

describe('Sistema no menu (FT-11)', () => {
  it('a migalha da rota é Configurações e Sistema e o ícone existe', () => {
    expect(migalhasDaRota('/configuracoes/sistema')).toEqual(['Configurações', 'Sistema'])
    const item = GRUPOS_DE_MENU.flatMap((g) => g.itens).find((i) => i.href === '/configuracoes/sistema')!
    expect(item.somenteAdmin).toBe(true)
    expect(renderToStaticMarkup(createElement(Icone, { nome: item.icone }))).toContain('<svg')
  })
})
