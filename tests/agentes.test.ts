import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { listar, obter, criar } from '@/servicos/agentes'
import { criarUsuario, limparBanco } from './ajuda'

beforeEach(limparBanco)

const valido = {
  nome: 'Atendimento',
  instrucoes: 'Responda com educação.',
  modelo: 'openai/gpt-4o-mini',
  temperatura: 0.5,
  mensagemInicial: 'Olá! Como posso ajudar?',
}

describe('criar', () => {
  it('grava os campos, o dono e as datas', async () => {
    const autor = await criarUsuario()
    const agente = await criar(autor, valido)
    expect(agente).toMatchObject({ ...valido, criadoPorId: autor.id })
    expect(agente.id).toMatch(/^\w{20,}$/)
    expect(agente.criadoEm).toBeInstanceOf(Date)
    expect(await prisma.agente.count()).toBe(1)
  })

  it('temperatura, instruções e mensagem inicial têm padrão', async () => {
    const autor = await criarUsuario()
    const agente = await criar(autor, { nome: 'Mínimo', modelo: 'openai/gpt-4o-mini' })
    expect(agente.temperatura).toBe(0.7)
    expect(agente.instrucoes).toBe('')
    expect(agente.mensagemInicial).toBe('')
  })

  it('aceita a temperatura como texto do formulário, com vírgula', async () => {
    const autor = await criarUsuario()
    const agente = await criar(autor, { ...valido, temperatura: '1,3' })
    expect(agente.temperatura).toBeCloseTo(1.3)
  })

  it('apara espaços do nome e do modelo', async () => {
    const autor = await criarUsuario()
    const agente = await criar(autor, { ...valido, nome: '  Vendas  ', modelo: ' openai/gpt-4o ' })
    expect(agente.nome).toBe('Vendas')
    expect(agente.modelo).toBe('openai/gpt-4o')
  })

  it.each([
    ['nome vazio', { nome: '   ' }],
    ['nome acima de 80', { nome: 'a'.repeat(81) }],
    ['instruções acima de 8000', { instrucoes: 'x'.repeat(8001) }],
    ['temperatura acima de 2', { temperatura: 2.1 }],
    ['temperatura abaixo de 0', { temperatura: -0.1 }],
    ['temperatura que não é número', { temperatura: 'quente' }],
    ['modelo vazio', { modelo: '' }],
    ['modelo acima de 200', { modelo: 'm'.repeat(201) }],
    ['mensagem inicial acima de 500', { mensagemInicial: 'm'.repeat(501) }],
  ])('%s recebe 422 e nada é gravado', async (_nome, troca) => {
    const autor = await criarUsuario()
    await expect(criar(autor, { ...valido, ...troca })).rejects.toMatchObject({ status: 422 })
    expect(await prisma.agente.count()).toBe(0)
  })

  it('aceita os limites exatos', async () => {
    const autor = await criarUsuario()
    const agente = await criar(autor, {
      nome: 'n'.repeat(80),
      instrucoes: 'i'.repeat(8000),
      modelo: 'm'.repeat(200),
      temperatura: 2,
      mensagemInicial: 'x'.repeat(500),
    })
    expect(agente.temperatura).toBe(2)
    expect((await criar(autor, { ...valido, temperatura: 0 })).temperatura).toBe(0)
  })

  it('entrada que não é objeto recebe 422', async () => {
    const autor = await criarUsuario()
    await expect(criar(autor, null)).rejects.toMatchObject({ status: 422 })
  })
})

describe('listar e obter', () => {
  it('qualquer usuário lista todos os agentes, o mais novo primeiro', async () => {
    const a = await criarUsuario()
    const b = await criarUsuario()
    const primeiro = await criar(a, { ...valido, nome: 'Primeiro' })
    await new Promise((r) => setTimeout(r, 5))
    const segundo = await criar(b, { ...valido, nome: 'Segundo' })
    const lista = await listar(a)
    expect(lista.map((x) => x.id)).toEqual([segundo.id, primeiro.id])
    expect((await listar(b)).length).toBe(2)
  })

  it('obter devolve o agente por id, para qualquer usuário', async () => {
    const a = await criarUsuario()
    const b = await criarUsuario()
    const agente = await criar(a, valido)
    expect((await obter(b, agente.id)).nome).toBe('Atendimento')
  })

  it('obter de id inexistente lança 404', async () => {
    const autor = await criarUsuario()
    await expect(obter(autor, 'nao-existe')).rejects.toMatchObject({ status: 404 })
  })
})
