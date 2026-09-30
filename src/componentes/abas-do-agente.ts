// A lista de abas da página de um agente. Uma feature nova acrescenta a aba
// dela AQUI e cria a subrota em `src/app/(sistema)/agentes/[id]/<caminho>`;
// o componente `AbasDoAgente` e o layout não mudam. Exemplos previstos:
// Canais (FT-07), Conversas (FT-09). Conhecimento é da FT-04; Publicar, da FT-06.

export interface AbaDoAgente {
  rotulo: string
  /** Subrota do agente, sem barras. Vazio é a página de configurações. */
  caminho: string
}

export const ABAS_DO_AGENTE: AbaDoAgente[] = [
  { rotulo: 'Configurações', caminho: '' },
  { rotulo: 'Conhecimento', caminho: 'conhecimento' },
  { rotulo: 'Testar', caminho: 'testar' },
  { rotulo: 'Publicar', caminho: 'publicar' },
]

export function hrefDaAba(agenteId: string, aba: AbaDoAgente): string {
  return aba.caminho ? `/agentes/${agenteId}/${aba.caminho}` : `/agentes/${agenteId}`
}
