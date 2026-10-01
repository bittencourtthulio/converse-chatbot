// Backups de teste (FT-11): gera um backup real da instalação semeada e fabrica variações adulteradas
// (byte alterado, sem manifest, truncado, com parte extra, com caminho perigoso, de esquema diferente)
// reempacotando o conteúdo extraído, para os testes de validação e de restauração.
import Database from 'better-sqlite3'
import { createHash } from 'node:crypto'
import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, truncateSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { create, extract } from 'tar'
import { ambiente } from '../../src/lib/ambiente.js'
import { gerarBackup, type ManifestoDoBackup, type ResultadoDoBackup } from '../../src/lib/backup.js'
import { bancoDoTeste, semearInstalacao, type InstalacaoSemeada } from './instalacao'

const temporarios: string[] = []

/** Um diretório temporário que `limparBackupsDeTeste` apaga. */
export function novoDiretorioDeTeste(prefixo = 'converse-bkp-'): string {
  const d = mkdtempSync(path.join(os.tmpdir(), prefixo))
  temporarios.push(d)
  return d
}

export function limparBackupsDeTeste(): void {
  for (const d of temporarios.splice(0)) rmSync(d, { recursive: true, force: true })
}

export interface BackupDeTeste extends ResultadoDoBackup {
  inst: InstalacaoSemeada
  diretorio: string
}

/** Semeia a instalação de teste e gera um backup real dela, num diretório temporário. */
export async function gerarBackupDeTeste(): Promise<BackupDeTeste> {
  const inst = await semearInstalacao()
  const diretorio = novoDiretorioDeTeste()
  const r = await gerarBackup({ bancoArquivo: bancoDoTeste(), storageDir: ambiente.storageDir, backupDir: diretorio, versaoDoApp: '1.0.0' })
  return { ...r, inst, diretorio }
}

export const sha256 = (arquivo: string): string => createHash('sha256').update(readFileSync(arquivo)).digest('hex')

async function empacotar(origem: string, destino: string, opcoes: { preservePaths?: boolean } = {}): Promise<void> {
  await create({ gzip: true, cwd: origem, file: destino, portable: true, ...opcoes }, readdirSync(origem))
}

/**
 * Extrai o backup, deixa `mutar` alterar o conteúdo (recebe o diretório e o manifesto) e reempacota
 * num arquivo novo. `reescreverManifesto` (padrão sim) grava o manifesto alterado de volta.
 */
export async function adulterar(
  arquivo: string,
  mutar: (dir: string, manifesto: ManifestoDoBackup) => void | Promise<void>,
  opcoes: { reescreverManifesto?: boolean; preservePaths?: boolean } = {},
): Promise<string> {
  const dir = novoDiretorioDeTeste('converse-adulterar-')
  await extract({ file: arquivo, cwd: dir })
  const manifesto = JSON.parse(readFileSync(path.join(dir, 'manifest.json'), 'utf8')) as ManifestoDoBackup
  await mutar(dir, manifesto)
  if (opcoes.reescreverManifesto !== false) writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifesto, null, 2))
  const destino = path.join(novoDiretorioDeTeste('converse-adulterado-'), 'adulterado.tar.gz')
  await empacotar(dir, destino, { preservePaths: opcoes.preservePaths })
  return destino
}

/** Atualiza no manifesto o tamanho e o SHA-256 de uma parte depois de alterá-la no disco. */
export function refazerParte(dir: string, manifesto: ManifestoDoBackup, caminho: string): void {
  const parte = manifesto.partes.find((p) => p.caminho === caminho)!
  parte.bytes = readFileSync(path.join(dir, caminho)).length
  parte.sha256 = sha256(path.join(dir, caminho))
}

/** Troca um byte do meio de um arquivo (mesmo tamanho), sem tocar no manifesto: o SHA-256 deixa de conferir. */
export function alterarUmByte(arquivo: string): void {
  const bytes = readFileSync(arquivo)
  const i = Math.floor(bytes.length / 2)
  bytes[i] = bytes[i]! ^ 0xff
  writeFileSync(arquivo, bytes)
}

/** Um backup válido cujo banco tem uma migration a mais (esquema mais novo que o do app), com o manifesto refeito. */
export function comMigrationNova(dir: string, manifesto: ManifestoDoBackup, nome = '29991231000000_do_futuro'): void {
  const banco = path.join(dir, 'banco', 'app.db')
  const db = new Database(banco)
  db.prepare(
    "INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES (?, ?, datetime('now'), ?, NULL, NULL, datetime('now'), 1)",
  ).run('id-do-futuro', 'x'.repeat(64), nome)
  db.close()
  manifesto.migracoes = [...manifesto.migracoes, nome]
  refazerParte(dir, manifesto, 'banco/app.db')
}

/** Um backup válido cujo banco perdeu a última migration (esquema mais antigo), com o manifesto refeito. */
export function semUltimaMigration(dir: string, manifesto: ManifestoDoBackup): string {
  const banco = path.join(dir, 'banco', 'app.db')
  const ultima = manifesto.migracoes.at(-1)!
  const db = new Database(banco)
  db.prepare('DELETE FROM _prisma_migrations WHERE migration_name = ?').run(ultima)
  db.close()
  manifesto.migracoes = manifesto.migracoes.slice(0, -1)
  refazerParte(dir, manifesto, 'banco/app.db')
  return ultima
}

/** Corta o arquivo ao meio (backup truncado). */
export function truncarAoMeio(arquivo: string): string {
  const destino = path.join(novoDiretorioDeTeste('converse-truncado-'), 'truncado.tar.gz')
  writeFileSync(destino, readFileSync(arquivo))
  truncateSync(destino, Math.floor(readFileSync(arquivo).length / 2))
  return destino
}

export { appendFileSync, mkdirSync, symlinkSync, writeFileSync }
