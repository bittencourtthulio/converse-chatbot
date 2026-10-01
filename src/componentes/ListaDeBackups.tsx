import { formatarBytes, formatarDataHora } from '@/componentes/sistema-logica'

export interface BackupDaLista {
  nome: string
  criadoEm: Date | string
  bytes: number
}

/**
 * Os backups existentes em BACKUP_DIR, do mais novo ao mais antigo, com o download de cada um
 * (FT-11, PR-96). Só leitura: o nome vem do padrão `backup-AAAAMMDD-HHMMSS.tar.gz`, sem dado pessoal, e
 * passa pelo React, que o escapa. O servidor confere o papel de admin e o nome de novo no download.
 */
export function ListaDeBackups({ backups }: { backups: BackupDaLista[] }) {
  if (backups.length === 0) return <p className="texto-de-apoio">Nenhum backup ainda.</p>
  return (
    <ul className="sistema-backup-lista" aria-label="Backups existentes">
      {backups.map((b) => (
        <li key={b.nome}>
          <div className="sistema-backup-dados">
            <code className="sistema-backup-nome">{b.nome}</code>
            <span className="texto-de-apoio">
              {formatarDataHora(new Date(b.criadoEm), '')} · {formatarBytes(b.bytes)}
            </span>
          </div>
          <a className="botao secundario" href={`/api/backups/${encodeURIComponent(b.nome)}`} download aria-label={`Baixar ${b.nome}`}>
            Baixar
          </a>
        </li>
      ))}
    </ul>
  )
}
