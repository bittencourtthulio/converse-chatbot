// Cifra de segredo em repouso (PR-14, PR-39): AES-256-GCM, IV aleatório por
// gravação, formato versionado `v1:<iv>:<etiqueta>:<cifrado>` em base64url.
// A chave (`ENCRYPTION_KEY`) só é lida e validada quando um segredo é cifrado
// ou decifrado: a ausência dela não derruba o resto do sistema.
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { ambiente } from '@/lib/ambiente'
import { ErroDeAplicacao } from '@/lib/erros'

const VERSAO = 'v1'
const TAMANHO_DO_IV = 12
const TAMANHO_DA_CHAVE = 32

const configuracaoInvalida = (detalhe: string) =>
  new ErroDeAplicacao(
    `ENCRYPTION_KEY ${detalhe}. Defina 32 bytes em hexadecimal ou base64 ` +
      '(veja o .env.example).',
    500,
    'configuracao_invalida',
  )

const segredoIlegivel = (detalhe: string) =>
  new ErroDeAplicacao(
    `Não foi possível ler o segredo gravado: ${detalhe}.`,
    500,
    'segredo_ilegivel',
  )

/** Lê e valida a chave. Nunca inclui o valor dela em mensagem. */
function chave(): Buffer {
  const bruta = ambiente.chaveDeCriptografia
  if (!bruta) throw configuracaoInvalida('não está definida')

  let bytes: Buffer | null = null
  if (/^[0-9a-fA-F]{64}$/.test(bruta)) bytes = Buffer.from(bruta, 'hex')
  else if (/^[A-Za-z0-9+/_-]+={0,2}$/.test(bruta)) {
    bytes = Buffer.from(bruta, 'base64')
  }
  if (!bytes || bytes.length !== TAMANHO_DA_CHAVE) {
    throw configuracaoInvalida('precisa ter exatamente 32 bytes')
  }
  return bytes
}

export function cifrar(texto: string): string {
  const iv = randomBytes(TAMANHO_DO_IV)
  const cifra = createCipheriv('aes-256-gcm', chave(), iv)
  const cifrado = Buffer.concat([cifra.update(texto, 'utf8'), cifra.final()])
  return [
    VERSAO,
    iv.toString('base64url'),
    cifra.getAuthTag().toString('base64url'),
    cifrado.toString('base64url'),
  ].join(':')
}

export function decifrar(cifrado: string): string {
  const partes = cifrado.split(':')
  if (partes.length !== 4) throw segredoIlegivel('formato desconhecido')
  const [versao, iv, etiqueta, dados] = partes as [string, string, string, string]
  if (versao !== VERSAO) throw segredoIlegivel('versão desconhecida')

  const bytesDaChave = chave()
  try {
    const decifra = createDecipheriv(
      'aes-256-gcm',
      bytesDaChave,
      Buffer.from(iv, 'base64url'),
    )
    decifra.setAuthTag(Buffer.from(etiqueta, 'base64url'))
    return Buffer.concat([
      decifra.update(Buffer.from(dados, 'base64url')),
      decifra.final(),
    ]).toString('utf8')
  } catch {
    // Chave errada e dado adulterado são indistinguíveis no GCM.
    throw segredoIlegivel('chave diferente ou dado alterado')
  }
}

/** `sk-or-v1-abcdef1234` vira `sk-or-…1234`. Segredo curto não mostra o começo. */
export function mascararSegredo(segredo: string): string {
  if (segredo.length < 12) {
    return segredo.length > 4 ? `…${segredo.slice(-4)}` : '…'
  }
  return `${segredo.slice(0, 6)}…${segredo.slice(-4)}`
}
