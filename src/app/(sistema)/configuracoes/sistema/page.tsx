import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { gerarBackupDaTela } from '@/app/acoes'
import { CabecalhoDaPagina } from '@/componentes/CabecalhoDaPagina'
import { PainelDoSistema } from '@/componentes/PainelDoSistema'
import { listarBackups } from '@/servicos/backup'
import { obterSistema } from '@/servicos/sistema'

/**
 * Configurações > Sistema (FT-11, PR-95, PR-96): o estado de saúde, o detalhe da instalação e os
 * backups (gerar, listar, baixar), só para o admin. A guarda está no layout da pasta e é repetida
 * aqui. Carregando é o `loading.tsx` da pasta e erro inesperado é o `error.tsx` do sistema, com o
 * código de referência.
 */
export default async function Sistema() {
  const admin = await exigirUsuarioAdmin()
  const [sistema, backups] = await Promise.all([obterSistema(admin), listarBackups(admin)])

  return (
    <div className="pilha">
      <CabecalhoDaPagina titulo="Sistema" subtitulo="O estado de saúde, a versão, o que está configurado e os backups desta instalação." />
      <PainelDoSistema sistema={sistema} backups={backups} acaoGerarBackup={gerarBackupDaTela} />
    </div>
  )
}
