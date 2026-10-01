/**
 * As ferramentas de que o backup depende (FT-11, PR-96): o `tar` em processo, sem shell, e a API
 * de backup online do `better-sqlite3`, que copia páginas e por isso preserva o `rowid` de
 * `trechos` (o índice FTS5 de conteúdo externo depende dele). A prova do `rowid` é a razão de a
 * decisão não ser `VACUUM INTO`.
 */
import { afterAll, afterEach, describe, expect, it } from 'vitest'
import Database from 'better-sqlite3'
import { create, extract } from 'tar'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import os from 'node:os'
import path from 'node:path'
import { prisma } from '../src/lib/prisma.js'
import { criarAgenteDeTeste } from './apoio/fontes'
import { limparBanco } from './ajuda'

const raiz = process.cwd()
const pacote = JSON.parse(readFileSync(path.join(raiz, 'package.json'), 'utf8')) as {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}

const temporarios: string[] = []
const novoDiretorio = () => {
  const d = mkdtempSync(path.join(os.tmpdir(), 'converse-dep-'))
  temporarios.push(d)
  return d
}

afterEach(async () => {
  await limparBanco()
})
afterAll(() => {
  for (const d of temporarios) rmSync(d, { recursive: true, force: true })
})

const caminhoDoBanco = () => process.env.DATABASE_URL!.replace(/^file:/, '')

describe('declaração das dependências de operação', () => {
  it('tar e better-sqlite3 têm versão fixa e as ferramentas de produção estão em dependencies', () => {
    expect(pacote.dependencies.tar).toMatch(/^\d+\.\d+\.\d+$/)
    expect(pacote.dependencies['better-sqlite3']).toMatch(/^\d+\.\d+\.\d+$/)
    expect(pacote.devDependencies['@types/better-sqlite3']).toMatch(/^\d+\.\d+\.\d+$/)
    // O contêiner executa as migrations, o backup, a restauração e o administrador inicial.
    expect(pacote.dependencies.prisma).toBeDefined()
    expect(pacote.dependencies.tsx).toBeDefined()
    expect(pacote.devDependencies.prisma).toBeUndefined()
    expect(pacote.devDependencies.tsx).toBeUndefined()
  })
})

describe('API de backup online do better-sqlite3', () => {
  let linhasOriginais: Array<{ rowid: number; id: string }> = []

  async function semearTrechosComLacuna() {
    const { agente } = await criarAgenteDeTeste()
    const fonte = await prisma.fonte.create({
      data: { agenteId: agente.id, tipo: 'texto', titulo: 'Fonte', tamanhoBytes: 10, status: 'pronto' },
    })
    const ids: string[] = []
    for (let i = 0; i < 6; i += 1) {
      const t = await prisma.trecho.create({
        data: { fonteId: fonte.id, agenteId: agente.id, indice: i, texto: `trecho ${i} sobre abacaxi e laranja`, caracteres: 30 },
      })
      ids.push(t.id)
    }
    // As duas primeiras linhas somem: o rowid das restantes deixa de começar em 1.
    await prisma.trecho.deleteMany({ where: { id: { in: ids.slice(0, 2) } } })
  }

  it('a cópia preserva o rowid de cada trecho, responde à busca FTS5 igual e passa no integrity_check', async () => {
    await semearTrechosComLacuna()
    const origem = new Database(caminhoDoBanco(), { readonly: true, fileMustExist: true })
    linhasOriginais = origem.prepare('SELECT rowid AS rowid, id FROM trechos ORDER BY rowid').all() as typeof linhasOriginais
    expect(linhasOriginais).toHaveLength(4)
    expect(linhasOriginais[0]!.rowid).toBeGreaterThan(1)

    const destino = path.join(novoDiretorio(), 'copia.db')
    await origem.backup(destino)

    const copia = new Database(destino, { readonly: true, fileMustExist: true })
    const linhasDaCopia = copia.prepare('SELECT rowid AS rowid, id FROM trechos ORDER BY rowid').all()
    expect(linhasDaCopia).toEqual(linhasOriginais)
    const busca = (db: Database.Database) =>
      db.prepare("SELECT t.id FROM trechos_fts f JOIN trechos t ON t.rowid = f.rowid WHERE trechos_fts MATCH 'abacaxi' ORDER BY t.id").all()
    expect(busca(copia)).toEqual(busca(origem))
    expect(busca(copia)).toHaveLength(4)
    expect(copia.pragma('integrity_check')).toEqual([{ integrity_check: 'ok' }])
    copia.close()
    origem.close()
  })

  it('a cópia é independente: apagar na origem depois do backup não muda a cópia', async () => {
    await semearTrechosComLacuna()
    const origem = new Database(caminhoDoBanco(), { fileMustExist: true })
    const destino = path.join(novoDiretorio(), 'copia.db')
    await origem.backup(destino)
    origem.prepare('DELETE FROM trechos').run()
    origem.close()
    const copia = new Database(destino, { readonly: true })
    expect((copia.prepare('SELECT COUNT(*) AS n FROM trechos').get() as { n: number }).n).toBe(4)
    copia.close()
  })
})

describe('tar em processo, sem shell', () => {
  it('empacota com gzip em arquivo 0600 e extrai com o mesmo conteúdo', async () => {
    const origem = novoDiretorio()
    mkdirSync(path.join(origem, 'storage', 'fontes'), { recursive: true })
    writeFileSync(path.join(origem, 'manifest.json'), '{"formato":1}')
    writeFileSync(path.join(origem, 'storage', 'fontes', 'original'), Buffer.from([0, 1, 2, 3, 250]))

    const arquivo = path.join(novoDiretorio(), 'saida.tar.gz')
    await pipeline(
      create({ gzip: true, cwd: origem, portable: true }, ['manifest.json', 'storage']),
      createWriteStream(arquivo, { mode: 0o600 }),
    )
    expect(statSync(arquivo).mode & 0o777).toBe(0o600)

    const destino = novoDiretorio()
    await extract({ file: arquivo, cwd: destino })
    expect(readFileSync(path.join(destino, 'manifest.json'), 'utf8')).toBe('{"formato":1}')
    expect([...readFileSync(path.join(destino, 'storage', 'fontes', 'original'))]).toEqual([0, 1, 2, 3, 250])
  })
})
