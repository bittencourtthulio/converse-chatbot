// Controles do servidor, independentes das instruções configuráveis do agente.
// Os padrões cobrem pedidos diretos; a política do prompt cobre também pedidos
// indiretos. Correspondência textual e citações não provam suporte semântico.
import { citacoesNaResposta } from '@/servicos/fontes-da-resposta'

export const RESPOSTA_SEM_CONHECIMENTO =
  'Não encontrei essa informação na base de conhecimento. Posso ajudar com perguntas sobre o conteúdo disponível.'
export const RESPOSTA_FORA_DO_ESCOPO =
  'Posso ajudar apenas com informações da base de conhecimento deste agente.'

function normalizar(texto: string): string {
  return texto.normalize('NFKD').replace(/\p{M}|\p{Cf}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim()
}

/**
 * Exceção fechada para cordialidade: não chama a IA nem amplia o escopo.
 * A mensagem inteira precisa conter somente estas expressões; um cumprimento
 * seguido de pergunta ou instrução passa pelos controles normais do turno.
 */
export function respostaDeCordialidade(mensagem: string): string | null {
  const texto = normalizar(mensagem).replace(/[\p{P}\p{S}]/gu, ' ').replace(/\s+/g, ' ').trim()
  if (texto.length === 0 || texto.length > 120) return null
  if (!/^(?:(?:oi|ola|opa|bom dia|boa tarde|boa noite|tudo bem|tudo bom|tudo certo|como vai|como voce esta|como esta|muito obrigado|muito obrigada|obrigado|obrigada|valeu|tchau|ate mais|ate logo|hello|hi|hey|how are you|good morning|good afternoon|good evening|good night|thank you|thanks|bye|goodbye)(?:\s+|$))+$/.test(texto)) return null

  if (/\b(?:tchau|ate mais|ate logo)\b/.test(texto)) return 'Até mais! Estou por aqui quando precisar.'
  if (/\b(?:bye|goodbye|good night)\b/.test(texto)) return 'Goodbye! Feel free to come back when you need help.'
  if (/\b(?:obrigado|obrigada|valeu)\b/.test(texto)) return 'Por nada! Se precisar de ajuda, estou por aqui.'
  if (/\b(?:thank you|thanks)\b/.test(texto)) return "You're welcome! Let me know if you need help."
  if (/\b(?:hello|hi|hey|how are you|good morning|good afternoon|good evening)\b/.test(texto)) return 'Hello! How can I help?'
  const cumprimento = texto.includes('bom dia') ? 'Bom dia' : texto.includes('boa tarde') ? 'Boa tarde' : texto.includes('boa noite') ? 'Boa noite' : 'Olá'
  return `${cumprimento}! Como posso ajudar?`
}

const PEDIDOS_PROTEGIDOS = [
  /\b(?:ignore|ignorar|desconsidere|esqueca|forget|disregard|override|bypass)\b.{0,100}\b(?:instrucoes|regras|prompt|instructions|rules|system|sistema)\b/,
  /\b(?:revele|mostre|exiba|repita|imprima|transcreva|traduza|liste|diga|reveal|show|print|repeat|translate|list|tell|share|dump)\b.{0,100}\b(?:seu|seus|sua|suas|your|system|sistema|intern[oa]s?)\b.{0,60}\b(?:prompt|instrucoes|regras|instructions|rules|configuracao|configuration)\b/,
  /\b(?:prompt|instrucoes|regras|instructions|rules)\b.{0,60}\b(?:sistema|system|intern[oa]s?)\b/,
  /\b(?:modelo|model|llm|provedor|provider)\s+(?:(?:de ia|de linguagem|de inteligencia artificial|de llm|de ai)\s+)?(?:voce|voces|you|are you|do you)\s+(?:usa|usando|utiliza|esta usando|use|using|running)\b/,
  /\b(?:qual|what|which)\b.{0,20}\b(?:seu modelo|modelo usado|modelo utilizado|your model|underlying model|base model)\b/,
  /\b(?:voce|voces|you|your|qual|which|what)\b.{0,80}\b(?:modelo de ia|modelo de linguagem|language model|llm|openai|openrouter|gpt|chatgpt|claude|gemini|llama|deepseek)\b/,
  /\b(?:modo|mode)\b.{0,30}\b(?:desenvolvedor|developer|jailbreak|sem restricoes|unrestricted)\b/,
  /(?:<\|(?:im_start|start_header_id)\|>|\[\s*(?:system|developer|sistema)\s*\]|<\s*\/?\s*(?:system|developer)\s*>)/,
]

/** Recusa o pedido inteiro, inclusive quando mistura pergunta legítima e extração. */
export function pedidoForaDoEscopo(mensagem: string): boolean {
  const texto = normalizar(mensagem)
  return PEDIDOS_PROTEGIDOS.some((padrao) => padrao.test(texto))
}

/**
 * Verifica o texto completo antes de liberar qualquer trecho ao consumidor.
 * Exige citações existentes e barra sinais de exposição de modelo e instruções.
 * Uma citação válida é requisito mínimo, não prova de que a afirmação é correta.
 */
export function respostaPermitida(entrada: {
  resposta: string
  modelo: string
  instrucoes: string
  citacoesPermitidas: number[]
}): boolean {
  const texto = normalizar(entrada.resposta)
  const modelo = normalizar(entrada.modelo)
  const nomeDoModelo = modelo.split('/').at(-1) ?? modelo
  // Pontuação e formatação não podem esconder o identificador do modelo.
  const compacto = (valor: string) => valor.replace(/[^a-z0-9]/g, '')
  if (nomeDoModelo && compacto(texto).includes(compacto(nomeDoModelo))) return false
  if (/\b(?:sou|uso|utilizo|modelo|model|powered by|i am|i use|i'm)\b.{0,80}\b(?:openai|openrouter|anthropic|gpt[\w.-]*|chatgpt|claude|gemini|llama|deepseek)\b/.test(texto)) return false
  if (/\b(?:meu|my|nosso|our)\s+(?:modelo|model|provedor|provider)\b/.test(texto)) return false
  if (/<<<(?:fim-)?material-|\b(?:system prompt|prompt de sistema)\s*:|regras obrigatorias da plataforma|instrucoes configuraveis do agente/.test(texto)) return false
  const instrucoes = normalizar(entrada.instrucoes)
  if (instrucoes.length >= 20 && texto.includes(instrucoes)) return false

  const citacoes = citacoesNaResposta(entrada.resposta)
  // A recuperação inclui no máximo seis trechos; números maiores não podem
  // passar despercebidos pelo leitor de citações de um ou dois dígitos.
  return !/\[\d{3,}\]/.test(entrada.resposta) && citacoes.size > 0 &&
    [...citacoes].every((n) => entrada.citacoesPermitidas.includes(n))
}
