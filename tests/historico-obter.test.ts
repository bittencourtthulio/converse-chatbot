// T-02.04: obterConversa (transcrição com fontes) e exportarConversaTexto.
import { describe, it, expect, beforeEach } from 'vitest'
import { ErroDeAplicacao } from '@/lib/erros'
import { exportarConversaTexto, obterConversa } from '@/servicos/historico'
import { criarAdmin, limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarConversaDeTeste, fonteDeTeste } from './apoio/historico'

beforeEach(limparBanco)

const VISITANTE = 'abcdef123456789012345'

async function conversaDoWidget() {
  const agente = await criarAgenteDeTeste({ nome: 'Vendas' })
  const t0 = new Date('2026-03-10T15:00:00.000Z')
  return criarConversaDeTeste({
    agenteId: agente.id,
    canal: 'widget',
    identificadorExterno: VISITANTE,
    atualizadoEm: t0,
    mensagens: [
      { papel: 'user', conteudo: 'Qual o prazo de entrega?', criadoEm: new Date(t0.getTime() + 1000) },
      { papel: 'assistant', conteudo: 'Cinco dias [1].', criadoEm: new Date(t0.getTime() + 2000), fontes: [fonteDeTeste('Política de entrega', 3)] },
      { papel: 'user', conteudo: 'Obrigado', criadoEm: new Date(t0.getTime() + 3000) },
    ],
  })
}

describe('obterConversa (integração com o banco de teste)', () => {
  it('devolve as mensagens em ordem cronológica com as fontes lidas por lerFontesGravadas', async () => {
    const c = await conversaDoWidget()
    const r = await obterConversa(c.id)
    expect(r.mensagens.map((m) => m.conteudo)).toEqual(['Qual o prazo de entrega?', 'Cinco dias [1].', 'Obrigado'])
    expect(r.mensagens.map((m) => m.papel)).toEqual(['user', 'assistant', 'user'])
    expect(r.mensagens[0]?.fontes).toEqual([])
    expect(r.mensagens[1]?.fontes[0]).toMatchObject({ titulo: 'Política de entrega', citada: true })
    expect(r.mensagens[1]?.fontes[0]?.trechos[0]).toMatchObject({ n: 1, posicao: 3 })
    expect(r.mensagens[0]?.criadoEm).toBeInstanceOf(Date)
    expect(r).toMatchObject({ id: c.id, agenteNome: 'Vendas', canal: 'widget', rotulo: 'Visitante abcdef', totalDeMensagens: 3 })
  })

  it('fontes com JSON inválido viram lista vazia, sem quebrar a leitura', async () => {
    const c = await conversaDoWidget()
    const { prisma } = await import('@/lib/prisma')
    await prisma.mensagem.updateMany({ where: { conversaId: c.id, papel: 'assistant' }, data: { fontes: '{quebrado' } })
    const r = await obterConversa(c.id)
    expect(r.mensagens[1]?.fontes).toEqual([])
  })

  it('id inexistente é 404', async () => {
    await expect(obterConversa('nao-existe')).rejects.toSatisfy((e) => e instanceof ErroDeAplicacao && e.status === 404)
  })

  it('o rótulo do painel é o nome do usuário e o do Telegram, o título', async () => {
    const admin = await criarAdmin()
    const agente = await criarAgenteDeTeste({ criadoPorId: admin.id })
    const p = await criarConversaDeTeste({ agenteId: agente.id, canal: 'painel', criadoPorId: admin.id, mensagens: [{ papel: 'user', conteudo: 'oi' }] })
    const t = await criarConversaDeTeste({ agenteId: agente.id, canal: 'telegram', identificadorExterno: '777888999', titulo: 'Telegram: Maria', mensagens: [{ papel: 'user', conteudo: 'oi' }] })
    expect((await obterConversa(p.id)).rotulo).toBe(admin.nome)
    const tel = await obterConversa(t.id)
    expect(tel.rotulo).toBe('Telegram: Maria')
    expect(JSON.stringify(tel)).not.toContain('777888999')
  })
})

describe('exportarConversaTexto (funcional)', () => {
  it('traz agente, canal, rótulo mascarado, horários e mensagens, sem o visitanteId completo', async () => {
    const c = await conversaDoWidget()
    const { nomeDoArquivo, texto } = await exportarConversaTexto(c.id)
    expect(nomeDoArquivo).toBe(`conversa-${c.id}.txt`)
    expect(texto).toContain('Vendas')
    expect(texto).toContain('widget')
    expect(texto).toContain('Visitante abcdef')
    expect(texto).toContain('Qual o prazo de entrega?')
    expect(texto).toContain('Cinco dias [1].')
    expect(texto).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    expect(texto).toContain('Fontes: Política de entrega')
    expect(texto).not.toContain(VISITANTE)
    expect(texto).not.toContain('Trecho 3')
    // ordem: pergunta antes da resposta
    expect(texto.indexOf('Qual o prazo')).toBeLessThan(texto.indexOf('Cinco dias'))
  })

  it('id inexistente é 404', async () => {
    await expect(exportarConversaTexto('x')).rejects.toSatisfy((e) => e instanceof ErroDeAplicacao && e.status === 404)
  })
})
