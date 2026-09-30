import { formatarCaracteres } from '@/componentes/conhecimento-logica'
import type { ResumoDaBase } from '@/servicos/fontes'

/** Os números da base no topo da aba Conhecimento: fontes, prontas e caracteres. */
export function CartoesDeResumo({ resumo }: { resumo: ResumoDaBase }) {
  const notas = [
    resumo.emProcessamento > 0 ? `${resumo.emProcessamento} em processamento` : null,
    resumo.comErro > 0 ? `${resumo.comErro} com erro` : null,
  ].filter(Boolean)

  return (
    <section className="cartoes-de-resumo" aria-label="Resumo da base">
      <div className="cartao cartao-resumo">
        <span className="cartao-resumo-rotulo">Fontes</span>
        <strong className="cartao-resumo-valor">{resumo.total}</strong>
        {notas.length > 0 && <span className="cartao-resumo-apoio">{notas.join(' · ')}</span>}
      </div>
      <div className="cartao cartao-resumo">
        <span className="cartao-resumo-rotulo">Prontas</span>
        <strong className="cartao-resumo-valor">{resumo.prontas}</strong>
        <span className="cartao-resumo-apoio">Já usadas para responder</span>
      </div>
      <div className="cartao cartao-resumo">
        <span className="cartao-resumo-rotulo">Caracteres</span>
        <strong className="cartao-resumo-valor">{formatarCaracteres(resumo.caracteres)}</strong>
        <span className="cartao-resumo-apoio">De texto nas fontes prontas</span>
      </div>
    </section>
  )
}
