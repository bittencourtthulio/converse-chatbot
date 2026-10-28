'use client'

import { useCallback, useEffect, useId, useState } from 'react'
import { BarraLateral } from '@/componentes/BarraLateral'
import { Cabecalho } from '@/componentes/Cabecalho'

/**
 * A casca do sistema: cabeçalho fixo, barra lateral expansível e conteúdo com
 * toda a largura disponível. Até 768px a barra vira gaveta; fecha com Esc, ao tocar no
 * fundo escurecido e ao navegar. O estado mora aqui, em um lugar só.
 */
export function CascaDoSistema({
  nomeDoProduto,
  usuario,
  children,
}: {
  nomeDoProduto: string
  usuario: { nome: string; email: string; papel: string }
  children: React.ReactNode
}) {
  const [gavetaAberta, setGavetaAberta] = useState(false)
  const idDaGaveta = useId()
  const fechar = useCallback(() => setGavetaAberta(false), [])

  useEffect(() => {
    if (!gavetaAberta) return
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') setGavetaAberta(false)
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [gavetaAberta])

  const ehAdmin = usuario.papel === 'admin'

  return (
    <div className="casca" data-gaveta={gavetaAberta ? 'aberta' : 'fechada'}>
      <a className="pular-para-o-conteudo" href="#conteudo">
        Pular para o conteúdo
      </a>

      <BarraLateral
        id={idDaGaveta}
        nomeDoProduto={nomeDoProduto}
        ehAdmin={ehAdmin}
        aoNavegar={fechar}
      />
      <button
        type="button"
        className="fundo-da-gaveta"
        aria-label="Fechar menu"
        tabIndex={-1}
        onClick={fechar}
      />

      <div className="principal">
        <Cabecalho
          nome={usuario.nome}
          email={usuario.email}
          ehAdmin={ehAdmin}
          idDaGaveta={idDaGaveta}
          gavetaAberta={gavetaAberta}
          aoAbrirMenu={() => setGavetaAberta(true)}
        />
        <main className="conteudo" id="conteudo" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}
