/**
 * Ilustração da landing (FT-14): cubos isométricos desenhados para este projeto, só em SVG e só com
 * as cores do tema (`--marca-cubo-*`). Decorativa: o texto ao lado diz tudo, por isso `aria-hidden`.
 * Cada cubo é um hexágono de lado `s` repartido em três losangos (topo, face esquerda, face direita).
 */
const RAIZ_DE_3_SOBRE_2 = 0.866

function Cubo({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  const w = s * RAIZ_DE_3_SOBRE_2
  const pontos = (lista: Array<[number, number]>) => lista.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  return (
    <g>
      <polygon className="cubo-topo" points={pontos([[cx, cy - s], [cx + w, cy - s / 2], [cx, cy], [cx - w, cy - s / 2]])} />
      <polygon className="cubo-esquerda" points={pontos([[cx - w, cy - s / 2], [cx, cy], [cx, cy + s], [cx - w, cy + s / 2]])} />
      <polygon className="cubo-direita" points={pontos([[cx, cy], [cx + w, cy - s / 2], [cx + w, cy + s / 2], [cx, cy + s]])} />
    </g>
  )
}

export type ArranjoDeCubos = 'unico' | 'par' | 'pilha'

/** Cubos na ordem de desenho: de trás para a frente, para as faces se cobrirem do jeito certo. */
function cubosDo(arranjo: ArranjoDeCubos, s: number): Array<{ cx: number; cy: number }> {
  const w = s * RAIZ_DE_3_SOBRE_2
  if (arranjo === 'unico') return [{ cx: 0, cy: 0 }]
  if (arranjo === 'par') return [{ cx: -w, cy: -s / 2 }, { cx: w, cy: -s / 2 }, { cx: 0, cy: 0 }]
  return [{ cx: 0, cy: s / 2 }, { cx: 0, cy: -s / 2 }, { cx: 0, cy: -s * 1.5 }]
}

export function CuboIsometrico({ arranjo }: { arranjo: ArranjoDeCubos }) {
  const s = 40
  return (
    <svg className="cubo-svg" viewBox="-110 -80 220 160" aria-hidden="true" focusable="false">
      {cubosDo(arranjo, s).map((c, i) => (
        <Cubo key={i} cx={c.cx} cy={c.cy + 8} s={s} />
      ))}
    </svg>
  )
}
