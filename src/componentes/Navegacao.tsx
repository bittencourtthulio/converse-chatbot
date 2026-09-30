'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * A navegação padrão do P-9. As features do projeto acrescentam itens
 * aqui; não recriam a área de Configurações.
 */
export function Navegacao({ ehAdmin }: { ehAdmin: boolean }) {
  const atual = usePathname()
  const marca = (href: string) =>
    atual === href ? ({ 'aria-current': 'page' } as const) : {}

  return (
    <nav className="navegacao" aria-label="Navegação principal">
      <Link href="/" {...marca('/')}>
        Painel
      </Link>

      <h2>Configurações</h2>
      {ehAdmin && (
        <Link
          href="/configuracoes/usuarios"
          className="aninhado"
          {...marca('/configuracoes/usuarios')}
        >
          Usuários
        </Link>
      )}
      <Link href="/perfil" className="aninhado" {...marca('/perfil')}>
        Meu perfil
      </Link>
    </nav>
  )
}
