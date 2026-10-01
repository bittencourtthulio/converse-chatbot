import Link from 'next/link'
import { BadgeDeCanal } from '@/componentes/BadgeDeCanal'
import { formatarAtividade } from '@/componentes/conversas-logica'
import type { ItemDoHistorico } from '@/servicos/historico'

/** As conversas mais recentes do painel, com link para cada uma e para o histórico inteiro. */
export function ConversasRecentes({ itens }: { itens: ItemDoHistorico[] }) {
  return (
    <section className="cartao cartao-corpo" aria-labelledby="conversas-recentes-titulo">
      <div className="linha linha-entre">
        <h2 className="secao-titulo sem-margem" id="conversas-recentes-titulo">
          Conversas recentes
        </h2>
        <Link href="/conversas" className="botao secundario botao-pequeno">
          Ver todas as conversas
        </Link>
      </div>
      {itens.length === 0 ? (
        <p className="texto-de-apoio">
          Nenhuma conversa ainda. Converse com um agente na aba Testar, publique o chat embutido ou conecte um bot do Telegram.
        </p>
      ) : (
        <ul className="conversas-recentes">
          {itens.map((c) => (
            <li key={c.id}>
              <Link href={`/conversas/${c.id}`} className="conversa-recente">
                <span className="conversa-recente-topo">
                  <strong>{c.rotulo}</strong>
                  <BadgeDeCanal canal={c.canal} />
                </span>
                <span className="conversa-recente-previa">{c.previa}</span>
                <span className="texto-de-apoio">
                  {c.agenteNome} · {formatarAtividade(c.atualizadoEm)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
