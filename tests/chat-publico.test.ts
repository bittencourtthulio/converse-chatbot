/**
 * T-02.04 (FT-06, PR-56): o turno do visitante anônimo no canal widget: posse
 * da conversa, agente inativo, validação, erros genéricos, fontes reduzidas e
 * retomada das últimas 50 mensagens.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { ErroDeAplicacao } from '@/lib/erros'
import { criarLimitador } from '@/lib/limite-de-uso'
import { MENSAGEM_PARA_VISITANTE } from '@/servicos/chat-erros'
import {
  LIMITE_DA_MENSAGEM_PUBLICA,
  exigirAgenteAtivo,
  reduzirFontes,
  retomarConversaDoVisitante,
  validarVisitanteId,
} from '@/servicos/chat-publico'
import { limparBanco } from './ajuda'
import { iniciarOpenRouterFalso, type OpenRouterFalso } from './apoio/openrouter-falso'
import { criarBase } from './apoio/conhecimento'
import { VISITANTE_A, VISITANTE_B, cenarioPublico, coletarPublico, conversarComoVisitante } from './apoio/publico'

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

function turno(agenteId: string, extra: Record<string, unknown> = {}) {
  return coletarPublico(
    conversarComoVisitante({
      agenteId,
      visitanteId: VISITANTE_A,
      mensagem: 'Qual o prazo de troca?',
      ip: '9.9.9.9',
      limitador: criarLimitador(),
      ...extra,
    } as never),
  )
}

async function erroDe(promessa: Promise<unknown>): Promise<ErroDeAplicacao> {
  try {
    await promessa
  } catch (e) {
    expect(e).toBeInstanceOf(ErroDeAplicacao)
    return e as ErroDeAplicacao
  }
  throw new Error('Era esperado um erro de aplicação.')
}

describe('validarVisitanteId', () => {
  it.each(['abcdefghijklmnop', 'A_b-C_d-E_f-G_h-1234', 'x'.repeat(64)])('aceita %s', (id) => {
    expect(validarVisitanteId(id)).toBe(id)
  })
  it.each(['curto', 'x'.repeat(65), 'com espaco 1234567890', 'acentuação-0123456789', '../../etc/passwd0', '', undefined, 42, null])(
    'recusa %j com 422',
    (id) => {
      expect(() => validarVisitanteId(id)).toThrow(ErroDeAplicacao)
      try {
        validarVisitanteId(id)
      } catch (e) {
        expect((e as ErroDeAplicacao).status).toBe(422)
      }
    },
  )
})

describe('exigirAgenteAtivo', () => {
  it('agente inativo e agente inexistente dão o mesmo 404 e a mesma mensagem', async () => {
    const { agente } = await cenarioPublico({ ativo: false })
    const a = await erroDe(exigirAgenteAtivo(agente.id))
    const b = await erroDe(exigirAgenteAtivo('nao-existe'))
    expect(a.status).toBe(404)
    expect([a.status, a.codigo, a.message]).toEqual([b.status, b.codigo, b.message])
  })
})

describe('turno do visitante', () => {
  it('grava conversa do canal widget com o visitanteId como identificadorExterno e faz o stream', async () => {
    const { agente } = await cenarioPublico()
    const { eventos, erro } = await turno(agente.id)
    expect(erro).toBeUndefined()
    expect(eventos.map((e) => e.tipo)).toEqual(['inicio', 'trecho', 'fim'])
    const conversa = await prisma.conversa.findFirstOrThrow({ where: { agenteId: agente.id } })
    expect(conversa).toMatchObject({ canal: 'widget', identificadorExterno: VISITANTE_A, criadoPorId: null })
    const mensagens = await prisma.mensagem.findMany({ where: { conversaId: conversa.id }, orderBy: { criadoEm: 'asc' } })
    expect(mensagens.map((m) => m.papel)).toEqual(['user', 'assistant'])
  })

  it('o mesmo visitante continua a própria conversa; outro visitante recebe 404 igual ao de conversa inexistente', async () => {
    const { agente } = await cenarioPublico()
    const { eventos } = await turno(agente.id)
    const fim = eventos.at(-1)
    if (fim?.tipo !== 'fim') throw new Error('sem fim')
    const de = await turno(agente.id, { conversaId: fim.conversaId, mensagem: 'E o prazo de entrega?' })
    expect(de.erro).toBeUndefined()
    expect(await prisma.mensagem.count({ where: { conversaId: fim.conversaId } })).toBe(4)

    const intruso = await erroDe(Promise.reject((await turno(agente.id, { visitanteId: VISITANTE_B, conversaId: fim.conversaId })).erro))
    const inexistente = await erroDe(Promise.reject((await turno(agente.id, { visitanteId: VISITANTE_B, conversaId: 'nao-existe' })).erro))
    expect(intruso.status).toBe(404)
    expect([intruso.status, intruso.codigo, intruso.message]).toEqual([inexistente.status, inexistente.codigo, inexistente.message])
    expect(await prisma.mensagem.count({ where: { conversaId: fim.conversaId } })).toBe(4)
  })

  it('agente inativo: 404 sem gravar nada', async () => {
    const { agente } = await cenarioPublico({ ativo: false })
    const { erro } = await turno(agente.id)
    expect((erro as ErroDeAplicacao).status).toBe(404)
    expect(await prisma.conversa.count()).toBe(0)
  })

  it('mensagem de 1001 caracteres, vazia ou só espaços e visitanteId curto dão 422 sem gravar', async () => {
    const { agente } = await cenarioPublico()
    for (const extra of [
      { mensagem: 'x'.repeat(LIMITE_DA_MENSAGEM_PUBLICA + 1) },
      { mensagem: '' },
      { mensagem: '   ' },
      { visitanteId: 'curto' },
    ]) {
      const { erro } = await turno(agente.id, extra)
      expect((erro as ErroDeAplicacao).status, JSON.stringify(extra).slice(0, 40)).toBe(422)
    }
    expect(await prisma.conversa.count()).toBe(0)
    expect((await turno(agente.id, { mensagem: 'x'.repeat(LIMITE_DA_MENSAGEM_PUBLICA) })).erro).toBeUndefined()
  })

  it('aplica o limite por IP antes de gravar, com o limitador injetado', async () => {
    const { agente } = await cenarioPublico()
    const limitador = criarLimitador(() => 1)
    for (let i = 0; i < 10; i += 1) expect((await turno(agente.id, { limitador })).erro).toBeUndefined()
    const { erro } = await turno(agente.id, { limitador })
    expect(erro).toMatchObject({ status: 429, codigo: 'limite_excedido' })
  })

  it('aplica o teto diário do agente configurado', async () => {
    const { agente } = await cenarioPublico({ configuracao: { limiteDiario: 2 } })
    expect((await turno(agente.id)).erro).toBeUndefined()
    expect((await turno(agente.id)).erro).toBeUndefined()
    expect((await turno(agente.id)).erro).toMatchObject({ status: 429, codigo: 'limite_diario' })
  })

  it('aplica o limite de 60 mensagens por conversa', async () => {
    const { agente } = await cenarioPublico()
    const c = await prisma.conversa.create({ data: { agenteId: agente.id, canal: 'widget', identificadorExterno: VISITANTE_A } })
    await prisma.mensagem.createMany({
      data: Array.from({ length: 60 }, () => ({ conversaId: c.id, papel: 'user', conteudo: 'oi', criadoEm: new Date(Date.now() - 3 * 86_400_000) })),
    })
    const { erro } = await turno(agente.id, { conversaId: c.id })
    expect(erro).toMatchObject({ status: 429, codigo: 'conversa_cheia' })
  })

  it('erro do provedor vira erro genérico sem detalhe técnico, antes e depois do início', async () => {
    const { agente } = await cenarioPublico()
    await criarBase({ agenteId: agente.id, textos: ['A troca é em sete dias.'] })
    falso.configurar({ erroHttp: 402 })
    const { erro } = await turno(agente.id)
    const e = erro as ErroDeAplicacao
    expect(e).toBeInstanceOf(ErroDeAplicacao)
    expect(e.status).toBeGreaterThanOrEqual(500)
    expect(e.message).toBe(MENSAGEM_PARA_VISITANTE)
    expect(e.codigo).toBe('indisponivel')
    expect(JSON.stringify([e.message, e.codigo])).not.toMatch(/saldo|credit|openrouter|402|provedor/i)
  })

  it('sem chave do OpenRouter o visitante vê a mensagem genérica, não a do operador', async () => {
    const { agente } = await cenarioPublico({ comChave: false })
    const { erro } = await turno(agente.id)
    expect((erro as ErroDeAplicacao).message).toBe(MENSAGEM_PARA_VISITANTE)
    expect((erro as ErroDeAplicacao).message).not.toMatch(/administrador|Integrações/)
  })

  it('o evento fontes público só traz título, citada e números, nunca o trecho nem ids reais', async () => {
    const { agente } = await cenarioPublico()
    const base = await criarBase({
      agenteId: agente.id,
      titulo: 'Política de troca',
      textos: ['Aceitamos a troca em até sete dias corridos, conteúdo interno da empresa.'],
    })
    const { eventos } = await turno(agente.id)
    const ev = eventos.find((e) => e.tipo === 'fontes')
    if (ev?.tipo !== 'fontes') throw new Error('sem evento fontes')
    expect(ev.fontes).toHaveLength(1)
    expect(ev.fontes[0]).toMatchObject({ titulo: 'Política de troca', citada: true })
    expect(ev.fontes[0]!.trechos.map((t) => t.n)).toEqual([1])
    const json = JSON.stringify(ev)
    expect(json).not.toContain('conteúdo interno')
    expect(json).not.toContain('sete dias corridos')
    expect(json).not.toContain(base.fonteId)
    expect(ev.fontes[0]!.trechos.every((t) => t.trechoTexto === '')).toBe(true)
  })
})

describe('reduzirFontes', () => {
  it('troca os ids reais por ordinais e esvazia o texto dos trechos', () => {
    const r = reduzirFontes([
      { fonteId: 'cuid-real-1', titulo: 'A', citada: true, trechos: [{ n: 1, posicao: 7, trechoTexto: 'segredo' }] },
      { fonteId: 'cuid-real-2', titulo: 'B', citada: false, trechos: [{ n: 2, posicao: 1, trechoTexto: 'outro' }] },
    ])
    expect(r.map((f) => f.fonteId)).toEqual(['f1', 'f2'])
    expect(JSON.stringify(r)).not.toMatch(/segredo|outro|cuid-real/)
    expect(r[0]!.trechos).toEqual([{ n: 1, posicao: 1, trechoTexto: '' }])
  })
})

/** A leitura pública exige o IP (FT-12): cada chamada ganha um limitador novo para não gastar o de outra. */
const opcoesDeLeitura = () => ({ ip: 'ip-de-teste', limitador: criarLimitador() })

describe('retomarConversaDoVisitante', () => {
  it('sem conversa devolve nulo; agente inativo dá 404; id inválido dá 422', async () => {
    const { agente } = await cenarioPublico()
    expect(await retomarConversaDoVisitante(agente.id, VISITANTE_A, opcoesDeLeitura())).toEqual({ conversa: null })
    await expect(retomarConversaDoVisitante(agente.id, 'curto', opcoesDeLeitura())).rejects.toMatchObject({ status: 422 })
    const { agente: inativo } = await cenarioPublico({ ativo: false })
    await expect(retomarConversaDoVisitante(inativo.id, VISITANTE_A, opcoesDeLeitura())).rejects.toMatchObject({ status: 404 })
  })

  it('devolve só a conversa do próprio visitante, com as últimas 50 mensagens em ordem e truncada', async () => {
    const { agente } = await cenarioPublico()
    const minha = await prisma.conversa.create({ data: { agenteId: agente.id, canal: 'widget', identificadorExterno: VISITANTE_A } })
    const alheia = await prisma.conversa.create({ data: { agenteId: agente.id, canal: 'widget', identificadorExterno: VISITANTE_B } })
    const t0 = Date.now() - 10_000_000
    await prisma.mensagem.createMany({
      data: Array.from({ length: 60 }, (_, i) => ({
        conversaId: minha.id,
        papel: i % 2 === 0 ? 'user' : 'assistant',
        conteudo: `mensagem ${i}`,
        criadoEm: new Date(t0 + i * 1000),
      })),
    })
    await prisma.mensagem.create({ data: { conversaId: alheia.id, papel: 'user', conteudo: 'do outro visitante' } })
    const r = await retomarConversaDoVisitante(agente.id, VISITANTE_A, opcoesDeLeitura())
    if (!r.conversa) throw new Error('sem conversa')
    expect(r.conversa.conversaId).toBe(minha.id)
    expect(r.conversa.truncada).toBe(true)
    expect(r.conversa.mensagens).toHaveLength(50)
    expect(r.conversa.mensagens[0]!.conteudo).toBe('mensagem 10')
    expect(r.conversa.mensagens.at(-1)!.conteudo).toBe('mensagem 59')
    expect(JSON.stringify(r)).not.toContain('do outro visitante')
  })

  it('conversa curta não é truncada e as fontes voltam reduzidas', async () => {
    const { agente } = await cenarioPublico()
    await criarBase({ agenteId: agente.id, titulo: 'Política de troca', textos: ['Aceitamos a troca em até sete dias corridos.'] })
    await turno(agente.id)
    const r = await retomarConversaDoVisitante(agente.id, VISITANTE_A, opcoesDeLeitura())
    if (!r.conversa) throw new Error('sem conversa')
    expect(r.conversa.truncada).toBe(false)
    expect(r.conversa.mensagens.map((m) => m.papel)).toEqual(['user', 'assistant'])
    const resposta = r.conversa.mensagens[1]!
    expect(resposta.fontes?.[0]).toMatchObject({ titulo: 'Política de troca', citada: true })
    expect(JSON.stringify(r)).not.toContain('sete dias corridos.')
  })
})
