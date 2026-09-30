/**
 * T-06.01 (FT-06, PR-55, PR-12): a ação de servidor que salva a configuração do
 * chat. Só as bordas do framework são trocadas (sessão, redirecionamento e
 * revalidação); o serviço e o banco são os reais.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { criarUsuario, limparBanco } from './ajuda'

let usuarioDaSessao: Awaited<ReturnType<typeof criarUsuario>> | null = null
const revalidatePath = vi.fn()

vi.mock('@/app/sessao-servidor', () => ({
  exigirUsuario: async () => {
    if (!usuarioDaSessao) throw new Error('sem sessão')
    return usuarioDaSessao
  },
  exigirUsuarioAdmin: async () => usuarioDaSessao,
  gravarCookieDeSessao: async () => undefined,
  apagarCookieDeSessao: async () => undefined,
}))
vi.mock('next/navigation', () => ({
  redirect: (destino: string) => {
    throw Object.assign(new Error('NEXT_REDIRECT'), { destino })
  },
}))
vi.mock('next/cache', () => ({ revalidatePath: (caminho: string) => revalidatePath(caminho) }))

const { salvarChat } = await import('@/app/acoes')

let agenteId: string

function formulario(campos: Record<string, string | null>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) if (v !== null) f.set(k, v)
  return f
}

const campos = () => ({
  id: agenteId,
  ativo: 'on' as string | null,
  titulo: 'Fale com a Ana',
  cor: '#2563eb',
  posicao: 'esquerda',
  avatar: 'robo',
  avisoDePrivacidade: 'Guardamos a conversa por 90 dias.',
  avisoDePrivacidadeUrl: 'https://exemplo.com/privacidade',
  dominiosPermitidos: 'exemplo.com\n*.parceiro.com',
  limiteDiario: '250',
  sugestoes: 'Qual o horário?\nComo troco um produto?',
})

beforeEach(async () => {
  revalidatePath.mockClear()
  await limparBanco()
  usuarioDaSessao = await criarUsuario()
  agenteId = (
    await prisma.agente.create({ data: { nome: 'Agente', modelo: 'm', criadoPorId: usuarioDaSessao.id } })
  ).id
})

describe('salvarChat', () => {
  it('grava a configuração do formulário e devolve só a mensagem de sucesso', async () => {
    const r = await salvarChat({}, formulario(campos()))
    expect(r).toEqual({ sucesso: 'Configuração do chat salva.' })
    const linha = await prisma.configuracaoDoChat.findUniqueOrThrow({ where: { agenteId } })
    expect(linha).toMatchObject({
      ativo: true,
      titulo: 'Fale com a Ana',
      cor: '#2563eb',
      posicao: 'esquerda',
      avatar: 'robo',
      avisoDePrivacidade: 'Guardamos a conversa por 90 dias.',
      avisoDePrivacidadeUrl: 'https://exemplo.com/privacidade',
      limiteDiario: 250,
    })
    expect(JSON.parse(linha.dominiosPermitidos)).toEqual(['exemplo.com', '*.parceiro.com'])
    expect(JSON.parse(linha.sugestoes)).toEqual(['Qual o horário?', 'Como troco um produto?'])
  })

  it('revalida a própria aba Publicar do agente', async () => {
    await salvarChat({}, formulario(campos()))
    expect(revalidatePath).toHaveBeenCalledWith(`/agentes/${agenteId}/publicar`)
  })

  it('caixa "Publicar chat" desmarcada (campo ausente) desliga o chat', async () => {
    await salvarChat({}, formulario(campos()))
    await salvarChat({}, formulario({ ...campos(), ativo: null }))
    expect((await prisma.configuracaoDoChat.findUniqueOrThrow({ where: { agenteId } })).ativo).toBe(false)
  })

  it('erro de validação volta como mensagem do serviço, sem gravar nem revalidar', async () => {
    const r = await salvarChat({}, formulario({ ...campos(), cor: 'azul' }))
    expect(r.erro).toMatch(/cor/i)
    expect(r.sucesso).toBeUndefined()
    expect(await prisma.configuracaoDoChat.count()).toBe(0)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it.each([
    ['domínio inválido', { dominiosPermitidos: 'exemplo.com\nnao valido' }, /nao valido/],
    ['link sem texto de aviso', { avisoDePrivacidade: '', avisoDePrivacidadeUrl: 'https://x.com' }, /aviso/i],
    ['limite diário fora da faixa', { limiteDiario: '0' }, /limite/i],
    ['quatro sugestões', { sugestoes: 'a\nb\nc\nd' }, /3/],
  ])('%s volta como erro', async (_nome, troca, mensagem) => {
    const r = await salvarChat({}, formulario({ ...campos(), ...troca }))
    expect(r.erro).toMatch(mensagem)
    expect(await prisma.configuracaoDoChat.count()).toBe(0)
  })

  it('sem sessão não grava nada', async () => {
    usuarioDaSessao = null
    const r = await salvarChat({}, formulario(campos()))
    expect(r.erro).toBeTruthy()
    expect(await prisma.configuracaoDoChat.count()).toBe(0)
  })

  it('agente inexistente volta como erro e não cria configuração', async () => {
    const r = await salvarChat({}, formulario({ ...campos(), id: 'nao-existe' }))
    expect(r.erro).toMatch(/não encontrado/i)
    expect(await prisma.configuracaoDoChat.count()).toBe(0)
  })

  it('qualquer usuário autenticado salva, não só o dono do agente (PR-12)', async () => {
    usuarioDaSessao = await criarUsuario()
    expect(await salvarChat({}, formulario(campos()))).toEqual({ sucesso: 'Configuração do chat salva.' })
  })
})
