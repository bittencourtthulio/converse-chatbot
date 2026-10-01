'use client'

import { PaginaDeErro } from '@/componentes/PaginaDeErro'
import '../estilos/global.css'

/**
 * Erro no layout raiz: substitui o layout inteiro, por isso traz o próprio `html` e `body` e o
 * CSS. Sem o script do tema, o tema segue a preferência do sistema (PR-93).
 */
export default function ErroGlobal({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body>
        <PaginaDeErro
          titulo="Algo deu errado"
          descricao="O sistema não conseguiu carregar. Tente de novo; se o problema continuar, avise quem cuida do sistema e informe o código abaixo."
          codigo={error.digest}
        >
          <button type="button" className="primario" onClick={reset}>
            Tentar de novo
          </button>
          {/* Navegação completa de propósito: o layout raiz quebrou e o roteador não é confiável. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="botao secundario" href="/">
            Voltar ao início
          </a>
        </PaginaDeErro>
      </body>
    </html>
  )
}
