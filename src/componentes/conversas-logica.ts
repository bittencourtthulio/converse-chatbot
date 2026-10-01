// Lógica da tela de conversas (FT-09) sem navegador: filtros a partir dos searchParams,
// links de página, seleção em lote como reducer puro e formatação. O componente só liga
// isto ao DOM e à rede (o ambiente de teste é `node`).
import { CANAIS_DO_HISTORICO, LIMITE_DO_LOTE, LIMITE_DO_TEXTO } from '@/servicos/historico-logica'

export type CanalDoFiltro = (typeof CANAIS_DO_HISTORICO)[number]

/** Os filtros como a tela os entende: texto da URL já saneado, ainda não validado pelo serviço. */
export interface FiltrosDaTela {
  agenteId?: string
  canal?: CanalDoFiltro
  texto?: string
  /** `AAAA-MM-DD`. */
  de?: string
  ate?: string
  pagina: number
}

type Parametro = string | string[] | undefined
const primeiro = (v: Parametro): string | undefined => (Array.isArray(v) ? v[0] : v)

function diaValido(v: string | undefined): string | undefined {
  if (!v) return undefined
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
  if (!m) return undefined
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return d.getFullYear() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3])
    ? v
    : undefined
}

/** Os searchParams da página viram o filtro; o que é inválido some e a página inválida vira 1. */
export function entradaDeFiltros(sp: Record<string, Parametro>): FiltrosDaTela {
  const agenteId = primeiro(sp.agente)?.trim()
  const canal = primeiro(sp.canal)
  const texto = primeiro(sp.texto)?.trim().slice(0, LIMITE_DO_TEXTO)
  const de = diaValido(primeiro(sp.de))
  const ate = diaValido(primeiro(sp.ate))
  const bruta = primeiro(sp.pagina)
  const pagina = bruta !== undefined && /^[1-9]\d*$/.test(bruta) ? Number(bruta) : 1
  return {
    pagina,
    ...(agenteId && { agenteId }),
    ...((CANAIS_DO_HISTORICO as readonly string[]).includes(canal ?? '') && { canal: canal as CanalDoFiltro }),
    ...(texto && { texto }),
    ...(de && { de }),
    ...(ate && { ate }),
  }
}

/** O link de uma página da lista, mantendo os filtros; a página 1 sai sem `pagina`. */
export function hrefDaPagina(f: FiltrosDaTela, pagina: number): string {
  const q = new URLSearchParams()
  if (f.agenteId) q.set('agente', f.agenteId)
  if (f.canal) q.set('canal', f.canal)
  if (f.texto) q.set('texto', f.texto)
  if (f.de) q.set('de', f.de)
  if (f.ate) q.set('ate', f.ate)
  if (pagina > 1) q.set('pagina', String(pagina))
  const texto = q.toString()
  return texto === '' ? '/conversas' : `/conversas?${texto}`
}

export function descricaoDaPagina(p: { pagina: number; tamanho: number; total: number }): string {
  if (p.total === 0) return 'Nenhuma conversa'
  const de = (p.pagina - 1) * p.tamanho + 1
  const ate = Math.min(p.total, p.pagina * p.tamanho)
  return `${de} a ${ate} de ${p.total} ${p.total === 1 ? 'conversa' : 'conversas'}`
}

/** A primeira, a última e a vizinhança da página atual. */
export function paginasVisiveis(atual: number, total: number): number[] {
  const conjunto = new Set<number>([1, total, atual - 1, atual, atual + 1])
  return [...conjunto].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
}

const partesDeData = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'America/Sao_Paulo',
})

/** `10/03/2026 12:30`, no fuso de Brasília (o mesmo das outras telas do sistema). */
export function formatarAtividade(data: Date | string): string {
  const p = Object.fromEntries(partesDeData.formatToParts(new Date(data)).map((x) => [x.type, x.value]))
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`
}

export interface EstadoDoLote {
  selecionadas: string[]
  confirmando: boolean
  apagando: boolean
  erro: string | null
  aviso: string | null
}

export const ESTADO_INICIAL_DO_LOTE: EstadoDoLote = {
  selecionadas: [],
  confirmando: false,
  apagando: false,
  erro: null,
  aviso: null,
}

export type AcaoDoLote =
  | { tipo: 'alternar'; id: string }
  | { tipo: 'marcarTodas'; ids: string[] }
  | { tipo: 'desmarcarTodas'; ids: string[] }
  | { tipo: 'limpar' }
  | { tipo: 'pedirConfirmacao' }
  | { tipo: 'cancelar' }
  | { tipo: 'apagando' }
  | { tipo: 'falhou'; mensagem: string }
  | { tipo: 'concluido' }

const AVISO_DO_LIMITE = `Você pode selecionar até ${LIMITE_DO_LOTE} conversas por vez.`

function comSelecao(estado: EstadoDoLote, selecionadas: string[], aviso: string | null): EstadoDoLote {
  // Mudar a seleção desfaz uma confirmação aberta: ela era sobre outra lista.
  return { ...estado, selecionadas, aviso, confirmando: false, erro: null }
}

/** A seleção e a confirmação de apagar em lote como máquina de estados pura. */
export function reduzirLote(estado: EstadoDoLote, acao: AcaoDoLote): EstadoDoLote {
  switch (acao.tipo) {
    case 'alternar': {
      if (estado.selecionadas.includes(acao.id)) {
        return comSelecao(estado, estado.selecionadas.filter((i) => i !== acao.id), null)
      }
      if (estado.selecionadas.length >= LIMITE_DO_LOTE) return { ...estado, aviso: AVISO_DO_LIMITE }
      return comSelecao(estado, [...estado.selecionadas, acao.id], null)
    }
    case 'marcarTodas': {
      const juntas = [...new Set([...estado.selecionadas, ...acao.ids])]
      const cortou = juntas.length > LIMITE_DO_LOTE
      return comSelecao(estado, juntas.slice(0, LIMITE_DO_LOTE), cortou ? AVISO_DO_LIMITE : null)
    }
    case 'desmarcarTodas':
      return comSelecao(estado, estado.selecionadas.filter((i) => !acao.ids.includes(i)), null)
    case 'limpar':
      return ESTADO_INICIAL_DO_LOTE
    case 'pedirConfirmacao':
      return estado.selecionadas.length === 0 ? estado : { ...estado, confirmando: true, erro: null }
    case 'cancelar':
      return { ...estado, confirmando: false, erro: null }
    case 'apagando':
      return { ...estado, apagando: true, erro: null }
    case 'falhou':
      return { ...estado, apagando: false, erro: acao.mensagem }
    case 'concluido':
      return ESTADO_INICIAL_DO_LOTE
  }
}
