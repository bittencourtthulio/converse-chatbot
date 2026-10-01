/**
 * `npm run restore -- <arquivo>` (FT-11, PR-20, PR-98): o comando roda como processo filho contra
 * diretórios limpos. Valida antes de tocar em qualquer coisa, recusa rodar com o servidor de pé (salvo
 * `--forcar`), aplica `prisma migrate deploy` se o esquema do backup é mais antigo, reconstrói o índice
 * FTS5, grava a auditoria `restauracao` no banco já restaurado e imprime o resumo.
 */
import { afterEach, describe, expect, it } from 'vitest'
import Database from 'better-sqlite3'
import { createHash, randomUUID } from 'node:crypto'
import { createServer, type Server } from 'node:http'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { gerarBackup } from '../src/lib/backup.js'
import { ambiente } from '../src/lib/ambiente.js'
import { migracoesDoApp } from '../src/lib/versao.js'
import { limparBanco } from './ajuda'
import { adulterar, alterarUmByte, comMigrationNova, gerarBackupDeTeste, limparBackupsDeTeste, novoDiretorioDeTeste, refazerParte } from './apoio/backups-de-teste'
import { rodarScript } from './apoio/comando'
import { PALAVRA_DE_BUSCA, bancoDoTeste, buscarNoIndice, retratoDoBanco, retratoDoStorage } from './apoio/instalacao'

const servidores: Server[] = []
afterEach(async () => {
  limparBackupsDeTeste()
  await limparBanco()
  await Promise.all(servidores.splice(0).map((s) => new Promise((r) => s.close(() => r(undefined)))))
})

interface Destino {
  raiz: string
  banco: string
  storage: string
  backups: string
}
const destinoLimpo = (): Destino => {
  const raiz = novoDiretorioDeTeste('converse-restore-')
  return { raiz, banco: path.join(raiz, 'dados', 'app.db'), storage: path.join(raiz, 'dados', 'storage'), backups: path.join(raiz, 'dados', 'backups') }
}
const variaveis = (d: Destino, extra: Record<string, string | undefined> = {}) => ({
  DATABASE_URL: `file:${d.banco}`,
  STORAGE_DIR: d.storage,
  BACKUP_DIR: d.backups,
  NODE_ENV: 'test',
  PORT: '3298',
  ...extra,
})

async function servidorDeSaudeFalso(): Promise<number> {
  const s = createServer((_req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end('{"status":"ok"}')
  })
  servidores.push(s)
  await new Promise<void>((r) => s.listen(0, '127.0.0.1', () => r()))
  return (s.address() as { port: number }).port
}

describe('npm run restore (instalação limpa)', () => {
  it('restaura o banco e o storage, grava a auditoria restauracao no banco restaurado e imprime o resumo', async () => {
    const b = await gerarBackupDeTeste()
    const doBackup = retratoDoBanco()
    const arquivosDoBackup = retratoDoStorage().filter((a) => !/\/(audio|segmentos)\/|\.parcial$/.test(a.caminho))
    const d = destinoLimpo()

    const r = await rodarScript('restore', variaveis(d), [b.caminho])

    expect(r.stderr).not.toMatch(/\n\s+at\s/)
    expect(r.codigo).toBe(0)
    expect(r.stdout).toContain('Restauração concluída')
    expect(r.stdout).toContain(b.nome)
    expect(r.stdout).toContain('ENCRYPTION_KEY')
    expect(r.stdout).toMatch(/instalação limpa|nenhum/i)

    // Cada tabela voltou igual, menos a auditoria, que ganhou exatamente a linha da restauração.
    const depois = retratoDoBanco(d.banco)
    for (const tabela of Object.keys(doBackup)) {
      if (tabela === 'registros_de_auditoria') continue
      expect(depois[tabela], tabela).toEqual(doBackup[tabela])
    }
    const auditoria = depois.registros_de_auditoria!
    expect(auditoria).toHaveLength(doBackup.registros_de_auditoria!.length + 1)
    const nova = auditoria.find((l) => l.acao === 'restauracao')!
    expect(nova).toMatchObject({ usuarioId: null, usuarioRotulo: 'Sistema', alvoTipo: 'sistema' })
    expect(JSON.parse(String(nova.detalhes))).toEqual({ origem: b.nome, resultado: 'concluida' })

    expect(retratoDoStorage(d.storage)).toEqual(arquivosDoBackup)
    expect(buscarNoIndice(d.banco, PALAVRA_DE_BUSCA)).toHaveLength(3)
  }, 120_000)

  it('reconstrói o índice FTS5: um backup com o índice vazio responde à busca depois de restaurado', async () => {
    const b = await gerarBackupDeTeste()
    const semIndice = await adulterar(b.caminho, (dir, m) => {
      const db = new Database(path.join(dir, 'banco', 'app.db'))
      db.exec("INSERT INTO trechos_fts(trechos_fts) VALUES ('delete-all')")
      db.close()
      refazerParte(dir, m, 'banco/app.db')
    })
    // O índice do backup está vazio...
    const prova = novoDiretorioDeTeste('converse-prova-')
    const dPrev = destinoLimpo()
    expect(dPrev.banco).toBeTruthy()
    const { extract } = await import('tar')
    await extract({ file: semIndice, cwd: prova })
    expect(buscarNoIndice(path.join(prova, 'banco', 'app.db'), PALAVRA_DE_BUSCA)).toHaveLength(0)
    // ...e depois de restaurado a busca volta.
    const d = destinoLimpo()
    const r = await rodarScript('restore', variaveis(d), [semIndice])
    expect(r.codigo).toBe(0)
    expect(buscarNoIndice(d.banco, PALAVRA_DE_BUSCA)).toHaveLength(3)
  }, 120_000)

  it('sobre uma instalação com dados guarda a cópia em BACKUP_DIR/pre-restauracao-* e diz onde', async () => {
    const b = await gerarBackupDeTeste()
    const d = destinoLimpo()
    // Primeira restauração: cria a instalação. Segunda: já há dados a guardar.
    expect((await rodarScript('restore', variaveis(d), [b.caminho])).codigo).toBe(0)
    const antes = retratoDoBanco(d.banco)
    const r = await rodarScript('restore', variaveis(d), [b.caminho])
    expect(r.codigo).toBe(0)
    const pre = readdirSync(d.backups).filter((n) => n.startsWith('pre-restauracao-'))
    expect(pre).toHaveLength(1)
    expect(r.stdout).toContain(path.join(d.backups, pre[0]!))
    expect(retratoDoBanco(path.join(d.backups, pre[0]!, 'app.db'))).toEqual(antes)
  }, 180_000)
})

describe('npm run restore (esquema)', () => {
  /** Um banco no esquema ANTERIOR ao último: aplica as migrations menos a última, como o Prisma registra. */
  function bancoNoEsquemaAnterior(destino: string): void {
    const db = new Database(destino)
    db.exec(
      'CREATE TABLE "_prisma_migrations" ("id" TEXT PRIMARY KEY NOT NULL, "checksum" TEXT NOT NULL, "finished_at" DATETIME, "migration_name" TEXT NOT NULL, "logs" TEXT, "rolled_back_at" DATETIME, "started_at" DATETIME NOT NULL DEFAULT current_timestamp, "applied_steps_count" INTEGER UNSIGNED NOT NULL DEFAULT 0)',
    )
    for (const nome of migracoesDoApp().slice(0, -1)) {
      const sql = readFileSync(path.join(process.cwd(), 'prisma', 'migrations', nome, 'migration.sql'), 'utf8')
      db.exec(sql)
      db.prepare("INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, started_at, applied_steps_count) VALUES (?, ?, datetime('now'), ?, datetime('now'), 1)").run(
        randomUUID(),
        createHash('sha256').update(sql).digest('hex'),
        nome,
      )
    }
    db.prepare("INSERT INTO usuarios (id, nome, email, senhaHash, papel, ativo, sessoesValidasDesde, criadoEm, atualizadoEm) VALUES ('u1', 'Maria', 'maria@exemplo.local', 'hash-de-teste', 'admin', 1, datetime('now'), datetime('now'), datetime('now'))").run()
    db.close()
  }

  it('backup de esquema mais antigo: aplica prisma migrate deploy, restaura e a auditoria cabe no esquema novo', async () => {
    const antigo = novoDiretorioDeTeste('converse-esquema-antigo-')
    const bancoAntigo = path.join(antigo, 'antigo.db')
    bancoNoEsquemaAnterior(bancoAntigo)
    const backups = novoDiretorioDeTeste('converse-backups-antigo-')
    const r0 = await gerarBackup({ bancoArquivo: bancoAntigo, storageDir: path.join(antigo, 'sem-storage'), backupDir: backups, versaoDoApp: '0.9.0' })
    expect(r0.manifesto.migracoes).toHaveLength(migracoesDoApp().length - 1)

    const d = destinoLimpo()
    const r = await rodarScript('restore', variaveis(d), [r0.caminho], { prazoMs: 120_000 })

    expect(r.stderr).not.toMatch(/\n\s+at\s/)
    expect(r.codigo).toBe(0)
    expect(r.stdout).toMatch(/migration/i)
    const db = new Database(d.banco, { readonly: true })
    const aplicadas = (db.prepare('SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL ORDER BY migration_name').all() as Array<{ migration_name: string }>).map((l) => l.migration_name)
    expect(aplicadas).toEqual(migracoesDoApp())
    expect(db.prepare("SELECT acao FROM registros_de_auditoria WHERE acao = 'restauracao'").all()).toHaveLength(1)
    expect((db.prepare('SELECT COUNT(*) AS n FROM usuarios').get() as { n: number }).n).toBe(1)
    db.close()
  }, 180_000)

  it('backup de esquema mais novo: recusa sem tocar em nada e diz que o app é mais antigo', async () => {
    const b = await gerarBackupDeTeste()
    const novo = await adulterar(b.caminho, (dir, m) => comMigrationNova(dir, m))
    const d = destinoLimpo()
    const r = await rodarScript('restore', variaveis(d), [novo])
    expect(r.codigo).not.toBe(0)
    expect(r.stderr).toMatch(/mais nova|mais novo|mais recente/i)
    expect(r.stderr).not.toMatch(/\n\s+at\s/)
    expect(existsSync(d.raiz) ? readdirSync(d.raiz) : []).toEqual([])
  }, 120_000)
})

describe('npm run restore (servidor de pé e argumentos)', () => {
  it('com o servidor respondendo em /api/saude recusa sem tocar em nada; com --forcar prossegue', async () => {
    const b = await gerarBackupDeTeste()
    const porta = await servidorDeSaudeFalso()
    const d = destinoLimpo()

    const recusa = await rodarScript('restore', variaveis(d, { PORT: String(porta) }), [b.caminho])
    expect(recusa.codigo).not.toBe(0)
    expect(recusa.stderr).toMatch(/Pare o servidor/)
    expect(recusa.stderr).toContain('--forcar')
    expect(existsSync(d.raiz) ? readdirSync(d.raiz) : []).toEqual([])

    const forcada = await rodarScript('restore', variaveis(d, { PORT: String(porta) }), [b.caminho, '--forcar'])
    expect(forcada.codigo).toBe(0)
    expect(forcada.stdout).toContain('Restauração concluída')
    expect(forcada.stdout + forcada.stderr).toMatch(/--forcar|servidor/)
    expect(existsSync(d.banco)).toBe(true)
  }, 180_000)

  it('sem argumento, com arquivo inexistente ou sem DATABASE_URL sai com código diferente de zero e mensagem clara, sem pilha', async () => {
    const d = destinoLimpo()
    const semArgumento = await rodarScript('restore', variaveis(d), [])
    expect(semArgumento.codigo).not.toBe(0)
    expect(semArgumento.stderr).toMatch(/Uso:|informe o arquivo/i)

    const inexistente = await rodarScript('restore', variaveis(d), [path.join(d.raiz, 'nao-existe.tar.gz')])
    expect(inexistente.codigo).not.toBe(0)
    expect(inexistente.stderr).toMatch(/não foi encontrado/)

    const b = await gerarBackupDeTeste()
    const semBanco = await rodarScript('restore', variaveis(d, { DATABASE_URL: undefined }), [b.caminho])
    expect(semBanco.codigo).not.toBe(0)
    expect(semBanco.stderr).toContain('DATABASE_URL')

    for (const r of [semArgumento, inexistente, semBanco]) expect(r.stderr).not.toMatch(/\n\s+at\s/)
    expect(existsSync(d.raiz) ? readdirSync(d.raiz) : []).toEqual([])
  }, 180_000)

  it('arquivo adulterado: recusa e não toca na instalação', async () => {
    const b = await gerarBackupDeTeste()
    const ruim = await adulterar(b.caminho, (dir) => alterarUmByte(path.join(dir, 'banco', 'app.db')), { reescreverManifesto: false })
    const d = destinoLimpo()
    const r = await rodarScript('restore', variaveis(d), [ruim])
    expect(r.codigo).not.toBe(0)
    expect(r.stderr).toMatch(/alterado|não confere/)
    expect(existsSync(d.banco)).toBe(false)
  }, 120_000)

  it('o script e o package.json: o comando restore, o aviso da ENCRYPTION_KEY e nenhuma execução por shell', () => {
    const fonte = readFileSync(path.join(process.cwd(), 'scripts/restore.ts'), 'utf8')
    expect(fonte).toContain('reconstruirIndiceDeTrechos')
    expect(fonte).toMatch(/acao: 'restauracao'/)
    expect(fonte).not.toMatch(/shell:\s*true|execSync|exec\(/)
    const pacote = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')) as { scripts: Record<string, string> }
    expect(pacote.scripts.restore).toBe('tsx scripts/restore.ts')
    expect(ambiente.storageDir).toBeTruthy()
    expect(bancoDoTeste()).toBeTruthy()
  })
})
