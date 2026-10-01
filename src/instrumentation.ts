// Chamado uma vez quando o servidor do Next sobe (PR-05, PR-48). No runtime
// Node devolve a `pendente` as fontes que um reinício deixou em `processando` e
// liga a fila de processamento em segundo plano. A fila é importada de forma
// dinâmica para não ser carregada em outros runtimes, e o processamento não é
// esperado: a subida nunca fica presa a uma fonte lenta. Também liga a auditoria aos pontos
// de extensão de canal e de conversa apagada e inicia o expurgo automático (FT-10, PR-86,
// PR-89): a primeira rodada é 1 minuto depois, então a subida não espera por ela.
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  // Import dinâmico: o log usa módulos do Node e este arquivo também é analisado para o runtime de borda.
  const { camposDoErro, log } = await import('@/lib/log')
  try {
    const { ligarAuditoria } = await import('@/servicos/auditoria-ouvintes')
    ligarAuditoria()
  } catch (erro) {
    log.erro('auditoria_nao_ligou', camposDoErro(erro))
  }
  try {
    const { obterAgendadorDoExpurgo } = await import('@/servicos/expurgo')
    obterAgendadorDoExpurgo().iniciar()
  } catch (erro) {
    log.erro('expurgo_nao_iniciou', camposDoErro(erro))
  }
  try {
    const { obterFila } = await import('@/servicos/fontes-fila')
    const fila = obterFila()
    await fila.retomar()
    fila.iniciar()
  } catch (erro) {
    // Sem a fila, o sistema segue de pé; o operador vê o evento no log.
    log.erro('fila_nao_iniciou', camposDoErro(erro))
  }
}
