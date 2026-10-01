// O backup (FT-11, PR-20, PR-96): UM arquivo `backup-AAAAMMDD-HHMMSS.tar.gz` com
//   manifest.json   formato, data, versão do app, migrations, contagem por tabela e SHA-256 de cada parte
//   banco/app.db    o SQLite copiado pela API de backup online do better-sqlite3 (páginas, então o
//                   `rowid` de `trechos` e o índice FTS5 ficam como estavam; nunca o arquivo cru em uso)
//   storage/...     os arquivos enviados, sem temporários (`audio/`, `segmentos/` e `*.parcial`)
// gravado em `BACKUP_DIR` com permissão 0600. Não leva a `ENCRYPTION_KEY` (PR-97): as chaves cifradas
// do banco só decifram com a mesma chave, que o operador guarda à parte. Sem shell: o empacotamento é
// o pacote `tar` em processo. Infraestrutura pura: não usa o Prisma, para o comando e o teste
// rodarem sem o servidor.
import Database from 'better-sqlite3'
import { createHash } from 'node:crypto'
import { createReadStream, createWriteStream } from 'node:fs'
import { chmod, lstat, mkdir, mkdtemp, readdir, rename, rm, stat, symlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { create } from 'tar'
import { ErroDeAplicacao } from './erros'
import { camposDoErro, log } from './log'

export interface ParteDoBackup {
  /** Caminho dentro do arquivo, com `/`: `banco/app.db` ou `storage/<caminho do arquivo>`. */
  caminho: string
  bytes: number
  sha256: string
}

export interface ManifestoDoBackup {
  formato: 1
  criadoEm: string
  versaoDoApp: string
  /** As migrations aplicadas no banco copiado, em ordem. */
  migracoes: string[]
  /** Linhas por tabela do banco copiado (sem a tabela virtual do FTS5 nem o histórico de migrations). */
  contagens: Record<string, number>
  partes: ParteDoBackup[]
  aviso: string
}

export interface OpcoesDoBackup {
  bancoArquivo: string
  storageDir: string
  backupDir: string
  versaoDoApp: string
  /** Quantos backups do padrão de nome ficam em `backupDir`. Padrão 7. */
  manter?: number
  agora?: () => Date
}

export interface ResultadoDoBackup {
  nome: string
  caminho: string
  bytes: number
  manifesto: ManifestoDoBackup
}

/** O nome de um backup. Só o que casa com isto entra na lista, no download e na retenção. */
export const PADRAO_DO_NOME_DE_BACKUP = /^backup-(\d{8})-(\d{6})(?:-(\d+))?\.tar\.gz$/

export const AVISO_DA_CHAVE =
  'Este backup contém dado pessoal e as chaves cifradas (OpenRouter e Telegram), mas NÃO contém a ENCRYPTION_KEY. ' +
  'Sem a mesma ENCRYPTION_KEY as chaves cifradas não decifram: guarde-a em local separado do backup.'

const TEMPORARIOS = new Set(['audio', 'segmentos'])

const falha = (mensagem: string) => new ErroDeAplicacao(mensagem, 500, 'backup_falhou')

/** `true` para o que o backup deixa de fora: pastas `audio/` e `segmentos/` e arquivos `*.parcial`. */
export function ehTemporario(caminhoRelativo: string): boolean {
  const partes = caminhoRelativo.split('/')
  return partes.some((p) => TEMPORARIOS.has(p)) || partes.at(-1)!.endsWith('.parcial')
}

function carimbo(d: Date): string {
  const p = (n: number, t = 2) => String(n).padStart(t, '0')
  return (
    `${p(d.getUTCFullYear(), 4)}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-` +
    `${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`
  )
}

async function sha256DoArquivo(arquivo: string): Promise<string> {
  const hash = createHash('sha256')
  await pipeline(createReadStream(arquivo), hash)
  return hash.digest('hex')
}

async function existe(caminho: string): Promise<boolean> {
  try {
    await lstat(caminho)
    return true
  } catch {
    return false
  }
}

/** Todos os arquivos regulares sob `raiz` que o backup leva, em ordem estável. Link simbólico não entra. */
async function listarArquivosDoStorage(raiz: string): Promise<string[]> {
  const achados: string[] = []
  async function visitar(dir: string, relativo: string): Promise<void> {
    for (const entrada of await readdir(dir, { withFileTypes: true })) {
      const rel = relativo ? `${relativo}/${entrada.name}` : entrada.name
      if (entrada.isDirectory()) {
        if (!TEMPORARIOS.has(entrada.name)) await visitar(path.join(dir, entrada.name), rel)
      } else if (entrada.isFile() && !ehTemporario(rel)) {
        achados.push(rel)
      }
    }
  }
  await visitar(raiz, '')
  return achados.sort()
}

interface LeituraDaCopia {
  migracoes: string[]
  contagens: Record<string, number>
}

/** Confere a integridade da cópia e lê dela as migrations e a contagem por tabela. */
function lerDaCopia(copia: string): LeituraDaCopia {
  const db = new Database(copia, { readonly: true, fileMustExist: true })
  try {
    const integridade = db.pragma('integrity_check') as Array<{ integrity_check: string }>
    if (integridade.length !== 1 || integridade[0]!.integrity_check !== 'ok') throw falha('A cópia do banco não passou na conferência de integridade.')
    let migracoes: string[] = []
    try {
      migracoes = (
        db.prepare('SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL ORDER BY migration_name').all() as Array<{ migration_name: string }>
      ).map((l) => l.migration_name)
    } catch {
      migracoes = []
    }
    const tabelas = (db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all() as Array<{ name: string }>)
      .map((t) => t.name)
      .filter((n) => !n.startsWith('sqlite_') && !n.startsWith('trechos_fts') && n !== '_prisma_migrations')
    const contagens: Record<string, number> = {}
    for (const nome of tabelas) {
      contagens[nome] = (db.prepare(`SELECT COUNT(*) AS n FROM "${nome.replace(/"/g, '""')}"`).get() as { n: number }).n
    }
    return { migracoes, contagens }
  } finally {
    db.close()
  }
}

async function nomeLivre(backupDir: string, agora: Date): Promise<string> {
  const base = `backup-${carimbo(agora)}`
  for (let n = 0; n < 1000; n += 1) {
    const nome = n === 0 ? `${base}.tar.gz` : `${base}-${n}.tar.gz`
    if (!(await existe(path.join(backupDir, nome)))) return nome
  }
  throw falha('Não foi possível escolher um nome para o backup.')
}

/**
 * Gera o backup e devolve o nome, o caminho, o tamanho e o manifesto. Em qualquer falha não deixa
 * arquivo parcial nem diretório de trabalho em `backupDir`. A retenção só remove arquivos do
 * padrão de nome (nunca a pasta `pre-restauracao-*` nem arquivo de outro nome).
 */
export async function gerarBackup(opcoes: OpcoesDoBackup): Promise<ResultadoDoBackup> {
  const { bancoArquivo, storageDir, backupDir, versaoDoApp } = opcoes
  const agora = (opcoes.agora ?? (() => new Date()))()
  await mkdir(backupDir, { recursive: true, mode: 0o700 })
  const trabalho = await mkdtemp(path.join(backupDir, '.trabalho-'))
  let parcial: string | null = null
  try {
    // 1. O banco, pela API de backup online: consistente mesmo com o servidor escrevendo.
    if (!(await existe(bancoArquivo))) throw falha('O arquivo do banco de dados não foi encontrado.')
    await mkdir(path.join(trabalho, 'banco'))
    const copia = path.join(trabalho, 'banco', 'app.db')
    const origem = new Database(bancoArquivo, { readonly: true, fileMustExist: true })
    try {
      await origem.backup(copia)
    } finally {
      origem.close()
    }
    const { migracoes, contagens } = lerDaCopia(copia)

    // 2. As partes e o manifesto: SHA-256 do banco e de cada arquivo do storage.
    const partes: ParteDoBackup[] = [{ caminho: 'banco/app.db', bytes: (await stat(copia)).size, sha256: await sha256DoArquivo(copia) }]
    const temStorage = await stat(storageDir).then((s) => s.isDirectory(), () => false)
    if (temStorage) {
      for (const rel of await listarArquivosDoStorage(storageDir)) {
        const completo = path.join(storageDir, rel)
        partes.push({ caminho: `storage/${rel}`, bytes: (await stat(completo)).size, sha256: await sha256DoArquivo(completo) })
      }
    }
    const manifesto: ManifestoDoBackup = {
      formato: 1,
      criadoEm: agora.toISOString(),
      versaoDoApp,
      migracoes,
      contagens,
      partes,
      aviso: AVISO_DA_CHAVE,
    }
    await writeFile(path.join(trabalho, 'manifest.json'), `${JSON.stringify(manifesto, null, 2)}\n`)

    // 3. O arquivo único. O tar tem uma raiz só, então o diretório de trabalho espelha o storage com um link
    //    simbólico por arquivo LISTADO (o `follow` do tar só segue esses). Um arquivo que apareceu depois,
    //    um temporário ou um link plantado no storage não está no espelho, logo não entra.
    const criadas = new Set<string>()
    for (const parte of partes.slice(1)) {
      const noEspelho = path.join(trabalho, ...parte.caminho.split('/'))
      const pasta = path.dirname(noEspelho)
      if (!criadas.has(pasta)) {
        await mkdir(pasta, { recursive: true })
        criadas.add(pasta)
      }
      await symlink(path.join(storageDir, ...parte.caminho.slice('storage/'.length).split('/')), noEspelho)
    }
    const nome = await nomeLivre(backupDir, agora)
    const destino = path.join(backupDir, nome)
    parcial = `${destino}.parcial`
    const empacotar = create({ gzip: true, cwd: trabalho, follow: true, portable: true }, [
      'manifest.json',
      'banco',
      ...(partes.length > 1 ? ['storage'] : []),
    ])
    await pipeline(empacotar, createWriteStream(parcial, { mode: 0o600 }))
    await chmod(parcial, 0o600)
    await rename(parcial, destino)
    parcial = null

    const bytes = (await stat(destino)).size
    await aplicarRetencao(backupDir, opcoes.manter ?? 7, nome)
    return { nome, caminho: destino, bytes, manifesto }
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao) throw erro
    log.erro('backup_falhou', camposDoErro(erro))
    throw falha('Não foi possível gerar o backup.')
  } finally {
    if (parcial) await rm(parcial, { force: true }).catch(() => undefined)
    await rm(trabalho, { recursive: true, force: true }).catch(() => undefined)
  }
}

interface BackupDoPadrao {
  nome: string
  chave: string
}

/** Os arquivos do padrão de nome em `backupDir`, do mais novo ao mais antigo. Nada além do padrão entra. */
export async function listarNomesDeBackup(backupDir: string): Promise<string[]> {
  let entradas
  try {
    entradas = await readdir(backupDir, { withFileTypes: true })
  } catch {
    return []
  }
  const achados: BackupDoPadrao[] = []
  for (const e of entradas) {
    const m = PADRAO_DO_NOME_DE_BACKUP.exec(e.name)
    if (!m || !e.isFile()) continue
    achados.push({ nome: e.name, chave: `${m[1]}${m[2]}${String(m[3] ?? 0).padStart(6, '0')}` })
  }
  return achados.sort((a, b) => (a.chave < b.chave ? 1 : a.chave > b.chave ? -1 : 0)).map((a) => a.nome)
}

/** Remove os backups do padrão além dos `manter` mais novos. O arquivo recém-criado nunca é removido. */
async function aplicarRetencao(backupDir: string, manter: number, recemCriado: string): Promise<void> {
  const limite = Math.max(1, Math.floor(manter))
  const nomes = await listarNomesDeBackup(backupDir)
  for (const nome of nomes.slice(limite)) {
    if (nome === recemCriado) continue
    await rm(path.join(backupDir, nome), { force: true })
  }
}
