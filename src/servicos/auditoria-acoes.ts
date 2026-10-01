// O vocabulário da trilha de auditoria (FT-10, PR-19, PR-86): o conjunto fechado de ações,
// os tipos de alvo e a validação dos detalhes. Módulo puro (sem banco), para a tela da
// auditoria e os testes poderem importá-lo.
//
// Os detalhes nunca levam segredo, máscara de chave, texto de conversa nem identificador de
// visitante ou de chat: só nomes de campo, contagens e ids internos. Cada ação lista as
// chaves que aceita; qualquer outra é recusada.
import { entradaInvalida } from '@/lib/erros'

export const ACOES = [
  'chave_openrouter_alterada',
  'chave_openrouter_removida',
  'modelo_transcricao_alterado',
  'usuario_criado',
  'usuario_editado',
  'usuario_excluido',
  'agente_excluido',
  'canal_conectado',
  'canal_desconectado',
  'canal_pausado',
  'canal_retomado',
  'canal_limite_alterado',
  'conversa_apagada',
  'retencao_alterada',
  'dados_do_titular_apagados',
  'dados_do_titular_exportados',
  'expurgo_automatico',
  'restauracao',
] as const

export type AcaoDeAuditoria = (typeof ACOES)[number]

export const TIPOS_DE_ALVO = ['configuracao', 'usuario', 'agente', 'conversa', 'canal', 'titular', 'sistema'] as const
export type TipoDeAlvo = (typeof TIPOS_DE_ALVO)[number]

/** O JSON dos detalhes cabe em 1000 caracteres. */
export const LIMITE_DOS_DETALHES = 1000

const LIMITE_DO_TEXTO_DE_DETALHE = 200
const LIMITE_DA_LISTA_DE_DETALHE = 10

/** As chaves de detalhe que cada ação aceita. */
export const CHAVES_DE_DETALHES: Record<AcaoDeAuditoria, readonly string[]> = {
  chave_openrouter_alterada: [],
  chave_openrouter_removida: [],
  modelo_transcricao_alterado: ['modelo', 'restaurado'],
  usuario_criado: ['papel'],
  usuario_editado: ['campos', 'papelAnterior', 'papelNovo', 'ativo'],
  usuario_excluido: ['rotulo', 'papel', 'agentesTransferidos'],
  agente_excluido: ['nome', 'conversas', 'fontes'],
  canal_conectado: ['agente'],
  canal_desconectado: ['agente'],
  canal_pausado: ['agente'],
  canal_retomado: ['agente'],
  canal_limite_alterado: ['agente'],
  conversa_apagada: ['agenteId', 'canal', 'mensagens', 'origem'],
  retencao_alterada: ['diasAnterior', 'diasNovo'],
  dados_do_titular_apagados: ['canal', 'conversas', 'mensagens'],
  dados_do_titular_exportados: ['canal', 'conversas', 'mensagens', 'formato'],
  expurgo_automatico: ['conversas', 'mensagens', 'atualizacoesDoTelegram', 'registrosDeAuditoria', 'retencaoDias'],
  restauracao: ['origem', 'resultado'],
}

export function validarAcao(acao: unknown): AcaoDeAuditoria {
  if (typeof acao !== 'string' || !(ACOES as readonly string[]).includes(acao)) {
    throw entradaInvalida('Ação de auditoria desconhecida.')
  }
  return acao as AcaoDeAuditoria
}

export function validarTipoDeAlvo(tipo: unknown): TipoDeAlvo {
  if (typeof tipo !== 'string' || !(TIPOS_DE_ALVO as readonly string[]).includes(tipo)) {
    throw entradaInvalida('Tipo de alvo de auditoria desconhecido.')
  }
  return tipo as TipoDeAlvo
}

// Defesa em profundidade: nenhum detalhe legítimo parece com chave do OpenRouter, texto
// cifrado (`v1:`) ou token de bot do Telegram.
const PARECE_SEGREDO = [/\bsk-[A-Za-z0-9_-]{8,}/, /^v1:[A-Za-z0-9+/=:_-]+/, /\d{6,}:[A-Za-z0-9_-]{20,}/]

function valorSimples(valor: unknown): boolean {
  return valor === null || typeof valor === 'boolean' || (typeof valor === 'number' && Number.isFinite(valor))
}

function textoLimpo(valor: string): boolean {
  return valor.length <= LIMITE_DO_TEXTO_DE_DETALHE && !PARECE_SEGREDO.some((r) => r.test(valor))
}

/**
 * Valida os detalhes da ação e devolve o JSON a gravar. Aceita só as chaves da ação e
 * valores simples (texto curto, número, booleano, nulo ou lista curta de textos).
 */
export function validarDetalhes(acao: AcaoDeAuditoria, detalhes: unknown): string {
  if (detalhes === undefined || detalhes === null) return '{}'
  if (typeof detalhes !== 'object' || Array.isArray(detalhes)) throw entradaInvalida('Detalhes de auditoria inválidos.')
  const permitidas = CHAVES_DE_DETALHES[acao]
  for (const [chave, valor] of Object.entries(detalhes)) {
    if (!permitidas.includes(chave)) throw entradaInvalida(`Detalhe de auditoria não permitido para esta ação: ${chave}.`)
    if (typeof valor === 'string') {
      if (!textoLimpo(valor)) throw entradaInvalida(`Detalhe de auditoria inválido: ${chave}.`)
    } else if (Array.isArray(valor)) {
      if (
        valor.length > LIMITE_DA_LISTA_DE_DETALHE ||
        !valor.every((v) => typeof v === 'string' && textoLimpo(v))
      ) {
        throw entradaInvalida(`Detalhe de auditoria inválido: ${chave}.`)
      }
    } else if (!valorSimples(valor)) {
      throw entradaInvalida(`Detalhe de auditoria inválido: ${chave}.`)
    }
  }
  const json = JSON.stringify(detalhes)
  if (json.length > LIMITE_DOS_DETALHES) throw entradaInvalida('Detalhes de auditoria grandes demais.')
  return json
}
