// A lógica do chat embutido (FT-06, PR-61), sem React nem rede: o visitante no
// armazenamento do navegador (que pode faltar ou lançar dentro de um iframe de
// terceiro), os endereços e o corpo de cada modo, a tradução de erro HTTP em
// texto para o visitante, a leitura da retomada e o estilo da cor do agente. O
// componente `ChatEmbutido` só liga isto ao DOM e ao `fetch`.
import { COR_PADRAO, corDoTextoSobre, normalizarCor } from '@/lib/cor'
import {
  estadoInicial,
  reduzir,
  type AcaoDaConversa,
  type EstadoDaConversa,
} from '@/componentes/estado-da-conversa'
import type { FonteDaResposta } from '@/componentes/leitor-de-sse'

/** Espelha `LIMITE_DA_MENSAGEM_PUBLICA` de `src/servicos/chat-publico.ts`, que o cliente não importa. */
export const LIMITE_DA_MENSAGEM_DO_EMBED = 1000
export const LIMITE_PARA_AVISO_DO_EMBED = 900

export const CHAVE_DO_VISITANTE = 'converse:visitante'
export const chaveDaConversa = (agenteId: string): string => `converse:conversa:${agenteId}`

const ID_VALIDO = /^[A-Za-z0-9_-]{16,64}$/

/** 32 caracteres hexadecimais de `crypto.getRandomValues`; o sorteio é injetável para o teste. */
export function gerarIdDeVisitante(
  preencher: (bytes: Uint8Array) => Uint8Array = (b) => crypto.getRandomValues(b),
): string {
  const bytes = preencher(new Uint8Array(16))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export interface ArmazenamentoSimples {
  getItem(chave: string): string | null
  setItem(chave: string, valor: string): void
  removeItem(chave: string): void
}

/** `localStorage`, ou `null` se o navegador o nega (modo privado, terceiros bloqueados). */
export function armazenamentoDoNavegador(): ArmazenamentoSimples | null {
  try {
    const a = window.localStorage
    const sonda = 'converse:sonda'
    a.setItem(sonda, '1')
    a.removeItem(sonda)
    return a
  } catch {
    return null
  }
}

export interface GuardaDoVisitante {
  /** O id do visitante: o guardado, ou um novo (guardado se der; senão vive na memória). */
  visitanteId(): string
  conversaId(agenteId: string): string | null
  guardarConversa(agenteId: string, conversaId: string): void
  esquecerConversa(agenteId: string): void
}

/**
 * O visitante e a conversa dele. Todo acesso ao armazenamento tem try/catch: se
 * falhar, o id e a conversa ficam só na memória desta página, e o chat segue
 * funcionando sem retomada.
 */
export function criarGuardaDoVisitante(
  armazenamento: ArmazenamentoSimples | null,
  gerar: () => string = gerarIdDeVisitante,
): GuardaDoVisitante {
  let id: string | null = null
  const conversas = new Map<string, string>()

  function ler(chave: string): string | null {
    try {
      return armazenamento?.getItem(chave) ?? null
    } catch {
      return null
    }
  }
  function gravar(chave: string, valor: string): void {
    try {
      armazenamento?.setItem(chave, valor)
    } catch {
      // sem armazenamento: fica só na memória
    }
  }

  return {
    visitanteId() {
      if (id) return id
      const guardado = ler(CHAVE_DO_VISITANTE)
      if (guardado && ID_VALIDO.test(guardado)) return (id = guardado)
      id = gerar()
      gravar(CHAVE_DO_VISITANTE, id)
      return id
    },
    conversaId(agenteId) {
      const guardada = conversas.get(agenteId) ?? ler(chaveDaConversa(agenteId))
      return guardada && guardada !== '' ? guardada : null
    },
    guardarConversa(agenteId, conversaId) {
      conversas.set(agenteId, conversaId)
      gravar(chaveDaConversa(agenteId), conversaId)
    },
    esquecerConversa(agenteId) {
      conversas.delete(agenteId)
      try {
        armazenamento?.removeItem(chaveDaConversa(agenteId))
      } catch {
        // idem
      }
    },
  }
}

/** `publico` é o visitante do site; `previa` é o usuário do painel vendo o chat (PR-61). */
export type ModoDoEmbed = 'publico' | 'previa'

export function enderecosDoEmbed(
  modo: ModoDoEmbed,
  agenteId: string,
): { conversar: string; retomar: string | null; apagar: string | null } {
  return modo === 'previa'
    ? { conversar: `/api/agentes/${agenteId}/conversar`, retomar: null, apagar: null }
    : {
        conversar: `/api/publico/agentes/${agenteId}/conversar`,
        retomar: `/api/publico/agentes/${agenteId}/conversa`,
        // Apagar a própria conversa (FT-10, PR-90): o mesmo recurso da retomada, com DELETE.
        apagar: `/api/publico/agentes/${agenteId}/conversa`,
      }
}

export function corpoDoEnvio(
  modo: ModoDoEmbed,
  dados: { visitanteId: string; conversaId: string | null; mensagem: string },
): Record<string, unknown> {
  return {
    mensagem: dados.mensagem,
    ...(dados.conversaId && { conversaId: dados.conversaId }),
    // O painel não conhece visitante: só o canal público manda o id.
    ...(modo === 'publico' && { visitanteId: dados.visitanteId }),
  }
}

export const MENSAGEM_GENERICA_DO_EMBED = 'Não consegui responder agora. Tente novamente em instantes.'
export const MENSAGEM_DE_SEM_CONEXAO = 'Não foi possível falar com o servidor. Verifique a conexão e tente de novo.'

const STATUS_COM_MENSAGEM_PROPRIA = [403, 404, 413, 422, 429]

/**
 * O texto para o visitante quando o envio é recusado antes do stream. Só os
 * status que o servidor público define levam a mensagem do corpo (já amigável);
 * o resto é a frase genérica, nunca um texto técnico. Na prévia, quem vê é o
 * usuário do painel, e a mensagem do painel vale.
 */
export function erroDaResposta(modo: ModoDoEmbed, status: number, corpo: unknown): { codigo: string; mensagem: string } {
  const c = (typeof corpo === 'object' && corpo !== null ? corpo : {}) as { codigo?: unknown; mensagem?: unknown }
  const mensagem = typeof c.mensagem === 'string' && c.mensagem.trim() !== '' ? c.mensagem : null
  const codigo = typeof c.codigo === 'string' ? c.codigo : `http_${status}`
  if (mensagem && (modo === 'previa' || STATUS_COM_MENSAGEM_PROPRIA.includes(status))) return { codigo, mensagem }
  return { codigo, mensagem: MENSAGEM_GENERICA_DO_EMBED }
}

export interface RetomadaDoEmbed {
  conversaId: string
  mensagens: Array<{ id: string; papel: 'user' | 'assistant'; conteudo: string; fontes?: FonteDaResposta[] }>
  truncada: boolean
}

function fonteValida(f: unknown): f is FonteDaResposta {
  if (typeof f !== 'object' || f === null) return false
  const o = f as Record<string, unknown>
  return (
    typeof o.fonteId === 'string' &&
    typeof o.titulo === 'string' &&
    typeof o.citada === 'boolean' &&
    Array.isArray(o.trechos) &&
    o.trechos.every((t) => typeof t === 'object' && t !== null && typeof (t as { n?: unknown }).n === 'number')
  )
}

/** A resposta de `GET conversa`, lida com cuidado: o que não bate com o formato é descartado. */
export function lerRetomada(corpo: unknown): RetomadaDoEmbed | null {
  if (typeof corpo !== 'object' || corpo === null) return null
  const conversa = (corpo as { conversa?: unknown }).conversa
  if (typeof conversa !== 'object' || conversa === null) return null
  const c = conversa as { conversaId?: unknown; mensagens?: unknown; truncada?: unknown }
  if (typeof c.conversaId !== 'string' || !Array.isArray(c.mensagens)) return null
  const mensagens: RetomadaDoEmbed['mensagens'] = []
  for (const m of c.mensagens) {
    const o = (typeof m === 'object' && m !== null ? m : {}) as Record<string, unknown>
    if (typeof o.id !== 'string' || typeof o.conteudo !== 'string') continue
    if (o.papel !== 'user' && o.papel !== 'assistant') continue
    const fontes = Array.isArray(o.fontes) ? o.fontes.filter(fonteValida) : []
    mensagens.push({
      id: o.id,
      papel: o.papel,
      conteudo: o.conteudo,
      ...(fontes.length > 0 && { fontes }),
    })
  }
  return { conversaId: c.conversaId, mensagens, truncada: c.truncada === true }
}

/** As variáveis de CSS da cor do agente: a cor e o texto de maior contraste sobre ela (tokens). */
export function estiloDoAgente(cor: string): Record<string, string> {
  const valida = normalizarCor(cor) ?? COR_PADRAO
  return {
    '--cor-do-agente': valida,
    '--cor-do-agente-fg': `var(${corDoTextoSobre(valida).token})`,
  }
}

export function podeEnviarNoEmbed(texto: string, transmitindo: boolean): boolean {
  return !transmitindo && texto.trim().length > 0 && texto.length <= LIMITE_DA_MENSAGEM_DO_EMBED
}

/** As sugestões só aparecem enquanto a conversa não começou. */
export function sugestoesVisiveis(sugestoes: string[], quantasBolhas: number): string[] {
  return quantasBolhas === 0 ? sugestoes : []
}

export type AcaoDoEmbed = AcaoDaConversa | { tipo: 'retomar'; retomada: RetomadaDoEmbed }

/**
 * O reducer da conversa do painel mais a retomada do servidor. A retomada chega
 * depois de a tela abrir: se o visitante já escreveu nesse meio-tempo, a conversa
 * dele vale e a retomada é descartada.
 */
export function reduzirEmbed(estado: EstadoDaConversa, acao: AcaoDoEmbed): EstadoDaConversa {
  if (acao.tipo !== 'retomar') return reduzir(estado, acao)
  if (estado.bolhas.length > 0) return estado
  return estadoInicial({ conversaId: acao.retomada.conversaId, mensagens: acao.retomada.mensagens })
}

// --- "Apagar minha conversa" (FT-10, PR-90) -------------------------------------------------

export interface EstadoDoApagar {
  /** A pergunta "apagar de vez?" está aberta. */
  confirmando: boolean
  apagando: boolean
  erro: string | null
  /** A conversa acabou de ser apagada: mostra o aviso até a próxima ação. */
  apagada: boolean
}

export const ESTADO_INICIAL_DO_APAGAR: EstadoDoApagar = { confirmando: false, apagando: false, erro: null, apagada: false }

export type AcaoDoApagar =
  | { tipo: 'pedir' }
  | { tipo: 'cancelar' }
  | { tipo: 'apagando' }
  | { tipo: 'falhou'; mensagem: string }
  | { tipo: 'concluido' }
  | { tipo: 'limparAviso' }

/** A confirmação em dois passos como máquina de estados pura: o primeiro clique só pergunta. */
export function reduzirApagar(estado: EstadoDoApagar, acao: AcaoDoApagar): EstadoDoApagar {
  switch (acao.tipo) {
    case 'pedir':
      return { confirmando: true, apagando: false, erro: null, apagada: false }
    case 'cancelar':
    case 'limparAviso':
      return ESTADO_INICIAL_DO_APAGAR
    case 'apagando':
      return { ...estado, apagando: true, erro: null }
    case 'falhou':
      return { confirmando: true, apagando: false, erro: acao.mensagem, apagada: false }
    case 'concluido':
      return { confirmando: false, apagando: false, erro: null, apagada: true }
  }
}

export type ResultadoDeApagar = { ok: true } | { ok: false; mensagem: string }

/**
 * Pede ao servidor que apague a conversa do visitante. O visitante vai no cabeçalho (nunca na
 * URL, que vai para o log de acesso). Só os status que o servidor público define levam a
 * própria mensagem; o resto é a frase genérica. O `fetch` é injetável para o teste.
 */
export async function apagarMinhaConversaNoServidor(
  endereco: string,
  visitanteId: string,
  buscar: (url: string, init: RequestInit) => Promise<Response> = (url, init) => fetch(url, init),
): Promise<ResultadoDeApagar> {
  try {
    const resposta = await buscar(endereco, { method: 'DELETE', headers: { 'X-Visitante-Id': visitanteId } })
    if (resposta.ok) return { ok: true }
    const corpo: unknown = await resposta.json().catch(() => null)
    return { ok: false, mensagem: erroDaResposta('publico', resposta.status, corpo).mensagem }
  } catch {
    return { ok: false, mensagem: MENSAGEM_DE_SEM_CONEXAO }
  }
}
