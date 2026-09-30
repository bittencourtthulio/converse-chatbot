// Lógica pura da tela de conhecimento (PR-49), sem DOM nem rede: o componente
// só a liga ao navegador. Testável no ambiente `node`.
import { EXTENSOES_ACEITAS, formatoDoNome } from '@/lib/extracao/formatos'
import type { NomeDeIcone } from '@/componentes/itens-de-menu'

export type ResultadoDaValidacao = { ok: true } | { ok: false; motivo: string }

/** `1,5 KB`, `5 MB`: uma casa decimal só quando ela existe, vírgula como separador. */
export function formatarTamanho(bytes: number): string {
  const unidades = ['B', 'KB', 'MB', 'GB']
  let valor = bytes
  let i = 0
  while (valor >= 1024 && i < unidades.length - 1) {
    valor /= 1024
    i += 1
  }
  const texto = i === 0 || Number.isInteger(valor) ? String(valor) : valor.toFixed(1).replace('.', ',')
  return `${texto} ${unidades[i]}`
}

/**
 * A mesma conferência barata que o servidor faz (extensão, vazio, tamanho),
 * antes de gastar a rede. O servidor confere de novo: isto é conveniência.
 */
export function validarArquivoNoNavegador(nome: string, tamanho: number, maxBytes: number): ResultadoDaValidacao {
  if (!formatoDoNome(nome)) {
    return { ok: false, motivo: `Formato não aceito. Formatos aceitos: ${EXTENSOES_ACEITAS.join(', ')}.` }
  }
  if (tamanho === 0) return { ok: false, motivo: 'O arquivo está vazio.' }
  if (tamanho > maxBytes) {
    return {
      ok: false,
      motivo: `O arquivo tem ${formatarTamanho(tamanho)} e o limite é de ${formatarTamanho(maxBytes)}.`,
    }
  }
  return { ok: true }
}

const FORMATO_DE_DATA = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  // Fuso fixo: servidor e navegador escrevem a mesma hora (sem erro de hidratação).
  timeZone: 'America/Sao_Paulo',
})

export function formatarData(data: Date | string | null | undefined): string {
  if (!data) return '—'
  const d = typeof data === 'string' ? new Date(data) : data
  return Number.isNaN(d.getTime()) ? '—' : FORMATO_DE_DATA.format(d).replace(',', '')
}

export function formatarCaracteres(n: number): string {
  return n.toLocaleString('pt-BR')
}

export interface RotuloDeStatus {
  rotulo: string
  variante: 'neutro' | 'acento' | 'sucesso' | 'perigo' | 'aviso'
  /** Spinner ao lado do rótulo. */
  girando: boolean
}

export function rotuloDoStatus(status: string): RotuloDeStatus {
  switch (status) {
    case 'pendente':
      return { rotulo: 'Na fila', variante: 'neutro', girando: false }
    case 'processando':
      return { rotulo: 'Processando', variante: 'acento', girando: true }
    case 'pronto':
      return { rotulo: 'Pronto', variante: 'sucesso', girando: false }
    case 'erro':
      return { rotulo: 'Erro', variante: 'perigo', girando: false }
    default:
      return { rotulo: 'Desconhecido', variante: 'neutro', girando: false }
  }
}

/** O polling de 2 s só continua enquanto houver fonte que ainda vai mudar. */
export function deveContinuarPolling(fontes: Array<{ status: string }>): boolean {
  return fontes.some((f) => f.status === 'pendente' || f.status === 'processando')
}

export function iconeDoTipo(tipo: string): NomeDeIcone {
  return tipo === 'texto' ? 'texto' : 'arquivo'
}

export const INTERVALO_DO_POLLING_MS = 2000
