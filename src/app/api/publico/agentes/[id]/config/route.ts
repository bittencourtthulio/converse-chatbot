// GET /api/publico/agentes/[id]/config e OPTIONS: a configuração visual do chat
// para o `widget.js` (PR-56). Sem sessão. Só campos visuais; agente inativo e
// inexistente dão o mesmo 404. CORS pela lista de domínios do agente (PR-58).
import { MENSAGEM_DE_INDISPONIVEL } from '@/servicos/chat-publico'
import { configuracaoPublica, dominiosDoEmbed } from '@/servicos/chat-publico-config'
import { CABECALHOS_DE_PREFLIGHT, cabecalhosDeCors, erroPublico, semCache } from '../../../resposta'

export const dynamic = 'force-dynamic'

type Contexto = { params: Promise<{ id: string }> }

export async function GET(request: Request, contexto: Contexto) {
  try {
    const { id } = await contexto.params
    const origem = request.headers.get('origin')
    const configuracao = await configuracaoPublica(id)
    if (!configuracao) {
      // Igual para inexistente e inativo, inclusive nos cabeçalhos de CORS.
      return Response.json(
        { codigo: 'nao_encontrado', mensagem: MENSAGEM_DE_INDISPONIVEL },
        { status: 404, headers: { ...semCache, ...cabecalhosDeCors(origem, []) } },
      )
    }
    const { dominios } = await dominiosDoEmbed(id)
    return Response.json(configuracao, { headers: { ...semCache, ...cabecalhosDeCors(origem, dominios) } })
  } catch (erro) {
    return erroPublico(erro)
  }
}

export async function OPTIONS(request: Request, contexto: Contexto) {
  try {
    const { id } = await contexto.params
    const { dominios } = await dominiosDoEmbed(id)
    return new Response(null, {
      status: 204,
      headers: { ...semCache, ...CABECALHOS_DE_PREFLIGHT, ...cabecalhosDeCors(request.headers.get('origin'), dominios) },
    })
  } catch (erro) {
    return erroPublico(erro)
  }
}
