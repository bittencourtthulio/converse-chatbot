import type { ReactNode } from 'react'
import { analisarTexto, type Bloco, type Inline } from '@/componentes/texto-seguro'

/** Quem trata o clique numa referência [n]; sem ele, a referência é só um marcador. */
type AoClicarNaReferencia = (n: number) => void

function inline(nos: Inline[], aoReferenciar?: AoClicarNaReferencia): ReactNode[] {
  return nos.map((no, i) => {
    switch (no.tipo) {
      case 'texto':
        return no.texto
      case 'negrito':
        return <strong key={i}>{inline(no.filhos, aoReferenciar)}</strong>
      case 'codigo':
        return <code key={i}>{no.texto}</code>
      case 'link':
        return (
          <a key={i} href={no.href} target="_blank" rel="noopener noreferrer">
            {inline(no.filhos, aoReferenciar)}
          </a>
        )
      case 'referencia':
        return (
          <button
            key={i}
            type="button"
            className="referencia-de-fonte"
            data-referencia={no.n}
            aria-label={`Ver a fonte do trecho [${no.n}]`}
            onClick={aoReferenciar ? () => aoReferenciar(no.n) : undefined}
          >
            [{no.n}]
          </button>
        )
    }
  })
}

function bloco(b: Bloco, i: number, aoReferenciar?: AoClicarNaReferencia): ReactNode {
  switch (b.tipo) {
    case 'paragrafo':
      return <p key={i}>{inline(b.filhos, aoReferenciar)}</p>
    case 'lista': {
      const itens = b.itens.map((filhos, j) => <li key={j}>{inline(filhos, aoReferenciar)}</li>)
      return b.ordenada ? <ol key={i}>{itens}</ol> : <ul key={i}>{itens}</ul>
    }
    case 'bloco-de-codigo':
      return (
        <pre key={i}>
          <code>{b.texto}</code>
        </pre>
      )
  }
}

/**
 * A resposta do modelo como elementos React: parágrafos, listas, código e
 * links http(s). Todo texto passa pelo React, que o escapa; não há HTML cru.
 */
export function TextoDoModelo({
  texto,
  referencias,
  aoReferenciar,
}: {
  texto: string
  /** Números [n] que são referências a fontes (FT-05); os outros ficam como texto. */
  referencias?: number[]
  aoReferenciar?: AoClicarNaReferencia
}) {
  const blocos = analisarTexto(texto, { referencias })
  return <div className="texto-do-modelo">{blocos.map((b, i) => bloco(b, i, aoReferenciar))}</div>
}
