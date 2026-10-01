// Chamadas de rede da tela de conversas (FT-09): apagar em lote e apagar uma. Módulo puro,
// sem React, com o `fetch` injetável para o teste não precisar de rede (PR-80).
import { mensagemDaResposta } from '@/componentes/fonte-da-tela'

export type ResultadoDeExclusao = { ok: true; apagadas: number } | { ok: false; mensagem: string }

async function enviar(
  buscar: typeof fetch,
  url: string,
  init: RequestInit,
  padrao: string,
): Promise<ResultadoDeExclusao> {
  try {
    const r = await buscar(url, init)
    if (r.ok) {
      const corpo = (await r.json().catch(() => ({}))) as { apagadas?: unknown }
      return { ok: true, apagadas: typeof corpo.apagadas === 'number' ? corpo.apagadas : 0 }
    }
    return { ok: false, mensagem: await mensagemDaResposta(r, padrao) }
  } catch {
    return { ok: false, mensagem: 'Sem conexão. Não foi possível apagar.' }
  }
}

/** POST /api/conversas/apagar com os ids escolhidos. */
export function apagarConversasNoServidor(ids: string[], buscar: typeof fetch = fetch): Promise<ResultadoDeExclusao> {
  return enviar(
    buscar,
    '/api/conversas/apagar',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) },
    'Não foi possível apagar as conversas.',
  )
}

/** DELETE /api/conversas/[id]. */
export function apagarConversaNoServidor(id: string, buscar: typeof fetch = fetch): Promise<ResultadoDeExclusao> {
  return enviar(buscar, `/api/conversas/${encodeURIComponent(id)}`, { method: 'DELETE' }, 'Não foi possível apagar a conversa.')
}
