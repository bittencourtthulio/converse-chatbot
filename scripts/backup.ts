// npm run backup (FT-11, PR-20, PR-96): gera UM arquivo `backup-AAAAMMDD-HHMMSS.tar.gz` com o banco (cópia
// consistente) e os arquivos do storage, em BACKUP_DIR, com permissão 0600. Roda fora do servidor, com o
// mesmo serviço da tela Sistema (origem "linha de comando", ator Sistema na auditoria), e serve ao cron:
//   0 3 * * *  cd /caminho/da/instalacao && npm run backup
// Variáveis: DATABASE_URL, STORAGE_DIR, BACKUP_DIR (padrão ./backups) e BACKUP_MANTER (padrão 7).
// Saída de comando de linha de comando: é o único tipo de arquivo, além do seed, onde `console` é permitido.
import 'dotenv/config'
import path from 'node:path'
import { ambiente } from '../src/lib/ambiente'
import { ErroDeAplicacao } from '../src/lib/erros'
import { camposDoErro, log } from '../src/lib/log'

function formatarBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const unidades = ['KB', 'MB', 'GB']
  let valor = bytes / 1024
  let i = 0
  while (valor >= 1024 && i < unidades.length - 1) {
    valor /= 1024
    i += 1
  }
  return `${valor.toFixed(1).replace('.', ',')} ${unidades[i]}`
}

async function principal(): Promise<number> {
  // Importados aqui, depois de o ambiente estar completo: o Prisma lê DATABASE_URL ao ser carregado.
  const { gerarBackupAgora } = await import('../src/servicos/backup')
  const { prisma } = await import('../src/lib/prisma')
  try {
    const r = await gerarBackupAgora('sistema', 'linha de comando')
    console.log(`Backup gerado: ${path.join(ambiente.backupDir, r.nome)}`)
    console.log(`Tamanho: ${formatarBytes(r.bytes)} (banco e ${r.arquivos} ${r.arquivos === 1 ? 'arquivo' : 'arquivos'} do storage)`)
    console.log('')
    console.log('ATENÇÃO: o backup contém dado pessoal e as chaves cifradas, mas NÃO contém a ENCRYPTION_KEY.')
    console.log('Guarde a ENCRYPTION_KEY em local separado: sem ela as chaves do OpenRouter e do Telegram não decifram.')
    return 0
  } finally {
    await prisma.$disconnect().catch(() => undefined)
  }
}

principal().then(
  (codigo) => process.exit(codigo),
  (erro: unknown) => {
    if (erro instanceof ErroDeAplicacao) console.error(erro.message)
    else if (erro instanceof Error && erro.message.startsWith('Variável')) console.error(erro.message)
    else {
      log.erro('backup_comando_falhou', camposDoErro(erro))
      console.error('Não foi possível gerar o backup.')
    }
    process.exit(1)
  },
)
