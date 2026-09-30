import Link from 'next/link'
import { Icone } from '@/componentes/Icones'

/** Marca do produto: ícone em SVG e o nome (APP_NAME, vindo do servidor). */
export function Logotipo({
  nome,
  aoNavegar,
}: {
  nome: string
  aoNavegar?: () => void
}) {
  return (
    <Link href="/" className="logotipo" onClick={aoNavegar} aria-label={`${nome}, ir para o painel`}>
      <span className="logotipo-marca">
        <Icone nome="conversa" tamanho={18} />
      </span>
      <span className="logotipo-nome">{nome}</span>
    </Link>
  )
}
