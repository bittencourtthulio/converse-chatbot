/**
 * T-04.02: a lista de conversas (FT-09). Componentes por renderização estática e a página
 * contra o servidor de produção do teste, com conversas dos três canais.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { BadgeDeCanal } from '@/componentes/BadgeDeCanal'
import { FiltrosDeConversas } from '@/componentes/FiltrosDeConversas'
import { EstadoVazioDeConversas, ListaDeConversas, PaginacaoDeConversas } from '@/componentes/ListaDeConversas'
import type { ItemDoHistorico } from '@/servicos/historico'
import { limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarConversaDeTeste } from './apoio/historico'
import { cookieDe, subirServidor, type Servidor } from './apoio/servidor'

const item = (extra: Partial<ItemDoHistorico> = {}): ItemDoHistorico => ({
  id: 'c1',
  agenteId: 'a1',
  agenteNome: 'Vendas',
  canal: 'widget',
  rotulo: 'Visitante abcdef',
  totalDeMensagens: 4,
  atualizadoEm: new Date('2026-03-10T15:30:00.000Z'),
  previa: 'Obrigado pela ajuda',
  ...extra,
})

const AGENTES = [
  { id: 'a1', nome: 'Vendas' },
  { id: 'a2', nome: 'Suporte' },
]

describe('badge de canal', () => {
  it('diz o canal por texto e usa o token do canal, nunca só cor', () => {
    for (const [canal, texto] of [['painel', 'Painel'], ['widget', 'Chat embutido'], ['telegram', 'Telegram']] as const) {
      const html = renderToStaticMarkup(<BadgeDeCanal canal={canal} />)
      expect(html).toContain(texto)
      expect(html).toContain(`badge-de-canal-${canal}`)
      expect(html).not.toContain('style=')
    }
  })
})

describe('lista de conversas (componentes)', () => {
  it('mostra rótulo, agente, canal, mensagens, atividade e prévia, e a linha é um link para a conversa', () => {
    const html = renderToStaticMarkup(
      <ListaDeConversas
        itens={[
          item(),
          item({ id: 'c2', canal: 'telegram', rotulo: 'Telegram: Maria', previa: 'Quero trocar', totalDeMensagens: 1 }),
          item({ id: 'c3', canal: 'painel', rotulo: 'Ana', agenteNome: 'Suporte' }),
        ]}
      />,
    )
    for (const t of ['Visitante abcdef', 'Telegram: Maria', 'Ana', 'Vendas', 'Suporte', 'Chat embutido', 'Obrigado pela ajuda', 'Quero trocar', '10/03/2026 12:30']) {
      expect(html, t).toContain(t)
    }
    expect(html).toContain('href="/conversas/c1"')
    expect(html).toContain('href="/conversas/c2"')
    expect(html).toContain('href="/conversas/c3"')
    expect(html).toContain('scope="col"')
    expect(html).toContain('data-rotulo="Mensagens"')
    expect(html).toContain('aria-label="Conversas"')
    expect(html).not.toContain('style=')
  })

  it('texto de visitante na prévia ou no rótulo aparece escapado', () => {
    const html = renderToStaticMarkup(
      <ListaDeConversas itens={[item({ previa: '<script>alert(1)</script><img src=x onerror=alert(2)>', rotulo: '<b>x</b>' })]} />,
    )
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('<b>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('sem seleção não mostra caixas; com seleção mostra uma por linha com nome acessível', () => {
    const sem = renderToStaticMarkup(<ListaDeConversas itens={[item()]} />)
    expect(sem).not.toContain('type="checkbox"')
    const com = renderToStaticMarkup(
      <ListaDeConversas itens={[item(), item({ id: 'c2', rotulo: 'Outro' })]} selecionadas={['c1']} aoAlternar={() => undefined} aoAlternarTodas={() => undefined} />,
    )
    expect(com.match(/type="checkbox"/g)).toHaveLength(3)
    expect(com).toContain('aria-label="Selecionar a conversa com Visitante abcdef"')
    expect(com).toContain('aria-label="Selecionar todas as conversas desta página"')
    expect(com).toMatch(/checked=""[^>]*aria-label="Selecionar a conversa com Visitante abcdef"|aria-label="Selecionar a conversa com Visitante abcdef"[^>]*checked=""/)
  })
})

describe('estado vazio de conversas', () => {
  it('sem filtro explica como gerar conversas: testar, publicar e conectar o Telegram', () => {
    const html = renderToStaticMarkup(<EstadoVazioDeConversas filtrado={false} />)
    expect(html).toContain('Nenhuma conversa ainda')
    expect(html).toContain('Testar')
    expect(html).toContain('Publicar')
    expect(html).toContain('Telegram')
    expect(html).toContain('href="/agentes"')
  })
  it('com filtro diz que nada foi encontrado e oferece limpar', () => {
    const html = renderToStaticMarkup(<EstadoVazioDeConversas filtrado />)
    expect(html).toContain('Nenhuma conversa encontrada')
    expect(html).toContain('href="/conversas"')
  })
})

describe('filtros de conversas', () => {
  it('traz agente, canal, texto e período, com o que está filtrado já escolhido', () => {
    const html = renderToStaticMarkup(
      <FiltrosDeConversas agentes={AGENTES} filtros={{ agenteId: 'a2', canal: 'telegram', texto: 'troca', de: '2026-03-01', ate: '2026-03-31', pagina: 1 }} />,
    )
    expect(html).toContain('name="agente"')
    expect(html).toContain('name="canal"')
    expect(html).toContain('name="texto"')
    expect(html).toContain('name="de"')
    expect(html).toContain('name="ate"')
    expect(html).toContain('<option value="a2" selected="">Suporte</option>')
    expect(html).toContain('<option value="telegram" selected="">Telegram</option>')
    expect(html).toContain('value="troca"')
    expect(html).toContain('value="2026-03-01"')
    expect(html).toContain('href="/conversas"')
    expect(html).toContain('role="search"')
    expect(html).toContain('method="get"')
  })

  it('sem filtro ativo não oferece Limpar filtros', () => {
    const html = renderToStaticMarkup(<FiltrosDeConversas agentes={AGENTES} filtros={{ pagina: 1 }} />)
    expect(html).not.toContain('Limpar filtros')
  })
})

describe('paginação de conversas', () => {
  it('marca a página atual, liga a próxima e desabilita a anterior na primeira', () => {
    const html = renderToStaticMarkup(
      <PaginacaoDeConversas filtros={{ canal: 'widget', pagina: 1 }} pagina={1} tamanho={25} total={30} totalDePaginas={2} />,
    )
    expect(html).toContain('aria-current="page"')
    expect(html).toContain('href="/conversas?canal=widget&amp;pagina=2"')
    expect(html).toContain('aria-disabled="true"')
    expect(html).toContain('1 a 25 de 30 conversas')
  })
  it('com uma página só não mostra navegação', () => {
    const html = renderToStaticMarkup(<PaginacaoDeConversas filtros={{ pagina: 1 }} pagina={1} tamanho={25} total={3} totalDePaginas={1} />)
    expect(html).not.toContain('<nav')
    expect(html).toContain('1 a 3 de 3 conversas')
  })
})

describe('página /conversas (servidor de produção)', () => {
  let servidor: Servidor
  let cookie: string
  const pedir = (caminho: string, c: string | undefined = cookie) =>
    fetch(`${servidor.base}${caminho}`, { redirect: 'manual', headers: c ? { cookie: c } : {} })

  beforeAll(async () => {
    await limparBanco()
    const u = await prisma.usuario.create({
      data: { nome: 'Ana Souza', email: 'ana.lista@teste.local', senhaHash: await hashDeSenha('senha-de-rota-123'), papel: 'usuario' },
    })
    const vendas = await criarAgenteDeTeste({ nome: 'Vendas', criadoPorId: u.id })
    const suporte = await criarAgenteDeTeste({ nome: 'Suporte', criadoPorId: u.id })
    await criarConversaDeTeste({ agenteId: vendas.id, canal: 'painel', criadoPorId: u.id, mensagens: [{ papel: 'user', conteudo: 'Teste do painel' }] })
    await criarConversaDeTeste({ agenteId: vendas.id, canal: 'widget', identificadorExterno: 'zzyyxx123456789012', mensagens: [{ papel: 'user', conteudo: 'Qual o prazo de entrega?' }, { papel: 'assistant', conteudo: 'Cinco dias.' }] })
    await criarConversaDeTeste({ agenteId: suporte.id, canal: 'telegram', identificadorExterno: '99887766', titulo: 'Telegram: Maria', mensagens: [{ papel: 'user', conteudo: 'Preciso de ajuda' }] })
    cookie = await cookieDe('ana.lista@teste.local', 'senha-de-rota-123')
    servidor = await subirServidor(3203)
  }, 120_000)

  afterAll(async () => {
    servidor?.parar()
    await limparBanco()
  })

  it('sem sessão manda para o login', async () => {
    const r = await pedir('/conversas', '')
    expect(r.status).toBe(307)
    expect(r.headers.get('location')).toContain('/entrar')
  })

  it('com sessão traz título, filtros, as conversas dos três canais e links para cada uma', async () => {
    const r = await pedir('/conversas')
    expect(r.status).toBe(200)
    const html = await r.text()
    expect(html).toContain('Conversas')
    expect(html).toContain('role="search"')
    for (const t of ['Ana Souza', 'Visitante zzyyxx', 'Telegram: Maria', 'Chat embutido', 'Telegram', 'Cinco dias.', 'Preciso de ajuda']) {
      expect(html, t).toContain(t)
    }
    expect(html).toMatch(/href="\/conversas\/[a-z0-9]+"/)
    expect(html).toContain('<option value="')
    expect(html).toContain('Vendas')
    expect(html).not.toContain('zzyyxx123456789012')
    expect(html).not.toContain('99887766')
  })

  it('os filtros da URL reduzem a lista', async () => {
    const soWidget = await (await pedir('/conversas?canal=widget')).text()
    expect(soWidget).toContain('Visitante zzyyxx')
    expect(soWidget).not.toContain('Telegram: Maria')
    const porTexto = await (await pedir('/conversas?texto=ajuda')).text()
    expect(porTexto).toContain('Telegram: Maria')
    expect(porTexto).not.toContain('Visitante zzyyxx')
    expect(porTexto).toContain('Limpar filtros')
  })

  it('sem resultado mostra o estado vazio dos filtros; filtro inválido não derruba a página', async () => {
    const vazio = await (await pedir('/conversas?texto=nada-disso-existe')).text()
    expect(vazio).toContain('Nenhuma conversa encontrada')
    const invertido = await pedir('/conversas?de=2026-03-10&ate=2026-03-01')
    expect(invertido.status).toBe(200)
    expect(await invertido.text()).toContain('período')
  })
})
