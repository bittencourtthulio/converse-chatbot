// Erro de aplicação: carrega o status HTTP e uma mensagem segura para o
// usuário. Rastro de pilha nunca chega à interface (L17).

export class ErroDeAplicacao extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly codigo: string,
  ) {
    super(message)
    this.name = 'ErroDeAplicacao'
  }
}

export const naoAutenticado = (msg = 'Sessão inválida ou expirada.') =>
  new ErroDeAplicacao(msg, 401, 'nao_autenticado')

export const naoAutorizado = (msg = 'Você não tem acesso a este recurso.') =>
  new ErroDeAplicacao(msg, 403, 'nao_autorizado')

export const naoEncontrado = (msg = 'Recurso não encontrado.') =>
  new ErroDeAplicacao(msg, 404, 'nao_encontrado')

export const entradaInvalida = (msg: string) =>
  new ErroDeAplicacao(msg, 422, 'entrada_invalida')

export const conflito = (msg: string) =>
  new ErroDeAplicacao(msg, 409, 'conflito')

/** Limite de uso excedido (429). `reiniciaEmMs` vem de `verificarLimite`. */
export const limiteExcedido = (acao: string, reiniciaEmMs: number) => {
  const segundos = Math.max(1, Math.ceil(reiniciaEmMs / 1000))
  return new ErroDeAplicacao(
    `Muitas tentativas de ${acao}. Tente de novo em ${segundos} segundos.`,
    429,
    'limite_excedido',
  )
}

/**
 * Falha do provedor de IA (PR-22, PR-38). A mensagem é para o operador, em
 * português, e nunca repete o corpo do provedor nem a chave. `causa` é o
 * status HTTP recebido, `'timeout'` ou `'rede'`.
 */
export function erroDoProvedor(causa: number | 'timeout' | 'rede'): ErroDeAplicacao {
  if (causa === 'timeout' || causa === 408) {
    return new ErroDeAplicacao(
      'O OpenRouter demorou demais para responder. Tente de novo em instantes.',
      504,
      'provedor_tempo_esgotado',
    )
  }
  switch (causa) {
    case 401:
      return new ErroDeAplicacao(
        'O OpenRouter recusou a chave (inválida ou desativada). Confira a chave em Configurações > Integrações.',
        502,
        'provedor_chave_invalida',
      )
    case 402:
      return new ErroDeAplicacao(
        'Saldo insuficiente no OpenRouter. Adicione créditos à conta ou eleve o limite da chave.',
        502,
        'provedor_sem_saldo',
      )
    case 400:
    case 404:
      return new ErroDeAplicacao(
        'O modelo escolhido não está disponível no OpenRouter. Escolha outro modelo.',
        502,
        'provedor_modelo_invalido',
      )
    case 429:
      return new ErroDeAplicacao(
        'O OpenRouter atingiu o limite de uso. Aguarde um pouco e tente de novo.',
        502,
        'provedor_limite',
      )
    default:
      return new ErroDeAplicacao(
        'O OpenRouter está indisponível no momento. Tente de novo em instantes.',
        502,
        'provedor_indisponivel',
      )
  }
}
