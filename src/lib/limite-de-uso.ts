// Limite de uso por janela deslizante, em memória do processo (PR-16).
//
// É a base comum do limite de tentativas de login (FT-01) e, depois, do chat
// público (FT-06) e do Telegram (FT-07). Cada chave guarda os instantes das
// chamadas permitidas dentro da janela; a chamada que passaria do máximo é
// recusada e NÃO entra na lista, então insistir não estende o bloqueio.
//
// O relógio é injetável (`criarLimitador(relogio)`) para o teste não depender
// de tempo real. O limite vale por processo: com mais de uma instância do
// servidor ele deixa de ser global (PR-05, PR-36).

export interface OpcoesDeLimite {
  /** Quantas chamadas cabem na janela. Inteiro, no mínimo 1. */
  max: number
  /** Tamanho da janela, em milissegundos. */
  janelaMs: number
}

export interface ResultadoDoLimite {
  permitido: boolean
  /** Quantas chamadas ainda cabem na janela depois desta. */
  restante: number
  /** Em quantos ms a chamada mais antiga sai da janela e libera uma vaga. */
  reiniciaEmMs: number
}

export interface Limitador {
  /** Registra uma chamada para a chave, se couber, e diz o que resta. */
  verificarLimite(chave: string, opcoes: OpcoesDeLimite): ResultadoDoLimite
  /** Esquece uma chave (uso em teste ou quando um bloqueio deve cair). */
  reiniciar(chave: string): void
  /** Apaga da memória as chaves cuja janela já venceu. */
  limparVencidas(): void
  /** Quantas chaves estão em memória agora. */
  tamanho(): number
}

interface Entrada {
  marcas: number[]
  janelaMs: number
}

/** A cada tantas chamadas o limitador varre as chaves vencidas. */
const CHAMADAS_ENTRE_LIMPEZAS = 256

export function criarLimitador(relogio: () => number = Date.now): Limitador {
  const entradas = new Map<string, Entrada>()
  let chamadas = 0

  function limparVencidas(): void {
    const agora = relogio()
    for (const [chave, entrada] of entradas) {
      const ultima = entrada.marcas[entrada.marcas.length - 1]
      if (ultima === undefined || ultima <= agora - entrada.janelaMs) {
        entradas.delete(chave)
      }
    }
  }

  function verificarLimite(
    chave: string,
    { max, janelaMs }: OpcoesDeLimite,
  ): ResultadoDoLimite {
    if (!Number.isInteger(max) || max < 1) {
      throw new Error('Limite de uso: "max" precisa ser um inteiro maior que zero.')
    }
    if (!Number.isFinite(janelaMs) || janelaMs <= 0) {
      throw new Error('Limite de uso: "janelaMs" precisa ser maior que zero.')
    }

    chamadas += 1
    if (chamadas % CHAMADAS_ENTRE_LIMPEZAS === 0) limparVencidas()

    const agora = relogio()
    const entrada = entradas.get(chave) ?? { marcas: [], janelaMs }
    entrada.janelaMs = janelaMs
    entrada.marcas = entrada.marcas.filter((m) => m > agora - janelaMs)

    if (entrada.marcas.length >= max) {
      entradas.set(chave, entrada)
      const maisAntiga = entrada.marcas[0] ?? agora
      return {
        permitido: false,
        restante: 0,
        reiniciaEmMs: Math.max(0, maisAntiga + janelaMs - agora),
      }
    }

    entrada.marcas.push(agora)
    entradas.set(chave, entrada)
    const maisAntiga = entrada.marcas[0] ?? agora
    return {
      permitido: true,
      restante: max - entrada.marcas.length,
      reiniciaEmMs: Math.max(0, maisAntiga + janelaMs - agora),
    }
  }

  return {
    verificarLimite,
    reiniciar: (chave) => {
      entradas.delete(chave)
    },
    limparVencidas,
    tamanho: () => entradas.size,
  }
}

/** Instância única do processo, com o relógio real. */
export const limitadorPadrao: Limitador = criarLimitador()

export const verificarLimite = limitadorPadrao.verificarLimite
