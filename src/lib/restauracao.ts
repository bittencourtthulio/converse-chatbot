// A restauração (FT-11, PR-20, PR-98), parte de infraestrutura: validar o arquivo de backup ANTES de tocar
// em qualquer coisa e trocar o banco e o `storage/` por renomeação. Sem Prisma e sem servidor: o comando
// `scripts/restore.ts` e o teste usam estas funções sobre diretórios que eles escolhem.
//
// Validar = extrair para um diretório temporário (no mesmo volume do destino, para a troca ser uma
// renomeação), recusando caminho absoluto, `..`, link e qualquer tipo que não seja arquivo ou pasta;
// conferir o `manifest.json`, o tamanho e o SHA-256 de cada parte, que não há arquivo fora do manifesto
// e que o banco extraído passa na conferência de integridade e traz as migrations que o manifesto diz.
import Database from 'better-sqlite3'
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, stat, chmod, copyFile } from 'node:fs/promises'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { extract } from 'tar'
import { z } from 'zod'
import { ErroDeAplicacao } from './erros'
import { camposDoErro, log } from './log'
import type { ManifestoDoBackup } from './backup'

const invalido = (mensagem: string) => new ErroDeAplicacao(mensagem, 422, 'backup_invalido')
const falhaNaTroca = (mensagem: string) => new ErroDeAplicacao(mensagem, 500, 'restauracao_falhou')

const esquemaDoManifesto = z.object({
  formato: z.literal(1),
  criadoEm: z.string().min(1).max(40),
  versaoDoApp: z.string().min(1).max(50),
  migracoes: z.array(z.string().max(200)).max(1000),
  contagens: z.record(z.string(), z.number().int().nonnegative()),
  partes: z
    .array(
      z.object({
        caminho: z.string().min(1).max(1000),
        bytes: z.number().int().nonnegative(),
        sha256: z.string().regex(/^[0-9a-f]{64}$/),
      }),
    )
    .min(1),
  aviso: z.string().max(2000).optional(),
})

export interface BackupValidado {
  manifesto: ManifestoDoBackup
  /** O diretório temporário com `manifest.json`, `banco/app.db` e `storage/`. */
  diretorio: string
  /** As migrations do banco extraído (a verdade; o manifesto confere com elas). */
  migracoes: string[]
}

const TOPOS_PERMITIDOS = new Set(['manifest.json', 'banco', 'storage'])

/** O caminho de uma entrada do arquivo é seguro? Relativo, sem `..`, sem barra invertida, só os três topos. */
function caminhoSeguro(bruto: string): boolean {
  const caminho = bruto.replace(/^\.\//, '')
  if (caminho === '' || caminho.startsWith('/') || /^[A-Za-z]:/.test(caminho) || caminho.includes('\\') || caminho.includes('\0')) return false
  const partes = caminho.replace(/\/$/, '').split('/')
  if (partes.some((p) => p === '' || p === '..' || p === '.')) return false
  return TOPOS_PERMITIDOS.has(partes[0]!)
}

async function sha256DoArquivo(arquivo: string): Promise<string> {
  const hash = createHash('sha256')
  await pipeline(createReadStream(arquivo), hash)
  return hash.digest('hex')
}

async function listarArquivos(raiz: string): Promise<string[]> {
  const achados: string[] = []
  async function visitar(dir: string, relativo: string): Promise<void> {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const rel = relativo ? `${relativo}/${e.name}` : e.name
      if (e.isDirectory()) await visitar(path.join(dir, e.name), rel)
      else achados.push(rel)
    }
  }
  await visitar(raiz, '')
  return achados
}

/** Apaga o diretório temporário de um backup validado (ou de uma recusa). */
export async function descartarBackupValidado(v: Pick<BackupValidado, 'diretorio'>): Promise<void> {
  // Com tentativas: numa extração interrompida (arquivo truncado) uma escrita pendente ainda pode terminar.
  await rm(v.diretorio, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
}

/**
 * Lê e valida o arquivo de backup. Em qualquer recusa nada fica em `diretorioDeTrabalho` e nada é
 * escrito fora dele. O chamador descarta o diretório com `descartarBackupValidado` quando terminar.
 */
export async function lerEValidarBackup(arquivo: string, opcoes: { diretorioDeTrabalho: string }): Promise<BackupValidado> {
  let info
  try {
    info = await stat(arquivo)
  } catch {
    throw invalido('O arquivo de backup não foi encontrado.')
  }
  if (!info.isFile()) throw invalido('O caminho informado não é um arquivo de backup.')
  if (info.size === 0) throw invalido('O arquivo de backup está vazio.')

  await mkdir(opcoes.diretorioDeTrabalho, { recursive: true })
  const diretorio = await mkdtemp(path.join(opcoes.diretorioDeTrabalho, '.restauracao-'))
  try {
    let violacao: string | null = null
    try {
      await extract({
        file: arquivo,
        cwd: diretorio,
        strict: true,
        filter: (caminho, entrada) => {
          const tipo = (entrada as { type?: string }).type
          if (!caminhoSeguro(caminho)) {
            violacao ??= 'O arquivo de backup tem um caminho inválido (absoluto, com .. ou fora do formato do backup).'
            return false
          }
          if (tipo !== 'File' && tipo !== 'Directory') {
            violacao ??= 'O arquivo de backup tem um item que não é arquivo nem pasta (link ou outro tipo).'
            return false
          }
          return true
        },
      })
    } catch {
      throw invalido('O arquivo não é um backup válido: está truncado ou corrompido.')
    }
    if (violacao) throw invalido(violacao)

    // O manifesto.
    let bruto: string
    try {
      bruto = await readFile(path.join(diretorio, 'manifest.json'), 'utf8')
    } catch {
      throw invalido('O backup não tem o manifest.json.')
    }
    let json: unknown
    try {
      json = JSON.parse(bruto)
    } catch {
      throw invalido('O manifest.json do backup é inválido.')
    }
    const lido = esquemaDoManifesto.safeParse(json)
    if (!lido.success) throw invalido('O manifest.json do backup é inválido ou de outro formato.')
    const manifesto = lido.data as ManifestoDoBackup

    // As partes: caminho, tipo, tamanho e SHA-256.
    const listadas = new Set<string>(['manifest.json'])
    for (const parte of manifesto.partes) {
      if (!caminhoSeguro(parte.caminho) || !(parte.caminho.startsWith('banco/') || parte.caminho.startsWith('storage/'))) {
        throw invalido('O manifest.json lista um caminho inválido.')
      }
      listadas.add(parte.caminho)
      const completo = path.join(diretorio, ...parte.caminho.split('/'))
      let st
      try {
        st = await lstat(completo)
      } catch {
        throw invalido(`Parte ausente do arquivo de backup: ${parte.caminho} não confere com o manifest.`)
      }
      if (!st.isFile() || st.size !== parte.bytes || (await sha256DoArquivo(completo)) !== parte.sha256) {
        throw invalido(`O arquivo de backup foi alterado ou está corrompido: ${parte.caminho} não confere com o manifest.`)
      }
    }
    if (!listadas.has('banco/app.db')) throw invalido('O backup não traz o banco de dados (banco/app.db).')

    // Nenhum arquivo fora do manifesto.
    for (const rel of await listarArquivos(diretorio)) {
      if (!listadas.has(rel)) throw invalido('O arquivo de backup tem uma parte fora do manifest, não listada: foi alterado.')
    }

    // O banco: integridade e migrations, que precisam bater com o manifesto.
    let migracoes: string[]
    try {
      const db = new Database(path.join(diretorio, 'banco', 'app.db'), { readonly: true, fileMustExist: true })
      try {
        const integridade = db.pragma('integrity_check') as Array<{ integrity_check: string }>
        if (integridade.length !== 1 || integridade[0]!.integrity_check !== 'ok') throw new Error('integridade')
        try {
          migracoes = (
            db.prepare('SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL ORDER BY migration_name').all() as Array<{ migration_name: string }>
          ).map((l) => l.migration_name)
        } catch {
          migracoes = []
        }
      } finally {
        db.close()
      }
    } catch {
      throw invalido('O banco de dados do backup não passou na conferência de integridade.')
    }
    if (JSON.stringify(migracoes) !== JSON.stringify(manifesto.migracoes)) {
      throw invalido('As migrations do manifest não conferem com as do banco do backup (esquema inconsistente).')
    }
    return { manifesto, diretorio, migracoes }
  } catch (erro) {
    await descartarBackupValidado({ diretorio })
    if (erro instanceof ErroDeAplicacao) throw erro
    log.erro('backup_nao_validado', camposDoErro(erro))
    throw invalido('Não foi possível validar o arquivo de backup.')
  }
}

export type SituacaoDoEsquema = 'igual' | 'mais_antigo' | 'mais_novo' | 'divergente'

/**
 * Compara as migrations do backup com as do app. `mais_antigo`: o backup é um prefixo das do app (as
 * que faltam são aplicadas por `prisma migrate deploy`). `mais_novo`: o backup tem migration que o app
 * não conhece (o app mais antigo não lê um banco mais novo). `divergente`: todas conhecidas, mas fora
 * de ordem ou com buraco. Só `igual` e `mais_antigo` são restaurados.
 */
export function compararEsquema(doBackup: string[], doApp: string[]): SituacaoDoEsquema {
  if (JSON.stringify(doBackup) === JSON.stringify(doApp)) return 'igual'
  const conhecidas = new Set(doApp)
  if (doBackup.some((m) => !conhecidas.has(m))) return 'mais_novo'
  const prefixo = doBackup.length < doApp.length && doBackup.every((m, i) => doApp[i] === m)
  return prefixo ? 'mais_antigo' : 'divergente'
}

// ---- a troca ----------------------------------------------------------------------------------

export interface OpcoesDaTroca {
  validado: BackupValidado
  bancoArquivo: string
  storageDir: string
  backupDir: string
  agora?: () => Date
  /** Só para teste: roda depois de o `storage/` ser trocado e antes do banco, para provar o desfazer. */
  aposTrocarOStorage?: () => void | Promise<void>
}

export interface ResultadoDaTroca {
  /** A pasta com a cópia do estado de antes (`BACKUP_DIR/pre-restauracao-...`), ou `null` se não havia nada a guardar. */
  preRestauracao: string | null
}

function carimbo(d: Date): string {
  const p = (n: number, t = 2) => String(n).padStart(t, '0')
  return `${p(d.getUTCFullYear(), 4)}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`
}

async function existe(caminho: string): Promise<boolean> {
  try {
    await lstat(caminho)
    return true
  } catch {
    return false
  }
}

/** Move uma árvore: renomeação no mesmo volume; entre volumes (EXDEV) copia e remove a origem. */
async function moverArvore(origem: string, destino: string): Promise<void> {
  try {
    await rename(origem, destino)
  } catch (erro) {
    if ((erro as NodeJS.ErrnoException).code !== 'EXDEV') throw erro
    await cp(origem, destino, { recursive: true, errorOnExist: true, force: false })
    await rm(origem, { recursive: true, force: true })
  }
}

async function ajustarPermissoes(raiz: string): Promise<void> {
  for (const e of await readdir(raiz, { withFileTypes: true })) {
    const completo = path.join(raiz, e.name)
    if (e.isDirectory()) {
      await chmod(completo, 0o700)
      await ajustarPermissoes(completo)
    } else if (e.isFile()) await chmod(completo, 0o600)
  }
}

/** Cópia consistente do banco atual; se ele estiver corrompido a ponto de a API falhar, copia o arquivo como está. */
async function guardarBanco(bancoArquivo: string, destino: string): Promise<void> {
  try {
    const db = new Database(bancoArquivo, { readonly: true, fileMustExist: true })
    try {
      await db.backup(destino)
    } finally {
      db.close()
    }
  } catch {
    await copyFile(bancoArquivo, destino)
  }
}

/**
 * Troca o banco e o `storage/` pelos do backup validado, o mais atomicamente possível: guarda o estado
 * de antes em `backupDir/pre-restauracao-<data>` (cópia consistente do banco e o `storage/` anterior movido),
 * move o `storage/` novo para o lugar e por último substitui o banco por renomeação, tirando os arquivos
 * `-wal`, `-shm` e `-journal` do antigo. Se algo falhar no meio, devolve o `storage/` anterior ao lugar e
 * não toca no banco. Não aplica migrations nem mexe no índice FTS5: isso é do comando.
 */
export async function restaurarArquivos(o: OpcoesDaTroca): Promise<ResultadoDaTroca> {
  const { validado, bancoArquivo, storageDir, backupDir } = o
  const agora = (o.agora ?? (() => new Date()))()
  const haBanco = await existe(bancoArquivo)
  const haStorage = await existe(storageDir)
  let pre: string | null = null
  let storageGuardado: string | null = null
  try {
    if (haBanco || haStorage) {
      pre = path.join(backupDir, `pre-restauracao-${carimbo(agora)}`)
      await mkdir(pre, { recursive: true, mode: 0o700 })
      if (haBanco) await guardarBanco(bancoArquivo, path.join(pre, 'app.db'))
    }

    // O `storage/` novo (ou vazio, se o backup não trazia nenhum arquivo).
    const novoStorage = path.join(validado.diretorio, 'storage')
    const traz = await existe(novoStorage)
    await mkdir(path.dirname(storageDir), { recursive: true })
    if (haStorage) {
      storageGuardado = path.join(pre!, 'storage')
      await moverArvore(storageDir, storageGuardado)
    }
    if (traz) await moverArvore(novoStorage, storageDir)
    else await mkdir(storageDir, { recursive: true, mode: 0o700 })
    await ajustarPermissoes(storageDir)
    await o.aposTrocarOStorage?.()

    // O banco, por último: a renomeação substitui o arquivo antigo de uma vez.
    await mkdir(path.dirname(bancoArquivo), { recursive: true })
    for (const sufixo of ['-wal', '-shm', '-journal']) await rm(`${bancoArquivo}${sufixo}`, { force: true })
    const novoBanco = path.join(validado.diretorio, 'banco', 'app.db')
    await chmod(novoBanco, 0o600)
    try {
      await rename(novoBanco, bancoArquivo)
    } catch (erro) {
      if ((erro as NodeJS.ErrnoException).code !== 'EXDEV') throw erro
      await copyFile(novoBanco, `${bancoArquivo}.novo`)
      await rename(`${bancoArquivo}.novo`, bancoArquivo)
      await chmod(bancoArquivo, 0o600)
    }
    return { preRestauracao: pre }
  } catch (erro) {
    // Desfaz o que for possível: o `storage/` anterior volta ao lugar; o banco só é trocado no último passo.
    if (storageGuardado) {
      try {
        await rm(storageDir, { recursive: true, force: true })
        await moverArvore(storageGuardado, storageDir)
      } catch (desfazer) {
        log.erro('restauracao_nao_desfeita', camposDoErro(desfazer))
      }
    }
    if (erro instanceof ErroDeAplicacao) throw erro
    log.erro('restauracao_falhou', camposDoErro(erro))
    throw falhaNaTroca('Não foi possível trocar o banco e os arquivos. O estado anterior foi mantido.')
  }
}
