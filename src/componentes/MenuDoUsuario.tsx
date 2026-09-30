'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import { sair } from '@/app/acoes'
import { Icone } from '@/componentes/Icones'
import { iniciaisDe } from '@/componentes/iniciais'

/**
 * Menu do usuário: iniciais, nome, papel, atalho para o perfil e sair. É um
 * disclosure (botão + painel), fecha com Esc e com clique fora. O painel fica
 * no HTML mesmo fechado (atributo `hidden`), o que mantém o servidor e o
 * cliente iguais.
 */
export function MenuDoUsuario({
  nome,
  email,
  ehAdmin,
}: {
  nome: string
  email: string
  ehAdmin: boolean
}) {
  const [aberto, setAberto] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  const gatilho = useRef<HTMLButtonElement>(null)
  const idDoPainel = useId()

  useEffect(() => {
    if (!aberto) return
    function aoClicar(e: MouseEvent) {
      if (!raiz.current?.contains(e.target as Node)) setAberto(false)
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setAberto(false)
        gatilho.current?.focus()
      }
    }
    document.addEventListener('mousedown', aoClicar)
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('mousedown', aoClicar)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aberto])

  return (
    <div className="menu-do-usuario" ref={raiz}>
      <button
        ref={gatilho}
        type="button"
        className="menu-do-usuario-gatilho"
        aria-expanded={aberto}
        aria-controls={idDoPainel}
        aria-label={`Menu de ${nome}`}
        onClick={() => setAberto((v) => !v)}
      >
        <span className="avatar">{iniciaisDe(nome)}</span>
        <span className="menu-do-usuario-nome">{nome}</span>
      </button>

      <div id={idDoPainel} className="menu-do-usuario-painel" hidden={!aberto}>
        <div className="menu-do-usuario-identidade">
          <strong>{nome}</strong>
          <span>{email}</span>
          <span className="menu-do-usuario-papel badge badge-acento">
            {ehAdmin ? 'Administrador' : 'Usuário'}
          </span>
        </div>
        <Link href="/perfil" className="menu-item" onClick={() => setAberto(false)}>
          <Icone nome="perfil" tamanho={18} />
          Meu perfil
        </Link>
        <form action={sair}>
          <button type="submit" className="menu-item">
            <Icone nome="sair" tamanho={18} />
            Sair
          </button>
        </form>
      </div>
    </div>
  )
}
