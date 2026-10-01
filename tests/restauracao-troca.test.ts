/**
 * A troca do banco e do storage (FT-11, PR-20, PR-98): a cópia do estado de antes em
 * `BACKUP_DIR/pre-restauracao-<data>`, o banco e o `storage/` do backup no lugar, as sobras de
 * `-journal` e `-wal` removidas, as permissões fechadas, e o desfazer quando algo falha no meio.
 */
import { afterEach, describe, expect, it } from 'vitest'
import Database from 'better-sqlite3'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { descartarBackupValidado, lerEValidarBackup, restaurarArquivos } from '../src/lib/restauracao.js'
import { limparBanco } from './ajuda'
import { gerarBackupDeTeste, limparBackupsDeTeste, novoDiretorioDeTeste } from './apoio/backups-de-teste'
import { bancoDoTeste, retratoDoBanco, retratoDoStorage } from './apoio/instalacao'

afterEach(async () => {
  limparBackupsDeTeste()
  await limparBanco()
})

interface Destino {
  raiz: string
  banco: string
  storage: string
  backups: string
}

/** Uma instalação de destino com dados DIFERENTES dos do backup (um banco alterado e um arquivo só dela). */
async function destinoComDados(): Promise<Destino> {
  const raiz = novoDiretorioDeTeste('converse-destino-')
  const banco = path.join(raiz, 'app.db')
  const origem = new Database(bancoDoTeste(), { readonly: true })
  await origem.backup(banco)
  origem.close()
  const db = new Database(banco)
  db.exec('DELETE FROM mensagens; DELETE FROM registros_de_auditoria;')
  db.close()
  const storage = path.join(raiz, 'storage')
  mkdirSync(path.join(storage, 'fontes', 'antigo'), { recursive: true })
  writeFileSync(path.join(storage, 'fontes', 'antigo', 'so-do-destino'), 'dado que só existe no destino')
  return { raiz, banco, storage, backups: path.join(raiz, 'backups') }
}

async function validar(arquivo: string, d: Destino) {
  return lerEValidarBackup(arquivo, { diretorioDeTrabalho: d.raiz })
}

describe('restaurarArquivos', () => {
  it('guarda o estado de antes em pre-restauracao e coloca o banco e o storage do backup no lugar, sem sobras', async () => {
    const b = await gerarBackupDeTeste()
    const doBackup = retratoDoBanco()
    const arquivosDoBackup = retratoDoStorage().filter((a) => !/\/(audio|segmentos)\/|\.parcial$/.test(a.caminho))
    const d = await destinoComDados()
    const antes = retratoDoBanco(d.banco)
    expect(antes).not.toEqual(doBackup)
    const arquivosDeAntes = retratoDoStorage(d.storage)
    writeFileSync(`${d.banco}-journal`, 'sobra de uma transação interrompida')
    writeFileSync(`${d.banco}-wal`, 'sobra do wal')

    const v = await validar(b.caminho, d)
    const r = await restaurarArquivos({ validado: v, bancoArquivo: d.banco, storageDir: d.storage, backupDir: d.backups, agora: () => new Date('2026-06-07T08:09:10.000Z') })

    // O banco e o storage são os do backup.
    expect(retratoDoBanco(d.banco)).toEqual(doBackup)
    expect(retratoDoStorage(d.storage)).toEqual(arquivosDoBackup)
    expect(existsSync(path.join(d.storage, 'fontes', 'antigo'))).toBe(false)
    expect(existsSync(`${d.banco}-journal`)).toBe(false)
    expect(existsSync(`${d.banco}-wal`)).toBe(false)

    // O estado de antes está guardado.
    expect(r.preRestauracao).toBe(path.join(d.backups, 'pre-restauracao-20260607-080910'))
    expect(retratoDoBanco(path.join(r.preRestauracao!, 'app.db'))).toEqual(antes)
    expect(retratoDoStorage(path.join(r.preRestauracao!, 'storage'))).toEqual(arquivosDeAntes)

    // Permissões fechadas e nada de extração sobrando.
    expect(statSync(d.banco).mode & 0o777).toBe(0o600)
    for (const a of retratoDoStorage(d.storage)) expect(statSync(path.join(d.storage, a.caminho)).mode & 0o777, a.caminho).toBe(0o600)
    expect(existsSync(path.join(v.diretorio, 'banco', 'app.db'))).toBe(false)
    await descartarBackupValidado(v)
    expect(readdirSync(d.raiz).filter((n) => n.startsWith('.restauracao-'))).toEqual([])
  })

  it('o banco restaurado abre, passa no integrity_check e responde à busca FTS5 com o índice do backup', async () => {
    const b = await gerarBackupDeTeste()
    const d = await destinoComDados()
    const v = await validar(b.caminho, d)
    await restaurarArquivos({ validado: v, bancoArquivo: d.banco, storageDir: d.storage, backupDir: d.backups })
    const db = new Database(d.banco, { readonly: true })
    expect(db.pragma('integrity_check')).toEqual([{ integrity_check: 'ok' }])
    const ids = db.prepare('SELECT t.id AS id FROM trechos_fts f JOIN trechos t ON t.rowid = f.rowid WHERE trechos_fts MATCH ?').all('"abacaxi"')
    expect(ids).toHaveLength(3)
    db.close()
    expect(readFileSync(path.join(d.storage, b.inst.originalRelativo)).length).toBeGreaterThan(0)
    await descartarBackupValidado(v)
  })

  it('uma falha depois da troca do storage devolve o storage anterior ao lugar e não toca no banco', async () => {
    const b = await gerarBackupDeTeste()
    const d = await destinoComDados()
    const bancoAntes = retratoDoBanco(d.banco)
    const storageAntes = retratoDoStorage(d.storage)
    const v = await validar(b.caminho, d)

    await expect(
      restaurarArquivos({
        validado: v,
        bancoArquivo: d.banco,
        storageDir: d.storage,
        backupDir: d.backups,
        aposTrocarOStorage: () => {
          throw new Error('falha simulada no meio da troca')
        },
      }),
    ).rejects.toMatchObject({ codigo: 'restauracao_falhou', message: expect.stringContaining('estado anterior foi mantido') })

    expect(retratoDoBanco(d.banco)).toEqual(bancoAntes)
    expect(retratoDoStorage(d.storage)).toEqual(storageAntes)
    await descartarBackupValidado(v)
  })

  it('instalação limpa (sem banco e sem storage): restaura sem cópia prévia e cria as pastas', async () => {
    const b = await gerarBackupDeTeste()
    const doBackup = retratoDoBanco()
    const raiz = novoDiretorioDeTeste('converse-limpa-')
    const d: Destino = { raiz, banco: path.join(raiz, 'dados', 'app.db'), storage: path.join(raiz, 'dados', 'storage'), backups: path.join(raiz, 'backups') }
    const v = await lerEValidarBackup(b.caminho, { diretorioDeTrabalho: path.dirname(d.banco) })
    const r = await restaurarArquivos({ validado: v, bancoArquivo: d.banco, storageDir: d.storage, backupDir: d.backups })
    expect(r.preRestauracao).toBeNull()
    expect(existsSync(d.backups)).toBe(false)
    expect(retratoDoBanco(d.banco)).toEqual(doBackup)
    expect(retratoDoStorage(d.storage).length).toBeGreaterThan(0)
    await descartarBackupValidado(v)
  })

  it('backup sem arquivos no storage deixa o storage do destino vazio', async () => {
    const b = await gerarBackupDeTeste()
    // Um backup só com o banco: gera outro com um storage inexistente.
    const { gerarBackup } = await import('../src/lib/backup.js')
    const semStorage = await gerarBackup({ bancoArquivo: bancoDoTeste(), storageDir: path.join(novoDiretorioDeTeste(), 'nao-existe'), backupDir: novoDiretorioDeTeste(), versaoDoApp: '1.0.0' })
    const d = await destinoComDados()
    const v = await validar(semStorage.caminho, d)
    await restaurarArquivos({ validado: v, bancoArquivo: d.banco, storageDir: d.storage, backupDir: d.backups })
    expect(readdirSync(d.storage)).toEqual([])
    await descartarBackupValidado(v)
    expect(b.nome).toBeTruthy()
  })

  it('duas restaurações no mesmo segundo ainda guardam o estado de antes (a segunda não perde a primeira)', async () => {
    const b = await gerarBackupDeTeste()
    const d = await destinoComDados()
    const fixo = () => new Date('2026-06-07T08:09:10.000Z')
    const v1 = await validar(b.caminho, d)
    const r1 = await restaurarArquivos({ validado: v1, bancoArquivo: d.banco, storageDir: d.storage, backupDir: d.backups, agora: fixo })
    await descartarBackupValidado(v1)
    const v2 = await validar(b.caminho, d)
    const r2 = await restaurarArquivos({ validado: v2, bancoArquivo: d.banco, storageDir: d.storage, backupDir: d.backups, agora: fixo })
    await descartarBackupValidado(v2)
    expect(r1.preRestauracao).not.toBe(r2.preRestauracao)
    expect(existsSync(path.join(r1.preRestauracao!, 'app.db'))).toBe(true)
    expect(existsSync(path.join(r2.preRestauracao!, 'app.db'))).toBe(true)
  })
})
