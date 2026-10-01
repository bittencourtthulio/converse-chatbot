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
  const { camposDoErro, filtrarConsoleDoNext, log } = await import('@/lib/log')
  // Em produção o erro que o Next imprime sozinho (mensagem e pilha) vira uma linha estruturada.
  if (process.env.NODE_ENV === 'production') filtrarConsoleDoNext()
  // Configuração validada antes de qualquer tarefa (L20, PR-94): em produção, variável obrigatória ausente
  // derruba o start com os nomes (nunca os valores) e `APP_URL` ausente ou sem HTTPS é só aviso.
  const { ErroDeConfiguracao, validarAmbiente } = await import('@/lib/ambiente')
  try {
    for (const aviso of validarAmbiente().avisos) log.aviso('configuracao_aviso', { aviso })
  } catch (erro) {
    // A falha sobe de propósito: sem as variáveis o servidor não pode servir e o processo termina.
    if (erro instanceof ErroDeConfiguracao) log.erro('configuracao_invalida', { variaveis: erro.erros })
    throw erro
  }
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
