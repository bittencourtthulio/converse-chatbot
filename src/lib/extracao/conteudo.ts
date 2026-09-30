// Conferência do conteúdo real de um arquivo (PR-13, PR-45): a extensão diz o
// formato, mas o que vale são os bytes. Mensagens em português, sem caminho.
import { ErroDeAplicacao } from '../erros'
import type { Formato } from './formatos'

const conteudoInvalido = (mensagem: string) =>
  new ErroDeAplicacao(mensagem, 422, 'conteudo_invalido')

/** PDF de verdade começa por `%PDF-`. */
export function conferirPdf(bytes: Uint8Array): void {
  const assinatura = Buffer.from(bytes.subarray(0, 5)).toString('latin1')
  if (assinatura !== '%PDF-') {
    throw conteudoInvalido('Este arquivo não é um PDF válido: o conteúdo não corresponde à extensão .pdf.')
  }
}

/**
 * Decodifica texto: UTF-8 (BOM removido) e, se os bytes não forem UTF-8
 * válido, Latin-1. Byte nulo indica binário ou UTF-16 e recusa o arquivo.
 */
export function decodificarTexto(bytes: Uint8Array): string {
  if (bytes.includes(0)) {
    throw conteudoInvalido('Este arquivo não parece ser texto: contém dados binários.')
  }
  try {
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(bytes)
  } catch {
    // TextDecoder('windows-1252') é o que a web chama de Latin-1.
    return new TextDecoder('windows-1252').decode(bytes)
  }
}

/** Decodifica e confere um formato de texto; devolve o texto decodificado. */
export function conferirConteudoDeTexto(formato: Formato, bytes: Uint8Array): string {
  const texto = decodificarTexto(bytes)
  if (formato === 'json') {
    try {
      JSON.parse(texto)
    } catch {
      throw conteudoInvalido('O arquivo JSON é inválido: não foi possível ler a estrutura.')
    }
  }
  return texto
}
