import { CodigoDeReferencia } from '@/componentes/CodigoDeReferencia'
import { Icone } from '@/componentes/Icones'

/**
 * A página de tela cheia dos erros fora do sistema (erro, erro global e não encontrada), no mesmo
 * estilo do login: cartão centrado, ícone, título, explicação, código de referência e as ações.
 */
export function PaginaDeErro({
  titulo,
  descricao,
  codigo,
  children,
}: {
  titulo: string
  descricao: string
  codigo?: string | null
  children?: React.ReactNode
}) {
  return (
    <main className="login">
      <div className="login-cartao pagina-de-erro">
        <div className="pagina-de-erro-icone" aria-hidden="true">
          <Icone nome="alerta" tamanho={28} />
        </div>
        <h1 className="login-titulo">{titulo}</h1>
        <p className="login-subtitulo">{descricao}</p>
        <CodigoDeReferencia codigo={codigo} />
        {children && <div className="pagina-de-erro-acoes">{children}</div>}
      </div>
    </main>
  )
}
