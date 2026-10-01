import { exigirUsuarioAdmin } from '@/app/sessao-servidor'

/**
 * Guarda de admin no layout, acima do `loading.tsx` desta pasta, como em `auditoria/layout.tsx`:
 * quem não é admin recebe 307 antes de qualquer trecho da página (FT-11, PR-95). A página confere
 * de novo.
 */
export default async function LayoutDoSistema({ children }: { children: React.ReactNode }) {
  await exigirUsuarioAdmin()
  return children
}
