// Estado dos envios de arquivo da tela de conhecimento (PR-49): uma requisição
// por arquivo, com progresso e resultado por arquivo. Reducer puro, testável
// sem navegador (o ambiente de teste é `node`).

export type SituacaoDoEnvio = 'aguardando' | 'enviando' | 'aceito' | 'recusado'

export interface ItemDeEnvio {
  id: string
  nome: string
  tamanho: number
  situacao: SituacaoDoEnvio
  percentual: number
  motivo?: string
}

export interface EstadoDosEnvios {
  itens: ItemDeEnvio[]
}

export interface ArquivoParaEnvio {
  id: string
  nome: string
  tamanho: number
  /** Já recusado no navegador (extensão, vazio, tamanho): entra na lista e não vai para o envio. */
  recusadoComMotivo?: string
}

export type AcaoDosEnvios =
  | { tipo: 'adicionar'; arquivos: ArquivoParaEnvio[] }
  | { tipo: 'iniciar'; id: string }
  | { tipo: 'progresso'; id: string; percentual: number }
  | { tipo: 'resultado'; id: string; aceito: boolean; motivo?: string }
  | { tipo: 'falha'; id: string; motivo: string }
  | { tipo: 'remover'; id: string }
  | { tipo: 'limpar_terminados' }

export const estadoInicialDosEnvios: EstadoDosEnvios = { itens: [] }

function atualizar(estado: EstadoDosEnvios, id: string, mudar: (i: ItemDeEnvio) => ItemDeEnvio): EstadoDosEnvios {
  if (!estado.itens.some((i) => i.id === id)) return estado
  return { itens: estado.itens.map((i) => (i.id === id ? mudar(i) : i)) }
}

export function reducerDosEnvios(estado: EstadoDosEnvios, acao: AcaoDosEnvios): EstadoDosEnvios {
  switch (acao.tipo) {
    case 'adicionar': {
      const novos = acao.arquivos
        .filter((a) => !estado.itens.some((i) => i.id === a.id))
        .map<ItemDeEnvio>((a) =>
          a.recusadoComMotivo
            ? { id: a.id, nome: a.nome, tamanho: a.tamanho, situacao: 'recusado', percentual: 0, motivo: a.recusadoComMotivo }
            : { id: a.id, nome: a.nome, tamanho: a.tamanho, situacao: 'aguardando', percentual: 0 },
        )
      return { itens: [...estado.itens, ...novos] }
    }
    case 'iniciar':
      return atualizar(estado, acao.id, (i) => (i.situacao === 'aguardando' ? { ...i, situacao: 'enviando' } : i))
    case 'progresso':
      return atualizar(estado, acao.id, (i) =>
        i.situacao === 'enviando'
          ? { ...i, percentual: Math.min(100, Math.max(i.percentual, Math.round(acao.percentual))) }
          : i,
      )
    case 'resultado':
      return atualizar(estado, acao.id, (i) =>
        acao.aceito
          ? { ...i, situacao: 'aceito', percentual: 100, motivo: undefined }
          : { ...i, situacao: 'recusado', motivo: acao.motivo ?? 'O arquivo foi recusado.' },
      )
    case 'falha':
      return atualizar(estado, acao.id, (i) => ({ ...i, situacao: 'recusado', motivo: acao.motivo }))
    case 'remover':
      return { itens: estado.itens.filter((i) => i.id !== acao.id) }
    case 'limpar_terminados':
      return { itens: estado.itens.filter((i) => i.situacao === 'aguardando' || i.situacao === 'enviando') }
  }
}

/** Os itens que ainda precisam ser enviados. */
export function pendentesDeEnvio(estado: EstadoDosEnvios): ItemDeEnvio[] {
  return estado.itens.filter((i) => i.situacao === 'aguardando')
}

export function resumoDosEnvios(estado: EstadoDosEnvios) {
  const conta = (s: SituacaoDoEnvio) => estado.itens.filter((i) => i.situacao === s).length
  const aguardando = conta('aguardando')
  const enviando = conta('enviando')
  return {
    total: estado.itens.length,
    aguardando,
    enviando,
    aceitos: conta('aceito'),
    recusados: conta('recusado'),
    emAndamento: aguardando + enviando > 0,
  }
}
