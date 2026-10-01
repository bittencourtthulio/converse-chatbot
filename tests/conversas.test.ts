import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import {
  criar,
  obter,
  listar,
  anexarMensagem,
  listarMensagens,
  apagar,
  tituloDaConversa,
  retomarDoPainel,
} from '@/servicos/conversas'
import { criarUsuario, limparBanco } from './ajuda'

beforeEach(limparBanco)

async function cenario() {
  const dono = await criarUsuario()
  const agente = await prisma.agente.create({
    data: { nome: 'Agente', modelo: 'openai/gpt-4o-mini', criadoPorId: dono.id },
  })
  return { dono, agente }
}

describe('tituloDaConversa', () => {
  it('usa os primeiros 60 caracteres, com espaços colapsados', () => {
    expect(tituloDaConversa('  Olá,\n  tudo   bem?  ')).toBe('Olá, tudo bem?')
    const titulo = tituloDaConversa('a'.repeat(100))
    expect(titulo).toHaveLength(60)
  })
})

describe('criar', () => {
  it('grava o canal, o dono e o título da primeira mensagem', async () => {
    const { dono, agente } = await cenario()
    const conversa = await criar({
      agenteId: agente.id,
      canal: 'painel',
      criadoPorId: dono.id,
      primeiraMensagem: 'Como funciona o plano?',
    })
    expect(conversa).toMatchObject({
      agenteId: agente.id,
      canal: 'painel',
      criadoPorId: dono.id,
      identificadorExterno: null,
      titulo: 'Como funciona o plano?',
    })
    expect(conversa.id).toMatch(/^\w{20,}$/)
  })

  it('aceita canal de visitante com identificador externo', async () => {
    const { agente } = await cenario()
    const conversa = await criar({
      agenteId: agente.id,
      canal: 'widget',
      identificadorExterno: 'visitante-1',
    })
    expect(conversa.identificadorExterno).toBe('visitante-1')
    expect(conversa.titulo).toBeNull()
  })

  it('usa o título dado (FT-07), aparado em 60 caracteres, e sem ele deriva da primeira mensagem', async () => {
    const { agente } = await cenario()
    const comTitulo = await criar({
      agenteId: agente.id,
      canal: 'telegram',
      identificadorExterno: '42',
      titulo: 'Telegram: ' + 'N'.repeat(100),
      primeiraMensagem: 'texto que seria o título',
    })
    expect(comTitulo.titulo).toHaveLength(60)
    expect(comTitulo.titulo?.startsWith('Telegram: N')).toBe(true)
    const semTitulo = await criar({ agenteId: agente.id, canal: 'telegram', identificadorExterno: '43', primeiraMensagem: '  texto   da pergunta ' })
    expect(semTitulo.titulo).toBe('texto da pergunta')
    const vazio = await criar({ agenteId: agente.id, canal: 'telegram', identificadorExterno: '44', titulo: '   ' })
    expect(vazio.titulo).toBeNull()
  })

  it('recusa canal desconhecido', async () => {
    const { agente } = await cenario()
    await expect(
      criar({ agenteId: agente.id, canal: 'fax' as never }),
    ).rejects.toMatchObject({ status: 422 })
  })

  it('agente inexistente é 404', async () => {
    await expect(criar({ agenteId: 'nao-existe', canal: 'painel' })).rejects.toMatchObject({
      status: 404,
    })
  })
})

describe('obter', () => {
  it('devolve a conversa de quem é dono', async () => {
    const { dono, agente } = await cenario()
    const c = await criar({ agenteId: agente.id, canal: 'painel', criadoPorId: dono.id })
    const lida = await obter(c.id, { agenteId: agente.id, canal: 'painel', criadoPorId: dono.id })
    expect(lida.id).toBe(c.id)
  })

  it.each([
    ['outro agente', { agenteId: 'outro', canal: 'painel' as const }],
    ['outro canal', { canal: 'widget' as const }],
    ['outro usuário', { criadoPorId: 'outro-usuario' }],
    ['outro visitante', { identificadorExterno: 'intruso' }],
  ])('conversa de %s é 404, sem revelar que existe', async (_nome, diferente) => {
    const { dono, agente } = await cenario()
    const c = await criar({ agenteId: agente.id, canal: 'painel', criadoPorId: dono.id })
    await expect(
      obter(c.id, { agenteId: agente.id, canal: 'painel', criadoPorId: dono.id, ...diferente }),
    ).rejects.toMatchObject({ status: 404, codigo: 'nao_encontrado' })
  })

  it('id inexistente é 404', async () => {
    const { agente } = await cenario()
    await expect(obter('nada', { agenteId: agente.id, canal: 'painel' })).rejects.toMatchObject({
      status: 404,
    })
  })
})

describe('anexarMensagem e listarMensagens', () => {
  it('grava a mensagem e avança o atualizadoEm da conversa', async () => {
    const { agente } = await cenario()
    const c = await criar({ agenteId: agente.id, canal: 'widget', identificadorExterno: 'v' })
    await new Promise((r) => setTimeout(r, 5))
    const m = await anexarMensagem(c.id, {
      papel: 'assistant',
      conteudo: 'Olá!',
      modelo: 'openai/gpt-4o-mini',
    })
    expect(m).toMatchObject({ papel: 'assistant', conteudo: 'Olá!', modelo: 'openai/gpt-4o-mini' })
    const depois = await prisma.conversa.findUniqueOrThrow({ where: { id: c.id } })
    expect(depois.atualizadoEm.getTime()).toBeGreaterThan(c.atualizadoEm.getTime())
  })

  it('recusa papel inválido e conteúdo vazio', async () => {
    const { agente } = await cenario()
    const c = await criar({ agenteId: agente.id, canal: 'painel' })
    await expect(anexarMensagem(c.id, { papel: 'system' as never, conteudo: 'x' })).rejects.toMatchObject({ status: 422 })
    await expect(anexarMensagem(c.id, { papel: 'user', conteudo: '' })).rejects.toMatchObject({ status: 422 })
  })

  it('devolve as últimas N mensagens em ordem cronológica', async () => {
    const { agente } = await cenario()
    const c = await criar({ agenteId: agente.id, canal: 'painel' })
    for (let i = 1; i <= 5; i += 1) {
      await anexarMensagem(c.id, { papel: i % 2 ? 'user' : 'assistant', conteudo: `m${i}` })
    }
    expect((await listarMensagens(c.id, 3)).map((m) => m.conteudo)).toEqual(['m3', 'm4', 'm5'])
    expect((await listarMensagens(c.id)).map((m) => m.conteudo)).toEqual(['m1', 'm2', 'm3', 'm4', 'm5'])
  })
})

describe('listar', () => {
  it('filtra por agente e canal e devolve a mais recente primeiro', async () => {
    const { dono, agente } = await cenario()
    const outro = await prisma.agente.create({
      data: { nome: 'Outro', modelo: 'openai/gpt-4o-mini', criadoPorId: dono.id },
    })
    const a = await criar({ agenteId: agente.id, canal: 'painel', criadoPorId: dono.id })
    const b = await criar({ agenteId: agente.id, canal: 'painel', criadoPorId: dono.id })
    await criar({ agenteId: agente.id, canal: 'widget', identificadorExterno: 'v' })
    await criar({ agenteId: outro.id, canal: 'painel', criadoPorId: dono.id })
    await new Promise((r) => setTimeout(r, 5))
    await anexarMensagem(a.id, { papel: 'user', conteudo: 'mexeu' })

    const lista = await listar({ agenteId: agente.id, canal: 'painel' })
    expect(lista.map((c) => c.id)).toEqual([a.id, b.id])
  })

  it('filtra por criador e por limite', async () => {
    const { dono, agente } = await cenario()
    const outroUsuario = await criarUsuario()
    await criar({ agenteId: agente.id, canal: 'painel', criadoPorId: dono.id })
    await criar({ agenteId: agente.id, canal: 'painel', criadoPorId: outroUsuario.id })
    const so = await listar({ agenteId: agente.id, canal: 'painel', criadoPorId: dono.id })
    expect(so).toHaveLength(1)
    expect(so[0]!.criadoPorId).toBe(dono.id)
    expect(await listar({ agenteId: agente.id, canal: 'painel', limite: 1 })).toHaveLength(1)
  })
})

describe('apagar', () => {
  it('remove a conversa e as mensagens dela', async () => {
    const { agente } = await cenario()
    const c = await criar({ agenteId: agente.id, canal: 'painel' })
    await anexarMensagem(c.id, { papel: 'user', conteudo: 'oi' })
    await apagar(c.id)
    expect(await prisma.conversa.count()).toBe(0)
    expect(await prisma.mensagem.count()).toBe(0)
  })

  it('conversa inexistente é 404', async () => {
    await expect(apagar('nada')).rejects.toMatchObject({ status: 404 })
  })
})

describe('retomarDoPainel', () => {
  it('sem conversa devolve null', async () => {
    const { dono, agente } = await cenario()
    expect(await retomarDoPainel(agente.id, dono.id)).toBeNull()
  })

  it('devolve a conversa mais recente do usuário, com as mensagens em ordem', async () => {
    const { dono, agente } = await cenario()
    const antiga = await criar({ agenteId: agente.id, canal: 'painel', criadoPorId: dono.id })
    const recente = await criar({ agenteId: agente.id, canal: 'painel', criadoPorId: dono.id })
    await anexarMensagem(antiga.id, { papel: 'user', conteudo: 'velha' })
    await new Promise((r) => setTimeout(r, 5))
    await anexarMensagem(recente.id, { papel: 'user', conteudo: 'pergunta' })
    await anexarMensagem(recente.id, { papel: 'assistant', conteudo: 'resposta' })
    const r = await retomarDoPainel(agente.id, dono.id)
    expect(r?.conversaId).toBe(recente.id)
    expect(r?.mensagens.map((m) => [m.papel, m.conteudo])).toEqual([
      ['user', 'pergunta'],
      ['assistant', 'resposta'],
    ])
    expect(Object.keys(r!.mensagens[0]!).sort()).toEqual(['conteudo', 'id', 'papel'])
  })

  it('devolve as fontes gravadas na resposta (FT-05); JSON inválido ou ausente não vira chave nem erro', async () => {
    const { dono, agente } = await cenario()
    const conversa = await criar({ agenteId: agente.id, canal: 'painel', criadoPorId: dono.id })
    const fontes = [
      { fonteId: 'f1', titulo: 'Política', citada: true, trechos: [{ n: 1, posicao: 2, trechoTexto: 'Troca em sete dias.' }] },
    ]
    await anexarMensagem(conversa.id, { papel: 'user', conteudo: 'p1' })
    await anexarMensagem(conversa.id, { papel: 'assistant', conteudo: 'r1 [1]', fontes: JSON.stringify(fontes) })
    await anexarMensagem(conversa.id, { papel: 'user', conteudo: 'p2' })
    await anexarMensagem(conversa.id, { papel: 'assistant', conteudo: 'r2', fontes: 'isto não é json' })
    await anexarMensagem(conversa.id, { papel: 'assistant', conteudo: 'r3', fontes: '[{"fonteId":1}]' })

    const r = await retomarDoPainel(agente.id, dono.id)

    expect(r!.mensagens[1]).toMatchObject({ papel: 'assistant', conteudo: 'r1 [1]', fontes })
    expect('fontes' in r!.mensagens[0]!).toBe(false)
    expect('fontes' in r!.mensagens[3]!).toBe(false)
    expect('fontes' in r!.mensagens[4]!).toBe(false)
  })

  it('não devolve conversa de outro usuário, de outro canal nem de outro agente', async () => {
    const { dono, agente } = await cenario()
    const outro = await criarUsuario()
    const outroAgente = await prisma.agente.create({
      data: { nome: 'B', modelo: 'openai/gpt-4o-mini', criadoPorId: dono.id },
    })
    await criar({ agenteId: agente.id, canal: 'painel', criadoPorId: outro.id })
    await criar({ agenteId: agente.id, canal: 'widget', identificadorExterno: 'v' })
    await criar({ agenteId: outroAgente.id, canal: 'painel', criadoPorId: dono.id })
    expect(await retomarDoPainel(agente.id, dono.id)).toBeNull()
  })

  it('devolve no máximo as últimas 100 mensagens', async () => {
    const { dono, agente } = await cenario()
    const c = await criar({ agenteId: agente.id, canal: 'painel', criadoPorId: dono.id })
    await prisma.mensagem.createMany({
      data: Array.from({ length: 105 }, (_, i) => ({
        conversaId: c.id,
        papel: i % 2 ? 'assistant' : 'user',
        conteudo: `m${i + 1}`,
        criadoEm: new Date(Date.UTC(2026, 0, 1, 0, 0, i)),
      })),
    })
    const r = await retomarDoPainel(agente.id, dono.id)
    expect(r?.mensagens).toHaveLength(100)
    expect(r?.mensagens.at(0)?.conteudo).toBe('m6')
    expect(r?.mensagens.at(-1)?.conteudo).toBe('m105')
  })
})
