// GET /api/publico/agentes/[id]/conversa: a conversa do visitante para retomar
// ao reabrir o chat (PR-56). Sem sessão; o visitante vem no cabeçalho
// `X-Visitante-Id` (nunca na URL, que vai para log de acesso). Devolve só as
// últimas 50 mensagens da conversa mais recente dele.
import { retomarConversaDoVisitante } from '@/servicos/chat-publico'
import { erroPublico, semCache } from '../../../resposta'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, contexto: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await contexto.params
    const resultado = await retomarConversaDoVisitante(id, request.headers.get('x-visitante-id'))
    return Response.json(resultado, { headers: semCache })
  } catch (erro) {
    return erroPublico(erro)
  }
}
