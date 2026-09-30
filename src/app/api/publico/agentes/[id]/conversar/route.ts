// POST /api/publico/agentes/[id]/conversar: o turno do visitante anônimo em SSE
// (PR-56). Sem sessão. Handler fino: confere a origem, lê o corpo e traduz o
// gerador de `conversarComoVisitante`. Erro antes da primeira gravação vira JSON
// com status (404, 422, 429 com Retry-After); depois, o evento `erro` com a frase
// única do visitante. Nenhum detalhe técnico sai daqui.
import { fluxoDeEventos } from '@/app/eventos-sse'
import { entradaInvalida, ErroDeAplicacao } from '@/lib/erros'
import { ipDoCliente } from '@/lib/requisicao'
import { conversarComoVisitante, quadroDeErroParaVisitante } from '@/servicos/chat-publico'
import { erroPublico, origemEDaPlataforma } from '../../../resposta'

export const dynamic = 'force-dynamic'

/** O corpo legítimo tem poucas centenas de bytes: 8 KB sobram. */
const TAMANHO_MAXIMO_DO_CORPO = 8 * 1024

async function lerCorpo(request: Request): Promise<{ visitanteId: unknown; conversaId?: unknown; mensagem: unknown }> {
  const declarado = Number(request.headers.get('content-length') ?? 0)
  if (declarado > TAMANHO_MAXIMO_DO_CORPO) throw new ErroDeAplicacao('Mensagem grande demais.', 413, 'corpo_grande')
  const texto = await request.text()
  if (texto.length > TAMANHO_MAXIMO_DO_CORPO) throw new ErroDeAplicacao('Mensagem grande demais.', 413, 'corpo_grande')
  let corpo: unknown
  try {
    corpo = JSON.parse(texto)
  } catch {
    throw entradaInvalida('Envie a mensagem em JSON.')
  }
  if (typeof corpo !== 'object' || corpo === null || Array.isArray(corpo)) {
    throw entradaInvalida('Envie a mensagem em JSON.')
  }
  const { visitanteId, conversaId, mensagem } = corpo as Record<string, unknown>
  return { visitanteId, conversaId, mensagem }
}

export async function POST(request: Request, contexto: { params: Promise<{ id: string }> }) {
  try {
    const origem = request.headers.get('origin')
    if (origem !== null && !origemEDaPlataforma(origem, request)) {
      return Response.json(
        { codigo: 'origem_nao_permitida', mensagem: 'Esta origem não pode usar o chat.' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } },
      )
    }
    const { id } = await contexto.params
    const corpo = await lerCorpo(request)

    const eventos = conversarComoVisitante({
      agenteId: id,
      visitanteId: corpo.visitanteId,
      conversaId: corpo.conversaId,
      mensagem: corpo.mensagem,
      ip: await ipDoCliente(),
      sinal: request.signal,
    })
    // O primeiro evento (`inicio`) só sai depois de validar, limitar e gravar a
    // pergunta: qualquer erro até aqui ainda cabe num status HTTP.
    const primeiro = await eventos.next()
    if (primeiro.done || primeiro.value.tipo !== 'inicio') return new Response(null, { status: 204 })

    return new Response(fluxoDeEventos(eventos, { mapearErro: quadroDeErroParaVisitante }), {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-store, no-transform',
        'X-Accel-Buffering': 'no',
        'X-Conversa-Id': primeiro.value.conversaId,
      },
    })
  } catch (erro) {
    return erroPublico(erro)
  }
}
