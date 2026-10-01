// A lógica pura da tela Configurações > Sistema (FT-11, PR-95), sem React nem banco: bytes, tempo de
// atividade, situação, sim ou não e a fila escritos em português para quem não é técnico.
import type { NomeDoItemDeSaude, SituacaoDeSaude } from '@/servicos/saude'

/** Tamanho em B, KB, MB ou GB, com vírgula decimal e uma casa; `null` é "Indisponível". */
export function formatarBytes(bytes: number | null): string {
  if (bytes === null) return 'Indisponível'
  if (bytes < 1024) return `${bytes} B`
  let valor = bytes / 1024
  for (const unidade of ['KB', 'MB', 'GB']) {
    if (valor < 1024 || unidade === 'GB') return `${valor.toFixed(1).replace('.', ',')} ${unidade}`
    valor /= 1024
  }
  return `${bytes} B`
}

/** O tempo de atividade nos dois maiores componentes: "2 h 5 min", "3 dias 4 h", "45 s". */
export function formatarAtividade(segundos: number): string {
  const total = Math.max(0, Math.floor(segundos))
  const partes: Array<[number, string, string]> = [
    [Math.floor(total / 86400), 'dia', 'dias'],
    [Math.floor((total % 86400) / 3600), 'h', 'h'],
    [Math.floor((total % 3600) / 60), 'min', 'min'],
    [total % 60, 's', 's'],
  ]
  const primeira = partes.findIndex(([n]) => n > 0)
  if (primeira === -1) return '0 s'
  return partes
    .slice(primeira, primeira + 2)
    .filter(([n]) => n > 0)
    .map(([n, singular, plural]) => `${n} ${n === 1 ? singular : plural}`)
    .join(' ')
}

const DATA_E_HORA = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

/** Data e hora no fuso do servidor, ou `ausente` quando não há data. */
export function formatarDataHora(data: Date | null, ausente: string): string {
  return data ? DATA_E_HORA.format(data) : ausente
}

export function situacaoEmTexto(situacao: SituacaoDeSaude): { rotulo: string; variante: 'sucesso' | 'aviso' | 'perigo' } {
  if (situacao === 'ok') return { rotulo: 'Tudo em ordem', variante: 'sucesso' }
  if (situacao === 'degradado') return { rotulo: 'Funcionando com limitações', variante: 'aviso' }
  return { rotulo: 'Com falha', variante: 'perigo' }
}

export const simOuNao = (valor: boolean): string => (valor ? 'Sim' : 'Não')

const ROTULOS_DOS_ITENS: Record<NomeDoItemDeSaude, string> = {
  banco: 'Banco de dados',
  disco: 'Disco (dados e arquivos)',
  busca: 'Índice de busca',
  midia: 'Vídeo e áudio (ffmpeg)',
}
export const rotuloDoItemDeSaude = (nome: NomeDoItemDeSaude): string => ROTULOS_DOS_ITENS[nome]

/** A fila de fontes em uma frase: "1 pendente, 2 processando, 1 com erro", ou "Fila vazia". */
export function descreverFila(fila: { pendentes: number; processando: number; erro: number }): string {
  const partes: string[] = []
  if (fila.pendentes > 0) partes.push(`${fila.pendentes} ${fila.pendentes === 1 ? 'pendente' : 'pendentes'}`)
  if (fila.processando > 0) partes.push(`${fila.processando} processando`)
  if (fila.erro > 0) partes.push(`${fila.erro} com erro`)
  return partes.length === 0 ? 'Fila vazia' : partes.join(', ')
}

export function descreverArquivos(arquivos: number, parcial: boolean): string {
  const base = `${arquivos} ${arquivos === 1 ? 'arquivo' : 'arquivos'}`
  return parcial ? `${base} ou mais` : base
}

export function descreverChaveDeCriptografia(definida: boolean, valida: boolean): string {
  if (!definida) return 'Não definida'
  return valida ? 'Sim' : 'Definida, mas inválida'
}
