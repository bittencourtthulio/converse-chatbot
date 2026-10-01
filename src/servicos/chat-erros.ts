// As duas saídas de mensagem de um erro do turno de conversa (PR-22, PR-42):
// a do operador, no painel, é detalhada e em português; a do visitante, nos
// canais públicos (FT-06, FT-07), é uma frase única. Nenhuma repete corpo do
// provedor, chave ou pilha.
import { ErroDeAplicacao } from '@/lib/erros'
import { novaCorrelacao } from '@/lib/log'

export const MENSAGEM_PARA_VISITANTE = 'Não consegui responder agora. Tente novamente em instantes.'

export const CODIGO_SEM_CHAVE = 'chat_sem_chave'
export const CODIGO_INESPERADO = 'erro_inesperado'

export interface MensagemDeErro {
  codigo: string
  mensagem: string
  /** Só no erro inesperado: o identificador que liga a tela ao log. */
  correlacao?: string
}

/** Não há chave do OpenRouter cadastrada: só um admin resolve. */
export function erroSemChave(): ErroDeAplicacao {
  return new ErroDeAplicacao(
    'O OpenRouter ainda não foi configurado. Peça a um administrador que cadastre a chave em Configurações > Integrações.',
    409,
    CODIGO_SEM_CHAVE,
  )
}

/** Identificador curto de correlação entre a tela e o log (gerado por `src/lib/log.ts`, PR-93). */
export function gerarCorrelacao(): string {
  return novaCorrelacao()
}

/**
 * A mensagem para quem opera o sistema. Erro de aplicação leva a própria
 * mensagem (já segura e em português, ver `src/lib/erros.ts`); qualquer outra
 * coisa vira uma frase com o código de referência, sem o texto do erro.
 */
export function mensagemParaOperador(erro: unknown, correlacao = gerarCorrelacao()): MensagemDeErro {
  if (erro instanceof ErroDeAplicacao) {
    return { codigo: erro.codigo, mensagem: erro.message }
  }
  return {
    codigo: CODIGO_INESPERADO,
    mensagem: `Não foi possível concluir. Código de referência: ${correlacao}.`,
    correlacao,
  }
}

/** A mensagem para quem conversa por um canal público: sempre a mesma. */
export function mensagemParaVisitante(_erro?: unknown): string {
  return MENSAGEM_PARA_VISITANTE
}
