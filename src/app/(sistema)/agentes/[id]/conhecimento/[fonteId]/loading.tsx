import { Esqueleto } from '@/componentes/Esqueleto'

/** Carregando os trechos de uma fonte. */
export default function CarregandoTrechos() {
  return (
    <div aria-busy="true" role="status">
      <span className="somente-leitor">Carregando os trechos…</span>
      <div className="pilha" aria-hidden="true">
        <Esqueleto className="esqueleto-subtitulo" />
        <Esqueleto className="esqueleto-bloco" />
        <Esqueleto className="esqueleto-bloco" />
        <Esqueleto className="esqueleto-bloco" />
      </div>
    </div>
  )
}
