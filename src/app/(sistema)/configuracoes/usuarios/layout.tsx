import { exigirUsuarioAdmin } from '@/app/sessao-servidor'

/**
 * A guarda de admin fica no layout, acima do `loading.tsx` desta pasta: o
 * redirecionamento de quem não é admin acontece antes de qualquer trecho da
 * página ser enviado (status 307 de verdade, não um 200 com redirecionamento
 * no navegador). A página confere de novo.
 */
export default async function LayoutDeUsuarios({
  children,
}: {
  children: React.ReactNode
}) {
  await exigirUsuarioAdmin()
  return children
}
