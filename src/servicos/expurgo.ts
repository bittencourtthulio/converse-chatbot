// O expurgo automático (FT-10, PR-18, PR-86, PR-89): apaga o que passou da retenção, em
// segundo plano. Conversas com `atualizadoEm` estritamente anterior a agora menos N dias (as
// mensagens saem em cascata), em lotes para não travar o SQLite; as atualizações antigas do
// dedupe do Telegram (7 dias); e os registros de auditoria com mais de
// `AUDITORIA_RETENCAO_DIAS`. Com a retenção das conversas desligada ("sem expurgo
// automático"), só o dedupe e a auditoria são purgados. Registra `expurgo_automatico` com
// contagens, nunca conteúdo nem identificador, e só quando algo foi apagado.
//
// O relógio é injetável (`agora`), o corte é em instante UTC (não depende do `TZ`) e uma
// segunda rodada logo depois não apaga nem registra nada (idempotente).
import { ambiente } from '@/lib/ambiente'
import { prisma } from '@/lib/prisma'
import { purgarAnterioresA, registrarMelhorEsforco } from '@/servicos/auditoria'
import { retencaoEfetivaDias } from '@/servicos/privacidade'
import { purgarAtualizacoes } from '@/servicos/telegram-webhook'
import { camposDoErro, log } from '@/lib/log'

/** Conversas apagadas por transação: cada uma é curta e o SQLite não fica preso (PR-89). */
export const TAMANHO_DO_LOTE = 500

const DIA_EM_MS = 24 * 3600 * 1000
/** Trava de segurança contra laço sem fim: 10 mil lotes são 5 milhões de conversas. */
const MAXIMO_DE_LOTES = 10_000

export interface ResultadoDoExpurgo {
  conversas: number
  mensagens: number
  atualizacoesDoTelegram: number
  registrosDeAuditoria: number
  /** A retenção aplicada; `null` quando as conversas não são expurgadas. */
  retencaoDias: number | null
  /** O tamanho de cada lote de conversas apagado, na ordem. */
  lotesDeConversas: number[]
}

export interface OpcoesDoExpurgo {
  /** "Agora" da rodada; o padrão é o relógio do sistema. */
  agora?: Date
  tamanhoDoLote?: number
}

async function apagarConversasVencidas(corte: Date, tamanho: number) {
  let conversas = 0
  let mensagens = 0
  const lotes: number[] = []
  for (let i = 0; i < MAXIMO_DE_LOTES; i += 1) {
    const vencidas = await prisma.conversa.findMany({
      where: { atualizadoEm: { lt: corte } },
      select: { id: true, _count: { select: { mensagens: true } } },
      orderBy: { atualizadoEm: 'asc' },
      take: tamanho,
    })
    if (vencidas.length === 0) break
    const { count } = await prisma.conversa.deleteMany({ where: { id: { in: vencidas.map((c) => c.id) } } })
    conversas += count
    mensagens += vencidas.reduce((soma, c) => soma + c._count.mensagens, 0)
    lotes.push(vencidas.length)
    if (vencidas.length < tamanho) break
  }
  return { conversas, mensagens, lotes }
}

/** Executa uma rodada do expurgo e devolve o que apagou. */
export async function executarExpurgo(opcoes: OpcoesDoExpurgo = {}): Promise<ResultadoDoExpurgo> {
  const agora = opcoes.agora ?? new Date()
  const tamanho = opcoes.tamanhoDoLote ?? TAMANHO_DO_LOTE
  const retencaoDias = await retencaoEfetivaDias()

  const conversas =
    retencaoDias === null
      ? { conversas: 0, mensagens: 0, lotes: [] as number[] }
      : await apagarConversasVencidas(new Date(agora.getTime() - retencaoDias * DIA_EM_MS), tamanho)
  const atualizacoesDoTelegram = await purgarAtualizacoes(agora)
  const registrosDeAuditoria = await purgarAnterioresA(
    new Date(agora.getTime() - ambiente.auditoriaRetencaoDias * DIA_EM_MS),
  )

  const resultado: ResultadoDoExpurgo = {
    conversas: conversas.conversas,
    mensagens: conversas.mensagens,
    atualizacoesDoTelegram,
    registrosDeAuditoria,
    retencaoDias,
    lotesDeConversas: conversas.lotes,
  }
  if (conversas.conversas + atualizacoesDoTelegram + registrosDeAuditoria > 0) {
    // Melhor esforço (PR-87): o que foi apagado já está apagado.
    await registrarMelhorEsforco({
      ator: 'sistema',
      acao: 'expurgo_automatico',
      alvoTipo: 'sistema',
      detalhes: {
        conversas: resultado.conversas,
        mensagens: resultado.mensagens,
        atualizacoesDoTelegram,
        registrosDeAuditoria,
        retencaoDias,
      },
    })
  }
  return resultado
}

// --- o agendador em segundo plano -----------------------------------------------------------

/** A primeira rodada é 1 minuto depois da subida: o servidor não fica preso ao expurgo. */
export const PRIMEIRA_RODADA_DO_EXPURGO_MS = 60_000
/** Depois, uma rodada a cada 6 horas (contadas do fim da anterior, então nunca se sobrepõem). */
export const INTERVALO_DO_EXPURGO_MS = 6 * 3600 * 1000

export interface AgendadorDoExpurgo {
  /** Liga o agendador: a primeira rodada em 1 minuto. Chamar de novo não faz nada. */
  iniciar(): void
  /** Cancela a próxima rodada e impede novas (a FT-11 usa antes de restaurar um backup). */
  parar(): void
  /** O agendador está ligado? */
  ativo(): boolean
  /** Quando a última rodada terminou (com ou sem falha) neste processo, ou `null` se ainda não houve (tela Sistema). */
  ultimaExecucaoEm(): Date | null
  /** Espera a rodada em andamento terminar (os testes). */
  ocioso(): Promise<void>
}

export interface OpcoesDoAgendador {
  executar?: () => Promise<unknown>
  agendar?: (fn: () => void, ms: number) => unknown
  cancelar?: (handle: unknown) => void
  primeiraRodadaMs?: number
  intervaloMs?: number
  /** O relógio de `ultimaExecucaoEm`; o teste o fixa. */
  relogio?: () => Date
}

/**
 * Cria um agendador. Temporizador, relógio da rodada e intervalos são injetáveis; o padrão usa
 * `setTimeout` sem segurar o processo (`unref`), então o expurgo nunca impede o servidor de
 * encerrar. Uma falha da rodada vira a linha de log `expurgo_falhou` (só o nome do erro) e a
 * próxima é agendada do mesmo jeito.
 */
export function criarAgendadorDoExpurgo(opcoes: OpcoesDoAgendador = {}): AgendadorDoExpurgo {
  const executar = opcoes.executar ?? (() => executarExpurgo())
  const agendar =
    opcoes.agendar ??
    ((fn: () => void, ms: number) => {
      const handle = setTimeout(fn, ms)
      handle.unref?.()
      return handle
    })
  const cancelar = opcoes.cancelar ?? ((handle: unknown) => clearTimeout(handle as ReturnType<typeof setTimeout>))
  const primeira = opcoes.primeiraRodadaMs ?? PRIMEIRA_RODADA_DO_EXPURGO_MS
  const intervalo = opcoes.intervaloMs ?? INTERVALO_DO_EXPURGO_MS

  const relogio = opcoes.relogio ?? (() => new Date())
  let ligado = false
  let ultima: Date | null = null
  let handle: unknown = null
  let rodada: Promise<void> | null = null

  function agendarProxima(ms: number): void {
    handle = agendar(disparar, ms)
  }

  function disparar(): void {
    // Parado, ou uma rodada ainda em andamento: este disparo não faz nada.
    if (!ligado || rodada) return
    rodada = (async () => {
      try {
        await executar()
      } catch (erro) {
        log.erro('expurgo_falhou', camposDoErro(erro))
      } finally {
        ultima = relogio()
        rodada = null
        if (ligado) agendarProxima(intervalo)
      }
    })()
  }

  return {
    iniciar() {
      if (ligado) return
      ligado = true
      agendarProxima(primeira)
    },
    parar() {
      ligado = false
      if (handle !== null) cancelar(handle)
      handle = null
    },
    ativo: () => ligado,
    ultimaExecucaoEm: () => ultima,
    async ocioso() {
      await rodada
    },
  }
}

const CHAVE_DO_AGENDADOR = Symbol.for('converse.agendadorDoExpurgo')

/** O agendador do processo, em `globalThis` para sobreviver à recarga do módulo. */
export function obterAgendadorDoExpurgo(): AgendadorDoExpurgo {
  const g = globalThis as unknown as Record<symbol, AgendadorDoExpurgo | undefined>
  return (g[CHAVE_DO_AGENDADOR] ??= criarAgendadorDoExpurgo())
}
