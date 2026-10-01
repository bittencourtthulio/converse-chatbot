import { Badge } from '@/componentes/Badge'
import { DADOS_POR_CANAL, textosDoPainelDeDados } from '@/componentes/privacidade-logica'

/**
 * "Dados pessoais tratados": painel somente leitura com texto fixo (FT-10, PR-18, PR-91). A
 * retenção vem da configuração; a base legal fica marcada como provisória.
 */
export function PainelDeDadosPessoais({ retencaoDias }: { retencaoDias: number | null }) {
  const t = textosDoPainelDeDados(retencaoDias)
  return (
    <section className="cartao" aria-labelledby="titulo-dados-pessoais">
      <div className="cartao-corpo pilha">
        <div className="linha linha-entre">
          <h2 className="secao-titulo sem-margem" id="titulo-dados-pessoais">
            Dados pessoais tratados
          </h2>
          <Badge variante="neutro">Somente leitura</Badge>
        </div>
        <p className="texto-de-apoio">O que este sistema guarda de quem conversa com os seus agentes, canal por canal.</p>

        <div className="dados-por-canal">
          {DADOS_POR_CANAL.map((c) => (
            <div key={c.canal} className="dados-do-canal">
              <h3 className="secao-subtitulo">{c.canal}</h3>
              <ul>
                {c.campos.map((campo) => (
                  <li key={campo}>{campo}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <dl className="metadados-da-conversa dados-gerais">
          <div>
            <dt>Finalidade</dt>
            <dd>{t.finalidade}</dd>
          </div>
          <div>
            <dt>Retenção</dt>
            <dd>{t.retencao}</dd>
          </div>
          <div>
            <dt>Onde ficam</dt>
            <dd>{t.ondeFicam}</dd>
          </div>
          <div>
            <dt>Quem acessa</dt>
            <dd>{t.quemAcessa}</dd>
          </div>
          <div>
            <dt>Base legal</dt>
            <dd>{t.baseLegal}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
