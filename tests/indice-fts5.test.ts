/**
 * Índice FTS5 dos trechos (FT-05, PR-04, PR-30, PR-50): a tabela virtual
 * `trechos_fts` nasce da migration, acompanha `trechos` por gatilhos e ignora
 * acento e caixa.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { criarAgenteDeTeste, criarFonteDeTeste } from './apoio/fontes'
import { limparBanco } from './ajuda'

// better-sqlite3 não traz tipos e o projeto não os instala: só este teste o abre direto.
const Database = createRequire(import.meta.url)('better-sqlite3') as new (arquivo: string) => {
  exec(sql: string): void
  prepare(sql: string): { all(): unknown[] }
  close(): void
}

async function achar(termo: string): Promise<string[]> {
  const linhas = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT t.id FROM trechos_fts JOIN trechos t ON t.rowid = trechos_fts.rowid
    WHERE trechos_fts MATCH ${`"${termo}"`}`
  return linhas.map((l) => l.id)
}

async function trechoNovo(texto: string) {
  const { agente } = await criarAgenteDeTeste()
  const fonte = await criarFonteDeTeste({ agenteId: agente.id, tipo: 'texto', status: 'pronto' })
  const trecho = await prisma.trecho.create({
    data: { fonteId: fonte.id, agenteId: agente.id, indice: 0, texto, caracteres: texto.length },
  })
  return { agente, fonte, trecho }
}

beforeEach(async () => {
  await limparBanco()
})
afterAll(async () => {
  await limparBanco()
})

describe('migration do índice FTS5', () => {
  it('existe uma migration busca_fts5 com a tabela virtual, os três gatilhos e o rebuild', () => {
    const sql = readFileSync(
      path.join(process.cwd(), 'prisma/migrations/20260930190000_busca_fts5/migration.sql'),
      'utf8',
    )
    expect(sql).toMatch(/CREATE VIRTUAL TABLE "?trechos_fts"? USING fts5/i)
    expect(sql).toMatch(/remove_diacritics 2/)
    expect(sql).toMatch(/AFTER INSERT ON "?trechos"?/i)
    expect(sql).toMatch(/AFTER DELETE ON "?trechos"?/i)
    expect(sql).toMatch(/AFTER UPDATE OF "?texto"? ON "?trechos"?/i)
    expect(sql).toMatch(/'rebuild'/)
  })
})

describe('preenchimento inicial', () => {
  it('a migration indexa trechos que já existiam antes dela', () => {
    const pasta = path.join(process.cwd(), 'prisma/migrations')
    const nomes = readdirSync(pasta)
      .filter((n) => /^\d{14}_/.test(n))
      .sort()
    const banco = new Database(':memory:')
    for (const nome of nomes.filter((n) => !n.endsWith('_busca_fts5'))) {
      banco.exec(readFileSync(path.join(pasta, nome, 'migration.sql'), 'utf8'))
    }
    banco.exec(`INSERT INTO usuarios(id,nome,email,senhaHash,atualizadoEm) VALUES ('u','U','u@x','h',CURRENT_TIMESTAMP);
      INSERT INTO agentes(id,nome,modelo,criadoPorId,atualizadoEm) VALUES ('a','A','m','u',CURRENT_TIMESTAMP);
      INSERT INTO fontes(id,agenteId,tipo,titulo,tamanhoBytes,atualizadoEm) VALUES ('f','a','texto','T',1,CURRENT_TIMESTAMP);
      INSERT INTO trechos(id,fonteId,agenteId,indice,texto,caracteres) VALUES ('t','f','a',0,'Entrega em até sete dias',24);`)
    banco.exec(readFileSync(path.join(pasta, '20260930190000_busca_fts5', 'migration.sql'), 'utf8'))
    const achados = banco
      .prepare(`SELECT t.id FROM trechos_fts JOIN trechos t ON t.rowid = trechos_fts.rowid WHERE trechos_fts MATCH '"entrega"'`)
      .all()
    banco.close()
    expect(achados).toEqual([{ id: 't' }])
  })
})

describe('sincronização do índice com trechos', () => {
  it('um trecho inserido é achado pelo MATCH', async () => {
    const { trecho } = await trechoNovo('O horário de atendimento é das 9h às 18h.')
    expect(await achar('atendimento')).toEqual([trecho.id])
  })

  it('ignora acento e caixa nos dois lados', async () => {
    const { trecho } = await trechoNovo('Política de TROCA e devolução')
    expect(await achar('politica')).toEqual([trecho.id])
    expect(await achar('DEVOLUCAO')).toEqual([trecho.id])
    expect(await achar('troca')).toEqual([trecho.id])
  })

  it('atualizar o texto troca o que o índice acha', async () => {
    const { trecho } = await trechoNovo('Vendemos cadernos universitários.')
    await prisma.trecho.update({ where: { id: trecho.id }, data: { texto: 'Vendemos grampeadores.' } })
    expect(await achar('cadernos')).toEqual([])
    expect(await achar('grampeadores')).toEqual([trecho.id])
  })

  it('apagar o trecho tira do índice', async () => {
    const { trecho } = await trechoNovo('Frete grátis acima de cento e cinquenta reais.')
    await prisma.trecho.delete({ where: { id: trecho.id } })
    expect(await achar('frete')).toEqual([])
  })

  it('o rebuild reconstrói o índice a partir de trechos', async () => {
    const { trecho } = await trechoNovo('Pagamento por Pix tem desconto.')
    await prisma.$executeRawUnsafe(`INSERT INTO trechos_fts(trechos_fts) VALUES('delete-all')`)
    expect(await achar('pix')).toEqual([])
    await prisma.$executeRawUnsafe(`INSERT INTO trechos_fts(trechos_fts) VALUES('rebuild')`)
    expect(await achar('pix')).toEqual([trecho.id])
  })
})
