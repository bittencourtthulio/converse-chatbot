// Parte Node da subida do servidor (PR-05, PR-48), separada de `instrumentation.ts` para que o
// bundle do runtime de borda não alcance módulos do Node (`node:zlib` da extração, banco, fila): o
// Next só descarta um import dinâmico guardado por `NEXT_RUNTIME === 'nodejs'` positivo.
// Devolve a `pendente` as fontes que um reinício deixou em `processando` e liga a fila de
// processamento em segundo plano, sem esperá-la: a subida nunca fica presa a uma fonte lenta.
// Também liga a auditoria aos pontos de extensão de canal e de conversa apagada e inicia o expurgo
// automático (FT-10, PR-86, PR-89): a primeira rodada é 1 minuto depois, então a subida não espera por ela.
export async function registrarNoNode(): Promise<void> {
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
  try {
    const { obterRecebimentoTelegram } = await import('@/servicos/telegram-recebimento')
    obterRecebimentoTelegram().iniciar()
  } catch (erro) {
    log.erro('telegram_recebimento_nao_iniciou', camposDoErro(erro))
  }
  // Desligamento limpo (FT-11, PR-99): só com NEXT_MANUAL_SIG_HANDLE=1, que desliga o tratamento de sinal do
  // próprio Next (o contêiner define). Sem a variável o Next trata SIGTERM sozinho e sai sem esperar a fila.
  if (process.env.NEXT_MANUAL_SIG_HANDLE === '1') instalarDesligamento()
}

const PRAZO_DA_FILA_NO_DESLIGAMENTO_MS = 20_000
const CHAVE_DO_DESLIGAMENTO = Symbol.for('converse.desligamentoInstalado')

export interface OpcoesDoDesligamento {
  agendador?: { parar(): void }
  fila?: { parar(): void; aguardarEncerramento(prazoMs: number): Promise<boolean> }
  /** Espera as gravações de auditoria de melhor esforço em andamento. */
  auditoria?: () => Promise<void>
  prazoDaFilaMs?: number
  sair?: (codigo: number) => void
  sinal?: string
}

/**
 * O desligamento limpo: para o agendador do expurgo, manda a fila parar de reivindicar e espera ela
 * terminar o passo corrente (até o prazo; o que sobrar volta a `pendente` e é retomado no próximo start),
 * espera as gravações de auditoria pendentes, registra e sai com 0. Cada passo é independente: a falha de
 * um vai ao log (só o nome do erro) e não impede os outros nem a saída.
 */
export async function desligarComCalma(opcoes: OpcoesDoDesligamento = {}): Promise<void> {
  const { camposDoErro, log } = await import('@/lib/log')
  log.info('desligamento_iniciado', { ...(opcoes.sinal && { sinal: opcoes.sinal }) })
  const passo = async (nome: string, tarefa: () => void | Promise<unknown>) => {
    try {
      return await tarefa()
    } catch (erro) {
      log.erro('desligamento_falhou', { passo: nome, ...camposDoErro(erro) })
      return undefined
    }
  }
  const agendador = opcoes.agendador ?? (await import('@/servicos/expurgo')).obterAgendadorDoExpurgo()
  const fila = opcoes.fila ?? (await import('@/servicos/fontes-fila')).obterFila()
  const auditoria = opcoes.auditoria ?? (await import('@/servicos/auditoria')).aguardarGravacoesPendentes
  await passo('telegram', async () => {
    const { obterRecebimentoTelegram } = await import('@/servicos/telegram-recebimento')
    const recebimento = obterRecebimentoTelegram()
    recebimento.parar()
    await recebimento.ocioso()
  })
  await passo('expurgo', () => agendador.parar())
  await passo('fila_parar', () => fila.parar())
  const ociosa = await passo('fila_aguardar', () => fila.aguardarEncerramento(opcoes.prazoDaFilaMs ?? PRAZO_DA_FILA_NO_DESLIGAMENTO_MS))
  await passo('auditoria', () => auditoria())
  log.info('desligamento_concluido', { filaOciosa: ociosa === true })
  ;(opcoes.sair ?? ((codigo: number) => process.exit(codigo)))(0)
}

function instalarDesligamento(): void {
  const g = globalThis as unknown as Record<symbol, boolean | undefined>
  if (g[CHAVE_DO_DESLIGAMENTO]) return
  g[CHAVE_DO_DESLIGAMENTO] = true
  let desligando = false
  for (const sinal of ['SIGTERM', 'SIGINT'] as const) {
    process.on(sinal, () => {
      if (desligando) return // o segundo sinal não reinicia o desligamento
      desligando = true
      void desligarComCalma({ sinal })
    })
  }
}
