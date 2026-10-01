// GET /api/conversas/[id]/exportar: a conversa em texto simples, como anexo (PR-83).
// Handler fino: sessão no servidor e a tradução de `exportarConversaTexto`. O nome do
// arquivo é o id interno da conversa (nunca o rótulo, o nome ou o identificador externo).
import { exportarConversaTexto } from '@/servicos/historico'
import { erroEmJson, exigirSessao } from '../../resposta'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, contexto: { params: Promise<{ id: string }> }) {
  try {
    await exigirSessao()
    const { id } = await contexto.params
    const { nomeDoArquivo, texto } = await exportarConversaTexto(id)
    return new Response(texto, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${nomeDoArquivo.replace(/[^A-Za-z0-9._-]/g, '_')}"`,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (erro) {
    return erroEmJson(erro)
  }
}
