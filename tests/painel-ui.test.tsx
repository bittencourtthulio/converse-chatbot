/**
 * T-05.04: o painel inicial (FT-09, PR-81, PR-82): cartões, gráfico, conversas recentes,
 * alerta de fontes com erro e primeiros passos. Componentes por renderização estática e a
 * página contra o servidor de produção do teste, com dados.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { salvarChaveDoOpenrouter } from '@/servicos/integracoes'
import { CartoesDoPainel } from '@/componentes/CartoesDoPainel'
import { ConversasRecentes } from '@/componentes/ConversasRecentes'
import { PrimeirosPassos } from '@/componentes/PrimeirosPassos'
import { limparBanco } from './ajuda'
import { CHAVE_VALIDA } from './apoio/openrouter-falso'
import { criarAgenteDeTeste, criarConversaDeTeste } from './apoio/historico'
import { cookieDe, subirServidor, type Servidor } from './apoio/servidor'

const NUMEROS = {
  agentes: 3,
  fontesProntas: 7,
  fontesComErro: 2,
  conversas: 11,
  mensagens: 45,
  porCanal: [
    { canal: 'painel' as const, conversas: 2, mensagens: 6 },
    { canal: 'widget' as const, conversas: 7, mensagens: 30 },
    { canal: 'telegram' as const, conversas: 2, mensagens: 9 },
  ],
}

describe('cartões do painel', () => {
  it('mostra agentes, fontes prontas e com erro, conversas e mensagens dos 7 dias', () => {
    const html = renderToStaticMarkup(<CartoesDoPainel numeros={NUMEROS} />)
    for (const [rotulo, valor] of [['Agentes', 3], ['Fontes prontas', 7], ['Fontes com erro', 2], ['Conversas', 11], ['Mensagens', 45]] as const) {
      expect(html, rotulo).toMatch(new RegExp(`${rotulo}[^<]*</span><strong[^>]*>${valor}<`))
    }
    expect(html).toContain('últimos 7 dias')
  })
  it('mostra a quebra por canal com o nome do canal em texto', () => {
    const html = renderToStaticMarkup(<CartoesDoPainel numeros={NUMEROS} />)
    for (const t of ['Painel', 'Chat embutido', 'Telegram', '7 conversas', '30 mensagens', '2 conversas', '9 mensagens']) expect(html, t).toContain(t)
  })
  it('fonte com erro é destacada por texto, e zero erro não vira alarme', () => {
    expect(renderToStaticMarkup(<CartoesDoPainel numeros={NUMEROS} />)).toContain('precisam de atenção')
    expect(renderToStaticMarkup(<CartoesDoPainel numeros={{ ...NUMEROS, fontesComErro: 0 }} />)).not.toContain('precisam de atenção')
  })
})

describe('primeiros passos', () => {
  const pendente = { chaveConfigurada: false, primeiroAgente: false, primeiraFontePronta: false, canalAtivo: false, completo: false }
  it('lista os quatro passos, cada um com o estado em texto', () => {
    const html = renderToStaticMarkup(<PrimeirosPassos passos={{ ...pendente, primeiroAgente: true }} ehAdmin />)
    expect(html).toContain('Primeiros passos')
    expect(html.match(/<li/g)).toHaveLength(4)
    expect(html).toContain('Feito')
    expect(html).toContain('Pendente')
    // o passo feito não oferece mais o link; os pendentes, sim
    expect(html).not.toContain('href="/agentes/novo"')
    expect(renderToStaticMarkup(<PrimeirosPassos passos={pendente} ehAdmin />)).toContain('href="/agentes/novo"')
  })
  it('só o admin recebe o link das Integrações; o usuário comum vê o passo sem link', () => {
    const admin = renderToStaticMarkup(<PrimeirosPassos passos={pendente} ehAdmin />)
    const comum = renderToStaticMarkup(<PrimeirosPassos passos={pendente} ehAdmin={false} />)
    expect(admin).toContain('href="/configuracoes/integracoes"')
    expect(comum).not.toContain('/configuracoes/integracoes')
    expect(comum).toContain('administrador')
  })
  it('some sozinha quando todos os passos estão feitos', () => {
    expect(renderToStaticMarkup(<PrimeirosPassos passos={{ ...pendente, chaveConfigurada: true, primeiroAgente: true, primeiraFontePronta: true, canalAtivo: true, completo: true }} ehAdmin />)).toBe('')
  })
})

describe('conversas recentes', () => {
  const item = { id: 'c1', agenteId: 'a1', agenteNome: 'Vendas', canal: 'telegram', rotulo: 'Telegram: Maria', totalDeMensagens: 3, atualizadoEm: new Date('2026-03-10T15:30:00.000Z'), previa: 'Quero trocar' }
  it('lista com link para cada conversa e para ver todas', () => {
    const html = renderToStaticMarkup(<ConversasRecentes itens={[item, { ...item, id: 'c2', rotulo: 'Visitante abcdef', canal: 'widget' }]} />)
    expect(html).toContain('href="/conversas/c1"')
    expect(html).toContain('href="/conversas/c2"')
    expect(html).toContain('Telegram: Maria')
    expect(html).toContain('Quero trocar')
    expect(html).toContain('href="/conversas"')
  })
  it('sem conversas explica como gerar a primeira', () => {
    const html = renderToStaticMarkup(<ConversasRecentes itens={[]} />)
    expect(html).toContain('Nenhuma conversa ainda')
    expect(html).toContain('Testar')
  })
  it('texto de visitante na prévia aparece escapado', () => {
    const html = renderToStaticMarkup(<ConversasRecentes itens={[{ ...item, previa: '<script>alert(1)</script>' }]} />)
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})

describe('página inicial (servidor de produção)', () => {
  let servidor: Servidor
  let cookieComum: string
  let cookieAdmin: string
  let agenteId: string
  const pedir = (c: string) => fetch(`${servidor.base}/`, { redirect: 'manual', headers: { cookie: c } })

  beforeAll(async () => {
    await limparBanco()
    const senhaHash = await hashDeSenha('senha-de-rota-123')
    const admin = await prisma.usuario.create({ data: { nome: 'Adm', email: 'adm.painel@teste.local', senhaHash, papel: 'admin' } })
    await prisma.usuario.create({ data: { nome: 'Comum', email: 'comum.painel@teste.local', senhaHash, papel: 'usuario' } })
    agenteId = (await criarAgenteDeTeste({ nome: 'Vendas', criadoPorId: admin.id })).id
    await prisma.fonte.create({ data: { agenteId, tipo: 'texto', titulo: 'Manual quebrado', tamanhoBytes: 1, status: 'erro', mensagemErro: 'Não consegui ler o arquivo.' } })
    await criarConversaDeTeste({ agenteId, canal: 'widget', identificadorExterno: 'painelvisitante123456789', mensagens: [{ papel: 'user', conteudo: 'Quero saber o prazo' }, { papel: 'assistant', conteudo: 'Cinco dias.' }] })
    await criarConversaDeTeste({ agenteId, canal: 'telegram', titulo: 'Telegram: Maria', identificadorExterno: '555000111', mensagens: [{ papel: 'user', conteudo: 'Oi' }] })
    cookieComum = await cookieDe('comum.painel@teste.local', 'senha-de-rota-123')
    cookieAdmin = await cookieDe('adm.painel@teste.local', 'senha-de-rota-123')
    servidor = await subirServidor(3205)
  }, 120_000)

  afterAll(async () => {
    servidor?.parar()
    await limparBanco()
  })

  it('com dados traz os cartões, o gráfico, as conversas recentes e o alerta de fontes com erro', async () => {
    const r = await pedir(cookieComum)
    expect(r.status).toBe(200)
    const html = await r.text()
    expect(html).toContain('Fontes com erro')
    expect(html).toContain('Manual quebrado')
    expect(html).toMatch(/<svg[^>]*role="img"/)
    expect(html).toContain('Ver os dados em tabela')
    expect(html).toContain('Visitante painel')
    expect(html).toContain('Telegram: Maria')
    expect(html).toContain('Cinco dias.')
    expect(html).toMatch(/href="\/conversas\/[a-z0-9]+"/)
    expect(html).not.toContain('painelvisitante123456789')
    expect(html).not.toContain('555000111')
  })

  it('mantém o título e o subtítulo do painel', async () => {
    const html = await (await pedir(cookieComum)).text()
    expect(html).toContain('titulo-da-pagina')
    expect(html).toContain('>Painel<')
    expect(html).toContain('Visão geral da sua conta')
  })

  it('a instalação ainda incompleta mostra os primeiros passos; o link da chave é só do admin', async () => {
    const comum = await (await pedir(cookieComum)).text()
    const admin = await (await pedir(cookieAdmin)).text()
    expect(comum).toContain('Primeiros passos')
    expect(comum).not.toContain('href="/configuracoes/integracoes"')
    expect(admin).toContain('href="/configuracoes/integracoes"')
    expect(admin).toContain('Cadastrar usuário')
  })

  it('a lista de primeiros passos some sozinha quando tudo está feito', async () => {
    const admin = await prisma.usuario.findUniqueOrThrow({ where: { email: 'adm.painel@teste.local' } })
    await salvarChaveDoOpenrouter({ id: admin.id, nome: admin.nome, email: admin.email, papel: admin.papel }, { chave: CHAVE_VALIDA })
    await prisma.fonte.create({ data: { agenteId, tipo: 'texto', titulo: 'Manual bom', tamanhoBytes: 1, status: 'pronto' } })
    await prisma.configuracaoDoChat.create({ data: { agenteId, ativo: true } })
    const html = await (await pedir(cookieAdmin)).text()
    expect(html).not.toContain('Primeiros passos')
    expect(html).not.toContain(CHAVE_VALIDA)
  })
})
