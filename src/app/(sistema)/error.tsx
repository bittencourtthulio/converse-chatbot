'use client'

import { Alerta } from '@/componentes/Alerta'
import { CodigoDeReferencia } from '@/componentes/CodigoDeReferencia'

/**
 * Estado de erro de toda tela do sistema. A mensagem técnica nunca chega à
 * tela (L17): só o código de referência (`digest`), que o operador procura
 * no log do servidor (PR-93).
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
        <p>Tente de novo. Se o problema continuar, avise quem cuida do sistema e informe o código abaixo.</p>
        <CodigoDeReferencia codigo={error.digest} />
      </Alerta>
      <div>
        <button type="button" className="primario" onClick={reset}>
          Tentar de novo
        </button>
      </div>
    </div>
  )
}
