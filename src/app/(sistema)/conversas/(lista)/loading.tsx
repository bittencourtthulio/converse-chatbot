import { EsqueletoDePagina } from '@/componentes/Esqueleto'

/**
 * Carregando da lista de conversas. Mora no grupo `(lista)`, e não em `conversas/`, para
 * não envolver `[id]`: o carregamento acima do `notFound` faria o 404 sair como 200.
 */
export default function Carregando() {
  return <EsqueletoDePagina />
}
