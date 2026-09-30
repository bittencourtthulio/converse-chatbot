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
