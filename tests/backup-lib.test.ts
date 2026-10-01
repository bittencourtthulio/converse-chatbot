/**
 * gerarBackup (FT-11, PR-20, PR-96): um único `.tar.gz` com `manifest.json`, o banco copiado pela
 * API de backup online e o `storage/`, tudo conferível pelos SHA-256 do manifesto. Roda sobre a
 * instalação de teste (banco e storage do próprio teste, nunca os do desenvolvedor).
 */
import { afterEach, describe, expect, it } from 'vitest'
import Database from 'better-sqlite3'
import { createHash } from 'node:crypto'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { extract } from 'tar'
import { ambiente } from '../src/lib/ambiente.js'
import { gerarBackup, PADRAO_DO_NOME_DE_BACKUP, type ManifestoDoBackup } from '../src/lib/backup.js'
import { migracoesDoApp } from '../src/lib/versao.js'
import { limparBanco } from './ajuda'
import {
  PALAVRA_DE_BUSCA,
  bancoDoTeste,
  buscarNoIndice,
  retratoDoBanco,
  semearInstalacao,
} from './apoio/instalacao'

const temporarios: string[] = []
const novoDiretorio = (prefixo = 'converse-backup-') => {
  const d = mkdtempSync(path.join(os.tmpdir(), prefixo))
  temporarios.push(d)
  return d
}

afterEach(async () => {
  for (const d of temporarios.splice(0)) rmSync(d, { recursive: true, force: true })
  await limparBanco()
})

const sha256 = (arquivo: string) => createHash('sha256').update(readFileSync(arquivo)).digest('hex')

async function gerar(backupDir = novoDiretorio()) {
  const resultado = await gerarBackup({
    bancoArquivo: bancoDoTeste(),
    storageDir: ambiente.storageDir,
    backupDir,
    versaoDoApp: '9.9.9',
    agora: () => new Date('2026-05-05T10:20:30.000Z'),
  })
  const extraido = novoDiretorio('converse-extraido-')
  await extract({ file: resultado.caminho, cwd: extraido })
  return { ...resultado, backupDir, extraido }
}

describe('gerarBackup', () => {
  it('produz um único arquivo backup-AAAAMMDD-HHMMSS.tar.gz com manifest.json, banco/app.db e storage/', async () => {
    const inst = await semearInstalacao()
    const r = await gerar()

    expect(r.nome).toBe('backup-20260505-102030.tar.gz')
    expect(PADRAO_DO_NOME_DE_BACKUP.test(r.nome)).toBe(true)
    expect(readdirSync(r.backupDir)).toEqual([r.nome])
    expect(statSync(r.caminho).size).toBe(r.bytes)

    expect(existsSync(path.join(r.extraido, 'manifest.json'))).toBe(true)
    expect(existsSync(path.join(r.extraido, 'banco', 'app.db'))).toBe(true)
    expect(existsSync(path.join(r.extraido, 'storage', inst.originalRelativo))).toBe(true)
    expect(readFileSync(path.join(r.extraido, 'storage', inst.originalRelativo))).toEqual(readFileSync(inst.caminhos.original))
  })

  it('o manifest traz formato, data, versão do app, migrations, contagem por tabela e o SHA-256 de cada parte, e todos conferem', async () => {
    const inst = await semearInstalacao()
    const r = await gerar()
    const m = JSON.parse(readFileSync(path.join(r.extraido, 'manifest.json'), 'utf8')) as ManifestoDoBackup

    expect(m.formato).toBe(1)
    expect(m.criadoEm).toBe('2026-05-05T10:20:30.000Z')
    expect(m.versaoDoApp).toBe('9.9.9')
    expect(m.migracoes).toEqual(migracoesDoApp())
    expect(m.contagens).toMatchObject({ usuarios: 2, agentes: 1, fontes: 1, trechos: 3, conversas: 1, mensagens: 2, canais_telegram: 1, registros_de_auditoria: 1 })
    expect(Object.keys(m.contagens).some((t) => t.startsWith('trechos_fts') || t === '_prisma_migrations')).toBe(false)
    expect(m.aviso).toContain('ENCRYPTION_KEY')

    const caminhos = m.partes.map((p) => p.caminho)
    expect(caminhos[0]).toBe('banco/app.db')
    expect(caminhos).toContain(`storage/${inst.originalRelativo}`)
    for (const parte of m.partes) {
      const arquivo = path.join(r.extraido, parte.caminho)
      expect(statSync(arquivo).size, parte.caminho).toBe(parte.bytes)
      expect(sha256(arquivo), parte.caminho).toBe(parte.sha256)
    }
    // Nenhum arquivo extraído fora do manifesto (além do próprio manifest.json).
    const extraidos: string[] = []
    const visitar = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const completo = path.join(dir, e.name)
        if (e.isDirectory()) visitar(completo)
        else extraidos.push(path.relative(r.extraido, completo).split(path.sep).join('/'))
      }
    }
    visitar(r.extraido)
    expect(extraidos.sort()).toEqual([...caminhos, 'manifest.json'].sort())
  })

  it('o banco extraído abre, passa no integrity_check e tem exatamente as mesmas linhas, o rowid e a busca FTS5', async () => {
    await semearInstalacao()
    const antes = retratoDoBanco()
    const r = await gerar()
    const copia = path.join(r.extraido, 'banco', 'app.db')

    const db = new Database(copia, { readonly: true })
    expect(db.pragma('integrity_check')).toEqual([{ integrity_check: 'ok' }])
    db.close()
    expect(retratoDoBanco(copia)).toEqual(antes)
    expect(buscarNoIndice(copia, PALAVRA_DE_BUSCA)).toEqual(buscarNoIndice(bancoDoTeste(), PALAVRA_DE_BUSCA))
    expect(buscarNoIndice(copia, PALAVRA_DE_BUSCA)).toHaveLength(3)
  })

  it('não deixa diretório de trabalho nem arquivo parcial em BACKUP_DIR e o diretório é criado se não existe', async () => {
    await semearInstalacao()
    const pai = novoDiretorio()
    const r = await gerar(path.join(pai, 'ainda', 'nao', 'existe'))
    expect(readdirSync(r.backupDir)).toEqual([r.nome])
  })

  it('banco inexistente recusa com mensagem clara e não deixa nada em BACKUP_DIR', async () => {
    const backupDir = novoDiretorio()
    await expect(
      gerarBackup({ bancoArquivo: path.join(backupDir, 'nao-existe.db'), storageDir: ambiente.storageDir, backupDir, versaoDoApp: '1.0.0' }),
    ).rejects.toMatchObject({ codigo: 'backup_falhou' })
    expect(readdirSync(backupDir)).toEqual([])
  })

  it('o mesmo segundo gera um nome com sufixo em vez de sobrescrever o anterior', async () => {
    await semearInstalacao()
    const backupDir = novoDiretorio()
    const a = await gerar(backupDir)
    const b = await gerar(backupDir)
    expect(a.nome).toBe('backup-20260505-102030.tar.gz')
    expect(b.nome).toBe('backup-20260505-102030-1.tar.gz')
    expect(readdirSync(backupDir).sort()).toEqual([a.nome, b.nome].sort())
  })

  it('o código não usa shell: nenhum child_process nem exec em src/lib/backup.ts', () => {
    const fonte = readFileSync(path.join(process.cwd(), 'src/lib/backup.ts'), 'utf8')
    // `RegExp.exec` (precedido de ponto) não é execução de processo.
    expect(fonte).not.toMatch(/child_process|(^|[^.\w])exec(Sync|File)?\(|\bspawn\(/m)
  })
})
