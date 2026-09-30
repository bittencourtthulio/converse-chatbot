/** Um bloco cinza pulsante, decorativo. */
export function Esqueleto({ className = '' }: { className?: string }) {
  return <span className={`esqueleto ${className}`.trim()} aria-hidden="true" />
}

/** O esqueleto de uma tela inteira: título, subtítulo e um cartão de conteúdo. */
export function EsqueletoDePagina() {
  return (
    <div aria-busy="true" role="status">
      <span className="somente-leitor">Carregando…</span>
      <div className="pilha" aria-hidden="true">
        <div>
          <Esqueleto className="esqueleto-titulo" />
          <div style={{ height: 8 }} />
          <Esqueleto className="" />
        </div>
        <Esqueleto className="esqueleto-bloco" />
      </div>
    </div>
  )
}
