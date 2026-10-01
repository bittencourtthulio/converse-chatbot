// A lógica da tela de Privacidade (FT-10, PR-18, PR-89, PR-91), sem React nem banco: a retenção
// na tela e o texto fixo do painel "Dados pessoais tratados". O texto descreve o que o sistema
// faz; a base legal fica marcada como "a confirmar pela empresa" e nada aqui afirma conformidade.

export const RETENCAO_MINIMA = 7
export const RETENCAO_MAXIMA = 3650

export type ModoDaRetencao = 'dias' | 'sem_expurgo'

export function modoInicialDaRetencao(retencaoDias: number | null): ModoDaRetencao {
  return retencaoDias === null ? 'sem_expurgo' : 'dias'
}

/** `30 dias`, `1 dia` ou a frase de "sem expurgo automático". */
export function descreverRetencao(retencaoDias: number | null): string {
  if (retencaoDias === null) return 'sem expurgo automático: as conversas ficam guardadas até alguém apagá-las'
  return `${retencaoDias} ${retencaoDias === 1 ? 'dia' : 'dias'}`
}

/**
 * Pode salvar? Dias inteiros de 7 a 3650; sem expurgo só depois de marcar que entende o risco.
 * O servidor valida de novo; isto só habilita o botão.
 */
export function retencaoPodeSalvar(e: { modo: ModoDaRetencao; dias: string; confirmouRisco: boolean }): boolean {
  if (e.modo === 'sem_expurgo') return e.confirmouRisco
  const texto = e.dias.trim()
  if (!/^\d+$/.test(texto)) return false
  const n = Number(texto)
  return n >= RETENCAO_MINIMA && n <= RETENCAO_MAXIMA
}

export const BASE_LEGAL = 'Legítimo interesse, a confirmar pela empresa.'

export interface DadosDeUmCanal {
  canal: string
  campos: string[]
}

/** Os dados pessoais que cada canal guarda. Texto fixo: muda só quando o sistema mudar. */
export const DADOS_POR_CANAL: DadosDeUmCanal[] = [
  {
    canal: 'Chat embutido',
    campos: [
      'Identificador anônimo do visitante (sorteado no navegador dele, sem nome nem e-mail)',
      'Texto das mensagens que a pessoa escreve',
      'Respostas do agente e as fontes citadas',
    ],
  },
  {
    canal: 'Telegram',
    campos: [
      'Identificador do chat do Telegram',
      'Nome público do chat (o nome que a pessoa usa no Telegram)',
      'Texto das mensagens que a pessoa escreve',
      'Respostas do agente e as fontes citadas',
    ],
  },
  {
    canal: 'Painel',
    campos: ['Nome do usuário da equipe que fez o teste', 'Texto das mensagens de teste e as respostas do agente'],
  },
]

export interface TextosDoPainel {
  finalidade: string
  retencao: string
  ondeFicam: string
  quemAcessa: string
  baseLegal: string
}

export function textosDoPainelDeDados(retencaoDias: number | null): TextosDoPainel {
  return {
    finalidade: 'Atendimento: responder às perguntas das pessoas e permitir que a equipe consulte o histórico das conversas.',
    retencao: `Conversas guardadas por ${descreverRetencao(retencaoDias)}. Os registros de auditoria seguem a retenção própria definida pelo operador.`,
    ondeFicam:
      'No banco de dados e nos arquivos da instalação, no servidor da própria empresa. O texto das perguntas é enviado ao OpenRouter para gerar a resposta.',
    quemAcessa:
      'Qualquer usuário da equipe com login lê e apaga as conversas. Só administradores veem a auditoria, esta tela e as ferramentas do titular.',
    baseLegal: BASE_LEGAL,
  }
}
