'use client'

import { useEffect, useRef, useState } from 'react'
import { apagarConversaNoServidor, type ResultadoDeExclusao } from '@/componentes/apagar-conversas'

interface Props {
  conversaId: string
  /** Só para teste: troca a chamada de rede. */
  apagar?: (id: string) => Promise<ResultadoDeExclusao>
  /** Só para teste: troca a navegação de volta para a lista. */
  aoApagar?: () => void
}

/**
 * Exportar (um link para o `.txt`, que funciona sem JavaScript) e Apagar, com confirmação na
 * própria tela, sem a janela nativa do navegador: o primeiro clique só abre a pergunta.
 */
export function AcoesDaConversa({
  conversaId,
  apagar = apagarConversaNoServidor,
  aoApagar = () => {
    // Navegação completa de propósito: a lista precisa vir do servidor, sem cache do cliente,
    // e o teste troca esta função (o roteador do Next não existe fora do aplicativo).
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/conversas'
  },
}: Props) {
  const [confirmando, setConfirmando] = useState(false)
  const [apagando, setApagando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const botaoApagar = useRef<HTMLButtonElement>(null)
  const devolverFoco = useRef(false)

  useEffect(() => {
    if (!confirmando && devolverFoco.current) {
      devolverFoco.current = false
      botaoApagar.current?.focus()
    }
  }, [confirmando])

  async function confirmar() {
    setApagando(true)
    setErro(null)
    const resultado = await apagar(conversaId)
    setApagando(false)
    if (resultado.ok) aoApagar()
    else setErro(resultado.mensagem)
  }

  return (
    <div className="pilha pilha-compacta acoes-da-conversa">
      <div className="linha">
        <a href={`/api/conversas/${conversaId}/exportar`} download className="botao secundario">
          Exportar (.txt)
        </a>
        {!confirmando && (
          <button ref={botaoApagar} type="button" className="botao perigo" onClick={() => setConfirmando(true)}>
            Apagar
          </button>
        )}
      </div>
      {confirmando && (
        <div className="confirmacao-de-exclusao" role="alertdialog" aria-labelledby="apagar-titulo" aria-describedby="apagar-descricao">
          <p className="secao-titulo sem-margem" id="apagar-titulo">
            Apagar esta conversa?
          </p>
          <p className="texto-de-apoio" id="apagar-descricao">
            A conversa e todas as mensagens dela serão apagadas de vez. Isso não pode ser desfeito.
          </p>
          {erro && (
            <p className="fonte-erro" role="alert">
              {erro}
            </p>
          )}
          <div className="linha">
            <button type="button" className="botao perigo" onClick={confirmar} disabled={apagando}>
              {apagando ? 'Apagando…' : 'Confirmar exclusão'}
            </button>
            <button
              type="button"
              className="botao secundario"
              autoFocus
              disabled={apagando}
              onClick={() => {
                devolverFoco.current = true
                setConfirmando(false)
                setErro(null)
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
