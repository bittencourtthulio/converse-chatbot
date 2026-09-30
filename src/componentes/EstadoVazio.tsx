import { Icone } from '@/componentes/Icones'
import type { NomeDeIcone } from '@/componentes/itens-de-menu'

/**
 * Estado vazio: explica o que falta e, quando houver, dá a ação. Toda tela que
 * busca dado precisa dele (PR-23).
 */
export function EstadoVazio({
  titulo,
  descricao,
  icone = 'caixa-vazia',
  acao,
}: {
  titulo: string
  descricao: string
  icone?: NomeDeIcone
  acao?: React.ReactNode
}) {
  return (
    <div className="estado-vazio" role="status">
      <span className="estado-vazio-icone">
        <Icone nome={icone} tamanho={26} />
      </span>
      <p className="estado-vazio-titulo">{titulo}</p>
      <p className="estado-vazio-descricao">{descricao}</p>
      {acao && <div className="estado-vazio-acao">{acao}</div>}
    </div>
  )
}
