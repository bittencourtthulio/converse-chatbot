// GET /api/saude: o healthcheck do contêiner e do balanceador (FT-11, PR-21, PR-95). Público, sem
// sessão e mínimo de propósito: só o status, sem versão, caminho nem detalhe de configuração (o
// detalhe é a tela Configurações > Sistema, para o admin). 200 para `ok` e `degradado`, 503 para
// `falha`; nunca em cache.
import { verificarSaude, type SituacaoDeSaude } from '@/servicos/saude'

export const dynamic = 'force-dynamic'

export async function GET() {
  let status: SituacaoDeSaude = 'falha'
  try {
    status = (await verificarSaude()).status
  } catch {
    // verificarSaude não lança; se algo escapar, o sistema não está saudável.
  }
  return Response.json({ status }, { status: status === 'falha' ? 503 : 200, headers: { 'Cache-Control': 'no-store' } })
}
