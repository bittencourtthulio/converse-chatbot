import { Esqueleto } from '@/componentes/Esqueleto'

/** Carregando a aba Canais: o cartão do canal. */
export default function CarregandoCanais() {
  return (
    <div className="pilha" aria-busy="true" role="status">
      <span className="somente-leitor">Carregando os canais do agente…</span>
      <div className="pilha" aria-hidden="true">
        <Esqueleto className="esqueleto-bloco" />
        <Esqueleto className="esqueleto-bloco" />
      </div>
    </div>
  )
}
