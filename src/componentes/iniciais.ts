/** "Ana Maria Souza" -> "AS". Uma palavra só dá uma letra; vazio dá "?". */
export function iniciaisDe(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  const primeira = partes[0]?.[0]
  if (!primeira) return '?'
  const ultima = partes.length > 1 ? partes[partes.length - 1]?.[0] : undefined
  return `${primeira}${ultima ?? ''}`.toLocaleUpperCase('pt-BR')
}
