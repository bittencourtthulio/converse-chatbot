// Proxy do Next 16 (antigo middleware), só para a rota do iframe (FT-06, PR-59).
// O `frame-ancestors` depende do agente: a página do App Router não define
// cabeçalho de resposta, então é aqui, antes de a página renderizar, que o valor
// certo entra. Lista vazia libera qualquer site; com lista, a plataforma e os
// domínios dela; agente inexistente ou inativo e qualquer falha na consulta, só a
// própria plataforma (a pré-visualização da aba Publicar é da mesma origem).
// Roda no runtime Node, por isso consulta o banco pelo serviço.
import { NextResponse, type NextRequest } from 'next/server'
import { FRAME_ANCESTORS_SOMENTE_EU, cabecalhoFrameAncestors } from '@/lib/dominios-permitidos'
import { dominiosDoEmbed } from '@/servicos/chat-publico-config'

export async function proxy(request: NextRequest) {
  // /embed/<id>/...: o id é o segundo segmento.
  const id = request.nextUrl.pathname.split('/')[2] ?? ''
  let politica = FRAME_ANCESTORS_SOMENTE_EU
  try {
    const { ativo, dominios } = await dominiosDoEmbed(id)
    if (ativo) politica = cabecalhoFrameAncestors(dominios)
  } catch {
    // Falha fecha: sem a lista não se sabe quem pode emoldurar.
  }
  const resposta = NextResponse.next()
  resposta.headers.set('Content-Security-Policy', politica)
  return resposta
}

// O valor do matcher precisa ser constante (proxy.md).
export const config = { matcher: '/embed/:path*' }
