// A lista de canais da aba Canais de um agente. Um canal novo acrescenta a
// entrada dele AQUI e o cartão correspondente em `PAINEL_DE_CANAIS` da página
// (`src/app/(sistema)/agentes/[id]/canais/page.tsx`); a aba e o layout não mudam.

export type IdDoCanal = 'telegram'

export interface CanalDoAgente {
  id: IdDoCanal
  titulo: string
  resumo: string
}

export const CANAIS_DO_AGENTE: CanalDoAgente[] = [
  {
    id: 'telegram',
    titulo: 'Telegram',
    resumo: 'Converse com este agente pelo aplicativo do Telegram, com o seu próprio bot.',
  },
]
