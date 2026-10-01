// POST /api/telegram/[agenteId]/webhook: a entrega de updates do Telegram (PR-66).
// Sem sessão: quem autentica é o segredo do cabeçalho. Handler fino: o serviço
// decide; aqui o resultado vira HTTP e o atendimento roda em `after()`, depois
// do 200, porque o Telegram reenvia se a resposta demorar e o turno do modelo
// leva segundos. 401 sem corpo, igual para tudo que não autentica.
import { after } from 'next/server'
import { tratarWebhook } from '@/servicos/telegram-webhook'

export const dynamic = 'force-dynamic'

export async function POST(request: Request, contexto: { params: Promise<{ agenteId: string }> }) {
  const { agenteId } = await contexto.params
  const declarado = request.headers.get('content-length')
  const resultado = await tratarWebhook({
    agenteId,
    segredo: request.headers.get('x-telegram-bot-api-secret-token'),
    tamanhoDeclarado: declarado === null ? undefined : Number(declarado),
    lerCorpo: () => request.text(),
  })
  const { depois } = resultado
  if (depois) after(depois)
  return new Response(null, { status: resultado.status, headers: { 'Cache-Control': 'no-store' } })
}
