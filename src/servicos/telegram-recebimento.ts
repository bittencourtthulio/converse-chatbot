// Recebimento direto para servidores sem URL pública. Uma instância por processo,
// inclusive no recarregamento do Next. O webhookUrl vazio é o modo persistido;
// canais com webhook continuam sendo atendidos exclusivamente pela rota pública.
import { prisma } from '@/lib/prisma'
import { decifrar } from '@/lib/cripto'
import { ErroDoTelegram, getUpdates } from '@/lib/telegram'
import { lerUpdate, purgarAtualizacoesSeNecessario, registrarAtualizacao } from '@/servicos/telegram-webhook'
import { atenderUpdate } from '@/servicos/telegram-atendimento'
import { registrarErroDoCanal } from '@/servicos/canal-telegram'
import { camposDoErro, log } from '@/lib/log'

export function criarRecebimentoTelegram() {
  let temporizador: ReturnType<typeof setTimeout> | undefined
  let controlador: AbortController | undefined
  let ligado = false
  let emCurso: Promise<void> | undefined
  const cursores = new Map<string, { tokenCifrado: string; offset: number; erro?: string }>()

  async function receber(sinal?: AbortSignal): Promise<void> {
    const canais = await prisma.canalTelegram.findMany({ where: { webhookUrl: '' } })
    for (const id of cursores.keys()) {
      if (!canais.some((canal) => canal.id === id)) cursores.delete(id)
    }
    await Promise.all(canais.map(async (canal) => {
      let cursor = cursores.get(canal.id)
      if (!cursor || cursor.tokenCifrado !== canal.tokenCifrado) {
        cursor = { tokenCifrado: canal.tokenCifrado, offset: 0 }
        cursores.set(canal.id, cursor)
      }
      try {
        const updates = await getUpdates(decifrar(canal.tokenCifrado), cursor.offset, sinal)
        // Limpa apenas a falha de transporte vista nesta consulta. Um erro novo de
        // atendimento não pode ser apagado por uma consulta posterior sem mensagens.
        if (cursor.erro && canal.ultimoErro === cursor.erro) {
          await prisma.canalTelegram.updateMany({
            where: { id: canal.id, ultimoErro: canal.ultimoErro, ultimoErroEm: canal.ultimoErroEm },
            data: { ultimoErro: null, ultimoErroEm: null },
          })
        }
        cursor.erro = undefined
        for (const corpo of updates) {
          if (sinal?.aborted) return
          // Pausa, desconexão ou troca de modo/token durante a requisição prevalecem.
          const atual = await prisma.canalTelegram.findUnique({ where: { id: canal.id } })
          if (!atual || atual.webhookUrl || atual.tokenCifrado !== canal.tokenCifrado) return
          const id = (corpo as { update_id?: unknown } | null)?.update_id
          if (typeof id !== 'number' || !Number.isSafeInteger(id) || id < 0) continue
          const update = lerUpdate(corpo)
          // Mesmo pausado, consome e confirma: retomar não responde mensagens da pausa.
          if (await registrarAtualizacao(canal.id, String(id))) {
            if (atual.ativo && update) await atenderUpdate(atual, update)
          }
          cursor.offset = Math.max(cursor.offset, id + 1)
        }
        // Erros de atendimento são tratados pelo próprio atenderUpdate; não os apaga aqui.
      } catch (erro) {
        if (sinal?.aborted) return
        const mensagem = erro instanceof ErroDoTelegram ? erro.message : 'Não foi possível receber as mensagens do Telegram. O sistema tentará novamente.'
        cursor.erro = mensagem
        await registrarErroDoCanal(canal.id, mensagem)
        log.erro('telegram_recebimento_falhou', { agenteId: canal.agenteId, ...camposDoErro(erro) })
      }
    }))
    await purgarAtualizacoesSeNecessario()
  }

  function processar(): Promise<void> {
    if (emCurso) return emCurso
    controlador = new AbortController()
    emCurso = receber(controlador.signal).finally(() => { emCurso = undefined })
    return emCurso
  }

  function agendar() {
    temporizador = setTimeout(async () => {
      try {
        await processar()
      } catch (erro) {
        log.erro('telegram_recebimento_falhou', camposDoErro(erro))
      } finally {
        if (ligado) agendar()
      }
    }, 1000)
    temporizador.unref()
  }

  return {
    processar,
    iniciar() {
      if (ligado) return
      ligado = true
      agendar()
    },
    parar() {
      ligado = false
      clearTimeout(temporizador)
      controlador?.abort()
    },
    async ocioso() { await emCurso },
  }
}

const CHAVE = Symbol.for('converse.recebimentoTelegram')
export function obterRecebimentoTelegram(): ReturnType<typeof criarRecebimentoTelegram> {
  const global = globalThis as unknown as Record<symbol, ReturnType<typeof criarRecebimentoTelegram> | undefined>
  return (global[CHAVE] ??= criarRecebimentoTelegram())
}
