// A lógica pura da aba Canais (FT-07, PR-69): transforma o estado do canal numa
// visão (selo, botões, aviso, link do bot) sem navegador, para ter teste sem
// DOM. O componente cliente só liga isto ao DOM e às ações. Não importa serviço
// de valor nem banco: este arquivo roda no navegador.
import type { EstadoDoCanal } from '@/servicos/canal-telegram'

export const AVISO_SEM_APP_URL =
  'A conexão funciona diretamente enquanto este servidor estiver ligado. Você pode testar no Telegram sem configurar um endereço público.'

export const PASSOS_DO_TELEGRAM = [
  'Abra o @BotFather no Telegram e crie um bot com o comando /newbot.',
  'Copie o token que o @BotFather entregar e cole no campo abaixo.',
  'Clique em Conectar. A partir daí, quem falar com o bot conversa com este agente.',
] as const

export type SituacaoDoCartao = 'nao_conectado' | 'conectado' | 'pausado' | 'com_erro'
type VarianteDoSelo = 'neutro' | 'sucesso' | 'aviso' | 'perigo'

/** O que a tela recebe do canal: só texto e números, nunca token, segredo nem id do bot. */
export interface DadosDoCanalTelegram {
  ativo: boolean
  estado: 'conectado' | 'pausado' | 'com_erro'
  bot: { username: string; nome: string; url: string }
  webhookUrl: string
  conectadoEm: string
  ultimoErro: string | null
  ultimoErroEm: string | null
  ultimaMensagemEm: string | null
  limiteDiario: number
}

export interface VisaoDoCartaoTelegram {
  situacao: SituacaoDoCartao
  selo: { texto: string; variante: VarianteDoSelo }
  /** O recebimento direto permite conectar mesmo sem URL pública. */
  podeConectar: boolean
  motivoSemConectar: string | null
  linkDoBot: string | null
  rotuloDaPausa: 'Pausar' | 'Retomar'
}

/** Data e hora em português, ou nulo. */
export function formatarData(data: Date | null): string | null {
  return data === null ? null : data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

/** O estado do serviço, reduzido ao que a tela precisa, com as datas já formatadas. */
export function dadosDoCanal(canal: EstadoDoCanal | null): DadosDoCanalTelegram | null {
  if (canal === null) return null
  return {
    ativo: canal.ativo,
    estado: canal.estado,
    bot: { username: canal.bot.username, nome: canal.bot.nome, url: canal.bot.url },
    webhookUrl: canal.webhookUrl,
    conectadoEm: formatarData(canal.conectadoEm) ?? '',
    ultimoErro: canal.ultimoErro,
    ultimoErroEm: formatarData(canal.ultimoErroEm),
    ultimaMensagemEm: formatarData(canal.ultimaMensagemEm),
    limiteDiario: canal.limiteDiario,
  }
}

const SELOS: Record<SituacaoDoCartao, { texto: string; variante: VarianteDoSelo }> = {
  nao_conectado: { texto: 'Não conectado', variante: 'neutro' },
  conectado: { texto: 'Conectado', variante: 'sucesso' },
  pausado: { texto: 'Pausado', variante: 'aviso' },
  com_erro: { texto: 'Com erro', variante: 'perigo' },
}

export function visaoDoCartaoTelegram(entrada: {
  canal: DadosDoCanalTelegram | null
  appUrlServe: boolean
}): VisaoDoCartaoTelegram {
  const situacao: SituacaoDoCartao = entrada.canal === null ? 'nao_conectado' : entrada.canal.estado
  return {
    situacao,
    selo: SELOS[situacao],
    podeConectar: true,
    motivoSemConectar: (entrada.canal ? entrada.canal.webhookUrl !== '' : entrada.appUrlServe) ? null : AVISO_SEM_APP_URL,
    linkDoBot: entrada.canal?.bot.url ?? null,
    rotuloDaPausa: entrada.canal !== null && !entrada.canal.ativo ? 'Retomar' : 'Pausar',
  }
}

type EstadoDaConfirmacao = 'inicial' | 'confirmando'

/** Desconectar pede confirmação na própria tela: o primeiro clique só abre o bloco. */
export function proximoEstadoDaDesconexao(
  estado: EstadoDaConfirmacao,
  evento: 'desconectar' | 'cancelar',
): EstadoDaConfirmacao {
  if (evento === 'desconectar') return 'confirmando'
  return estado === 'confirmando' ? 'inicial' : estado
}
