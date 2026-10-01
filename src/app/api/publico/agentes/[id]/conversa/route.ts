// GET /api/publico/agentes/[id]/conversa: a conversa do visitante para retomar
// ao reabrir o chat (PR-56). Sem sessão; o visitante vem no cabeçalho
// `X-Visitante-Id` (nunca na URL, que vai para log de acesso). Devolve só as
// últimas 50 mensagens da conversa mais recente dele, com o mesmo limite de uso por
// IP e agente do POST e do DELETE (FT-12, PR-56).
//
// DELETE (FT-10, PR-90): o visitante apaga a própria conversa com este agente. Mesmo cabeçalho
// do visitante, `Origin` da plataforma como no POST, agente ativo e limite de uso.
import { ipDoCliente } from '@/lib/requisicao'
import { apagarConversasDoVisitante, retomarConversaDoVisitante } from '@/servicos/chat-publico'
import { erroPublico, origemEDaPlataforma, semCache } from '../../../resposta'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, contexto: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await contexto.params
    const resultado = await retomarConversaDoVisitante(id, request.headers.get('x-visitante-id'), {
      ip: await ipDoCliente(),
    })
    return Response.json(resultado, { headers: semCache })
  } catch (erro) {
    return erroPublico(erro)
  }
}

export async function DELETE(request: Request, contexto: { params: Promise<{ id: string }> }) {
  try {
    const origem = request.headers.get('origin')
    if (origem !== null && !origemEDaPlataforma(origem, request)) {
      return Response.json(
        { codigo: 'origem_nao_permitida', mensagem: 'Esta origem não pode usar o chat.' },
        { status: 403, headers: semCache },
      )
    }
    const { id } = await contexto.params
    const { conversas } = await apagarConversasDoVisitante({
      agenteId: id,
      visitanteId: request.headers.get('x-visitante-id'),
      ip: await ipDoCliente(),
    })
    return Response.json({ apagadas: conversas }, { headers: semCache })
  } catch (erro) {
    return erroPublico(erro)
  }
}
