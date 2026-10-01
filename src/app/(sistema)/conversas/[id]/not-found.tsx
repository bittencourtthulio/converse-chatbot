import Link from 'next/link'
import { EstadoVazio } from '@/componentes/EstadoVazio'

/** Conversa inexistente (ou já apagada). */
export default function ConversaNaoEncontrada() {
  return (
    <section className="cartao" aria-label="Conversa não encontrada">
      <EstadoVazio
        icone="conversa"
        titulo="Conversa não encontrada"
        descricao="Ela não existe ou já foi apagada."
        acao={
          <Link href="/conversas" className="botao secundario">
            Voltar para as conversas
          </Link>
        }
      />
    </section>
  )
}
