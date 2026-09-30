'use client'

import { Icone } from '@/componentes/Icones'

/**
 * Alterna entre claro e escuro. Renderiza os dois ícones e deixa o CSS
 * mostrar o certo a partir do `data-theme` que o script do <head> já
 * resolveu antes da primeira pintura: o HTML do servidor é igual ao do
 * cliente, então não há divergência de hidratação nem piscada.
 */
export function AlternadorDeTema() {
  function alternar() {
    const raiz = document.documentElement
    const atual =
      raiz.dataset.theme ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    const novo = atual === 'dark' ? 'light' : 'dark'
    raiz.dataset.theme = novo
    try {
      localStorage.setItem('tema', novo)
    } catch {
      // Armazenamento bloqueado: o tema vale só para esta aba.
    }
  }

  return (
    <button
      type="button"
      className="botao-icone"
      onClick={alternar}
      aria-label="Alternar tema"
      title="Alternar entre tema claro e escuro"
    >
      <Icone nome="lua" className="icone-lua" />
      <Icone nome="sol" className="icone-sol" />
    </button>
  )
}
