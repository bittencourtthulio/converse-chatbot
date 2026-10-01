// POST /api/agentes/[id]/conversar: o turno de conversa do painel em SSE
// (PR-43). Handler fino: sessão no servidor, corpo, e a tradução do gerador do
// serviço `responderMensagem` para HTTP. Erro antes de qualquer gravação vira
// JSON com o status certo; depois do início, vira o evento `erro` do stream.
import { usuarioAtual } from '@/app/sessao-servidor'
import { fluxoDeEventos } from '@/app/eventos-sse'
import { respostaDeErro } from '@/app/api/resposta-de-erro'
import { entradaInvalida, naoAutenticado } from '@/lib/erros'
import { responderMensagem } from '@/servicos/chat'

export const dynamic = 'force-dynamic'

const semCache = { 'Cache-Control': 'no-store' }

function erroEmJson(erro: unknown): Promise<Response> {
  return respostaDeErro(erro, 'conversar')
}

async function lerCorpo(request: Request): Promise<{ conversaId?: string; mensagem: unknown }> {
  const corpo: unknown = await request.json().catch(() => null)
  if (typeof corpo !== 'object' || corpo === null) throw entradaInvalida('Envie a mensagem em JSON.')
  const { conversaId, mensagem } = corpo as Record<string, unknown>
  if (conversaId !== undefined && typeof conversaId !== 'string') {
    throw entradaInvalida('O identificador da conversa é inválido.')
  }
  return { conversaId, mensagem }
}

export async function POST(request: Request, contexto: { params: Promise<{ id: string }> }) {
  try {
    const usuario = await usuarioAtual()
    if (!usuario) throw naoAutenticado()
    const { id } = await contexto.params
    const { conversaId, mensagem } = await lerCorpo(request)

    const eventos = responderMensagem({
      agenteId: id,
      conversaId,
      canal: 'painel',
      criadoPorId: usuario.id,
      mensagem,
      sinal: request.signal,
    })
    // O primeiro evento (`inicio`) só sai depois de validar e gravar a pergunta:
    // qualquer erro até aqui ainda cabe num status HTTP.
    const primeiro = await eventos.next()
    if (primeiro.done || primeiro.value.tipo !== 'inicio') return new Response(null, { status: 204 })

    return new Response(fluxoDeEventos(eventos), {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-store, no-transform',
        'X-Accel-Buffering': 'no',
        'X-Conversa-Id': primeiro.value.conversaId,
      },
    })
  } catch (erro) {
    return erroEmJson(erro)
  }
}
