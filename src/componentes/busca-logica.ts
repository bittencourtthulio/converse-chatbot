// Lógica do cartão "Testar busca" da aba Conhecimento (FT-05, PR-54), sem React
// nem rede: validar a pergunta, os estados da tela e a pontuação. O componente
// só liga isto ao `fetch` e ao DOM.

/** Espelha `LIMITE_DA_PERGUNTA_DA_BUSCA` de `src/servicos/recuperacao.ts`, que o cliente não importa. */
export const LIMITE_DA_PERGUNTA = 500

/** O que a rota `/buscar` devolve por trecho. */
export interface TrechoDaBusca {
  trechoId: string
  fonteId: string
  titulo: string
  posicao: number
  texto: string
  pontuacao: number
}

export type EstadoDaBusca =
  | { fase: 'inicial' }
  | { fase: 'carregando'; pergunta: string }
  | { fase: 'erro'; mensagem: string }
  | { fase: 'vazio'; pergunta: string }
  | { fase: 'resultado'; pergunta: string; trechos: TrechoDaBusca[] }

export type AcaoDaBusca =
  | { tipo: 'buscar'; pergunta: string }
  | { tipo: 'resultado'; trechos: TrechoDaBusca[] }
  | { tipo: 'erro'; mensagem: string }

export const estadoInicialDaBusca = (): EstadoDaBusca => ({ fase: 'inicial' })

/** A conferência barata antes de enviar; o servidor confere de novo. */
export function validarPergunta(texto: string): { ok: true; pergunta: string } | { ok: false; erro: string } {
  const pergunta = texto.trim()
  if (pergunta === '') return { ok: false, erro: 'Escreva uma pergunta.' }
  if (pergunta.length > LIMITE_DA_PERGUNTA) {
    return { ok: false, erro: `A pergunta pode ter até ${LIMITE_DA_PERGUNTA} caracteres.` }
  }
  return { ok: true, pergunta }
}

export function reduzirBusca(estado: EstadoDaBusca, acao: AcaoDaBusca): EstadoDaBusca {
  switch (acao.tipo) {
    case 'buscar':
      return { fase: 'carregando', pergunta: acao.pergunta }
    case 'resultado':
      if (estado.fase !== 'carregando') return estado
      return acao.trechos.length === 0
        ? { fase: 'vazio', pergunta: estado.pergunta }
        : { fase: 'resultado', pergunta: estado.pergunta, trechos: acao.trechos }
    case 'erro':
      if (estado.fase !== 'carregando') return estado
      return { fase: 'erro', mensagem: acao.mensagem }
  }
}

/** Duas casas com vírgula; valor menor que 0,01 aparece como "< 0,01" em vez de um "0,00" enganoso. */
export function formatarPontuacao(pontuacao: number): string {
  if (pontuacao > 0 && pontuacao < 0.01) return '< 0,01'
  return pontuacao.toFixed(2).replace('.', ',')
}
