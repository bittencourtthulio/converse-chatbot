// T-05.02: conversas recentes, fontes com erro e primeiros passos do painel (FT-09, PR-81, PR-82).
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { salvarChaveDoOpenrouter } from '@/servicos/integracoes'
import { conversasRecentes, fontesComErro, obterPainel, primeirosPassos } from '@/servicos/painel'
import { criarAdmin, limparBanco } from './ajuda'
import { CHAVE_VALIDA } from './apoio/openrouter-falso'
import { criarAgenteDeTeste, criarConversaDeTeste } from './apoio/historico'

beforeEach(limparBanco)

async function fonte(agenteId: string, status: string, titulo = `Fonte ${status}`) {
  return prisma.fonte.create({ data: { agenteId, tipo: 'texto', titulo, tamanhoBytes: 1, status, mensagemErro: status === 'erro' ? 'Não consegui ler o arquivo.' : null } })
}

describe('conversasRecentes (integração com o banco de teste)', () => {
  it('devolve as 5 mais recentes, da mais nova à mais velha, com rótulo mascarado', async () => {
    const ag = await criarAgenteDeTeste({ nome: 'Vendas' })
    const base = Date.parse('2026-03-01T12:00:00.000Z')
    for (let i = 0; i < 7; i += 1) {
      await criarConversaDeTeste({
        agenteId: ag.id,
        canal: 'widget',
        identificadorExterno: `visitante${i}-abcdefghijklmnop`,
        atualizadoEm: new Date(base + i * 3_600_000),
        mensagens: [{ papel: 'user', conteudo: `pergunta ${i}` }],
      })
    }
    const r = await conversasRecentes()
    expect(r).toHaveLength(5)
    expect(r.map((c) => c.previa)).toEqual(['pergunta 6', 'pergunta 5', 'pergunta 4', 'pergunta 3', 'pergunta 2'])
    expect(r[0]).toMatchObject({ agenteNome: 'Vendas', canal: 'widget', rotulo: 'Visitante visita' })
    expect(JSON.stringify(r)).not.toContain('abcdefghijklmnop')
  })

  it('sem conversas devolve lista vazia', async () => {
    expect(await conversasRecentes()).toEqual([])
  })
})

describe('fontesComErro', () => {
  it('sem erro devolve total 0; com erro traz o agente e a mensagem segura, no máximo 5', async () => {
    const ag = await criarAgenteDeTeste({ nome: 'Suporte' })
    await fonte(ag.id, 'pronto')
    expect(await fontesComErro()).toEqual({ total: 0, itens: [] })
    for (let i = 0; i < 7; i += 1) await fonte(ag.id, 'erro', `Manual ${i}`)
    const r = await fontesComErro()
    expect(r.total).toBe(7)
    expect(r.itens).toHaveLength(5)
    expect(r.itens[0]).toMatchObject({ agenteId: ag.id, agenteNome: 'Suporte', mensagemErro: 'Não consegui ler o arquivo.' })
    expect(r.itens[0]?.titulo).toMatch(/^Manual /)
    expect(r.itens[0]?.id).toEqual(expect.any(String))
  })
})

describe('primeirosPassos (funcional)', () => {
  it('numa instalação vazia nenhum passo está feito e a lista não está completa', async () => {
    expect(await primeirosPassos()).toEqual({
      chaveConfigurada: false,
      primeiroAgente: false,
      primeiraFontePronta: false,
      canalAtivo: false,
      completo: false,
    })
  })

  it('cada passo vira verdadeiro com o seu fato; só com os quatro a lista fica completa', async () => {
    const admin = await criarAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: CHAVE_VALIDA })
    expect(await primeirosPassos()).toMatchObject({ chaveConfigurada: true, completo: false })
    const ag = await criarAgenteDeTeste({ criadoPorId: admin.id })
    expect(await primeirosPassos()).toMatchObject({ primeiroAgente: true, completo: false })
    await fonte(ag.id, 'erro')
    expect((await primeirosPassos()).primeiraFontePronta).toBe(false)
    await fonte(ag.id, 'pronto')
    expect(await primeirosPassos()).toMatchObject({ primeiraFontePronta: true, canalAtivo: false, completo: false })
    await prisma.configuracaoDoChat.create({ data: { agenteId: ag.id, ativo: false } })
    expect((await primeirosPassos()).canalAtivo).toBe(false)
    await prisma.configuracaoDoChat.update({ where: { agenteId: ag.id }, data: { ativo: true } })
    expect(await primeirosPassos()).toEqual({
      chaveConfigurada: true,
      primeiroAgente: true,
      primeiraFontePronta: true,
      canalAtivo: true,
      completo: true,
    })
  })

  it('um bot do Telegram conectado também conta como canal ativo', async () => {
    const ag = await criarAgenteDeTeste()
    await prisma.canalTelegram.create({
      data: { agenteId: ag.id, tokenCifrado: 'v1:x', botId: '1', botUsername: 'bot', botNome: 'Bot', segredoDoWebhookHash: 'h', webhookUrl: 'https://x.test/w' },
    })
    expect((await primeirosPassos()).canalAtivo).toBe(true)
  })

  it('nunca devolve a chave nem a máscara dela, só verdadeiro ou falso', async () => {
    const admin = await criarAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: CHAVE_VALIDA })
    const texto = JSON.stringify(await obterPainel(new Date()))
    expect(texto).not.toContain(CHAVE_VALIDA)
    expect(texto).not.toContain(CHAVE_VALIDA.slice(0, 8))
    expect(texto).not.toMatch(/openrouterChave|v1:/)
  })
})

describe('obterPainel', () => {
  it('junta números, série, recentes, erros e passos numa chamada', async () => {
    const p = await obterPainel(new Date(2026, 2, 15, 12, 0, 0))
    expect(Object.keys(p).sort()).toEqual(['fontesComErro', 'numeros', 'passos', 'recentes', 'serie'])
    expect(p.serie).toHaveLength(14)
    expect(p.numeros.agentes).toBe(0)
  })
})
