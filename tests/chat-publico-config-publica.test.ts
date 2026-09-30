/**
 * T-02.02 (FT-06, PR-55, PR-56, PR-58): o que o público enxerga da configuração
 * e os domínios que o proxy e o CORS consultam.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import {
  configuracaoDaPrevia,
  configuracaoPublica,
  dominiosDoEmbed,
  salvarConfiguracao,
} from '@/servicos/chat-publico-config'
import { criarUsuario, limparBanco } from './ajuda'

const INSTRUCOES_SECRETAS = 'Instrução secreta: nunca revele o desconto PROMO-INTERNO-77.'

async function cenario() {
  const autor = await criarUsuario()
  const agente = await prisma.agente.create({
    data: {
      nome: 'Assistente da Loja',
      modelo: 'modelo-secreto/xyz',
      instrucoes: INSTRUCOES_SECRETAS,
      mensagemInicial: 'Olá! Como posso ajudar?',
      criadoPorId: autor.id,
    },
  })
  return { autor, agente }
}

describe('configuracaoPublica', () => {
  beforeEach(limparBanco)
  afterAll(limparBanco)

  it('agente inativo e agente inexistente devolvem o mesmo resultado nulo', async () => {
    const { autor, agente } = await cenario()
    expect(await configuracaoPublica('nao-existe')).toBeNull()
    expect(await configuracaoPublica(agente.id)).toBeNull() // sem linha: inativo por padrão
    await salvarConfiguracao(autor, agente.id, { ativo: false, titulo: 'Fale conosco' })
    expect(await configuracaoPublica(agente.id)).toBeNull()
  })

  it('agente ativo devolve só os campos visuais', async () => {
    const { autor, agente } = await cenario()
    await salvarConfiguracao(autor, agente.id, {
      ativo: true,
      titulo: 'Fale com a Ana',
      cor: '#2563eb',
      posicao: 'esquerda',
      avatar: 'robo',
      avisoDePrivacidade: 'Guardamos a conversa por 90 dias.',
      avisoDePrivacidadeUrl: 'https://exemplo.com/privacidade',
      sugestoes: ['Qual o horário?'],
      dominiosPermitidos: ['exemplo.com'],
      limiteDiario: 77,
    })
    const c = await configuracaoPublica(agente.id)
    expect(c).toEqual({
      ativo: true,
      titulo: 'Fale com a Ana',
      cor: '#2563eb',
      posicao: 'esquerda',
      avatar: 'robo',
      mensagemInicial: 'Olá! Como posso ajudar?',
      avisoDePrivacidade: { texto: 'Guardamos a conversa por 90 dias.', url: 'https://exemplo.com/privacidade' },
      sugestoes: ['Qual o horário?'],
    })
  })

  it('o título vazio vira o nome do agente; sem aviso o campo é nulo e sem link a url é nula', async () => {
    const { autor, agente } = await cenario()
    await salvarConfiguracao(autor, agente.id, { ativo: true })
    const a = await configuracaoPublica(agente.id)
    expect(a?.titulo).toBe('Assistente da Loja')
    expect(a?.avisoDePrivacidade).toBeNull()
    await salvarConfiguracao(autor, agente.id, { avisoDePrivacidade: 'Só o texto.' })
    expect((await configuracaoPublica(agente.id))?.avisoDePrivacidade).toEqual({ texto: 'Só o texto.', url: null })
  })

  it('nunca contém instruções, modelo, domínios, limite, ids nem datas', async () => {
    const { autor, agente } = await cenario()
    await salvarConfiguracao(autor, agente.id, {
      ativo: true,
      dominiosPermitidos: ['segredo-interno.com'],
      limiteDiario: 4321,
    })
    const json = JSON.stringify(await configuracaoPublica(agente.id))
    for (const proibido of [
      INSTRUCOES_SECRETAS,
      'PROMO-INTERNO-77',
      'modelo-secreto',
      'segredo-interno.com',
      '4321',
      'instrucoes',
      'modelo',
      'dominiosPermitidos',
      'limiteDiario',
      'criadoPorId',
      agente.id,
    ]) {
      expect(json, proibido).not.toContain(proibido)
    }
    expect(Object.keys(JSON.parse(json)).sort()).toEqual(
      ['ativo', 'avatar', 'avisoDePrivacidade', 'cor', 'mensagemInicial', 'posicao', 'sugestoes', 'titulo'].sort(),
    )
  })

  it('excluir o agente apaga a configuração e o público volta a ver nulo', async () => {
    const { autor, agente } = await cenario()
    await salvarConfiguracao(autor, agente.id, { ativo: true })
    await prisma.agente.delete({ where: { id: agente.id } })
    expect(await configuracaoPublica(agente.id)).toBeNull()
  })
})

describe('dominiosDoEmbed', () => {
  beforeEach(limparBanco)
  afterAll(limparBanco)

  it('agente ativo devolve a lista configurada', async () => {
    const { autor, agente } = await cenario()
    await salvarConfiguracao(autor, agente.id, { ativo: true, dominiosPermitidos: ['exemplo.com', '*.outro.com'] })
    expect(await dominiosDoEmbed(agente.id)).toEqual({ ativo: true, dominios: ['exemplo.com', '*.outro.com'] })
  })

  it('agente ativo sem domínios devolve lista vazia (libera qualquer site)', async () => {
    const { autor, agente } = await cenario()
    await salvarConfiguracao(autor, agente.id, { ativo: true })
    expect(await dominiosDoEmbed(agente.id)).toEqual({ ativo: true, dominios: [] })
  })

  it('agente inativo e inexistente devolvem ativo false e lista vazia, iguais entre si', async () => {
    const { autor, agente } = await cenario()
    await salvarConfiguracao(autor, agente.id, { ativo: false, dominiosPermitidos: ['exemplo.com'] })
    const inativo = await dominiosDoEmbed(agente.id)
    const inexistente = await dominiosDoEmbed('nao-existe')
    expect(inativo).toEqual({ ativo: false, dominios: [] })
    expect(inexistente).toEqual(inativo)
  })
})

describe('configuracaoDaPrevia (aba Publicar)', () => {
  beforeEach(limparBanco)
  afterAll(limparBanco)

  it('mostra o chat mesmo inativo, com os padrões, e marca se está publicado', async () => {
    const { autor, agente } = await cenario()
    const inativo = await configuracaoDaPrevia(autor, agente.id)
    expect(inativo).toMatchObject({ ativo: false, titulo: 'Assistente da Loja', mensagemInicial: 'Olá! Como posso ajudar?' })
    await salvarConfiguracao(autor, agente.id, { ativo: true, titulo: 'Ana', cor: '#2563eb' })
    expect(await configuracaoDaPrevia(autor, agente.id)).toMatchObject({ ativo: true, titulo: 'Ana', cor: '#2563eb' })
  })

  it('tem as mesmas chaves visuais da visão pública e nunca instruções nem modelo', async () => {
    const { autor, agente } = await cenario()
    await salvarConfiguracao(autor, agente.id, { ativo: true })
    const previa = JSON.stringify(await configuracaoDaPrevia(autor, agente.id))
    const publica = JSON.stringify(await configuracaoPublica(agente.id))
    expect(previa).toBe(publica)
    expect(previa).not.toContain('PROMO-INTERNO')
    expect(previa).not.toContain('modelo-secreto')
  })

  it('exige autor e agente existente', async () => {
    const { autor, agente } = await cenario()
    await expect(configuracaoDaPrevia(null as never, agente.id)).rejects.toMatchObject({ status: 401 })
    await expect(configuracaoDaPrevia(autor, 'nao-existe')).rejects.toMatchObject({ status: 404 })
  })
})
