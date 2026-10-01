import {
  ALTURA_MAXIMA_DA_BARRA,
  descricaoDoGrafico,
  diaCompleto,
  escalaDasBarras,
  totalDaSerie,
  type PontoDaSerie,
} from '@/componentes/painel-logica'

const LARGURA_DO_DIA = 22
const LARGURA_DA_BARRA = 14
const TOPO = 18
const BASE = TOPO + ALTURA_MAXIMA_DA_BARRA
const ALTURA_TOTAL = BASE + 24

/**
 * Mensagens por dia (FT-09, PR-81): barras em SVG com `role="img"` e rótulo que resume o
 * período, o valor escrito sobre cada barra (a leitura não depende de cor), e a tabela
 * equivalente logo abaixo, para leitor de tela e para quem prefere números. Cores só por
 * classe, que lê os tokens (`--grafico-*`).
 */
export function GraficoDeMensagens({ serie }: { serie: PontoDaSerie[] }) {
  const largura = serie.length * LARGURA_DO_DIA
  const descricao = descricaoDoGrafico(serie)
  const vazio = totalDaSerie(serie) === 0
  return (
    <figure className="grafico-de-mensagens">
      <figcaption className="secao-titulo">Mensagens por dia</figcaption>
      {vazio ? (
        <p className="texto-de-apoio">Nenhuma mensagem nos últimos {serie.length} dias.</p>
      ) : (
        <svg viewBox={`0 0 ${largura} ${ALTURA_TOTAL}`} role="img" aria-label={descricao} focusable="false">
          <line className="grafico-eixo" x1={0} x2={largura} y1={BASE} y2={BASE} />
          {escalaDasBarras(serie).map((b, i) => {
            const x = i * LARGURA_DO_DIA
            const centro = x + LARGURA_DO_DIA / 2
            return (
              <g key={b.dia}>
                {b.altura > 0 && (
                  <>
                    <rect
                      className="grafico-barra"
                      x={x + (LARGURA_DO_DIA - LARGURA_DA_BARRA) / 2}
                      y={BASE - b.altura}
                      width={LARGURA_DA_BARRA}
                      height={b.altura}
                      rx={2}
                    />
                    <text className="grafico-valor" x={centro} y={BASE - b.altura - 4} textAnchor="middle">
                      {b.mensagens}
                    </text>
                  </>
                )}
                <text className="grafico-rotulo-do-dia" x={centro} y={BASE + 14} textAnchor="middle">
                  {b.dia.slice(8)}
                </text>
              </g>
            )
          })}
        </svg>
      )}
      <details className="grafico-tabela">
        <summary>Ver os dados em tabela</summary>
        <div className="tabela-envoltorio">
          <table>
            <caption className="somente-leitor">{descricao}</caption>
            <thead>
              <tr>
                <th scope="col">Dia</th>
                <th scope="col">Mensagens</th>
              </tr>
            </thead>
            <tbody>
              {serie.map((p) => (
                <tr key={p.dia}>
                  <th scope="row">{diaCompleto(p.dia)}</th>
                  <td>{p.mensagens}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
