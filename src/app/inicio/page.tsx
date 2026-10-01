import type { Metadata } from 'next'
import { ambiente } from '@/lib/ambiente'
import { PaginaInicial } from '@/componentes/PaginaInicial'

/**
 * Landing pública (FT-14). É a página que o `src/proxy.ts` mostra em `/` para quem não tem cookie
 * de sessão, e responde também direto em `/inicio`. Não lê sessão nem banco: só o nome do produto.
 * Dinâmica (e não gerada no build) para o `APP_NAME` valer em tempo de execução.
 */
export const dynamic = 'force-dynamic'

export function generateMetadata(): Metadata {
  const nome = ambiente.nomeDoProduto
  const titulo = `${nome}: agentes de IA com a base de conhecimento da sua empresa`
  const descricao =
    'Crie agentes que respondem com os seus arquivos, textos e vídeos e mostram as fontes. Publique no seu site ou no Telegram.'
  return {
    title: { absolute: titulo },
    description: descricao,
    openGraph: { title: titulo, description: descricao, type: 'website', locale: 'pt_BR', siteName: nome },
  }
}

export default function Inicio() {
  return <PaginaInicial nome={ambiente.nomeDoProduto} />
}
