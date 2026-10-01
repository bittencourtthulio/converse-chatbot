// Proxy do Next 16 (antigo middleware). Duas tarefas:
//
// 1. Correlação (FT-11, PR-93): toda requisição recebe um código novo, que vai ao handler no
//    cabeçalho de requisição `x-correlacao` (o valor que o cliente mandar é ignorado: não se
//    confia em identificador de fora para gravar no log) e volta na resposta como `X-Correlacao`.
//    É o código que o usuário vê como "Código de referência" e que o operador procura no log.
// 2. Só na rota do iframe (FT-06, PR-59): o `frame-ancestors` depende do agente, e a página do
//    App Router não define cabeçalho de resposta, então é aqui, antes de a página renderizar,
//    que o valor certo entra. Lista vazia libera qualquer site; com lista, a plataforma e os
//    domínios dela; agente inexistente ou inativo e qualquer falha na consulta, só a própria
//    plataforma (a pré-visualização da aba Publicar é da mesma origem).
// Roda no runtime Node, por isso consulta o banco pelo serviço.
import { NextResponse, type NextRequest } from 'next/server'
import { FRAME_ANCESTORS_SOMENTE_EU, cabecalhoFrameAncestors } from '@/lib/dominios-permitidos'
import { novaCorrelacao } from '@/lib/log'
import { dominiosDoEmbed } from '@/servicos/chat-publico-config'

async function politicaDoEmbed(caminho: string): Promise<string> {
  // /embed/<id>/...: o id é o segundo segmento.
  const id = caminho.split('/')[2] ?? ''
  try {
    const { ativo, dominios } = await dominiosDoEmbed(id)
    if (ativo) return cabecalhoFrameAncestors(dominios)
  } catch {
    // Falha fecha: sem a lista não se sabe quem pode emoldurar.
  }
  return FRAME_ANCESTORS_SOMENTE_EU
}

export async function proxy(request: NextRequest) {
  const correlacao = novaCorrelacao()
  const cabecalhos = new Headers(request.headers)
  cabecalhos.set('x-correlacao', correlacao)
  const caminho = request.nextUrl.pathname
  const politica = caminho === '/embed' || caminho.startsWith('/embed/') ? await politicaDoEmbed(caminho) : null
  const resposta = NextResponse.next({ request: { headers: cabecalhos } })
  resposta.headers.set('X-Correlacao', correlacao)
  if (politica) resposta.headers.set('Content-Security-Policy', politica)
  return resposta
}

// O valor do matcher precisa ser constante (proxy.md). Cobre tudo, menos:
// - os arquivos estáticos do próprio Next e o ícone, que não têm handler que precise de código;
// - os envios de arquivo e de vídeo (`/api/agentes/<id>/fontes...`): com proxy o Next copia o corpo
//   da requisição em memória, até 10 MB, e entrega só esse começo ao handler. O vídeo chega a
//   500 MB e é gravado em stream (PR-71), então a rota não pode passar pelo proxy. Essas rotas
//   leem a correlação pelo mesmo `correlacaoDaRequisicao` (que gera um código novo) e devolvem
//   o `X-Correlacao` no erro.
export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|api/agentes/[^/]+/fontes).*)',
}
