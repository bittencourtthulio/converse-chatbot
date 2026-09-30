import { exigirUsuarioAdmin } from '@/app/sessao-servidor'

/**
 * Guarda de admin no layout, acima do `loading.tsx` desta pasta, como em
 * `usuarios/layout.tsx`: quem não é admin recebe 307 antes de qualquer trecho
 * da página. A página confere de novo.
 */
export default async function LayoutDeIntegracoes({
  children,
}: {
  children: React.ReactNode
}) {
  await exigirUsuarioAdmin()
  return children
}
