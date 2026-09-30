import Link from 'next/link'
import { Icone } from '@/componentes/Icones'

/**
 * Marca do produto: ícone em SVG e o nome (APP_NAME, vindo do servidor).
 * `href={null}` mostra a marca sem link (tela de login).
 */
export function Logotipo({
  nome,
  href = '/',
  aoNavegar,
}: {
  nome: string
  href?: string | null
  aoNavegar?: () => void
}) {
  const conteudo = (
    <>
      <span className="logotipo-marca">
        <Icone nome="conversa" tamanho={18} />
      </span>
      <span className="logotipo-nome">{nome}</span>
    </>
  )
  if (href === null) return <span className="logotipo">{conteudo}</span>
  return (
    <Link href={href} className="logotipo" onClick={aoNavegar} aria-label={`${nome}, ir para o painel`}>
      {conteudo}
    </Link>
  )
}
