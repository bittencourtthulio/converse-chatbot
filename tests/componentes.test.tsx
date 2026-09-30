import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { CabecalhoDaPagina } from '@/componentes/CabecalhoDaPagina'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { EsqueletoDePagina } from '@/componentes/Esqueleto'
import { Badge } from '@/componentes/Badge'
import { Alerta } from '@/componentes/Alerta'
import MensagemDeErro from '@/app/(sistema)/error'

describe('CabecalhoDaPagina', () => {
  it('rende o título como h1 e o subtítulo', () => {
    const html = renderToStaticMarkup(
      <CabecalhoDaPagina titulo="Usuários" subtitulo="Quem tem acesso." />,
    )
    expect(html).toContain('<h1')
    expect(html).toContain('Usuários')
    expect(html).toContain('Quem tem acesso.')
  })
})

describe('EstadoVazio', () => {
  it('diz o que houve e como seguir, com o papel de status', () => {
    const html = renderToStaticMarkup(
      <EstadoVazio titulo="Ainda não há o que mostrar" descricao="Crie o primeiro item." />,
    )
    expect(html).toContain('role="status"')
    expect(html).toContain('Ainda não há o que mostrar')
    expect(html).toContain('Crie o primeiro item.')
    expect(html).toContain('<svg')
  })

  it('aceita uma ação', () => {
    const html = renderToStaticMarkup(
      <EstadoVazio titulo="Vazio" descricao="x" acao={<a href="/novo">Criar</a>} />,
    )
    expect(html).toContain('href="/novo"')
  })
})

describe('EsqueletoDePagina', () => {
  it('avisa que está carregando para leitores de tela', () => {
    const html = renderToStaticMarkup(<EsqueletoDePagina />)
    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('Carregando')
    expect(html).toContain('esqueleto')
  })
})

describe('Badge', () => {
  it('rende o texto com a variante', () => {
    const html = renderToStaticMarkup(<Badge variante="sucesso">Ativo</Badge>)
    expect(html).toContain('badge-sucesso')
    expect(html).toContain('Ativo')
  })
  it('sem variante é neutro', () => {
    expect(renderToStaticMarkup(<Badge>Rascunho</Badge>)).not.toContain('badge-')
  })
})

describe('Alerta', () => {
  it('erro usa role alert; sucesso usa role status', () => {
    expect(renderToStaticMarkup(<Alerta variante="erro">Falhou</Alerta>)).toContain('role="alert"')
    const ok = renderToStaticMarkup(<Alerta variante="sucesso">Salvo</Alerta>)
    expect(ok).toContain('role="status"')
    expect(ok).toContain('alerta-sucesso')
  })
})

describe('tela de erro do sistema', () => {
  it('mostra mensagem segura, o código de correlação e não vaza a mensagem técnica', () => {
    const erro = Object.assign(new Error('SQLITE_ERROR: no such table usuarios'), {
      digest: 'abc123',
    })
    const html = renderToStaticMarkup(<MensagemDeErro error={erro} reset={() => {}} />)
    expect(html).toContain('Tentar de novo')
    expect(html).toContain('abc123')
    expect(html).not.toContain('SQLITE')
    expect(html).not.toContain('no such table')
    expect(html).toContain('role="alert"')
  })
})
