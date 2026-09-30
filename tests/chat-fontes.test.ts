/**
 * Evento `fontes` e gravação em `Mensagem.fontes` (FT-05, PR-53): o evento sai
 * antes do `fim`, o JSON é gravado com a resposta e uma falha nas fontes não
 * derruba a resposta.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import * as conversas from '@/servicos/conversas'
import * as fontesDaResposta from '@/servicos/fontes-da-resposta'
import { limparBanco } from './ajuda'
import { iniciarOpenRouterFalso, type OpenRouterFalso } from './apoio/openrouter-falso'
import { cenarioDeChat, coletar, responderMensagem } from './apoio/chat'
import { criarBase } from './apoio/conhecimento'

let falso: OpenRouterFalso
const baseOriginal = process.env.OPENROUTER_BASE_URL

beforeEach(async () => {
  await limparBanco()
  falso = await iniciarOpenRouterFalso({ trechos: ['Você pode trocar em sete dias ', '[1]', '.'] })
  process.env.OPENROUTER_BASE_URL = falso.url
})
afterEach(async () => {
  vi.restoreAllMocks()
  await falso.fechar()
  if (baseOriginal === undefined) delete process.env.OPENROUTER_BASE_URL
  else process.env.OPENROUTER_BASE_URL = baseOriginal
})

async function turno(agenteId: string, criadoPorId: string, mensagem: string) {
  return coletar(responderMensagem({ agenteId, canal: 'painel', criadoPorId, mensagem }))
}

describe('evento fontes', () => {
  it('sai depois dos trechos e antes do fim, e a mensagem guarda o mesmo JSON, com a citação', async () => {
    const { admin, agente } = await cenarioDeChat()
    const base = await criarBase({
      agenteId: agente.id,
      titulo: 'Política de troca',
      textos: ['Aceitamos a troca em até sete dias corridos.'],
    })
    await criarBase({ agenteId: agente.id, titulo: 'Entrega', textos: ['A troca do endereço de entrega é grátis.'] })

    const { eventos, erro } = await turno(agente.id, admin.id, 'Qual o prazo de troca?')

    expect(erro).toBeUndefined()
    expect(eventos.map((e) => e.tipo)).toEqual(['inicio', 'trecho', 'trecho', 'trecho', 'fontes', 'fim'])
    const evento = eventos.find((e) => e.tipo === 'fontes')
    if (evento?.tipo !== 'fontes') throw new Error('sem evento fontes')
    expect(evento.fontes).toHaveLength(2)
    const politica = evento.fontes.find((f) => f.fonteId === base.fonteId)!
    expect(politica).toMatchObject({
      titulo: 'Política de troca',
      citada: true,
      trechos: [{ n: 1, posicao: 1, trechoTexto: 'Aceitamos a troca em até sete dias corridos.' }],
    })
    expect(evento.fontes.find((f) => f.fonteId !== base.fonteId)!.citada).toBe(false)

    const fim = eventos.at(-1)!
    if (fim.tipo !== 'fim') throw new Error('sem fim')
    const gravada = await prisma.mensagem.findUniqueOrThrow({ where: { id: fim.mensagemId } })
    expect(JSON.parse(gravada.fontes!)).toEqual(evento.fontes)
    const doUsuario = await prisma.mensagem.findFirstOrThrow({ where: { papel: 'user' } })
    expect(doUsuario.fontes).toBeNull()
  })

  it('sem trechos relevantes não há evento fontes e a coluna fica nula', async () => {
    const { admin, agente } = await cenarioDeChat()
    await criarBase({ agenteId: agente.id, textos: ['Vendemos cadernos.'] })
    const { eventos } = await turno(agente.id, admin.id, 'Qual a capital da Austrália?')
    expect(eventos.map((e) => e.tipo)).not.toContain('fontes')
    expect((await prisma.mensagem.findFirstOrThrow({ where: { papel: 'assistant' } })).fontes).toBeNull()
  })

  it('agente sem fonte pronta também não emite fontes', async () => {
    const { admin, agente } = await cenarioDeChat()
    const { eventos } = await turno(agente.id, admin.id, 'Qual o prazo de troca?')
    expect(eventos.map((e) => e.tipo)).toEqual(['inicio', 'trecho', 'trecho', 'trecho', 'fim'])
  })
})

describe('falha nas fontes não derruba a resposta', () => {
  it('se a gravação com fontes falha, a resposta é gravada sem elas e o turno termina com fim', async () => {
    const { admin, agente } = await cenarioDeChat()
    await criarBase({ agenteId: agente.id, textos: ['Aceitamos a troca em até sete dias.'] })
    const original = conversas.anexarMensagem
    vi.spyOn(conversas, 'anexarMensagem').mockImplementation(async (id, entrada) => {
      if (entrada.fontes) throw new Error('falha ao gravar segredo-da-conversa')
      return original(id, entrada)
    })
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const { eventos, erro } = await turno(agente.id, admin.id, 'Qual o prazo de troca?')

    expect(erro).toBeUndefined()
    expect(eventos.at(-1)!.tipo).toBe('fim')
    const gravada = await prisma.mensagem.findFirstOrThrow({ where: { papel: 'assistant' } })
    expect(gravada.conteudo).toBe('Você pode trocar em sete dias [1].')
    expect(gravada.fontes).toBeNull()
    const linhas = log.mock.calls.map((c) => String(c[0])).join('\n')
    expect(linhas).toContain('fontes_nao_gravadas')
    expect(linhas).not.toContain('segredo-da-conversa')
    expect(linhas).not.toContain('Aceitamos')
  })

  it('se a montagem das fontes lança, a resposta sai sem o evento e sem fontes', async () => {
    const { admin, agente } = await cenarioDeChat()
    await criarBase({ agenteId: agente.id, textos: ['Aceitamos a troca em até sete dias.'] })
    vi.spyOn(fontesDaResposta, 'montarFontes').mockImplementation(() => {
      throw new Error('quebrou')
    })
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const { eventos, erro } = await turno(agente.id, admin.id, 'Qual o prazo de troca?')

    expect(erro).toBeUndefined()
    expect(eventos.map((e) => e.tipo)).not.toContain('fontes')
    expect(eventos.at(-1)!.tipo).toBe('fim')
    expect((await prisma.mensagem.findFirstOrThrow({ where: { papel: 'assistant' } })).fontes).toBeNull()
    expect(log.mock.calls.map((c) => String(c[0])).join('\n')).toContain('fontes_nao_gravadas')
  })
})
