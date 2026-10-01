/**
 * T-06.03 (FT-10, PR-19): a tela de Auditoria. Componentes por renderização estática e a página
 * contra o servidor de produção do teste, com registros no banco: quando, quem, ação e a frase
 * em português, filtros pela URL, paginação de 25 e os estados vazio e de erro.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { FiltrosDeAuditoria } from '@/componentes/FiltrosDeAuditoria'
import { EstadoVazioDeAuditoria, ListaDeAuditoria, PaginacaoDeAuditoria } from '@/componentes/ListaDeAuditoria'
import type { RegistroListado } from '@/servicos/auditoria'
import { limparBanco } from './ajuda'
import { criarRegistroDeTeste } from './apoio/privacidade'
import { cookieDe, subirServidor, type Servidor } from './apoio/servidor'

const registro = (extra: Partial<RegistroListado> = {}): RegistroListado => ({
  id: 'r1',
  quando: new Date('2026-03-10T15:30:00.000Z'),
  usuarioId: 'u1',
  usuarioRotulo: 'Ana Admin <ana@exemplo.com>',
  acao: 'usuario_editado',
  alvoTipo: 'usuario',
  alvoId: 'u2',
  alvoNome: 'Maria',
  detalhes: { campos: ['papel'], papelAnterior: 'usuario', papelNovo: 'admin' },
  ...extra,
})
const USUARIOS = [
  { id: 'u1', nome: 'Ana Admin', email: 'ana@exemplo.com' },
  { id: 'u2', nome: 'Maria', email: 'maria@exemplo.com' },
]

describe('lista de auditoria (componentes)', () => {
  it('mostra quando, quem, o rótulo da ação e a frase em português, com data-rotulo em cada célula', () => {
    const html = renderToStaticMarkup(<ListaDeAuditoria itens={[registro(), registro({ id: 'r2', acao: 'chave_openrouter_alterada', alvoNome: null, detalhes: {} })]} />)
    for (const t of ['10/03/2026 12:30', 'Ana Admin &lt;ana@exemplo.com&gt;', 'Usuário editado', 'Alterou o papel de Maria de Usuário para Administrador.', 'Chave do OpenRouter trocada', 'Trocou a chave do OpenRouter.']) {
      expect(html, t).toContain(t)
    }
    for (const r of ['Quando', 'Quem', 'Ação', 'Detalhes']) expect(html).toContain(`data-rotulo="${r}"`)
    expect(html).toMatch(/<table[^>]*class="tabela-de-auditoria"[^>]*aria-label="Registro de auditoria"/)
    expect(html).not.toContain('style=')
  })

  it('texto vindo dos detalhes é escapado e a lista não tem controle de editar nem de apagar', () => {
    const html = renderToStaticMarkup(
      <ListaDeAuditoria itens={[registro({ acao: 'agente_excluido', alvoNome: null, detalhes: { nome: '<img src=x onerror=alert(1)>', conversas: 0, fontes: 0 } })]} />,
    )
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img')
    expect(html).not.toMatch(/<button|<form|Apagar|Excluir|Editar/)
  })

  it('usuário removido aparece pelo rótulo gravado', () => {
    const html = renderToStaticMarkup(<ListaDeAuditoria itens={[registro({ usuarioId: null, usuarioRotulo: 'Ex-Colega <ex@exemplo.com>' })]} />)
    expect(html).toContain('Ex-Colega &lt;ex@exemplo.com&gt;')
  })

  it('o estado vazio explica, com e sem filtro', () => {
    const sem = renderToStaticMarkup(<EstadoVazioDeAuditoria filtrado={false} />)
    expect(sem).toContain('Nenhum registro ainda')
    expect(sem).toContain('role="status"')
    const com = renderToStaticMarkup(<EstadoVazioDeAuditoria filtrado />)
    expect(com).toContain('Nenhum registro encontrado')
    expect(com).toContain('href="/configuracoes/auditoria"')
  })
})

describe('filtros e paginação (componentes)', () => {
  it('formulário GET com ação, usuário e período, com os valores atuais marcados', () => {
    const html = renderToStaticMarkup(<FiltrosDeAuditoria usuarios={USUARIOS} filtros={{ acao: 'usuario_criado', usuarioId: 'u2', de: '2026-01-01', ate: '2026-02-01' }} />)
    const abertura = html.slice(0, html.indexOf('>') + 1)
    expect(abertura).toContain('method="get"')
    expect(abertura).toContain('action="/configuracoes/auditoria"')
    expect(abertura).toContain('role="search"')
    expect(html).toMatch(/<select[^>]*name="acao"/)
    expect(html).toMatch(/<option value="usuario_criado" selected="">Usuário criado<\/option>/)
    expect(html).toMatch(/<option value="u2" selected="">Maria/)
    expect(html).toMatch(/<input[^>]*type="date"[^>]*name="de"[^>]*value="2026-01-01"/)
    expect(html).toMatch(/<input[^>]*type="date"[^>]*name="ate"[^>]*value="2026-02-01"/)
    expect(html).toContain('Limpar filtros')
  })

  it('sem filtro ativo não mostra Limpar filtros', () => {
    expect(renderToStaticMarkup(<FiltrosDeAuditoria usuarios={USUARIOS} filtros={{}} />)).not.toContain('Limpar filtros')
  })

  it('a paginação diz o intervalo e mantém os filtros nos links, sem a página 1', () => {
    const html = renderToStaticMarkup(<PaginacaoDeAuditoria filtros={{ acao: 'usuario_criado' }} pagina={2} tamanho={25} total={60} totalDePaginas={3} />)
    expect(html).toContain('26 a 50 de 60 registros')
    expect(html).toContain('href="/configuracoes/auditoria?acao=usuario_criado"')
    expect(html).toContain('href="/configuracoes/auditoria?acao=usuario_criado&amp;pagina=3"')
    expect(html).toContain('aria-current="page"')
  })

  it('com uma página só não há navegação, e sem registros diz isso', () => {
    expect(renderToStaticMarkup(<PaginacaoDeAuditoria filtros={{}} pagina={1} tamanho={25} total={3} totalDePaginas={1} />)).not.toContain('<nav')
    expect(renderToStaticMarkup(<PaginacaoDeAuditoria filtros={{}} pagina={1} tamanho={25} total={0} totalDePaginas={1} />)).toContain('Nenhum registro')
  })
})

describe('página de auditoria (integração com o servidor de produção)', () => {
  const SENHA = 'senha-de-rota-123'
  let servidor: Servidor
  let cookie: string
  const pagina = async (caminho = '/configuracoes/auditoria') => {
    const r = await fetch(`${servidor.base}${caminho}`, { headers: { cookie } })
    return { status: r.status, html: await r.text() }
  }

  beforeAll(async () => {
    await limparBanco()
    const senhaHash = await hashDeSenha(SENHA)
    const admin = await prisma.usuario.create({ data: { nome: 'Ana Admin', email: 'admin.auditoria@teste.local', senhaHash, papel: 'admin' } })
    const maria = await prisma.usuario.create({ data: { nome: 'Maria', email: 'maria.auditoria@teste.local', senhaHash, papel: 'usuario' } })
    for (let i = 0; i < 30; i += 1) {
      await criarRegistroDeTeste({ acao: 'usuario_criado', usuarioId: admin.id, alvoId: maria.id, detalhes: { papel: 'usuario' }, quando: new Date(Date.UTC(2026, 2, 1, 12, 0, i)) })
    }
    await criarRegistroDeTeste({ acao: 'agente_excluido', usuarioId: maria.id, alvoTipo: 'agente', detalhes: { nome: 'Loja', conversas: 2, fontes: 1 }, quando: new Date(Date.UTC(2026, 2, 2, 12)) })
    cookie = await cookieDe('admin.auditoria@teste.local', SENHA)
    servidor = await subirServidor(3208)
  }, 180_000)
  afterAll(async () => {
    servidor?.parar()
    await limparBanco()
  })

  it('abre com os registros, a frase em português e 25 por página, do mais recente ao mais antigo', async () => {
    const { status, html } = await pagina()
    expect(status).toBe(200)
    expect(html).toContain('Auditoria')
    expect(html).toContain('Excluiu o agente &quot;Loja&quot; (2 conversas e 1 fonte apagadas junto).')
    expect(html).toContain('Criou o usuário Maria com o papel Usuário.')
    expect((html.match(/data-rotulo="Quando"/g) ?? []).length).toBe(25)
    expect(html).toContain('1 a 25 de 31 registros')
    expect(html.indexOf('Excluiu o agente')).toBeLessThan(html.indexOf('Criou o usuário Maria'))
  })

  it('a página 2 mostra o resto e o filtro por ação reduz a lista', async () => {
    const dois = await pagina('/configuracoes/auditoria?pagina=2')
    expect((dois.html.match(/data-rotulo="Quando"/g) ?? []).length).toBe(6)
    const filtrada = await pagina('/configuracoes/auditoria?acao=agente_excluido')
    expect((filtrada.html.match(/data-rotulo="Quando"/g) ?? []).length).toBe(1)
    expect(filtrada.html).toContain('1 a 1 de 1 registro')
  })

  it('o filtro por usuário e por período funciona pela URL', async () => {
    const maria = await prisma.usuario.findFirstOrThrow({ where: { nome: 'Maria' } })
    const porUsuario = await pagina(`/configuracoes/auditoria?usuario=${maria.id}`)
    expect((porUsuario.html.match(/data-rotulo="Quando"/g) ?? []).length).toBe(1)
    const porDia = await pagina('/configuracoes/auditoria?de=2026-03-02&ate=2026-03-02')
    expect((porDia.html.match(/data-rotulo="Quando"/g) ?? []).length).toBe(1)
  })

  it('período invertido mostra o aviso na própria tela, sem quebrar', async () => {
    const { status, html } = await pagina('/configuracoes/auditoria?de=2026-03-10&ate=2026-03-01')
    expect(status).toBe(200)
    expect(html).toContain('Confira os filtros')
    expect(html).toContain('a data final vem antes da inicial')
  })

  it('não tem como editar nem apagar: nenhum botão de ação na tela', async () => {
    const { html } = await pagina()
    expect(html).not.toMatch(/Apagar|Excluir registro|Editar/)
  })

  it('sem registros mostra o estado vazio', async () => {
    await prisma.registroDeAuditoria.deleteMany()
    const { html } = await pagina()
    expect(html).toContain('Nenhum registro ainda')
  })
})
