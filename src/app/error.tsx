'use client'

import Link from 'next/link'
import { PaginaDeErro } from '@/componentes/PaginaDeErro'

/**
 * Estado de erro das telas fora do sistema (entrar, embed): a mensagem técnica nunca chega à tela
 * (L17); só o código de referência (`digest`), que o operador procura no log do servidor (PR-93).
 */
export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PaginaDeErro
      titulo="Algo deu errado"
      descricao="Não foi possível carregar esta página. Tente de novo; se o problema continuar, avise quem cuida do sistema e informe o código abaixo."
      codigo={error.digest}
    >
      <button type="button" className="primario" onClick={reset}>
        Tentar de novo
      </button>
      <Link className="botao secundario" href="/">
        Voltar ao início
      </Link>
    </PaginaDeErro>
  )
}
