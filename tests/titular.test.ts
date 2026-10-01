// T-05.01 (FT-10, PR-18, PR-90, D-23, D-24): direitos do titular pelo admin. Buscar por canal e
// identificador (prefixo de 6 ou mais caracteres no widget, id exato no Telegram) até resolver
// a um titular único, exportar (JSON e TXT) e apagar tudo. O identificador completo nunca
// aparece no resultado, no arquivo nem na auditoria.
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { apagarDoTitular, buscarTitular, exportarTitular } from '@/servicos/titular'
import { aguardarGravacoesPendentes } from '@/servicos/auditoria'
import { aoApagarConversa, type ConversaApagada } from '@/servicos/historico'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarConversaDeTeste, fonteDeTeste } from './apoio/historico'

const VISITANTE_A = 'visitanteAAAAAAAA0001XYZ'
const VISITANTE_B = 'visitanteBBBBBBBB0002XYZ'
const AGORA = new Date('2026-07-04T12:00:00.000Z')

beforeEach(limparBanco)
afterAll(limparBanco)

const eventos: ConversaApagada[] = []
let remover: () => void
beforeEach(() => {
  eventos.length = 0
  remover = aoApagarConversa((e) => eventos.push(e))
})
afterEach(() => remover())

async function cenario() {
  const admin = await criarAdmin()
  const agente = await criarAgenteDeTeste({ nome: 'Atendimento Loja' })
  const outro = await criarAgenteDeTeste({ nome: 'Suporte' })
  const a1 = await criarConversaDeTeste({
    agenteId: agente.id, canal: 'widget', identificadorExterno: VISITANTE_A,
    mensagens: [
      { papel: 'user', conteudo: 'Meu e-mail é maria@exemplo.com' },
      { papel: 'assistant', conteudo: 'Anotado [1]', fontes: [fonteDeTeste('Política de troca')] },
    ],
  })
  const a2 = await criarConversaDeTeste({ agenteId: outro.id, canal: 'widget', identificadorExterno: VISITANTE_A, mensagens: [{ papel: 'user', conteudo: 'outra conversa dela' }] })
  const b1 = await criarConversaDeTeste({ agenteId: agente.id, canal: 'widget', identificadorExterno: VISITANTE_B, mensagens: [{ papel: 'user', conteudo: 'conversa de outro visitante' }] })
  const t1 = await criarConversaDeTeste({ agenteId: agente.id, canal: 'telegram', identificadorExterno: '4455667788', titulo: 'Telegram: Joana', mensagens: [{ papel: 'user', conteudo: 'oi do telegram' }, { papel: 'assistant', conteudo: 'olá' }] })
  return { admin, agente, outro, a1, a2, b1, t1 }
}

describe('buscarTitular (integração com o banco de teste)', () => {
  it('o prefixo de 6 caracteres que casa dois visitantes devolve varios, com prefixo de 10 e contagens, sem o id completo', async () => {
    const { admin } = await cenario()
    const r = await buscarTitular(admin, { canal: 'widget', identificador: 'visita' })
    expect(r.estado).toBe('varios')
    expect(r.titulares).toHaveLength(2)
    const a = r.titulares.find((t) => t.conversas === 2)!
    expect(a).toMatchObject({ rotulo: 'Visitante visita', prefixo: VISITANTE_A.slice(0, 10), conversas: 2, mensagens: 3 })
    expect(a.agentes.sort()).toEqual(['Atendimento Loja', 'Suporte'])
    expect(JSON.stringify(r)).not.toContain(VISITANTE_A)
    expect(JSON.stringify(r)).not.toContain(VISITANTE_B)
  })

  it('um prefixo que identifica um só visitante devolve unico, e o id completo também', async () => {
    const { admin } = await cenario()
    expect((await buscarTitular(admin, { canal: 'widget', identificador: 'visitanteAAAA' })).estado).toBe('unico')
    expect((await buscarTitular(admin, { canal: 'widget', identificador: VISITANTE_B })).estado).toBe('unico')
  })

  it('Telegram exige o id do chat exato e mostra o nome público, nunca o id', async () => {
    const { admin } = await cenario()
    const r = await buscarTitular(admin, { canal: 'telegram', identificador: '4455667788' })
    expect(r.estado).toBe('unico')
    expect(r.titulares[0]).toMatchObject({ rotulo: 'Telegram: Joana', prefixo: null, conversas: 1, mensagens: 2 })
    expect(JSON.stringify(r)).not.toContain('4455667788')
    expect((await buscarTitular(admin, { canal: 'telegram', identificador: '44556' })).estado).toBe('nenhum')
  })

  it('identificador que não casa devolve nenhum', async () => {
    const { admin } = await cenario()
    const r = await buscarTitular(admin, { canal: 'widget', identificador: 'naoexiste12345' })
    expect(r).toEqual({ estado: 'nenhum', titulares: [] })
  })
})

describe('buscarTitular (funcional: validação e permissão)', () => {
  it('recusa prefixo curto, caracteres fora do alfabeto, canal inválido e Telegram não numérico com 422', async () => {
    const { admin } = await cenario()
    for (const entrada of [
      { canal: 'widget', identificador: 'visit' },
      { canal: 'widget', identificador: 'visita%' },
      { canal: 'widget', identificador: 'a'.repeat(65) },
      { canal: 'painel', identificador: 'visitanteAAAA' },
      { canal: 'telegram', identificador: 'abc' },
      { canal: 'widget', identificador: '' },
    ]) {
      await expect(buscarTitular(admin, entrada)).rejects.toMatchObject({ status: 422 })
    }
  })

  it('só admin: usuário comum recebe 403 em buscar, exportar e apagar', async () => {
    await cenario()
    const comum = await criarUsuario()
    const entrada = { canal: 'widget', identificador: VISITANTE_A }
    await expect(buscarTitular(comum, entrada)).rejects.toMatchObject({ status: 403 })
    await expect(exportarTitular(comum, { ...entrada, formato: 'json' })).rejects.toMatchObject({ status: 403 })
    await expect(apagarDoTitular(comum, entrada)).rejects.toMatchObject({ status: 403 })
    expect(await prisma.conversa.count()).toBe(4)
  })
})

describe('exportarTitular (integração e funcional)', () => {
  it('JSON traz as conversas e mensagens do titular certo, sem o identificador, e grava dados_do_titular_exportados', async () => {
    const { admin } = await cenario()
    const r = await exportarTitular(admin, { canal: 'widget', identificador: 'visitanteAAAA', formato: 'json' }, AGORA)
    expect(r.nomeDoArquivo).toBe('titular-widget-2026-07-04.json')
    expect(r.tipo).toBe('application/json; charset=utf-8')
    const dados = JSON.parse(r.conteudo)
    expect(dados.conversas).toHaveLength(2)
    expect(dados.conversas.flatMap((c: { mensagens: unknown[] }) => c.mensagens)).toHaveLength(3)
    expect(r.conteudo).toContain('maria@exemplo.com')
    expect(r.conteudo).toContain('Política de troca')
    expect(r.conteudo).not.toContain('conversa de outro visitante')
    expect(r.conteudo).not.toContain(VISITANTE_A)
    await aguardarGravacoesPendentes()
    const [reg] = await prisma.registroDeAuditoria.findMany()
    expect(reg).toMatchObject({ acao: 'dados_do_titular_exportados', alvoTipo: 'titular', usuarioId: admin.id })
    expect(JSON.parse(reg!.detalhes)).toEqual({ canal: 'widget', conversas: 2, mensagens: 3, formato: 'json' })
    expect(reg!.detalhes).not.toMatch(/maria|visitante/)
  })

  it('TXT é legível, com agente, horários e mensagens, e o nome do arquivo não leva o id', async () => {
    const { admin } = await cenario()
    const r = await exportarTitular(admin, { canal: 'telegram', identificador: '4455667788', formato: 'txt' }, AGORA)
    expect(r.nomeDoArquivo).toBe('titular-telegram-2026-07-04.txt')
    expect(r.tipo).toBe('text/plain; charset=utf-8')
    expect(r.conteudo).toContain('Atendimento Loja')
    expect(r.conteudo).toContain('oi do telegram')
    expect(r.conteudo).toContain('Telegram: Joana')
    expect(r.conteudo).not.toContain('4455667788')
  })

  it('prefixo ambíguo recusa exportar com 422 e formato desconhecido também', async () => {
    const { admin } = await cenario()
    await expect(exportarTitular(admin, { canal: 'widget', identificador: 'visita', formato: 'json' })).rejects.toMatchObject({ status: 422 })
    await expect(exportarTitular(admin, { canal: 'widget', identificador: VISITANTE_A, formato: 'pdf' })).rejects.toMatchObject({ status: 422 })
    expect(await prisma.registroDeAuditoria.count()).toBe(0)
  })

  it('titular inexistente dá 404', async () => {
    const { admin } = await cenario()
    await expect(exportarTitular(admin, { canal: 'widget', identificador: 'naoexiste12345', formato: 'json' })).rejects.toMatchObject({ status: 404 })
  })
})

describe('apagarDoTitular (integração e funcional)', () => {
  it('o id completo apaga só as conversas daquele visitante, em cascata, e as de outro ficam', async () => {
    const { admin, a1, a2, b1, t1 } = await cenario()
    const r = await apagarDoTitular(admin, { canal: 'widget', identificador: VISITANTE_A })
    expect(r).toEqual({ conversas: 2, mensagens: 3 })
    expect(await prisma.conversa.findMany({ where: { id: { in: [a1.id, a2.id] } } })).toHaveLength(0)
    expect(await prisma.conversa.findMany({ where: { id: { in: [b1.id, t1.id] } } })).toHaveLength(2)
    expect(await prisma.mensagem.count()).toBe(3)
  })

  it('avisa aoApagarConversa por conversa com origem titular, sem texto nem identificador, e grava o resumo', async () => {
    const { admin, a1, a2 } = await cenario()
    await apagarDoTitular(admin, { canal: 'widget', identificador: 'visitanteAAAA' })
    expect(eventos.map((e) => e.conversaId).sort()).toEqual([a1.id, a2.id].sort())
    for (const e of eventos) {
      expect(e).toMatchObject({ canal: 'widget', usuarioId: admin.id, origem: 'titular' })
      expect(JSON.stringify(e)).not.toMatch(/visitanteAAAA|maria@/)
    }
    await aguardarGravacoesPendentes()
    const registros = await prisma.registroDeAuditoria.findMany()
    expect(registros).toHaveLength(1)
    expect(registros[0]).toMatchObject({ acao: 'dados_do_titular_apagados', alvoTipo: 'titular', usuarioId: admin.id })
    expect(JSON.parse(registros[0]!.detalhes)).toEqual({ canal: 'widget', conversas: 2, mensagens: 3 })
  })

  it('prefixo ambíguo recusa apagar com 422 e nada é apagado', async () => {
    const { admin } = await cenario()
    await expect(apagarDoTitular(admin, { canal: 'widget', identificador: 'visita' })).rejects.toMatchObject({ status: 422 })
    expect(await prisma.conversa.count()).toBe(4)
  })

  it('apaga o titular do Telegram pelo id do chat', async () => {
    const { admin, t1 } = await cenario()
    expect(await apagarDoTitular(admin, { canal: 'telegram', identificador: '4455667788' })).toEqual({ conversas: 1, mensagens: 2 })
    expect(await prisma.conversa.findUnique({ where: { id: t1.id } })).toBeNull()
    expect(await prisma.conversa.count()).toBe(3)
  })

  it('titular inexistente dá 404 e não grava registro', async () => {
    const { admin } = await cenario()
    await expect(apagarDoTitular(admin, { canal: 'widget', identificador: 'naoexiste12345' })).rejects.toMatchObject({ status: 404 })
    expect(await prisma.registroDeAuditoria.count()).toBe(0)
  })
})
