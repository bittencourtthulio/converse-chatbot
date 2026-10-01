import { exigirUsuario } from '@/app/sessao-servidor'
import { carregarConversa } from '@/app/(sistema)/conversas/[id]/carregar-conversa'

/**
 * Layout do detalhe: confere sessão e existência da conversa acima do `loading.tsx`, para o
 * id inexistente sair como 404 de verdade (e não como 200 com a tela de carregamento).
 */
export default async function LayoutDaConversa({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  await exigirUsuario()
  const { id } = await params
  await carregarConversa(id)
  return children
}
