import { exigirUsuarioAdmin } from '@/app/sessao-servidor'

/**
 * Guarda de admin no layout, acima do `loading.tsx` desta pasta, como em
 * `usuarios/layout.tsx`: quem não é admin recebe 307 antes de qualquer trecho
 * da página (FT-10). A página confere de novo.
 */
export default async function LayoutDePrivacidade({
  children,
}: {
  children: React.ReactNode
}) {
  await exigirUsuarioAdmin()
  return children
}
