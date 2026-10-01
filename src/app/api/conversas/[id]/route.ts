// DELETE /api/conversas/[id]: apaga uma conversa e, em cascata, as mensagens (PR-80).
// Handler fino: sessão no servidor e a tradução de `apagarConversa`. Id inexistente é 404.
import { apagarConversa } from '@/servicos/historico'
import { erroEmJson, exigirSessao, semCache } from '../resposta'

export const dynamic = 'force-dynamic'

export async function DELETE(_request: Request, contexto: { params: Promise<{ id: string }> }) {
  try {
    const usuario = await exigirSessao()
    const { id } = await contexto.params
    await apagarConversa(id, usuario.id)
    return Response.json({ apagadas: 1 }, { headers: semCache })
  } catch (erro) {
    return erroEmJson(erro)
  }
}
