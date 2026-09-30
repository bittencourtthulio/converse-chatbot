// A lógica da tela de chat, sem React nem rede: o estado da conversa como um
// reducer puro e as regras do campo de texto. O componente cliente só liga
// isto ao `fetch` e ao DOM, o que deixa o comportamento testável sem navegador.

/** Espelha `LIMITE_DA_MENSAGEM` de `src/servicos/chat.ts`, que o cliente não pode importar. */
export const LIMITE_DA_MENSAGEM = 4000
/** A partir daqui o contador de caracteres aparece. */
export const LIMITE_PARA_AVISO = 3500

export type EstadoDaBolha = 'completa' | 'digitando' | 'interrompida' | 'erro'

export interface Bolha {
  id: string
  papel: 'user' | 'assistant'
  texto: string
  estado: EstadoDaBolha
}

export interface ErroDaConversa {
  codigo: string
  mensagem: string
  correlacao?: string
}

export interface EstadoDaConversa {
  conversaId: string | null
  bolhas: Bolha[]
  transmitindo: boolean
  erro: ErroDaConversa | null
}

export type AcaoDaConversa =
  | { tipo: 'enviar'; texto: string; idDoUsuario: string; idDoAgente: string }
  | { tipo: 'conversa'; conversaId: string }
  | { tipo: 'trecho'; texto: string }
  | { tipo: 'fim'; conversaId: string; mensagemId: string }
  | { tipo: 'erro'; erro: ErroDaConversa }
  | { tipo: 'parar' }
  | { tipo: 'nova' }

export function estadoInicial(retomada?: {
  conversaId: string
  mensagens: Array<{ id: string; papel: 'user' | 'assistant'; conteudo: string }>
}): EstadoDaConversa {
  return {
    conversaId: retomada?.conversaId ?? null,
    bolhas: (retomada?.mensagens ?? []).map((m) => ({
      id: m.id,
      papel: m.papel,
      texto: m.conteudo,
      estado: 'completa',
    })),
    transmitindo: false,
    erro: null,
  }
}

/** Fecha a bolha do agente: sem texto ela some; com texto fica marcada. */
function encerrarBolhaDoAgente(bolhas: Bolha[], estado: EstadoDaBolha): Bolha[] {
  const ultima = bolhas.at(-1)
  if (!ultima || ultima.papel !== 'assistant' || ultima.estado !== 'digitando') return bolhas
  if (ultima.texto === '') return bolhas.slice(0, -1)
  return [...bolhas.slice(0, -1), { ...ultima, estado }]
}

export function reduzir(estado: EstadoDaConversa, acao: AcaoDaConversa): EstadoDaConversa {
  switch (acao.tipo) {
    case 'enviar':
      return {
        ...estado,
        transmitindo: true,
        erro: null,
        bolhas: [
          ...estado.bolhas,
          { id: acao.idDoUsuario, papel: 'user', texto: acao.texto, estado: 'completa' },
          { id: acao.idDoAgente, papel: 'assistant', texto: '', estado: 'digitando' },
        ],
      }
    case 'conversa':
      return { ...estado, conversaId: acao.conversaId }
    case 'trecho': {
      const ultima = estado.bolhas.at(-1)
      if (!estado.transmitindo || !ultima || ultima.estado !== 'digitando') return estado
      return {
        ...estado,
        bolhas: [...estado.bolhas.slice(0, -1), { ...ultima, texto: ultima.texto + acao.texto }],
      }
    }
    case 'fim': {
      const ultima = estado.bolhas.at(-1)
      const bolhas =
        ultima && ultima.estado === 'digitando'
          ? [...estado.bolhas.slice(0, -1), { ...ultima, id: acao.mensagemId, estado: 'completa' as const }]
          : estado.bolhas
      return { ...estado, conversaId: acao.conversaId, bolhas, transmitindo: false }
    }
    case 'erro':
      return {
        ...estado,
        bolhas: encerrarBolhaDoAgente(estado.bolhas, 'erro'),
        transmitindo: false,
        erro: acao.erro,
      }
    case 'parar':
      return {
        ...estado,
        bolhas: encerrarBolhaDoAgente(estado.bolhas, 'interrompida'),
        transmitindo: false,
      }
    case 'nova':
      return estadoInicial()
  }
}

export function contadorVisivel(tamanho: number): boolean {
  return tamanho >= LIMITE_PARA_AVISO
}

/** Dá para enviar: há texto de verdade, cabe no limite e não há resposta em curso. */
export function podeEnviar(texto: string, transmitindo: boolean): boolean {
  const util = texto.trim().length
  return !transmitindo && util > 0 && texto.length <= LIMITE_DA_MENSAGEM
}

export interface TeclaDoCampo {
  key: string
  shiftKey: boolean
  ctrlKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  /** Verdadeiro enquanto um método de entrada (IME) compõe o texto. */
  isComposing?: boolean
}

/**
 * Enter envia; Shift+Enter deixa o navegador quebrar a linha; Enter que
 * confirma uma composição de IME não envia.
 */
export function decidirTecla(tecla: TeclaDoCampo): 'enviar' | 'nada' {
  if (tecla.key !== 'Enter') return 'nada'
  if (tecla.shiftKey || tecla.isComposing || tecla.altKey || tecla.ctrlKey || tecla.metaKey) return 'nada'
  return 'enviar'
}
