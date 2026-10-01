// A correlação da requisição que está sendo atendida (FT-11, PR-93). O `src/proxy.ts` gera o código
// de toda requisição e o repassa no cabeçalho `x-correlacao`; as rotas e as páginas o leem aqui
// para devolver ao usuário o mesmo código que vai ao log e ao cabeçalho de resposta `X-Correlacao`.
// Vive em `src/app` porque usa `next/headers`; `src/lib/log.ts` não conhece o Next.
import { headers } from 'next/headers'
import { novaCorrelacao } from '@/lib/log'

const FORMATO = /^[0-9a-f]{8}$/

/**
 * O código de correlação da requisição atual. Sem cabeçalho (rota que o proxy não cobre), com
 * valor fora do formato ou fora de uma requisição, gera um código novo: quem pede sempre recebe
 * um código que pode mostrar e gravar.
 */
export async function correlacaoDaRequisicao(): Promise<string> {
  try {
    const valor = (await headers()).get('x-correlacao')
    if (valor && FORMATO.test(valor)) return valor
  } catch {
    // Fora do escopo de uma requisição: segue para o código novo.
  }
  return novaCorrelacao()
}
