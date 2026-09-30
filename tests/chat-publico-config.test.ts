/**
 * T-02.01 (FT-06, PR-55): salvar e obter a configuração do chat por agente,
 * com validação no serviço.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { ErroDeAplicacao } from '@/lib/erros'
import { COR_PADRAO } from '@/lib/cor'
import { obterConfiguracao, salvarConfiguracao } from '@/servicos/chat-publico-config'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

async function cenario() {
  const autor = await criarUsuario()
  const agente = await prisma.agente.create({
    data: { nome: 'Assistente da Loja', modelo: 'openai/gpt-4o-mini', criadoPorId: autor.id },
  })
  return { autor, agente }
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

describe('obterConfiguracao', () => {
  beforeEach(limparBanco)
  afterAll(limparBanco)

  it('sem linha devolve os padrões do PR-55', async () => {
    const { autor, agente } = await cenario()
    expect(await obterConfiguracao(autor, agente.id)).toEqual({
      agenteId: agente.id,
      ativo: false,
      titulo: '',
      cor: COR_PADRAO,
      posicao: 'direita',
      avatar: 'iniciais',
      avisoDePrivacidade: '',
      avisoDePrivacidadeUrl: '',
      dominiosPermitidos: [],
      limiteDiario: 500,
      sugestoes: [],
      atualizadoEm: null,
    })
  })

  it('agente inexistente dá 404 e autor nulo dá 401', async () => {
    const { autor, agente } = await cenario()
    expect((await erroDe(obterConfiguracao(autor, 'nao-existe'))).status).toBe(404)
    expect((await erroDe(obterConfiguracao(null as never, agente.id))).status).toBe(401)
  })
})

describe('salvarConfiguracao', () => {
  beforeEach(limparBanco)
  afterAll(limparBanco)

  it('cria a linha na primeira vez e atualiza nas seguintes, mantendo o que não veio', async () => {
    const { autor, agente } = await cenario()
    const a = await salvarConfiguracao(autor, agente.id, { ativo: true, titulo: 'Fale com a Ana', cor: '#2563eb' })
    expect(a).toMatchObject({ ativo: true, titulo: 'Fale com a Ana', cor: '#2563eb', limiteDiario: 500 })
    expect(a.atualizadoEm).toBeInstanceOf(Date)
    const b = await salvarConfiguracao(autor, agente.id, { limiteDiario: 100 })
    expect(b).toMatchObject({ ativo: true, titulo: 'Fale com a Ana', cor: '#2563eb', limiteDiario: 100 })
    expect(await prisma.configuracaoDoChat.count()).toBe(1)
  })

  it('qualquer usuário autenticado edita, não só o admin nem o dono (PR-12)', async () => {
    const { agente } = await cenario()
    const outro = await criarUsuario()
    const admin = await criarAdmin()
    await expect(salvarConfiguracao(outro, agente.id, { ativo: true })).resolves.toMatchObject({ ativo: true })
    await expect(salvarConfiguracao(admin, agente.id, { ativo: false })).resolves.toMatchObject({ ativo: false })
  })

  it('autor nulo dá 401 e agente inexistente dá 404, sem gravar nada', async () => {
    const { autor, agente } = await cenario()
    expect((await erroDe(salvarConfiguracao(null as never, agente.id, { ativo: true }))).status).toBe(401)
    expect((await erroDe(salvarConfiguracao(autor, 'nao-existe', { ativo: true }))).status).toBe(404)
    expect(await prisma.configuracaoDoChat.count()).toBe(0)
  })

  it.each([
    ['cor que não é hexadecimal', { cor: 'azul' }, /cor/i],
    ['posição desconhecida', { posicao: 'centro' }, /posi/i],
    ['avatar desconhecido', { avatar: 'foto.png' }, /avatar/i],
    ['título de 61 caracteres', { titulo: 'x'.repeat(61) }, /60/],
    ['aviso de 301 caracteres', { avisoDePrivacidade: 'x'.repeat(301) }, /300/],
    ['link ftp', { avisoDePrivacidade: 'Aviso', avisoDePrivacidadeUrl: 'ftp://x.com/p' }, /http/i],
    ['link sem esquema', { avisoDePrivacidade: 'Aviso', avisoDePrivacidadeUrl: 'x.com/p' }, /http/i],
    ['link javascript', { avisoDePrivacidade: 'Aviso', avisoDePrivacidadeUrl: 'javascript:alert(1)' }, /http/i],
    ['link sem texto de aviso', { avisoDePrivacidade: '', avisoDePrivacidadeUrl: 'https://x.com/p' }, /aviso/i],
    ['4 sugestões', { sugestoes: ['a', 'b', 'c', 'd'] }, /3/],
    ['sugestão de 81 caracteres', { sugestoes: ['x'.repeat(81)] }, /80/],
    ['limite diário zero', { limiteDiario: 0 }, /limite/i],
    ['limite diário 100001', { limiteDiario: 100001 }, /100\.?000/],
    ['limite diário fracionado', { limiteDiario: 10.5 }, /limite/i],
    ['domínio inválido', { dominiosPermitidos: ['exemplo.com', 'nao valido'] }, /nao valido/],
    ['21 domínios', { dominiosPermitidos: Array.from({ length: 21 }, (_, i) => `s${i}.com`) }, /20/],
  ])('recusa %s com 422 e não grava', async (_nome, entrada, mensagem) => {
    const { autor, agente } = await cenario()
    const erro = await erroDe(salvarConfiguracao(autor, agente.id, entrada))
    expect(erro.status).toBe(422)
    expect(erro.message).toMatch(mensagem)
    expect(await prisma.configuracaoDoChat.count()).toBe(0)
  })

  it('aceita #ABC e grava o hexadecimal de seis dígitos em minúsculas', async () => {
    const { autor, agente } = await cenario()
    expect((await salvarConfiguracao(autor, agente.id, { cor: '#ABC' })).cor).toBe('#aabbcc')
  })

  it('aceita o formulário como chega: texto, "on", domínios e sugestões por linha', async () => {
    const { autor, agente } = await cenario()
    const c = await salvarConfiguracao(autor, agente.id, {
      ativo: 'on',
      limiteDiario: '250',
      dominiosPermitidos: 'https://Exemplo.com/\n*.outro.com, localhost:3000',
      sugestoes: 'Qual o horário?\n\n  Como troco um produto?  \nQual o horário?',
    })
    expect(c.ativo).toBe(true)
    expect(c.limiteDiario).toBe(250)
    expect(c.dominiosPermitidos).toEqual(['exemplo.com', '*.outro.com', 'localhost:3000'])
    expect(c.sugestoes).toEqual(['Qual o horário?', 'Como troco um produto?'])
  })

  it('permite limpar o aviso, os domínios e as sugestões', async () => {
    const { autor, agente } = await cenario()
    await salvarConfiguracao(autor, agente.id, {
      avisoDePrivacidade: 'Conversas são guardadas.',
      avisoDePrivacidadeUrl: 'https://x.com/privacidade',
      dominiosPermitidos: ['x.com'],
      sugestoes: ['Oi'],
    })
    const c = await salvarConfiguracao(autor, agente.id, {
      avisoDePrivacidade: '',
      avisoDePrivacidadeUrl: '',
      dominiosPermitidos: [],
      sugestoes: [],
    })
    expect(c).toMatchObject({ avisoDePrivacidade: '', avisoDePrivacidadeUrl: '', dominiosPermitidos: [], sugestoes: [] })
  })

  it('guarda as listas como JSON e lê lista corrompida como vazia', async () => {
    const { autor, agente } = await cenario()
    await salvarConfiguracao(autor, agente.id, { dominiosPermitidos: ['x.com'], sugestoes: ['Oi'] })
    const linha = await prisma.configuracaoDoChat.findUniqueOrThrow({ where: { agenteId: agente.id } })
    expect(JSON.parse(linha.dominiosPermitidos)).toEqual(['x.com'])
    await prisma.configuracaoDoChat.update({ where: { agenteId: agente.id }, data: { sugestoes: '{quebrado' } })
    expect((await obterConfiguracao(autor, agente.id)).sugestoes).toEqual([])
  })
})
