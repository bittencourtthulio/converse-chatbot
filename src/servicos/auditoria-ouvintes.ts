// Liga os pontos de extensão que já existiam (`aoAlterarCanal`, FT-07, e `aoApagarConversa`,
// FT-09) à trilha de auditoria (FT-10, PR-19, PR-86). `ligarAuditoria` é chamada pela subida
// do servidor (`src/instrumentation.ts`) e é idempotente: o estado fica em `globalThis`, então
// chamá-la de novo, ou de uma cópia recarregada do módulo, não duplica os ouvintes.
//
// A gravação é de melhor esforço (PR-87): o ouvinte é síncrono, a gravação corre solta, e uma
// falha vira só a linha de log `auditoria_falhou`.
import { prisma } from '@/lib/prisma'
import { registrarMelhorEsforco, type EventoDeAuditoria } from '@/servicos/auditoria'
import type { AcaoDeAuditoria } from '@/servicos/auditoria-acoes'
import { aoAlterarCanal, type AcaoNoCanal, type AlteracaoDoCanal } from '@/servicos/canal-telegram'
import { aoApagarConversa, type ConversaApagada } from '@/servicos/historico'

const ACAO_DO_CANAL: Record<AcaoNoCanal, AcaoDeAuditoria> = {
  conectar: 'canal_conectado',
  desconectar: 'canal_desconectado',
  pausar: 'canal_pausado',
  retomar: 'canal_retomado',
  limite: 'canal_limite_alterado',
}

/** Registra a alteração do canal: o agente (id e nome) e quem fez, nunca token nem segredo. */
export function tratarAlteracaoDoCanal(alteracao: AlteracaoDoCanal): void {
  const acao = ACAO_DO_CANAL[alteracao.acao]
  void registrarMelhorEsforco(async (): Promise<EventoDeAuditoria> => {
    const agente = await prisma.agente.findUnique({ where: { id: alteracao.agenteId }, select: { nome: true } })
    return {
      ator: { usuarioId: alteracao.usuarioId },
      acao,
      alvoTipo: 'canal',
      alvoId: alteracao.agenteId,
      detalhes: { agente: (agente?.nome ?? 'Agente removido').slice(0, 100) },
    }
  }, acao)
}

/**
 * Registra a conversa apagada: canal, contagem de mensagens e o agente, nunca o texto nem o
 * identificador. A exclusão em nome de um titular não grava aqui (o resumo
 * `dados_do_titular_apagados` já a cobre, D-23).
 */
export function tratarConversaApagada(apagada: ConversaApagada): void {
  if (apagada.origem === 'titular') return
  const ator =
    apagada.origem === 'visitante'
      ? ('visitante' as const)
      : apagada.usuarioId !== null
        ? { usuarioId: apagada.usuarioId }
        : ('sistema' as const)
  void registrarMelhorEsforco(
    {
      ator,
      acao: 'conversa_apagada',
      alvoTipo: 'conversa',
      alvoId: apagada.conversaId,
      detalhes: {
        agenteId: apagada.agenteId,
        canal: apagada.canal,
        mensagens: apagada.quantidadeDeMensagens,
        ...(apagada.origem && { origem: apagada.origem }),
      },
    },
    'conversa_apagada',
  )
}

const CHAVE_DA_LIGACAO = Symbol.for('converse.auditoriaLigada')
type Ligacao = { desligar: () => void }

/** Liga a auditoria aos dois pontos de extensão; chamar de novo não faz nada. */
export function ligarAuditoria(): void {
  const g = globalThis as unknown as Record<symbol, Ligacao | undefined>
  if (g[CHAVE_DA_LIGACAO]) return
  const removerCanal = aoAlterarCanal(tratarAlteracaoDoCanal)
  const removerConversa = aoApagarConversa(tratarConversaApagada)
  g[CHAVE_DA_LIGACAO] = {
    desligar: () => {
      removerCanal()
      removerConversa()
    },
  }
}

/** Desfaz a ligação (os testes, e o desligamento limpo). */
export function desligarAuditoria(): void {
  const g = globalThis as unknown as Record<symbol, Ligacao | undefined>
  g[CHAVE_DA_LIGACAO]?.desligar()
  g[CHAVE_DA_LIGACAO] = undefined
}
