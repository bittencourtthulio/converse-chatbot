'use client'

import { useReducer, useState } from 'react'
import { mensagemDaResposta } from '@/componentes/fonte-da-tela'

type Estado = 'inicial' | 'confirmando'

/** A máquina de estados da confirmação, separada para ter teste sem navegador. */
export function proximoEstadoDaExclusaoDeFonte(estado: Estado, evento: 'excluir' | 'cancelar'): Estado {
  if (evento === 'excluir') return 'confirmando'
  return estado === 'confirmando' ? 'inicial' : estado
}

/**
 * Excluir fonte com confirmação na própria linha, sem a janela nativa do
 * navegador: o primeiro clique só abre a pergunta; a exclusão é definitiva e
 * só acontece em "Confirmar exclusão".
 */
export function BotaoExcluirFonte({
  fonte,
  aoExcluir,
  confirmandoInicial = false,
}: {
  fonte: { id: string; agenteId: string; titulo: string }
  aoExcluir: (id: string) => void
  /** Só para teste: começa com a pergunta aberta. */
  confirmandoInicial?: boolean
}) {
  const [estado, enviar] = useReducer(proximoEstadoDaExclusaoDeFonte, confirmandoInicial ? 'confirmando' : 'inicial')
  const [excluindo, setExcluindo] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function confirmar() {
    setExcluindo(true)
    setErro(null)
    try {
      const r = await fetch(`/api/agentes/${fonte.agenteId}/fontes/${fonte.id}`, { method: 'DELETE' })
      if (r.status === 204) {
        aoExcluir(fonte.id)
        return
      }
      setErro(await mensagemDaResposta(r, 'Não foi possível excluir a fonte.'))
    } catch {
      setErro('Sem conexão. Não foi possível excluir a fonte.')
    } finally {
      setExcluindo(false)
    }
  }

  if (estado === 'inicial') {
    return (
      <div className="pilha pilha-compacta">
        <button type="button" className="botao secundario botao-pequeno" onClick={() => enviar('excluir')}>
          Excluir
        </button>
        {erro && <p className="fonte-erro" role="alert">{erro}</p>}
      </div>
    )
  }

  return (
    <div className="confirmacao-de-exclusao" role="alertdialog" aria-labelledby={`excluir-${fonte.id}`}>
      <p className="secao-titulo sem-margem" id={`excluir-${fonte.id}`}>
        Excluir “{fonte.titulo}”?
      </p>
      <p className="texto-de-apoio">O arquivo e os trechos serão apagados de vez. Isso não pode ser desfeito.</p>
      {erro && <p className="fonte-erro" role="alert">{erro}</p>}
      <div className="linha">
        <button type="button" className="botao perigo botao-pequeno" onClick={confirmar} disabled={excluindo}>
          {excluindo ? 'Excluindo…' : 'Confirmar exclusão'}
        </button>
        <button type="button" className="botao secundario botao-pequeno" onClick={() => enviar('cancelar')} disabled={excluindo}>
          Cancelar
        </button>
      </div>
    </div>
  )
}
