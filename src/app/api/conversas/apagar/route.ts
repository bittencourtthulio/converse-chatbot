// POST /api/conversas/apagar: apaga várias conversas de uma vez, corpo `{ ids: string[] }`
// (no máximo 50, PR-80). Apaga só as que existem e devolve quantas apagou.
import { entradaInvalida } from '@/lib/erros'
import { apagarConversas } from '@/servicos/historico'
import { erroEmJson, exigirSessao, semCache } from '../resposta'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const usuario = await exigirSessao()
    const corpo: unknown = await request.json().catch(() => null)
    if (typeof corpo !== 'object' || corpo === null || Array.isArray(corpo)) {
      throw entradaInvalida('Envie os identificadores das conversas em JSON.')
    }
    const apagadas = await apagarConversas((corpo as Record<string, unknown>).ids, usuario.id)
    return Response.json({ apagadas }, { headers: semCache })
  } catch (erro) {
    return erroEmJson(erro)
  }
}
