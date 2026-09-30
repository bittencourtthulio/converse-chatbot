'use client'

import { Alerta } from '@/componentes/Alerta'

/**
 * Estado de erro de toda tela do sistema. A mensagem técnica nunca chega à
 * tela (L17): só o código de correlação (`digest`), que o operador procura
 * no log do servidor.
 */
export default function MensagemDeErro({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="pilha">
      <Alerta variante="erro">
        <strong>Não foi possível carregar esta tela.</strong>
        <p>
          Tente de novo. Se o problema continuar, avise quem cuida do sistema
          {error.digest ? ` e informe o código ${error.digest}` : ''}.
        </p>
      </Alerta>
      <div>
        <button type="button" className="primario" onClick={reset}>
          Tentar de novo
        </button>
      </div>
    </div>
  )
}
