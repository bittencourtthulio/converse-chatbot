/**
 * T-06.05 (FT-10, PR-90, D-24): as ações de servidor das ferramentas do titular. Só as bordas
 * do framework são trocadas; o serviço e o banco são os reais.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { aguardarGravacoesPendentes } from '@/servicos/auditoria'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarConversaDeTeste } from './apoio/historico'

let sessao: Awaited<ReturnType<typeof criarUsuario>> | null = null
vi.mock('@/app/sessao-servidor', () => ({
  exigirUsuario: async () => sessao,
  exigirUsuarioAdmin: async () => {
    if (!sessao || sessao.papel !== 'admin') throw Object.assign(new Error('NEXT_REDIRECT'), { destino: '/' })
    return sessao
  },
  gravarCookieDeSessao: async () => undefined,
  apagarCookieDeSessao: async () => undefined,
}))
vi.mock('next/navigation', () => ({ redirect: (d: string) => { throw Object.assign(new Error('NEXT_REDIRECT'), { destino: d }) } }))
vi.mock('next/cache', () => ({ revalidatePath: () => undefined }))

const { buscarTitularNaTela, apagarTitularNaTela } = await import('@/app/acoes')

const VISITANTE_A = 'visitanteAAAAAAAA0001XYZ'
const VISITANTE_B = 'visitanteBBBBBBBB0002XYZ'
const formulario = (campos: Record<string, string>) => {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) f.set(k, v)
  return f
}

beforeEach(async () => {
  await limparBanco()
  sessao = await criarAdmin()
  const agente = await criarAgenteDeTeste({ nome: 'Loja' })
  const msgs = [{ papel: 'user' as const, conteudo: 'oi' }]
  await criarConversaDeTeste({ agenteId: agente.id, canal: 'widget', identificadorExterno: VISITANTE_A, mensagens: msgs })
  await criarConversaDeTeste({ agenteId: agente.id, canal: 'widget', identificadorExterno: VISITANTE_B, mensagens: msgs })
})

describe('buscarTitularNaTela', () => {
  it('devolve um estado serializável (datas em texto) sem nenhum identificador completo', async () => {
    const r = await buscarTitularNaTela({}, formulario({ canal: 'widget', identificador: 'visitanteAAAA' }))
    expect(r.busca?.estado).toBe('unico')
    expect(typeof r.busca?.titulares[0]?.ultimaAtividade).toBe('string')
    expect(JSON.stringify(r)).not.toContain(VISITANTE_A)
    expect(r.canal).toBe('widget')
    expect(r.identificador).toBe('visitanteAAAA')
  })

  it('prefixo ambíguo devolve varios, e identificador inválido devolve o erro em português', async () => {
    expect((await buscarTitularNaTela({}, formulario({ canal: 'widget', identificador: 'visita' }))).busca?.estado).toBe('varios')
    expect((await buscarTitularNaTela({}, formulario({ canal: 'widget', identificador: 'abc' }))).erro).toMatch(/ao menos 6 caracteres/)
  })

  it('quem não é admin recebe erro e nada vaza', async () => {
    sessao = await criarUsuario()
    const r = await buscarTitularNaTela({}, formulario({ canal: 'widget', identificador: 'visitanteAAAA' }))
    expect(r.erro).toBeDefined()
    expect(r.busca).toBeUndefined()
  })
})

describe('apagarTitularNaTela', () => {
  it('exige digitar APAGAR, apaga só o titular, audita o resumo e conta o que apagou', async () => {
    const sem = await apagarTitularNaTela({}, formulario({ canal: 'widget', identificador: VISITANTE_A, confirmacao: 'apagar tudo' }))
    expect(sem.erro).toMatch(/APAGAR/)
    expect(await prisma.conversa.count()).toBe(2)

    const r = await apagarTitularNaTela({}, formulario({ canal: 'widget', identificador: VISITANTE_A, confirmacao: 'APAGAR' }))
    expect(r.sucesso).toMatch(/1 conversa/)
    expect(r.sucesso).toMatch(/1 mensagem/)
    expect(await prisma.conversa.count({ where: { identificadorExterno: VISITANTE_B } })).toBe(1)
    expect(await prisma.conversa.count({ where: { identificadorExterno: VISITANTE_A } })).toBe(0)
    await aguardarGravacoesPendentes()
    const reg = await prisma.registroDeAuditoria.findFirstOrThrow({ where: { acao: 'dados_do_titular_apagados' } })
    expect(reg.usuarioId).toBe(sessao!.id)
    expect(reg.detalhes).not.toContain(VISITANTE_A)
  })

  it('prefixo ambíguo devolve o erro e nada é apagado; quem não é admin não apaga', async () => {
    const amb = await apagarTitularNaTela({}, formulario({ canal: 'widget', identificador: 'visita', confirmacao: 'APAGAR' }))
    expect(amb.erro).toMatch(/Mais de um titular/)
    sessao = await criarUsuario()
    const comum = await apagarTitularNaTela({}, formulario({ canal: 'widget', identificador: VISITANTE_A, confirmacao: 'APAGAR' }))
    expect(comum.erro).toBeDefined()
    expect(await prisma.conversa.count()).toBe(2)
  })
})
