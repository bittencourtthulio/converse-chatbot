import { EsqueletoDePagina } from '@/componentes/Esqueleto'

/**
 * Carregando da lista de agentes. Mora no grupo `(lista)`, e não em `agentes/`,
 * para não envolver `[id]`: o carregamento acima do layout do agente faria o 404
 * de id inexistente sair como 200 (a resposta começaria antes do `notFound`).
 */
export default function Carregando() {
  return <EsqueletoDePagina />
}
