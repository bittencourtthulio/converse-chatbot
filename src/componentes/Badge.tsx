type Variante = 'neutro' | 'acento' | 'sucesso' | 'perigo' | 'aviso'

/** Etiqueta curta de situação. Nunca só cor: o texto diz o estado. */
export function Badge({
  variante = 'neutro',
  children,
}: {
  variante?: Variante
  children: React.ReactNode
}) {
  const classe = variante === 'neutro' ? 'badge' : `badge badge-${variante}`
  return <span className={classe}>{children}</span>
}
