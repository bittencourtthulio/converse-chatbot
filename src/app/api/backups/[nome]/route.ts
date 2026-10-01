// GET /api/backups/[nome]: o download autenticado de um backup (FT-11, PR-96). Só admin. O nome precisa
// ser do padrão exato `backup-AAAAMMDD-HHMMSS[-N].tar.gz` e o arquivo precisa ser regular e estar em
// `BACKUP_DIR` (o serviço confere; nada de `/`, `..` nem caminho absoluto). O nome no `Content-Disposition`
// é o do padrão, sem dado pessoal. O arquivo é entregue por stream: pode ter gigabytes.
import { createReadStream } from 'node:fs'
import { Readable } from 'node:stream'
import { erroEmJson, exigirSessao } from '@/app/api/conversas/resposta'
import { caminhoDoBackup } from '@/servicos/backup'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, contexto: { params: Promise<{ nome: string }> }) {
  try {
    const usuario = await exigirSessao()
    const { nome } = await contexto.params
    const arquivo = await caminhoDoBackup(usuario, nome)
    const corpo = Readable.toWeb(createReadStream(arquivo.caminho)) as unknown as ReadableStream
    return new Response(corpo, {
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': `attachment; filename="${arquivo.nome}"`,
        'Content-Length': String(arquivo.bytes),
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (erro) {
    return erroEmJson(erro)
  }
}
