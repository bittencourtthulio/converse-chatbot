/**
 * As conversas fictícias da seed (FT-09, PR-84): o agente de exemplo ganha uma conversa do
 * painel e outra do widget, com fontes plausíveis, para as telas novas não nascerem vazias.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { spawnSync } from 'node:child_process'
import { prisma } from '@/lib/prisma'
import { lerFontesGravadas } from '@/servicos/fontes-da-resposta'
import { listarConversas, obterConversa } from '@/servicos/historico'
import { limparBanco } from './ajuda'

function semear(ambienteExtra: Record<string, string> = {}) {
  return spawnSync('npx', ['tsx', 'prisma/seed.ts'], { env: { ...process.env, ...ambienteExtra }, encoding: 'utf8' })
}

beforeEach(limparBanco)

describe('conversas de exemplo (integração com o banco de teste)', () => {
  it('rodada duas vezes deixa exatamente duas conversas do agente de exemplo, uma do painel e outra do widget', async () => {
    expect(semear().status).toBe(0)
    expect(semear().status).toBe(0)
    const conversas = await prisma.conversa.findMany({ include: { criadoPor: true, mensagens: true }, orderBy: { canal: 'asc' } })
    expect(conversas).toHaveLength(2)
    expect(conversas.every((c) => c.agenteId === 'agente-de-exemplo')).toBe(true)
    const [painel, widget] = conversas
    expect(painel?.canal).toBe('painel')
    expect(painel?.criadoPor?.email).toBe('usuario@exemplo.local')
    expect(widget?.canal).toBe('widget')
    expect(widget?.criadoPorId).toBeNull()
    expect(widget?.identificadorExterno).toMatch(/^[A-Za-z0-9_-]{16,64}$/)
    expect(await prisma.mensagem.count()).toBe((painel?.mensagens.length ?? 0) + (widget?.mensagens.length ?? 0))
  })

  it('cada conversa tem perguntas e respostas alternadas, e as respostas citam a fonte de exemplo', async () => {
    expect(semear().status).toBe(0)
    const texto = (await prisma.fonte.findUniqueOrThrow({ where: { id: 'fonte-de-exemplo' } })).titulo
    for (const c of await prisma.conversa.findMany({ include: { mensagens: { orderBy: { criadoEm: 'asc' } } } })) {
      expect(c.mensagens.length).toBeGreaterThanOrEqual(2)
      expect(c.mensagens.map((m) => m.papel)).toEqual(c.mensagens.map((_, i) => (i % 2 === 0 ? 'user' : 'assistant')))
      const respostas = c.mensagens.filter((m) => m.papel === 'assistant')
      for (const r of respostas) {
        const fontes = lerFontesGravadas(r.fontes)
        expect(fontes.length).toBeGreaterThan(0)
        expect(fontes[0]).toMatchObject({ fonteId: 'fonte-de-exemplo', titulo: texto, citada: true })
        expect(r.conteudo).toContain('[1]')
      }
    }
  })

  it('o trecho citado é um pedaço real do texto da fonte de exemplo, com até 300 caracteres', async () => {
    expect(semear().status).toBe(0)
    const trechos = (await prisma.trecho.findMany({ where: { fonteId: 'fonte-de-exemplo' } })).map((t) => t.texto.replace(/\s+/g, ' '))
    const conteudoDaFonte = trechos.join(' ')
    const respostas = await prisma.mensagem.findMany({ where: { papel: 'assistant' } })
    expect(respostas.length).toBeGreaterThan(0)
    for (const r of respostas) {
      for (const f of lerFontesGravadas(r.fontes)) {
        for (const t of f.trechos) {
          expect(t.trechoTexto.length).toBeLessThanOrEqual(300)
          expect(conteudoDaFonte.replace(/\s+/g, ' ')).toContain(t.trechoTexto.replace(/…$/, '').trim().slice(0, 40))
        }
      }
    }
  })
})

describe('conversas de exemplo (funcional)', () => {
  it('aparecem no histórico com o rótulo mascarado e abrem com as fontes', async () => {
    expect(semear().status).toBe(0)
    const { itens, total } = await listarConversas({})
    expect(total).toBe(2)
    const porCanal = Object.fromEntries(itens.map((i) => [i.canal, i]))
    expect(porCanal.painel?.rotulo).toBe('Usuário de demonstração')
    expect(porCanal.widget?.rotulo).toMatch(/^Visitante \S{6}$/)
    const aberta = await obterConversa(porCanal.widget!.id)
    expect(aberta.mensagens.some((m) => m.fontes.length > 0)).toBe(true)
  })

  it('a atividade é recente, para o painel não nascer com o gráfico vazio', async () => {
    expect(semear().status).toBe(0)
    const agora = Date.now()
    for (const c of await prisma.conversa.findMany()) {
      expect(agora - c.atualizadoEm.getTime()).toBeLessThan(3 * 24 * 3_600_000)
    }
  })

  it('não grava nada que pareça dado real: sem e-mail, telefone ou endereço', async () => {
    expect(semear().status).toBe(0)
    const tudo = (await prisma.mensagem.findMany()).map((m) => m.conteudo).join('\n') + (await prisma.conversa.findMany()).map((c) => `${c.titulo} ${c.identificadorExterno}`).join('\n')
    expect(tudo).not.toMatch(/@/)
    expect(tudo).not.toMatch(/\d{8,}/)
    expect(tudo).not.toMatch(/https?:\/\//)
  })

  it('apagar uma conversa de exemplo e semear de novo a recria uma vez só, sem duplicar a outra', async () => {
    expect(semear().status).toBe(0)
    const painel = await prisma.conversa.findFirstOrThrow({ where: { canal: 'painel' } })
    await prisma.conversa.delete({ where: { id: painel.id } })
    expect(semear().status).toBe(0)
    expect(await prisma.conversa.count()).toBe(2)
  })

  it('continua recusando rodar em produção e não grava conversa', async () => {
    const r = semear({ NODE_ENV: 'production' })
    expect(r.status).not.toBe(0)
    expect(r.stderr).toContain('não roda em produção')
    expect(await prisma.conversa.count()).toBe(0)
  })
})
