// A lista de abas da página de um agente. Uma feature nova acrescenta a aba
// dela AQUI e cria a subrota em `src/app/(sistema)/agentes/[id]/<caminho>`;
// o componente `AbasDoAgente` e o layout não mudam. Exemplos previstos:
// Conhecimento (FT-04), Canais (FT-06, FT-07), Conversas (FT-09).

export interface AbaDoAgente {
  rotulo: string
  /** Subrota do agente, sem barras. Vazio é a página de configurações. */
  caminho: string
}

export const ABAS_DO_AGENTE: AbaDoAgente[] = [
  { rotulo: 'Configurações', caminho: '' },
  { rotulo: 'Testar', caminho: 'testar' },
]

export function hrefDaAba(agenteId: string, aba: AbaDoAgente): string {
  return aba.caminho ? `/agentes/${agenteId}/${aba.caminho}` : `/agentes/${agenteId}`
}
