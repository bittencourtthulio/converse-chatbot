import { headers } from 'next/headers'
import { ambiente } from '@/lib/ambiente'

const DESCONHECIDO = 'desconhecido'
const TAMANHO_MAXIMO = 64

interface Cabecalhos {
  get(nome: string): string | null
}

/**
 * O IP de quem fez a requisição. `X-Forwarded-For` só vale quando a
 * instalação declara confiar no proxy (`TRUST_PROXY=1`): sem proxy o
 * cabeçalho é forjável, e forjá-lo bastaria para fugir do limite de uso.
 */
export function ipDeCabecalhos(
  cabecalhos: Cabecalhos,
  confiarNoProxy: boolean,
): string {
  if (!confiarNoProxy) return DESCONHECIDO
  const primeiro = cabecalhos.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (!primeiro) return DESCONHECIDO
  return primeiro.slice(0, TAMANHO_MAXIMO)
}

/** O IP da requisição em andamento (Server Action ou rota). */
export async function ipDoCliente(): Promise<string> {
  return ipDeCabecalhos(await headers(), ambiente.confiarNoProxy)
}
