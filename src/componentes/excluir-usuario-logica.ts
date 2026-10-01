// A regra da confirmação de "Excluir definitivamente" (FT-10, PR-88), sem React nem rede:
// o admin precisa digitar o e-mail do usuário para o botão de confirmar habilitar.

export const TEXTO_DA_EXCLUSAO = {
  descricao:
    'A conta e o acesso deste usuário são apagados de vez, e isso é irreversível. Os agentes, as conversas ' +
    'e a base de conhecimento continuam na empresa: os agentes que ele criou passam a ser seus.',
  alternativa:
    'Se você só quer bloquear o acesso, use Desativar: a desativação pode ser desfeita, a exclusão não.',
} as const

/** O e-mail como se compara: sem espaços nas pontas e sem diferença de caixa. */
export function normalizarEmailDigitado(texto: string): string {
  return texto.trim().toLowerCase()
}

export function emailConfere(digitado: string, email: string): boolean {
  const alvo = normalizarEmailDigitado(email)
  return alvo !== '' && normalizarEmailDigitado(digitado) === alvo
}

/** A própria conta nunca oferece a exclusão (o servidor também a recusa, com 409). */
export function podeOferecerExclusao(usuario: { ehVoce: boolean }): boolean {
  return !usuario.ehVoce
}
