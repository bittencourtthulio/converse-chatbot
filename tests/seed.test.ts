/**
 * A seed de demonstração (PR-25): duas contas fictícias, idempotente, e que
 * se recusa a rodar em produção porque cria contas com senha conhecida.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { ambiente } from '@/lib/ambiente'
import { listar, resumo, trechosDaFonte } from '@/servicos/fontes'
import { dividirEmTrechos } from '@/servicos/trechos'
import { prisma } from '@/lib/prisma'
import { senhaConfere } from '@/lib/senha'
import { limparBanco } from './ajuda'

function semear(ambienteExtra: Record<string, string> = {}) {
  return spawnSync('npx', ['tsx', 'prisma/seed.ts'], {
    env: { ...process.env, ...ambienteExtra },
    encoding: 'utf8',
  })
}

describe('seed de demonstração', () => {
  beforeEach(limparBanco)

  it('cria as duas contas e é idempotente', async () => {
    expect(semear().status).toBe(0)
    expect(semear().status).toBe(0)

    const usuarios = await prisma.usuario.findMany({ orderBy: { email: 'asc' } })
    expect(usuarios.map((u) => [u.email, u.papel])).toEqual([
      ['admin@exemplo.local', 'admin'],
      ['usuario@exemplo.local', 'usuario'],
    ])
    for (const u of usuarios) {
      expect(await senhaConfere('demo1234', u.senhaHash)).toBe(true)
      expect(u.ativo).toBe(true)
    }
  })

  it('recusa rodar em produção e não grava nada', async () => {
    const r = semear({ NODE_ENV: 'production' })
    expect(r.status).not.toBe(0)
    expect(r.stderr).toContain('não roda em produção')
    expect(await prisma.usuario.count()).toBe(0)
    expect(await prisma.agente.count()).toBe(0)
  })

  it('cria o agente de exemplo uma vez só, do admin, sem chave do OpenRouter', async () => {
    expect(semear().status).toBe(0)
    expect(semear().status).toBe(0)

    const agentes = await prisma.agente.findMany({ include: { criadoPor: true } })
    expect(agentes).toHaveLength(1)
    const [agente] = agentes
    expect(agente?.nome).toBe('Assistente de exemplo')
    expect(agente?.modelo).toBe('openai/gpt-4o-mini')
    expect(agente?.criadoPor.email).toBe('admin@exemplo.local')
    expect(agente?.instrucoes).toMatch(/português/i)
    expect(agente?.mensagemInicial.length).toBeGreaterThan(0)

    const configuracao = await prisma.configuracaoDoWorkspace.findUnique({ where: { id: 'unica' } })
    expect(configuracao?.openrouterChaveCifrada ?? null).toBeNull()
  })

  it('não desfaz a edição que alguém fez no agente de exemplo', async () => {
    expect(semear().status).toBe(0)
    const antes = await prisma.agente.findFirstOrThrow()
    await prisma.agente.update({ where: { id: antes.id }, data: { nome: 'Renomeado' } })
    expect(semear().status).toBe(0)
    expect((await prisma.agente.findUniqueOrThrow({ where: { id: antes.id } })).nome).toBe('Renomeado')
  })
})

describe('fonte de exemplo da base (PR-25, FT-04)', () => {
  beforeEach(limparBanco)

  it('o agente de exemplo ganha uma fonte de texto fictícia já processada, uma vez só', async () => {
    expect(semear().status).toBe(0)
    expect(semear().status).toBe(0)

    const fontes = await prisma.fonte.findMany({ include: { criadoPor: true } })
    expect(fontes).toHaveLength(1)
    const [fonte] = fontes
    expect(fonte).toMatchObject({
      agenteId: 'agente-de-exemplo',
      tipo: 'texto',
      status: 'pronto',
      mensagemErro: null,
      tipoMime: 'text/plain',
    })
    expect(fonte!.criadoPor!.email).toBe('admin@exemplo.local')
    expect(fonte!.titulo).toMatch(/Loja Exemplo/)
    expect(fonte!.processadoEm).not.toBeNull()
  })

  it('os trechos vêm do mesmo divisor do serviço, e o original está no STORAGE_DIR', async () => {
    expect(semear().status).toBe(0)
    const fonte = await prisma.fonte.findFirstOrThrow()
    expect(fonte.caminhoArquivo).toBe(`fontes/agente-de-exemplo/${fonte.id}/original`)
    const arquivo = path.join(ambiente.storageDir, fonte.caminhoArquivo!)
    expect(existsSync(arquivo)).toBe(true)

    const texto = readFileSync(arquivo, 'utf8')
    const esperados = dividirEmTrechos(texto)
    const trechos = await prisma.trecho.findMany({ where: { fonteId: fonte.id }, orderBy: { indice: 'asc' } })
    expect(esperados.length).toBeGreaterThanOrEqual(2)
    expect(trechos.map((t) => t.texto)).toEqual(esperados)
    expect(fonte.totalTrechos).toBe(esperados.length)
    expect(fonte.tamanhoBytes).toBe(Buffer.byteLength(texto))
    for (const t of trechos) expect(t.agenteId).toBe('agente-de-exemplo')
  })

  it('aparece no serviço: listar, resumo e trechos', async () => {
    expect(semear().status).toBe(0)
    const admin = await prisma.usuario.findUniqueOrThrow({ where: { email: 'admin@exemplo.local' } })
    const autor = { id: admin.id, nome: admin.nome, email: admin.email, papel: admin.papel }
    const [fonte] = await listar(autor, 'agente-de-exemplo')
    expect(fonte!.status).toBe('pronto')
    const r = await resumo(autor, 'agente-de-exemplo')
    expect(r).toMatchObject({ total: 1, prontas: 1, emProcessamento: 0, comErro: 0 })
    expect(r.caracteres).toBeGreaterThan(500)
    const pagina = await trechosDaFonte(autor, 'agente-de-exemplo', fonte!.id)
    expect(pagina.trechos.length).toBe(fonte!.totalTrechos)
  })

  it('o texto é fictício: só a Loja Exemplo, sem dado pessoal', async () => {
    expect(semear().status).toBe(0)
    const fonte = await prisma.fonte.findFirstOrThrow()
    const texto = readFileSync(path.join(ambiente.storageDir, fonte.caminhoArquivo!), 'utf8')
    expect(texto).toContain('Loja Exemplo')
    expect(texto).not.toMatch(/@|\d{3}\.\d{3}\.\d{3}-\d{2}|\(\d{2}\)\s?\d{4,5}-\d{4}/)
  })

  it('não recria a fonte que alguém editou e não roda em produção', async () => {
    expect(semear().status).toBe(0)
    const antes = await prisma.fonte.findFirstOrThrow()
    await prisma.fonte.update({ where: { id: antes.id }, data: { titulo: 'Renomeada' } })
    expect(semear().status).toBe(0)
    expect((await prisma.fonte.findUniqueOrThrow({ where: { id: antes.id } })).titulo).toBe('Renomeada')
    expect(await prisma.fonte.count()).toBe(1)

    await limparBanco()
    expect(semear({ NODE_ENV: 'production' }).status).not.toBe(0)
    expect(await prisma.fonte.count()).toBe(0)
  })
})

describe('fonte de exemplo coberta pelo índice de busca (FT-05, PR-50)', () => {
  beforeEach(limparBanco)

  it('uma pergunta sobre a política de troca recupera o trecho da fonte de exemplo', async () => {
    expect(semear().status).toBe(0)
    const { buscarTrechos } = await import('@/servicos/recuperacao')
    const achados = await buscarTrechos('agente-de-exemplo', 'qual a política de troca?')
    expect(achados.length).toBeGreaterThan(0)
    expect(achados[0]).toMatchObject({ fonteId: 'fonte-de-exemplo', titulo: 'Política de troca e horário da Loja Exemplo' })
    expect(achados[0]!.texto).toContain('Política de troca')
  })

  it('rodar a seed duas vezes não duplica o índice, e o horário também é recuperável', async () => {
    expect(semear().status).toBe(0)
    expect(semear().status).toBe(0)
    const { buscarTrechos } = await import('@/servicos/recuperacao')
    const achados = await buscarTrechos('agente-de-exemplo', 'horário de atendimento')
    expect(achados.map((a) => a.trechoId)).toEqual([...new Set(achados.map((a) => a.trechoId))])
    expect(achados[0]!.texto).toContain('segunda a sexta')
    await prisma.$executeRawUnsafe(`INSERT INTO trechos_fts(trechos_fts, rank) VALUES('integrity-check', 1)`)
  })
})
