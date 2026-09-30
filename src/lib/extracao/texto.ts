// TXT e MD: o texto decodificado, como está (o Markdown fica com os marcadores,
// que ajudam o modelo a ler títulos e listas).
import { decodificarTexto } from './conteudo'

export function extrairTextoSimples(bytes: Uint8Array): string {
  return decodificarTexto(bytes)
}
