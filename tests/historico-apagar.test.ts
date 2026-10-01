// T-02.05: apagarConversa, apagarConversas e o ponto de extensão aoApagarConversa (PR-80).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { ErroDeAplicacao } from '@/lib/erros'
import { aoApagarConversa, apagarConversa, apagarConversas, type ConversaApagada } from '@/servicos/historico'
import { limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarConversaDeTeste } from './apoio/historico'
import { criarAdmin } from './ajuda'

beforeEach(limparBanco)

const eventos: ConversaApagada[] = []
let remover: () => void
beforeEach(() => {
  eventos.length = 0
  remover = aoApagarConversa((e) => eventos.push(e))
})
afterEach(() => remover())

const e422 = (e: unknown) => e instanceof ErroDeAplicacao && e.status === 422
const e404 = (e: unknown) => e instanceof ErroDeAplicacao && e.status === 404

async function tres() {
  const agente = await criarAgenteDeTeste()
  const a = await criarConversaDeTeste({ agenteId: agente.id, canal: 'widget', identificadorExterno: 'visitante-secreto-123456', mensagens: [{ papel: 'user', conteudo: 'segredo da conversa a' }, { papel: 'assistant', conteudo: 'r' }] })
  const b = await criarConversaDeTeste({ agenteId: agente.id, canal: 'telegram', identificadorExterno: '4455667788', titulo: 'Telegram: Joana', mensagens: [{ papel: 'user', conteudo: 'b' }] })
  const c = await criarConversaDeTeste({ agenteId: agente.id, canal: 'widget', mensagens: [{ papel: 'user', conteudo: 'c' }] })
  return { agente, a, b, c }
}

describe('apagar (integração com o banco de teste)', () => {
  it('remove a conversa e, em cascata, as mensagens dela, e só ela', async () => {
    const { a, b } = await tres()
    await apagarConversa(a.id, 'u1')
    expect(await prisma.conversa.findUnique({ where: { id: a.id } })).toBeNull()
    expect(await prisma.mensagem.count({ where: { conversaId: a.id } })).toBe(0)
    expect(await prisma.conversa.findUnique({ where: { id: b.id } })).not.toBeNull()
    expect(await prisma.mensagem.count()).toBe(2)
  })

  it('apagar em lote remove todas as pedidas e devolve a contagem', async () => {
    const { a, b, c } = await tres()
    expect(await apagarConversas([a.id, b.id], 'u1')).toBe(2)
    expect(await prisma.conversa.count()).toBe(1)
    expect(await prisma.mensagem.count()).toBe(1)
    expect((await prisma.conversa.findMany())[0]?.id).toBe(c.id)
  })

  it('o ouvinte recebe um evento por conversa apagada, com os campos combinados', async () => {
    const { agente, a, b } = await tres()
    const admin = await criarAdmin()
    await apagarConversas([a.id, b.id], admin.id)
    expect(eventos).toHaveLength(2)
    expect(eventos.find((e) => e.conversaId === a.id)).toEqual({
      conversaId: a.id,
      agenteId: agente.id,
      canal: 'widget',
      usuarioId: admin.id,
      quantidadeDeMensagens: 2,
    })
    expect(eventos.find((e) => e.conversaId === b.id)).toMatchObject({ canal: 'telegram', quantidadeDeMensagens: 1 })
  })
})

describe('apagar (funcional)', () => {
  it('apagar três ids dos quais um não existe devolve dois', async () => {
    const { a, b } = await tres()
    expect(await apagarConversas([a.id, 'nao-existe', b.id], 'u1')).toBe(2)
    expect(eventos).toHaveLength(2)
  })

  it('ids repetidos contam uma vez', async () => {
    const { a } = await tres()
    expect(await apagarConversas([a.id, a.id, a.id], 'u1')).toBe(1)
    expect(eventos).toHaveLength(1)
  })

  it('lote vazio, de 51 ids ou com id inválido é 422 e não apaga nada', async () => {
    await tres()
    const cinquentaEUm = Array.from({ length: 51 }, (_, i) => `id-${i}`)
    await expect(apagarConversas([], 'u1')).rejects.toSatisfy(e422)
    await expect(apagarConversas(cinquentaEUm, 'u1')).rejects.toSatisfy(e422)
    await expect(apagarConversas(['ok', ''], 'u1')).rejects.toSatisfy(e422)
    await expect(apagarConversas('abc' as unknown as string[], 'u1')).rejects.toSatisfy(e422)
    await expect(apagarConversas([1 as unknown as string], 'u1')).rejects.toSatisfy(e422)
    expect(await prisma.conversa.count()).toBe(3)
    expect(eventos).toHaveLength(0)
  })

  it('50 ids é o máximo aceito', async () => {
    const cinquenta = Array.from({ length: 50 }, (_, i) => `id-${i}`)
    expect(await apagarConversas(cinquenta, 'u1')).toBe(0)
  })

  it('o evento nunca leva texto de mensagem nem o identificador externo', async () => {
    const { a, b } = await tres()
    await apagarConversas([a.id, b.id], 'u1')
    const texto = JSON.stringify(eventos)
    expect(texto).not.toContain('segredo da conversa a')
    expect(texto).not.toContain('visitante-secreto-123456')
    expect(texto).not.toContain('4455667788')
    expect(texto).not.toContain('Joana')
  })

  it('id inexistente em apagarConversa é 404 e não avisa ninguém', async () => {
    await expect(apagarConversa('nao-existe', 'u1')).rejects.toSatisfy(e404)
    expect(eventos).toHaveLength(0)
  })

  it('ouvinte que lança não derruba a exclusão e o que foi removido não é mais chamado', async () => {
    const { a, b } = await tres()
    const erro = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const removerQueLanca = aoApagarConversa(() => {
      throw new Error('falha do ouvinte')
    })
    expect(await apagarConversa(a.id, 'u1')).toBeUndefined()
    expect(eventos).toHaveLength(1)
    removerQueLanca()
    remover()
    await apagarConversa(b.id, 'u1')
    expect(eventos).toHaveLength(1)
    expect(erro).toHaveBeenCalledTimes(1)
    const linha = JSON.parse(String(erro.mock.calls[0]![0])) as Record<string, unknown>
    expect(linha).toMatchObject({ nivel: 'erro', msg: 'ouvinte_de_exclusao_falhou', conversaId: a.id })
    expect(JSON.stringify(linha)).not.toContain('falha do ouvinte')
    erro.mockRestore()
  })
})
