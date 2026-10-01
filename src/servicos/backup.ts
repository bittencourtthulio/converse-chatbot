// O backup como caso de uso (FT-11, PR-20, PR-96): gerar (admin pela tela ou o sistema pelo comando),
// listar e localizar um arquivo para baixar. A parte pesada (copiar o banco, empacotar, reter) é de
// `src/lib/backup.ts`; aqui ficam a permissão, a recusa de dois backups ao mesmo tempo, a auditoria
// `backup_gerado` e a defesa do download: só nomes do padrão, só arquivos regulares dentro de `BACKUP_DIR`.
import { lstat, stat } from 'node:fs/promises'
import path from 'node:path'
import { ambiente } from '@/lib/ambiente'
import { PADRAO_DO_NOME_DE_BACKUP, gerarBackup, listarNomesDeBackup } from '@/lib/backup'
import { conflito, naoEncontrado } from '@/lib/erros'
import { versaoDoApp } from '@/lib/versao'
import { exigirAdmin, type UsuarioAutenticado } from '@/servicos/autenticacao'
import { registrarMelhorEsforco } from '@/servicos/auditoria'

export type OrigemDoBackup = 'tela' | 'linha de comando'

export interface BackupListado {
  nome: string
  /** O instante do nome do arquivo (UTC). */
  criadoEm: Date
  bytes: number
}

export interface BackupGerado extends BackupListado {
  /** Quantos arquivos do `storage/` entraram (sem contar o banco). */
  arquivos: number
}

const CHAVE_DO_ANDAMENTO = Symbol.for('converse.backupEmAndamento')

function emAndamento(): boolean {
  return (globalThis as unknown as Record<symbol, boolean | undefined>)[CHAVE_DO_ANDAMENTO] === true
}
function marcarAndamento(valor: boolean): void {
  ;(globalThis as unknown as Record<symbol, boolean>)[CHAVE_DO_ANDAMENTO] = valor
}

/** O instante gravado no nome `backup-AAAAMMDD-HHMMSS[-N].tar.gz`, em UTC. */
export function dataDoNomeDoBackup(nome: string): Date {
  const m = PADRAO_DO_NOME_DE_BACKUP.exec(nome)
  if (!m) return new Date(0)
  const [, d, h] = m as unknown as [string, string, string]
  return new Date(Date.UTC(+d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6, 8), +h.slice(0, 2), +h.slice(2, 4), +h.slice(4, 6)))
}

/**
 * Gera um backup agora. `autor` é o admin da tela ou `'sistema'` (o comando de linha de comando).
 * Dois ao mesmo tempo no mesmo processo são recusados (409). A auditoria é de melhor esforço: o
 * backup já existe, e a falha em registrá-lo vai para o log.
 */
export async function gerarBackupAgora(autor: UsuarioAutenticado | 'sistema', origem: OrigemDoBackup): Promise<BackupGerado> {
  if (autor !== 'sistema') exigirAdmin(autor)
  if (emAndamento()) throw conflito('Já existe um backup em andamento. Aguarde terminar e tente de novo.')
  marcarAndamento(true)
  try {
    const r = await gerarBackup({
      bancoArquivo: ambiente.bancoArquivo,
      storageDir: ambiente.storageDir,
      backupDir: ambiente.backupDir,
      manter: ambiente.backupManter,
      versaoDoApp: versaoDoApp(),
    })
    const arquivos = r.manifesto.partes.length - 1
    await registrarMelhorEsforco({
      ator: autor,
      acao: 'backup_gerado',
      alvoTipo: 'sistema',
      detalhes: { origem, bytes: r.bytes, arquivos },
    })
    return { nome: r.nome, criadoEm: dataDoNomeDoBackup(r.nome), bytes: r.bytes, arquivos }
  } finally {
    marcarAndamento(false)
  }
}

/** Os backups de `BACKUP_DIR`, do mais novo ao mais antigo. Só admin. */
export async function listarBackups(autor: UsuarioAutenticado): Promise<BackupListado[]> {
  exigirAdmin(autor)
  return listarBackupsDoDisco()
}

/** O mesmo, sem sessão: para a tela Sistema (que já exigiu admin) e para o comando. */
export async function listarBackupsDoDisco(): Promise<BackupListado[]> {
  const dir = ambiente.backupDir
  const lista: BackupListado[] = []
  for (const nome of await listarNomesDeBackup(dir)) {
    try {
      lista.push({ nome, criadoEm: dataDoNomeDoBackup(nome), bytes: (await stat(path.join(dir, nome))).size })
    } catch {
      // O arquivo sumiu entre a listagem e a leitura (retenção em outro processo): não aparece.
    }
  }
  return lista
}

/** O backup mais recente, ou `null`. */
export async function ultimoBackup(): Promise<BackupListado | null> {
  return (await listarBackupsDoDisco())[0] ?? null
}

/**
 * O arquivo para o download. Só admin; o nome precisa ser do padrão exato (nada de `/`, `..`, caminho
 * absoluto nem outro nome), o arquivo precisa ser regular (link simbólico e pasta são 404) e o caminho
 * final fica dentro de `BACKUP_DIR`.
 */
export async function caminhoDoBackup(autor: UsuarioAutenticado, nome: unknown): Promise<{ caminho: string; nome: string; bytes: number }> {
  exigirAdmin(autor)
  const naoAchou = () => naoEncontrado('Backup não encontrado.')
  if (typeof nome !== 'string' || !PADRAO_DO_NOME_DE_BACKUP.test(nome)) throw naoAchou()
  const raiz = ambiente.backupDir
  const caminho = path.resolve(raiz, nome)
  if (path.dirname(caminho) !== raiz) throw naoAchou()
  try {
    const info = await lstat(caminho)
    if (!info.isFile()) throw naoAchou()
    return { caminho, nome, bytes: info.size }
  } catch {
    throw naoAchou()
  }
}
