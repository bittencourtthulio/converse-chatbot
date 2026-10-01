import { rotuloDoCanal } from '@/servicos/historico-logica'

/**
 * O canal da conversa: texto sempre (nunca só cor), com as cores dos tokens do canal
 * (`--canal-*`, PR-85).
 */
export function BadgeDeCanal({ canal }: { canal: string }) {
  return <span className={`badge-de-canal badge-de-canal-${canal}`}>{rotuloDoCanal(canal)}</span>
}
