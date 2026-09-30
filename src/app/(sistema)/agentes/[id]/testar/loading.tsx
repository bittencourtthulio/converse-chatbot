import { Esqueleto } from '@/componentes/Esqueleto'

/** Carregando a conversa de teste: o quadro de mensagens e o campo de envio. */
export default function CarregandoTestar() {
  return (
    <div className="chat" aria-busy="true" role="status">
      <span className="somente-leitor">Carregando a conversa…</span>
      <div className="chat-topo" aria-hidden="true">
        <Esqueleto className="esqueleto-subtitulo" />
      </div>
      <Esqueleto className="esqueleto-bloco" />
      <Esqueleto className="esqueleto-subtitulo" />
    </div>
  )
}
