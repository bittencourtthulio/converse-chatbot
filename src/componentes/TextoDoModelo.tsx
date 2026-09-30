import type { ReactNode } from 'react'
import { analisarTexto, type Bloco, type Inline } from '@/componentes/texto-seguro'

function inline(nos: Inline[]): ReactNode[] {
  return nos.map((no, i) => {
    switch (no.tipo) {
      case 'texto':
        return no.texto
      case 'negrito':
        return <strong key={i}>{inline(no.filhos)}</strong>
      case 'codigo':
        return <code key={i}>{no.texto}</code>
      case 'link':
        return (
          <a key={i} href={no.href} target="_blank" rel="noopener noreferrer">
            {inline(no.filhos)}
          </a>
        )
    }
  })
}

function bloco(b: Bloco, i: number): ReactNode {
  switch (b.tipo) {
    case 'paragrafo':
      return <p key={i}>{inline(b.filhos)}</p>
    case 'lista': {
      const itens = b.itens.map((filhos, j) => <li key={j}>{inline(filhos)}</li>)
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
export function TextoDoModelo({ texto }: { texto: string }) {
  return <div className="texto-do-modelo">{analisarTexto(texto).map(bloco)}</div>
}
