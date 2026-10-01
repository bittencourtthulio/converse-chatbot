'use client'

import { useEffect, useReducer, useRef } from 'react'
import { ListaDeConversas, type ItemDaLista } from '@/componentes/ListaDeConversas'
import { apagarConversasNoServidor, type ResultadoDeExclusao } from '@/componentes/apagar-conversas'
import { ESTADO_INICIAL_DO_LOTE, reduzirLote } from '@/componentes/conversas-logica'

interface Props {
  itens: ItemDaLista[]
  /** Só para teste: troca a chamada de rede. */
  apagar?: (ids: string[]) => Promise<ResultadoDeExclusao>
  /** Só para teste: troca o recarregamento da página depois de apagar. */
  recarregar?: () => void
}

const plural = (n: number, um: string, varios: string) => (n === 1 ? um : varios)

/**
 * A lista com caixas de seleção e a barra de ações em lote. Apagar pede confirmação na
 * própria tela (nunca a janela nativa do navegador): o primeiro clique só abre a pergunta;
 * a exclusão é definitiva e só acontece em "Confirmar exclusão".
 */
export function ListaComSelecao({ itens, apagar = apagarConversasNoServidor, recarregar = () => window.location.reload() }: Props) {
  const [estado, enviar] = useReducer(reduzirLote, ESTADO_INICIAL_DO_LOTE)
  const botaoApagar = useRef<HTMLButtonElement>(null)
  const devolverFoco = useRef(false)
  const ids = itens.map((i) => i.id)
  const total = estado.selecionadas.length
  const todasMarcadas = ids.length > 0 && ids.every((id) => estado.selecionadas.includes(id))

  // Ao cancelar, o foco volta ao botão que abriu a pergunta.
  useEffect(() => {
    if (!estado.confirmando && devolverFoco.current) {
      devolverFoco.current = false
      botaoApagar.current?.focus()
    }
  }, [estado.confirmando])

  async function confirmar() {
    enviar({ tipo: 'apagando' })
    const resultado = await apagar(estado.selecionadas)
    if (resultado.ok) {
      enviar({ tipo: 'concluido' })
      recarregar()
    } else {
      enviar({ tipo: 'falhou', mensagem: resultado.mensagem })
    }
  }

  return (
    <div className="pilha pilha-compacta">
      <div className="barra-do-lote">
        <button
          type="button"
          className="botao secundario botao-pequeno"
          onClick={() => enviar(todasMarcadas ? { tipo: 'desmarcarTodas', ids } : { tipo: 'marcarTodas', ids })}
        >
          {todasMarcadas ? 'Desmarcar todas desta página' : 'Selecionar todas desta página'}
        </button>
        <p className="barra-do-lote-contagem" role="status" aria-live="polite">
          {total > 0 ? `${total} ${plural(total, 'selecionada', 'selecionadas')}` : ''}
          {estado.aviso && <span className="texto-de-apoio"> {estado.aviso}</span>}
        </p>
        {total > 0 && !estado.confirmando && (
          <div className="linha">
            <button ref={botaoApagar} type="button" className="botao perigo botao-pequeno" onClick={() => enviar({ tipo: 'pedirConfirmacao' })}>
              Apagar selecionadas
            </button>
            <button type="button" className="botao secundario botao-pequeno" onClick={() => enviar({ tipo: 'limpar' })}>
              Limpar seleção
            </button>
          </div>
        )}
      </div>

      {estado.confirmando && (
        <div className="confirmacao-de-exclusao" role="alertdialog" aria-labelledby="lote-titulo" aria-describedby="lote-descricao">
          <p className="secao-titulo sem-margem" id="lote-titulo">
            Apagar {total} {plural(total, 'conversa', 'conversas')}?
          </p>
          <p className="texto-de-apoio" id="lote-descricao">
            As mensagens {plural(total, 'dela', 'delas')} serão apagadas de vez. Isso não pode ser desfeito.
          </p>
          {estado.erro && (
            <p className="fonte-erro" role="alert">
              {estado.erro}
            </p>
          )}
          <div className="linha">
            <button type="button" className="botao perigo botao-pequeno" onClick={confirmar} disabled={estado.apagando}>
              {estado.apagando ? 'Apagando…' : 'Confirmar exclusão'}
            </button>
            <button
              type="button"
              className="botao secundario botao-pequeno"
              autoFocus
              disabled={estado.apagando}
              onClick={() => {
                devolverFoco.current = true
                enviar({ tipo: 'cancelar' })
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <section className="cartao" aria-label="Lista de conversas">
        <ListaDeConversas
          itens={itens}
          selecionadas={estado.selecionadas}
          aoAlternar={(id) => enviar({ tipo: 'alternar', id })}
          aoAlternarTodas={(marcar, lista) => enviar(marcar ? { tipo: 'marcarTodas', ids: lista } : { tipo: 'desmarcarTodas', ids: lista })}
        />
      </section>
    </div>
  )
}
