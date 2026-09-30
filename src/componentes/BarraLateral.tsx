'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icone } from '@/componentes/Icones'
import { Logotipo } from '@/componentes/Logotipo'
import { gruposVisiveis, rotaEstaAtiva } from '@/componentes/itens-de-menu'

/**
 * A navegação lateral. Os itens vêm de `itens-de-menu.ts`: quem constrói uma
 * feature nova acrescenta o item lá, não aqui. Abaixo de 768px ela é a gaveta.
 */
export function BarraLateral({
  nomeDoProduto,
  ehAdmin,
  id,
  aoNavegar,
}: {
  nomeDoProduto: string
  ehAdmin: boolean
  id: string
  aoNavegar: () => void
}) {
  const caminho = usePathname()

  return (
    <aside className="barra-lateral" id={id} aria-label="Barra lateral">
      <div className="barra-lateral-topo">
        <Logotipo nome={nomeDoProduto} aoNavegar={aoNavegar} />
        <button
          type="button"
          className="botao-icone botao-menu"
          aria-label="Fechar menu"
          onClick={aoNavegar}
        >
          <Icone nome="fechar" />
        </button>
      </div>

      <nav className="navegacao" aria-label="Navegação principal">
        {gruposVisiveis(ehAdmin).map((grupo) => (
          <div className="navegacao-grupo" key={grupo.titulo ?? 'principal'}>
            {grupo.titulo && <h2 className="navegacao-titulo">{grupo.titulo}</h2>}
            {grupo.itens.map((item) => {
              const ativo = rotaEstaAtiva(caminho, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="navegacao-item"
                  aria-current={ativo ? 'page' : undefined}
                  onClick={aoNavegar}
                >
                  <Icone nome={item.icone} />
                  {item.rotulo}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}
