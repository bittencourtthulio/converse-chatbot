// Chamado uma vez quando o servidor do Next sobe (PR-05, PR-48). Só no runtime Node faz alguma
// coisa, e o import dinâmico fica dentro do `if` positivo para o bundle de borda não carregar a
// parte Node (ver `instrumentation-node.ts`). O processamento da fila não é esperado.
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { registrarNoNode } = await import('./instrumentation-node')
    await registrarNoNode()
  }
}

const FORMATO_DA_CORRELACAO = /^[0-9a-f]{8}$/

/**
 * Erro de servidor visto pelo Next (render, rota, ação ou proxy): grava a linha `erro_na_requisicao`
 * que liga o código mostrado na página de erro (`digest`) à correlação da requisição (FT-11, PR-93).
 * Só o nome do erro, a rota (o padrão, nunca o endereço com a busca) e os códigos: nunca a mensagem.
 */
export async function onRequestError(
  erro: unknown,
  request: { path: string; method: string; headers: { [chave: string]: string | string[] | undefined } },
  contexto: { routePath: string; routeType: string },
): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const { camposDoErro, log } = await import('@/lib/log')
  const digest = typeof erro === 'object' && erro !== null && 'digest' in erro ? String((erro as { digest: unknown }).digest) : undefined
  const bruto = request.headers['x-correlacao']
  const valor = Array.isArray(bruto) ? bruto[0] : bruto
  const correlacao = valor && FORMATO_DA_CORRELACAO.test(valor) ? valor : undefined
  log.erro('erro_na_requisicao', {
    ...(digest && { referencia: digest }),
    ...(correlacao && { correlacao }),
    rota: contexto.routePath,
    tipo: contexto.routeType,
    metodo: request.method,
    ...camposDoErro(erro),
  })
}
