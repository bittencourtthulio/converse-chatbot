'use client'

import { Fragment } from 'react'
import { usePathname } from 'next/navigation'
import { AlternadorDeTema } from '@/componentes/AlternadorDeTema'
import { Icone } from '@/componentes/Icones'
import { MenuDoUsuario } from '@/componentes/MenuDoUsuario'
import { migalhasDaRota } from '@/componentes/itens-de-menu'

/** Cabeçalho: botão do menu (celular), título da página, tema e usuário. */
export function Cabecalho({
  nome,
  email,
  ehAdmin,
  idDaGaveta,
  gavetaAberta,
  aoAbrirMenu,
}: {
  nome: string
  email: string
  ehAdmin: boolean
  idDaGaveta: string
  gavetaAberta: boolean
  aoAbrirMenu: () => void
}) {
  const migalhas = migalhasDaRota(usePathname())

  return (
    <header className="cabecalho">
      <button
        type="button"
        className="botao-icone botao-menu"
        aria-label="Abrir menu"
        aria-expanded={gavetaAberta}
        aria-controls={idDaGaveta}
        onClick={aoAbrirMenu}
      >
        <Icone nome="menu" />
      </button>

      <nav className="migalhas" aria-label="Você está em">
        {migalhas.map((titulo, i) => {
          const ultima = i === migalhas.length - 1
          return (
            <Fragment key={titulo}>
              {i > 0 && (
                <span className="migalhas-separador" aria-hidden="true">
                  /
                </span>
              )}
              <span aria-current={ultima ? 'page' : undefined}>{titulo}</span>
            </Fragment>
          )
        })}
      </nav>

      <div className="acoes-do-cabecalho">
        <AlternadorDeTema />
        <MenuDoUsuario nome={nome} email={email} ehAdmin={ehAdmin} />
      </div>
    </header>
  )
}
