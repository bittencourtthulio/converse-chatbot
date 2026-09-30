// POST /api/agentes/[id]/fontes/[fonteId]/reprocessar: devolve a fonte em erro à
// fila (PR-48, PR-49).
import { reprocessar } from '@/servicos/fontes'
import { erroEmJson, exigirSessao, semCache } from '../../resposta'

export const dynamic = 'force-dynamic'

export async function POST(_request: Request, contexto: { params: Promise<{ id: string; fonteId: string }> }) {
  try {
    const usuario = await exigirSessao()
    const { id, fonteId } = await contexto.params
    const fonte = await reprocessar(usuario, id, fonteId)
    return Response.json({ fonte }, { status: 202, headers: semCache })
  } catch (erro) {
    return erroEmJson(erro)
  }
}
