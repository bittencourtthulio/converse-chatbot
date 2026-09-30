// A lógica do chat embutido (FT-06, PR-61), sem React nem rede: o visitante no
// armazenamento do navegador (que pode faltar ou lançar dentro de um iframe de
// terceiro), os endereços e o corpo de cada modo, a tradução de erro HTTP em
// texto para o visitante, a leitura da retomada e o estilo da cor do agente. O
// componente `ChatEmbutido` só liga isto ao DOM e ao `fetch`.
import { COR_PADRAO, corDoTextoSobre, normalizarCor } from '@/lib/cor'
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

export function enderecosDoEmbed(modo: ModoDoEmbed, agenteId: string): { conversar: string; retomar: string | null } {
  return modo === 'previa'
    ? { conversar: `/api/agentes/${agenteId}/conversar`, retomar: null }
    : {
        conversar: `/api/publico/agentes/${agenteId}/conversar`,
        retomar: `/api/publico/agentes/${agenteId}/conversa`,
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
