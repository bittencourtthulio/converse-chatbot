// DELETE /api/agentes/[id]/fontes/[fonteId]: exclui a fonte, os trechos e o
// arquivo em disco (PR-49). A confirmação é da tela.
import { excluir } from '@/servicos/fontes'
import { erroEmJson, exigirSessao } from '../resposta'

export const dynamic = 'force-dynamic'

export async function DELETE(_request: Request, contexto: { params: Promise<{ id: string; fonteId: string }> }) {
  try {
    const usuario = await exigirSessao()
    const { id, fonteId } = await contexto.params
    await excluir(usuario, id, fonteId)
    return new Response(null, { status: 204 })
  } catch (erro) {
    return erroEmJson(erro)
  }
}
