import { Esqueleto } from '@/componentes/Esqueleto'

/** Carregando a aba Conhecimento: os três cartões, a área de adicionar e a lista. */
export default function CarregandoConhecimento() {
  return (
    <div aria-busy="true" role="status">
      <span className="somente-leitor">Carregando o conhecimento…</span>
      <div className="pilha" aria-hidden="true">
        <div className="cartoes-de-resumo">
          <Esqueleto className="esqueleto-bloco" />
          <Esqueleto className="esqueleto-bloco" />
          <Esqueleto className="esqueleto-bloco" />
        </div>
        <Esqueleto className="esqueleto-bloco" />
        <Esqueleto className="esqueleto-bloco" />
      </div>
    </div>
  )
}
