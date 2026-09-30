// A página do iframe do chat embutido (FT-06, PR-61): `/embed/[id]`, fora do
// grupo `(sistema)`: sem barra lateral, sem login. O visitante chega aqui pelo
// `widget.js`; o `frame-ancestors` desta resposta é definido por `src/proxy.ts`.
// Agente inexistente ou com o chat inativo: a mesma página neutra (404), sem
// dado nenhum. `?previa=1` com sessão válida mostra o chat mesmo inativo, para a
// aba Publicar do usuário logado; sem sessão o parâmetro é ignorado.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { usuarioAtual } from '@/app/sessao-servidor'
import { ChatEmbutido } from '@/componentes/ChatEmbutido'
import { ErroDeAplicacao } from '@/lib/erros'
import { configuracaoDaPrevia, configuracaoPublica } from '@/servicos/chat-publico-config'

export const dynamic = 'force-dynamic'

type Propriedades = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ previa?: string }>
}

/** A configuração a mostrar e o modo, ou `null` se não há nada para o visitante ver. */
async function carregar({ params, searchParams }: Propriedades) {
  const [{ id }, { previa }] = await Promise.all([params, searchParams])
  if (previa === '1') {
    const usuario = await usuarioAtual()
    if (usuario) {
      try {
        return { id, modo: 'previa' as const, configuracao: await configuracaoDaPrevia(usuario, id) }
      } catch (erro) {
        if (erro instanceof ErroDeAplicacao && erro.status === 404) return null
        throw erro
      }
    }
  }
  const configuracao = await configuracaoPublica(id)
  return configuracao ? { id, modo: 'publico' as const, configuracao } : null
}

export async function generateMetadata(propriedades: Propriedades): Promise<Metadata> {
  const dados = await carregar(propriedades)
  return { title: dados?.configuracao.titulo ?? 'Chat', robots: { index: false, follow: false } }
}

export default async function PaginaDoEmbed(propriedades: Propriedades) {
  const dados = await carregar(propriedades)
  if (!dados) notFound()
  const { ativo: _ativo, ...configuracao } = dados.configuracao
  return <ChatEmbutido agenteId={dados.id} modo={dados.modo} configuracao={configuracao} />
}
