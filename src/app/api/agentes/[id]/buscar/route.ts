// POST /api/agentes/[id]/buscar: a busca do cartão "Testar busca" da aba
// Conhecimento (PR-54). Handler fino: sessão no servidor, corpo JSON e a
// tradução de `buscarNaBase`. Não chama o OpenRouter.
import { entradaInvalida } from '@/lib/erros'
import { buscarNaBase } from '@/servicos/recuperacao'
import { erroEmJson, exigirSessao, semCache } from '../fontes/resposta'

export const dynamic = 'force-dynamic'

export async function POST(request: Request, contexto: { params: Promise<{ id: string }> }) {
  try {
    await exigirSessao()
    const { id } = await contexto.params
    const corpo: unknown = await request.json().catch(() => null)
    if (typeof corpo !== 'object' || corpo === null) throw entradaInvalida('Envie a pergunta em JSON.')
    const trechos = await buscarNaBase(id, (corpo as Record<string, unknown>).pergunta)
    return Response.json({ trechos }, { headers: semCache })
  } catch (erro) {
    return erroEmJson(erro)
  }
}
