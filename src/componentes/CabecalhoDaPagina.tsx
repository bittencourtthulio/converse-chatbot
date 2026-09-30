/** Título (h1), subtítulo e, à direita, as ações da tela. Uma vez por página. */
export function CabecalhoDaPagina({
  titulo,
  subtitulo,
  acoes,
}: {
  titulo: string
  subtitulo?: string
  acoes?: React.ReactNode
}) {
  return (
    <div className="pagina-cabecalho">
      <div>
        <h1 className="titulo-da-pagina">{titulo}</h1>
        {subtitulo && <p className="subtitulo-da-pagina">{subtitulo}</p>}
      </div>
      {acoes && <div className="linha">{acoes}</div>}
    </div>
  )
}
