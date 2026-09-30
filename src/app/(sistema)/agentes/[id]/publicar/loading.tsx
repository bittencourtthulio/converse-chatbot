import { Esqueleto } from '@/componentes/Esqueleto'

/** Carregando a aba Publicar: o cartão do formulário e o quadro da prévia. */
export default function CarregandoPublicar() {
  return (
    <div className="publicar-grade" aria-busy="true" role="status">
      <span className="somente-leitor">Carregando a configuração do chat…</span>
      <div className="pilha" aria-hidden="true">
        <Esqueleto className="esqueleto-bloco" />
        <Esqueleto className="esqueleto-bloco" />
      </div>
      <div aria-hidden="true">
        <Esqueleto className="esqueleto-bloco" />
      </div>
    </div>
  )
}
