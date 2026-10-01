import { EsqueletoDePagina } from '@/componentes/Esqueleto'

/** Carregando do painel. Mora no grupo `(painel)`, e não em `(sistema)`, para não envolver as outras rotas (o `notFound` delas sairia como 200). */
export default function Carregando() {
  return <EsqueletoDePagina />
}
