import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { LINHA_DE_CONDUTA } from '@/servicos/chat-prompt'
import { anexarMensagem, criar as criarConversa } from '@/servicos/conversas'
import { limparBanco } from './ajuda'
import { iniciarOpenRouterFalso, type OpenRouterFalso } from './apoio/openrouter-falso'
import { cenarioDeChatComBase as cenarioDeChat, coletar, responderMensagem } from './apoio/chat'

let falso: OpenRouterFalso
const baseOriginal = process.env.OPENROUTER_BASE_URL

beforeEach(async () => {
  await limparBanco()
  falso = await iniciarOpenRouterFalso({ trechos: ['A troca', ' é em ', 'sete dias [1].'] })
  process.env.OPENROUTER_BASE_URL = falso.url
})
afterEach(async () => {
  await falso.fechar()
  if (baseOriginal === undefined) delete process.env.OPENROUTER_BASE_URL
  else process.env.OPENROUTER_BASE_URL = baseOriginal
})

const corpoEnviado = () =>
  falso.requisicoes.filter((r) => r.caminho.endsWith('/chat/completions')).at(-1)!.corpo as {
    model: string
    temperature: number
    max_tokens: number
    stream: boolean
    messages: Array<{ role: string; content: string }>
  }

describe('responderMensagem: turno completo', () => {
  it('emite inicio, os trechos na ordem e o fim, e grava as duas mensagens', async () => {
    const { admin, agente } = await cenarioDeChat()
    const { eventos, erro } = await coletar(
      responderMensagem({
        agenteId: agente.id,
        canal: 'painel',
        criadoPorId: admin.id,
        mensagem: '  Qual o prazo de troca?  ',
      }),
    )
    expect(erro).toBeUndefined()
    expect(eventos.map((e) => e.tipo)).toEqual(['inicio', 'trecho', 'trecho', 'trecho', 'fontes', 'fim'])
    const inicio = eventos[0]!
    const fim = eventos.at(-1)!
    if (inicio.tipo !== 'inicio' || fim.tipo !== 'fim') throw new Error('eventos fora do esperado')
    expect(eventos.filter((e) => e.tipo === 'trecho').map((e) => (e as { texto: string }).texto)).toEqual([
      'A troca',
      ' é em ',
      'sete dias [1].',
    ])
    expect(fim.conversaId).toBe(inicio.conversaId)
    expect(fim.tamanho).toBe('A troca é em sete dias [1].'.length)

    const mensagens = await prisma.mensagem.findMany({
      where: { conversaId: inicio.conversaId },
      orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }],
    })
    expect(mensagens.map((m) => [m.papel, m.conteudo])).toEqual([
      ['user', 'Qual o prazo de troca?'],
      ['assistant', 'A troca é em sete dias [1].'],
    ])
    expect(mensagens[1]!.id).toBe(fim.mensagemId)
    expect(mensagens[1]!.modelo).toBe('openai/gpt-4o-mini')
    const conversa = await prisma.conversa.findUniqueOrThrow({ where: { id: inicio.conversaId } })
    expect(conversa).toMatchObject({ canal: 'painel', criadoPorId: admin.id, titulo: 'Qual o prazo de troca?' })
  })

  it('envia ao provedor o sistema, o histórico, a temperatura e o teto de tokens', async () => {
    const { agente } = await cenarioDeChat({ instrucoes: 'Você é a Ana, atendente da loja.' })
    await coletar(responderMensagem({ agenteId: agente.id, canal: 'painel', mensagem: 'Qual o prazo de troca?' }))
    const corpo = corpoEnviado()
    expect(corpo.model).toBe('openai/gpt-4o-mini')
    expect(corpo.temperature).toBe(0.3)
    expect(corpo.max_tokens).toBe(1024)
    expect(corpo.stream).toBe(true)
    expect(corpo.messages[0]!.role).toBe('system')
    expect(corpo.messages[0]!.content).toContain('Você é a Ana, atendente da loja.')
    expect(corpo.messages[0]!.content).toContain(LINHA_DE_CONDUTA)
    expect(corpo.messages.slice(1)).toEqual([{ role: 'user', content: 'Qual o prazo de troca?' }])
  })

  it('retomar a conversa envia o histórico e grava na mesma conversa', async () => {
    const { admin, agente } = await cenarioDeChat()
    const primeira = await coletar(
      responderMensagem({ agenteId: agente.id, canal: 'painel', criadoPorId: admin.id, mensagem: 'Primeira troca' }),
    )
    const conversaId = (primeira.eventos[0] as { conversaId: string }).conversaId
    const segunda = await coletar(
      responderMensagem({
        agenteId: agente.id,
        conversaId,
        canal: 'painel',
        criadoPorId: admin.id,
        mensagem: 'Segunda troca',
      }),
    )
    expect((segunda.eventos.at(-1) as { conversaId: string }).conversaId).toBe(conversaId)
    expect(corpoEnviado().messages.slice(1).map((m) => [m.role, m.content])).toEqual([
      ['user', 'Primeira troca'],
      ['assistant', 'A troca é em sete dias [1].'],
      ['user', 'Segunda troca'],
    ])
    expect(await prisma.conversa.count()).toBe(1)
    expect(await prisma.mensagem.count()).toBe(4)
  })

  it('manda no máximo 20 mensagens de histórico', async () => {
    const { admin, agente } = await cenarioDeChat()
    const conversa = await criarConversa({ agenteId: agente.id, canal: 'painel', criadoPorId: admin.id })
    for (let i = 1; i <= 30; i += 1) {
      await anexarMensagem(conversa.id, { papel: i % 2 ? 'user' : 'assistant', conteudo: `m${i}` })
    }
    await coletar(
      responderMensagem({
        agenteId: agente.id,
        conversaId: conversa.id,
        canal: 'painel',
        criadoPorId: admin.id,
        mensagem: 'troca agora',
      }),
    )
    const historico = corpoEnviado().messages.slice(1)
    expect(historico.length).toBeLessThanOrEqual(20)
    expect(historico.at(-1)).toEqual({ role: 'user', content: 'troca agora' })
  })

  it('canal de visitante grava o identificador externo e não exige usuário', async () => {
    const { agente } = await cenarioDeChat()
    const { eventos } = await coletar(
      responderMensagem({
        agenteId: agente.id,
        canal: 'widget',
        identificadorExterno: 'visitante-7',
        mensagem: 'Oi',
      }),
    )
    const conversaId = (eventos[0] as { conversaId: string }).conversaId
    const conversa = await prisma.conversa.findUniqueOrThrow({ where: { id: conversaId } })
    expect(conversa).toMatchObject({ canal: 'widget', identificadorExterno: 'visitante-7', criadoPorId: null })
  })
})

describe('responderMensagem: o que é recusado antes de gravar', () => {
  it.each([
    ['vazia', ''],
    ['só espaços', '   \n\t '],
    ['acima de 4000 caracteres', 'a'.repeat(4001)],
    ['que não é texto', 42],
    ['ausente', undefined],
  ])('mensagem %s é 422 e nada é gravado nem enviado', async (_nome, mensagem) => {
    const { agente } = await cenarioDeChat()
    const { eventos, erro } = await coletar(
      responderMensagem({ agenteId: agente.id, canal: 'painel', mensagem }),
    )
    expect(erro).toMatchObject({ status: 422, codigo: 'entrada_invalida' })
    expect(eventos).toEqual([])
    expect(await prisma.conversa.count()).toBe(0)
    expect(await prisma.mensagem.count()).toBe(0)
    expect(falso.requisicoes.filter((r) => r.caminho.endsWith('/chat/completions'))).toHaveLength(0)
  })

  it('aceita exatamente 4000 caracteres', async () => {
    const { agente } = await cenarioDeChat()
    const { erro } = await coletar(
      responderMensagem({ agenteId: agente.id, canal: 'painel', mensagem: 'a'.repeat(4000) }),
    )
    expect(erro).toBeUndefined()
  })

  it('agente inexistente é 404', async () => {
    await cenarioDeChat()
    const { erro } = await coletar(
      responderMensagem({ agenteId: 'nao-existe', canal: 'painel', mensagem: 'Oi' }),
    )
    expect(erro).toMatchObject({ status: 404 })
    expect(await prisma.conversa.count()).toBe(0)
  })

  it('sem chave do OpenRouter falha com chat_sem_chave e não grava nada', async () => {
    const { agente } = await cenarioDeChat({ comChave: false })
    const { eventos, erro } = await coletar(
      responderMensagem({ agenteId: agente.id, canal: 'painel', mensagem: 'Oi' }),
    )
    expect(erro).toMatchObject({ status: 409, codigo: 'chat_sem_chave' })
    expect((erro as Error).message).toMatch(/administrador/i)
    expect(eventos).toEqual([])
    expect(await prisma.conversa.count()).toBe(0)
    expect(await prisma.mensagem.count()).toBe(0)
  })

  it.each([
    ['outro usuário', { criadoPorId: 'outro' }],
    ['outro canal', { canal: 'widget' as const }],
  ])('conversa de %s é 404 e nada é gravado nela', async (_nome, diferente) => {
    const { admin, agente } = await cenarioDeChat()
    const conversa = await criarConversa({ agenteId: agente.id, canal: 'painel', criadoPorId: admin.id })
    const { erro } = await coletar(
      responderMensagem({
        agenteId: agente.id,
        conversaId: conversa.id,
        canal: 'painel',
        criadoPorId: admin.id,
        mensagem: 'Oi',
        ...diferente,
      }),
    )
    expect(erro).toMatchObject({ status: 404 })
    expect(await prisma.mensagem.count()).toBe(0)
  })
})
