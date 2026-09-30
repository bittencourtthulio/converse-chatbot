// Chamado uma vez quando o servidor do Next sobe (PR-05, PR-48). No runtime
// Node devolve a `pendente` as fontes que um reinício deixou em `processando` e
// liga a fila de processamento em segundo plano. A fila é importada de forma
// dinâmica para não ser carregada em outros runtimes, e o processamento não é
// esperado: a subida nunca fica presa a uma fonte lenta.
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  try {
    const { obterFila } = await import('@/servicos/fontes-fila')
    const fila = obterFila()
    await fila.retomar()
    fila.iniciar()
  } catch {
    // Sem a fila, o sistema segue de pé; o operador vê o evento no log.
    console.error(JSON.stringify({ evento: 'fila_nao_iniciou' }))
  }
}
