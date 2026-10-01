// Exclusão mútua por chave, em memória do processo (FT-07, PR-68): as tarefas
// da mesma chave rodam em ordem, uma de cada vez; chaves diferentes não se
// esperam. Serve a "um chat do Telegram é atendido em ordem". Vale por processo
// (PR-05): com mais de uma instância, cada uma tem a sua fila.

export interface ExclusaoMutua {
  /** Roda `tarefa` depois das anteriores da mesma `chave`; o erro volta só a quem a chamou. */
  executar<T>(chave: string, tarefa: () => Promise<T>): Promise<T>
  /** Quantas chaves têm fila agora (para teste). */
  pendentes(): number
}

export function criarExclusaoMutua(): ExclusaoMutua {
  const filas = new Map<string, Promise<void>>()
  return {
    executar<T>(chave: string, tarefa: () => Promise<T>): Promise<T> {
      const anterior = filas.get(chave) ?? Promise.resolve()
      const atual = anterior.then(tarefa)
      const marcador = atual.then(
        () => undefined,
        () => undefined,
      )
      filas.set(chave, marcador)
      void marcador.then(() => {
        if (filas.get(chave) === marcador) filas.delete(chave)
      })
      return atual
    },
    pendentes: () => filas.size,
  }
}

/** A instância do processo. */
export const exclusaoMutuaPadrao: ExclusaoMutua = criarExclusaoMutua()
