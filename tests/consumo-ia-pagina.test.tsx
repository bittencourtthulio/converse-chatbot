import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'
import { cookieDe, subirServidor, type Servidor } from './apoio/servidor'

let servidor: Servidor
let cookieAdmin: string
let cookieComum: string
const caminho = '/configuracoes/consumo-ia'
const pegar = (consulta = '', cookie?: string) => fetch(`${servidor.base}${caminho}${consulta}`, {
  redirect: 'manual', headers: cookie ? { cookie } : {},
})
beforeAll(async () => {
  await limparBanco()
  const admin = await criarAdmin()
  const comum = await criarUsuario()
  cookieAdmin = await cookieDe(admin.email, admin.senha)
  cookieComum = await cookieDe(comum.email, comum.senha)
  await prisma.chamadaDeIA.createMany({ data: [
    { funcao: 'responderMensagem', origem: 'widget', caminho: '/chat/completions', modelo: 'openai/gpt-4o-mini', status: 'sucesso', custoUsd: 0.00123456, tokensEntrada: 100, tokensSaida: 20, tokensTotal: 120 },
    { funcao: 'transcreverParte', origem: 'conhecimento', caminho: '/chat/completions', modelo: 'google/gemini-2.5-flash', status: 'erro', custoUsd: null },
    { funcao: 'funcao-antiga', origem: 'painel', caminho: '/chat/completions', modelo: 'modelo-antigo', status: 'sucesso', custoUsd: 2, iniciadoEm: new Date(Date.now() - 10 * 86400000) },
  ] })
  servidor = await subirServidor(3241)
}, 180_000)
afterAll(async () => { servidor?.parar(); await limparBanco() })

describe('Consumo de IA nas configurações', () => {
  it('exige sessão e restringe acesso a admin', async () => {
    const anonimo = await pegar()
    expect(anonimo.status).toBe(307); expect(anonimo.headers.get('location')).toContain('/entrar')
    const comum = await pegar('', cookieComum)
    expect(comum.status).toBe(307); expect(new URL(comum.headers.get('location')!, servidor.base).pathname).toBe('/')
  })
  it('abre com indicadores, quatro períodos, chamadas e custo com precisão', async () => {
    const resposta = await pegar('', cookieAdmin)
    expect(resposta.status).toBe(200)
    const html = (await resposta.text()).replaceAll('<!-- -->', '')
    for (const texto of ['Consumo de IA', 'Custo total no período', 'Tokens informados', 'Custo médio por geração', 'Chamadas com erro', 'responderMensagem', 'Chat público', 'transcreverParte', 'Não informado', '0,00123456']) expect(html).toContain(texto)
    for (const dias of [7, 15, 30, 90]) expect(html).toContain(`href="${caminho}?dias=${dias}"`)
    expect(html).toMatch(/<a[^>]*aria-current="page"[^>]*>7 dias<\/a>/)
    expect(html).not.toContain('modelo-antigo')
    expect(html).not.toContain(process.env.ENCRYPTION_KEY!)
    expect(html).not.toContain(process.env.JWT_SECRET!)
  })
  it('troca o período e recalcula os dados exibidos', async () => {
    const html = (await (await pegar('?dias=15', cookieAdmin)).text()).replaceAll('<!-- -->', '')
    expect(html).toContain('modelo-antigo')
    expect(html).toContain('2,00123456')
    expect(html).toMatch(/<a[^>]*aria-current="page"[^>]*>15 dias<\/a>/)
  })
  it('mantém período nos links da paginação e totais em todas as páginas', async () => {
    await prisma.chamadaDeIA.createMany({ data: Array.from({ length: 50 }, () => ({
      funcao: 'listarModelos', origem: 'integracoes', caminho: '/models', status: 'sucesso', custoUsd: 0,
    })) })
    const html = await (await pegar('?dias=15', cookieAdmin)).text()
    expect(html).toContain(`${caminho}?dias=15&amp;pagina=2`)
    const segunda = (await (await pegar('?dias=15&pagina=2', cookieAdmin)).text()).replaceAll('<!-- -->', '')
    expect(segunda).toContain('2,00123456')
    expect(segunda).toContain('Página 2 de 2')
    expect(segunda).toContain(`href="${caminho}?dias=15"`)
  })
  it('explica o início do registro e mostra o estado vazio quando não há chamadas', async () => {
    await prisma.chamadaDeIA.deleteMany()
    const resposta = await pegar('?dias=90', cookieAdmin)
    expect(resposta.status).toBe(200)
    const html = await resposta.text()
    expect(html).toContain('Nenhuma chamada neste período')
    expect(html).toContain('O histórico começa com a ativação deste registro.')
    expect(html).not.toContain('<table')
  })
})
