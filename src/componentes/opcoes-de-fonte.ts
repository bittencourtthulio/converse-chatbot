// As opções da seção "Adicionar" da aba Conhecimento; a tela lê esta lista.
import type { NomeDeIcone } from '@/componentes/itens-de-menu'

export interface OpcaoDeFonte {
  /** Identificador estável; é o valor da aba escolhida. */
  id: string
  rotulo: string
  descricao: string
  icone: NomeDeIcone
}

export const OPCOES_DE_FONTE: OpcaoDeFonte[] = [
  {
    id: 'arquivos',
    rotulo: 'Arquivos',
    descricao: 'Envie PDF, Word, planilhas CSV, HTML, JSON, legendas e arquivos de texto.',
    icone: 'upload',
  },
  {
    id: 'texto',
    rotulo: 'Texto',
    descricao: 'Cole um texto direto, com um título para reconhecê-lo depois.',
    icone: 'texto',
  },
  {
    id: 'video',
    rotulo: 'Vídeo',
    descricao: 'Envie um vídeo ou áudio, ou cole um link do YouTube: a fala vira texto para o agente usar.',
    icone: 'video',
  },
  {
    id: 'pergunta_resposta',
    rotulo: 'Perguntas e respostas',
    descricao: 'Cadastre uma pergunta e a resposta que o agente deve usar como referência.',
    icone: 'conversa',
  },
]
