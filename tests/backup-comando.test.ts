/**
 * `npm run backup` (FT-11, PR-20, PR-96): o comando roda fora do servidor, como processo filho, com
 * banco, STORAGE_DIR e BACKUP_DIR de teste (nunca os do desenvolvedor), gera o arquivo, audita com
 * origem "linha de comando" e o ator Sistema, e em falha sai com código diferente de zero e uma
 * mensagem clara, sem pilha.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import Database from 'better-sqlite3'
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { limparBanco } from './ajuda'
import { rodarScript } from './apoio/comando'
import { bancoDoTeste, semearInstalacao } from './apoio/instalacao'
import { ambiente } from '../src/lib/ambiente.js'

let pasta: string
let banco: string
let backups: string

const variaveis = (extra: Record<string, string | undefined> = {}) => ({
  DATABASE_URL: `file:${banco}`,
  STORAGE_DIR: ambiente.storageDir,
  BACKUP_DIR: backups,
  NODE_ENV: 'test',
  ...extra,
})

beforeEach(async () => {
  await limparBanco()
  pasta = mkdtempSync(path.join(os.tmpdir(), 'converse-comando-'))
  banco = path.join(pasta, 'app.db')
  backups = path.join(pasta, 'backups')
  await semearInstalacao()
  // O comando trabalha sobre uma cópia do banco do teste: o do teste continua só do teste.
  const origem = new Database(bancoDoTeste(), { readonly: true })
  await origem.backup(banco)
  origem.close()
})
afterEach(() => {
  try {
    chmodSync(pasta, 0o700)
  } catch {
    // some
  }
  rmSync(pasta, { recursive: true, force: true })
})

describe('npm run backup', () => {
  it('gera o arquivo 0600 em BACKUP_DIR, imprime nome e tamanho, avisa da ENCRYPTION_KEY e sai com 0', async () => {
    const r = await rodarScript('backup', variaveis())
    expect(r.stderr).not.toMatch(/\n\s+at\s/)
    expect(r.codigo).toBe(0)
    const arquivos = readdirSync(backups)
    expect(arquivos).toHaveLength(1)
    expect(arquivos[0]).toMatch(/^backup-\d{8}-\d{6}\.tar\.gz$/)
    expect(statSync(path.join(backups, arquivos[0]!)).mode & 0o777).toBe(0o600)
    expect(r.stdout).toContain(path.join(backups, arquivos[0]!))
    expect(r.stdout).toMatch(/\d+,\d (B|KB|MB)|\d+ B/)
    expect(r.stdout).toContain('ENCRYPTION_KEY')
  }, 90_000)

  it('registra a auditoria backup_gerado com origem linha de comando e ator Sistema, no banco do comando', async () => {
    await rodarScript('backup', variaveis())
    const db = new Database(banco, { readonly: true })
    const linha = db.prepare("SELECT usuarioRotulo, usuarioId, detalhes FROM registros_de_auditoria WHERE acao = 'backup_gerado'").get() as {
      usuarioRotulo: string
      usuarioId: string | null
      detalhes: string
    }
    db.close()
    expect(linha.usuarioRotulo).toBe('Sistema')
    expect(linha.usuarioId).toBeNull()
    expect(JSON.parse(linha.detalhes)).toMatchObject({ origem: 'linha de comando' })
  }, 90_000)

  it('sem DATABASE_URL sai com código diferente de zero e diz o nome da variável, sem pilha', async () => {
    const r = await rodarScript('backup', variaveis({ DATABASE_URL: undefined }))
    expect(r.codigo).not.toBe(0)
    expect(r.stderr).toContain('DATABASE_URL')
    expect(r.stderr).not.toMatch(/\n\s+at\s/)
    expect(readdirSync(pasta)).not.toContain('backups')
  }, 90_000)

  it('sem DATABASE_URL não lê um arquivo de ambiente: o banco que ele indicaria fica intacto (OC-2026-0001)', async () => {
    // Isca: faz o papel do arquivo de ambiente do desenvolvedor, apontando para um banco que não pode ser tocado.
    const sentinela = path.join(pasta, 'sentinela.db')
    copyFileSync(banco, sentinela)
    const isca = path.join(pasta, 'isca.env')
    writeFileSync(isca, `DATABASE_URL=file:${sentinela}\n`)
    const r = await rodarScript('backup', variaveis({ DATABASE_URL: undefined, DOTENV_CONFIG_PATH: isca }))
    expect(r.codigo).not.toBe(0)
    expect(r.stderr).toContain('DATABASE_URL')
    const db = new Database(sentinela, { readonly: true })
    const gravadas = db.prepare("SELECT COUNT(*) AS n FROM registros_de_auditoria WHERE acao = 'backup_gerado'").get() as { n: number }
    db.close()
    expect(gravadas.n).toBe(0)
  }, 90_000)

  it('BACKUP_DIR sem permissão de escrita sai com código diferente de zero e mensagem clara, sem pilha', async () => {
    if (process.getuid?.() === 0) return // como root a permissão não impede a gravação
    const somenteLeitura = path.join(pasta, 'so-leitura')
    mkdirSync(somenteLeitura)
    chmodSync(somenteLeitura, 0o500)
    const r = await rodarScript('backup', variaveis({ BACKUP_DIR: path.join(somenteLeitura, 'backups') }))
    expect(r.codigo).not.toBe(0)
    expect(r.stderr).toContain('Não foi possível gerar o backup')
    expect(r.stderr).not.toMatch(/\n\s+at\s/)
    chmodSync(somenteLeitura, 0o700)
  }, 90_000)

  it('o script usa o mesmo serviço do servidor e o package.json tem o comando backup', () => {
    const fonte = readFileSync(path.join(process.cwd(), 'scripts/backup.ts'), 'utf8')
    expect(fonte).toMatch(/gerarBackupAgora\('sistema', 'linha de comando'\)/)
    const pacote = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')) as { scripts: Record<string, string> }
    expect(pacote.scripts.backup).toBe('tsx scripts/backup.ts')
  })
})
