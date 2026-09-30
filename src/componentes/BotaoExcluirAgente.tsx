'use client'

import { useActionState, useReducer } from 'react'
import { useFormStatus } from 'react-dom'
import type { AcaoDeFormulario } from '@/componentes/Formulario'
import { Alerta } from '@/componentes/Alerta'

type Estado = 'inicial' | 'confirmando'

/** A máquina de estados da confirmação, separada para ter teste sem navegador. */
export function proximoEstadoDaExclusao(estado: Estado, evento: 'excluir' | 'cancelar'): Estado {
  if (evento === 'excluir') return 'confirmando'
  return estado === 'confirmando' ? 'inicial' : estado
}

function BotaoDeConfirmar() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="botao perigo" disabled={pending}>
      {pending ? 'Excluindo…' : 'Confirmar exclusão'}
    </button>
  )
}

/**
 * Excluir agente com confirmação na própria tela, sem a janela nativa do navegador: o
 * primeiro clique só abre o bloco de confirmação; a exclusão é definitiva
 * (PR-40) e só acontece em "Confirmar exclusão".
 */
export function BotaoExcluirAgente({
  agente,
  acao,
  confirmandoInicial = false,
}: {
  agente: { id: string; nome: string }
  acao: AcaoDeFormulario
  /** Só para teste: começa com o bloco de confirmação aberto. */
  confirmandoInicial?: boolean
}) {
  const [estado, enviar] = useReducer(
    proximoEstadoDaExclusao,
    confirmandoInicial ? 'confirmando' : 'inicial',
  )
  const [retorno, executar] = useActionState(acao, {})

  if (estado === 'inicial') {
    return (
      <div className="pilha pilha-compacta">
        {retorno.erro && <Alerta variante="erro">{retorno.erro}</Alerta>}
        <div>
          <button type="button" className="botao secundario" onClick={() => enviar('excluir')}>
            Excluir agente
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      action={executar}
      className="confirmacao-de-exclusao"
      role="alertdialog"
      aria-labelledby="titulo-exclusao"
      aria-describedby="descricao-exclusao"
    >
      <input type="hidden" name="id" value={agente.id} />
      <p className="secao-titulo sem-margem" id="titulo-exclusao">
        Excluir “{agente.nome}”?
      </p>
      <p className="texto-de-apoio" id="descricao-exclusao">
        O agente e as configurações dele serão apagados de vez. Isso não pode ser desfeito.
      </p>
      <div className="linha">
        <BotaoDeConfirmar />
        <button type="button" className="botao secundario" onClick={() => enviar('cancelar')}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
