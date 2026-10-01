import { BadgeDeCanal } from '@/componentes/BadgeDeCanal'
import type { NumerosDoPainel } from '@/servicos/painel'

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`

/**
 * Os números do painel (FT-09): agentes, fontes prontas e com erro, e a atividade dos últimos
 * 7 dias com a quebra por canal. O destaque das fontes com erro é por texto, nunca só cor.
 */
export function CartoesDoPainel({ numeros }: { numeros: NumerosDoPainel }) {
  return (
    <div className="pilha pilha-compacta">
      <section className="cartoes-de-resumo cartoes-do-painel" aria-label="Resumo da conta">
        <div className="cartao cartao-resumo">
          <span className="cartao-resumo-rotulo">Agentes</span>
          <strong className="cartao-resumo-valor">{numeros.agentes}</strong>
        </div>
        <div className="cartao cartao-resumo">
          <span className="cartao-resumo-rotulo">Fontes prontas</span>
          <strong className="cartao-resumo-valor">{numeros.fontesProntas}</strong>
          <span className="cartao-resumo-apoio">Já usadas para responder</span>
        </div>
        <div className="cartao cartao-resumo">
          <span className="cartao-resumo-rotulo">Fontes com erro</span>
          <strong className="cartao-resumo-valor">{numeros.fontesComErro}</strong>
          {numeros.fontesComErro > 0 && <span className="cartao-resumo-apoio">precisam de atenção</span>}
        </div>
        <div className="cartao cartao-resumo">
          <span className="cartao-resumo-rotulo">Conversas</span>
          <strong className="cartao-resumo-valor">{numeros.conversas}</strong>
          <span className="cartao-resumo-apoio">nos últimos 7 dias</span>
        </div>
        <div className="cartao cartao-resumo">
          <span className="cartao-resumo-rotulo">Mensagens</span>
          <strong className="cartao-resumo-valor">{numeros.mensagens}</strong>
          <span className="cartao-resumo-apoio">nos últimos 7 dias</span>
        </div>
      </section>
      <section className="cartao cartao-corpo" aria-label="Atividade por canal">
        <h2 className="secao-titulo">Por canal, nos últimos 7 dias</h2>
        <ul className="quebra-por-canal">
          {numeros.porCanal.map((c) => (
            <li key={c.canal}>
              <BadgeDeCanal canal={c.canal} />
              <span>
                {plural(c.conversas, 'conversa', 'conversas')} · {plural(c.mensagens, 'mensagem', 'mensagens')}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
