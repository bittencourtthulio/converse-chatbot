'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { ConfiguracaoDoEmbed } from '@/componentes/ChatEmbutido'
import { ORIGEM_DAS_MENSAGENS, mensagemDePrevia } from '@/componentes/embed-mensagens'

/**
 * A prévia ao vivo (PR-61): o chat de verdade, no `/embed/[id]?previa=1`, para o
 * usuário logado, mesmo com o chat desligado. A configuração ainda não salva
 * chega ao iframe por postMessage da mesma origem; salvar (nova `versao`) recarrega
 * o iframe com o que o servidor gravou.
 */
export function PreviaDoChat({
  agenteId,
  versao,
  rascunho,
}: {
  agenteId: string
  /** Muda a cada salvamento: troca a chave e recarrega o iframe. */
  versao: string
  rascunho?: Partial<ConfiguracaoDoEmbed>
}) {
  const quadro = useRef<HTMLIFrameElement>(null)
  const pronto = useRef(false)

  const enviar = useCallback((conteudo?: Partial<ConfiguracaoDoEmbed>) => {
    const janela = quadro.current?.contentWindow
    if (!janela || !conteudo || !pronto.current) return
    janela.postMessage(mensagemDePrevia(conteudo), window.location.origin)
  }, [])

  // O iframe avisa que hidratou; só então ele escuta. Mensagem de outra origem ou de outra janela é ignorada.
  useEffect(() => {
    const ouvir = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== quadro.current?.contentWindow) return
      const d = e.data as { origem?: unknown; tipo?: unknown } | null
      if (d && d.origem === ORIGEM_DAS_MENSAGENS && d.tipo === 'pronto') {
        pronto.current = true
        enviar(rascunho)
      }
    }
    window.addEventListener('message', ouvir)
    return () => window.removeEventListener('message', ouvir)
  }, [enviar, rascunho])

  useEffect(() => enviar(rascunho), [enviar, rascunho])

  return (
    <section className="cartao previa-do-chat" aria-labelledby="titulo-da-previa">
      <div className="previa-do-chat-topo">
        <h2 id="titulo-da-previa" className="secao-titulo sem-margem">
          Pré-visualização
        </h2>
      </div>
      <iframe
        key={versao}
        ref={quadro}
        title="Pré-visualização do chat"
        src={`/embed/${encodeURIComponent(agenteId)}?previa=1`}
        onLoad={() => {
          pronto.current = false
        }}
      />
      <p className="previa-do-chat-nota">
        É o chat de verdade, com as mudanças do formulário antes de salvar. As mensagens daqui não contam no limite
        diário.
      </p>
    </section>
  )
}
