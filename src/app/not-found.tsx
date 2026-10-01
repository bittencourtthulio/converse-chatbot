import Link from 'next/link'
import { correlacaoDaRequisicao } from '@/app/correlacao-servidor'
import { PaginaDeErro } from '@/componentes/PaginaDeErro'

/**
 * Página não encontrada. Mostra o código de referência da requisição (o mesmo do cabeçalho
 * `X-Correlacao`) para quem precisar relatar o endereço que não abriu (PR-93).
 */
export default async function NaoEncontrada() {
  return (
    <PaginaDeErro
      titulo="Página não encontrada"
      descricao="O endereço que você abriu não existe ou foi removido."
      codigo={await correlacaoDaRequisicao()}
    >
      <Link className="botao primario" href="/">
        Ir para o painel
      </Link>
    </PaginaDeErro>
  )
}
