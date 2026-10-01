// O atendimento de um update do Telegram (FT-07, PR-67): só mensagem de chat
// privado; `/start` responde a mensagem inicial do agente, `/novo` e `/reiniciar`
// abrem uma conversa nova, o que não é texto recebe um aviso e grupos e canais
// são ignorados. Roda depois que o webhook respondeu 200, por isso nenhum erro
// sobe: o que falha vira o último erro do canal (mensagem segura, sem token).
import { prisma } from '@/lib/prisma'
import { decifrar } from '@/lib/cripto'
import { ErroDoTelegram, sendChatAction, sendMessage } from '@/lib/telegram'
import { registrarErroDoCanal } from '@/servicos/canal-telegram'
import { LIMITE_DA_MENSAGEM, mensagemParaOperador, mensagemParaVisitante, responderMensagem } from '@/servicos/chat'
import type { FonteDaResposta } from '@/servicos/fontes-da-resposta'
import { exclusaoMutuaPadrao, type ExclusaoMutua } from '@/lib/exclusao-mutua'
import type { Limitador } from '@/lib/limite-de-uso'
import { frasePorLimiteDoBanco, MENSAGENS_DE_LIMITE, permitirMensagemDoChat } from '@/servicos/telegram-limites'
import { criar as criarConversa, listar as listarConversas, LIMITE_DO_TITULO } from '@/servicos/conversas'
import type { CanalAutenticado, MensagemDoUpdate, UpdateLido } from '@/servicos/telegram-webhook'

export const AVISO_SO_TEXTO = 'Só consigo ler mensagens de texto por enquanto.'
export const MENSAGEM_INICIAL_PADRAO = 'Olá! Envie sua pergunta.'
export const MENSAGEM_DE_NOVA_CONVERSA = 'Certo, começamos uma nova conversa. Pode perguntar.'

export const AVISO_MENSAGEM_LONGA = `Sua mensagem é longa demais. Envie até ${LIMITE_DA_MENSAGEM} caracteres por vez.`
/** O "digitando…" do Telegram dura cerca de 5 s: renova-se a cada 4. */
export const INTERVALO_DO_DIGITANDO_MS = 4000

export interface OpcoesDeAtendimento {
  intervaloDigitandoMs?: number
  /** Limitador por chat; o teste injeta um com relógio próprio. */
  limitador?: Limitador
  /** "Agora" do teto diário, para o teste. */
  agora?: Date
  /** Exclusão mútua por chat; o teste injeta uma própria. */
  exclusao?: ExclusaoMutua
}

export type Comando = 'start' | 'novo'

/**
 * O comando que o texto carrega, se for um dos nossos: `/start`, `/novo` ou
 * `/reiniciar`, com argumento ou com o `@` do próprio bot; qualquer outra coisa
 * (inclusive comando de outro bot) é texto comum.
 */
export function interpretarComando(texto: string, botUsername: string): Comando | null {
  const m = /^\/([A-Za-z0-9_]+)(?:@([A-Za-z0-9_]+))?(?:\s|$)/.exec(texto.trim())
  if (!m) return null
  if (m[2] !== undefined && m[2].toLowerCase() !== botUsername.toLowerCase()) return null
  switch ((m[1] as string).toLowerCase()) {
    case 'start':
      return 'start'
    case 'novo':
    case 'reiniciar':
      return 'novo'
    default:
      return null
  }
}

/** "Telegram: Nome", só com o nome público (PR-18), sem controle e em até 60 caracteres. */
export function tituloDoChat(nome: string | undefined): string {
  const limpo = (nome ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim()
  return `Telegram: ${limpo === '' ? 'contato' : limpo}`.slice(0, LIMITE_DO_TITULO)
}

/** Envia ao chat; falha do Telegram vira o último erro do canal e não propaga. */
export async function enviarAoChat(canal: CanalAutenticado, chatId: number, texto: string): Promise<boolean> {
  try {
    await sendMessage(decifrar(canal.tokenCifrado), chatId, texto)
    return true
  } catch (erro) {
    const mensagem =
      erro instanceof ErroDoTelegram
        ? erro.message
        : 'Não foi possível enviar a resposta pelo Telegram. Confira o token do bot.'
    await registrarErroDoCanal(canal.id, mensagem).catch(() => undefined)
    return false
  }
}

/** A conversa mais recente do chat com o agente, ou uma nova com o título pelo nome público. */
export async function conversaDoChat(canal: CanalAutenticado, mensagem: MensagemDoUpdate): Promise<{ id: string }> {
  const identificadorExterno = String(mensagem.chatId)
  const [existente] = await listarConversas({ agenteId: canal.agenteId, canal: 'telegram', identificadorExterno, limite: 1 })
  if (existente) return existente
  return novaConversaDoChat(canal, mensagem)
}

export async function novaConversaDoChat(canal: CanalAutenticado, mensagem: MensagemDoUpdate): Promise<{ id: string }> {
  return criarConversa({
    agenteId: canal.agenteId,
    canal: 'telegram',
    identificadorExterno: String(mensagem.chatId),
    titulo: tituloDoChat(mensagem.nome),
  })
}

async function marcarMensagemRecebida(canalId: string): Promise<void> {
  await prisma.canalTelegram.updateMany({ where: { id: canalId }, data: { ultimaMensagemEm: new Date() } })
}

/**
 * Atende o update. Só chat privado; grupos, canais e updates que não são
 * mensagem são ignorados sem resposta.
 */
export async function atenderUpdate(
  canal: CanalAutenticado,
  update: UpdateLido,
  opcoes: OpcoesDeAtendimento = {},
): Promise<void> {
  const mensagem = update.mensagem
  if (!mensagem || mensagem.tipoDoChat !== 'private') return
  // Um chat é atendido em ordem (PR-68); chats diferentes não se esperam.
  await (opcoes.exclusao ?? exclusaoMutuaPadrao).executar(`${canal.id}:${mensagem.chatId}`, () =>
    atenderMensagem(canal, mensagem, opcoes),
  )
}

async function atenderMensagem(
  canal: CanalAutenticado,
  mensagem: MensagemDoUpdate,
  opcoes: OpcoesDeAtendimento,
): Promise<void> {
  await marcarMensagemRecebida(canal.id)
  // Limite por chat (PR-68): vale para tudo que o chat manda, comando inclusive,
  // e vem antes de criar conversa ou chamar qualquer coisa.
  if (!permitirMensagemDoChat({ canalId: canal.id, chatId: mensagem.chatId }, opcoes.limitador)) {
    await enviarAoChat(canal, mensagem.chatId, MENSAGENS_DE_LIMITE.porChat)
    return
  }

  if (mensagem.texto === undefined) {
    await enviarAoChat(canal, mensagem.chatId, AVISO_SO_TEXTO)
    return
  }
  const comando = interpretarComando(mensagem.texto, canal.botUsername)
  if (comando === 'start') {
    const agente = await prisma.agente.findUnique({ where: { id: canal.agenteId }, select: { mensagemInicial: true } })
    const inicial = agente?.mensagemInicial.trim() ?? ''
    await enviarAoChat(canal, mensagem.chatId, inicial === '' ? MENSAGEM_INICIAL_PADRAO : inicial)
    return
  }
  if (comando === 'novo') {
    await novaConversaDoChat(canal, mensagem)
    await enviarAoChat(canal, mensagem.chatId, MENSAGEM_DE_NOVA_CONVERSA)
    return
  }
  if (mensagem.texto.trim() === '') return
  if (mensagem.texto.length > LIMITE_DA_MENSAGEM) {
    await enviarAoChat(canal, mensagem.chatId, AVISO_MENSAGEM_LONGA)
    return
  }
  // Os limites do banco (PR-68): conversa cheia e teto diário do canal.
  const conversa = await conversaDoChat(canal, mensagem)
  const frase = await frasePorLimiteDoBanco({
    agenteId: canal.agenteId,
    conversaId: conversa.id,
    limiteDiario: canal.limiteDiario,
    agora: opcoes.agora,
  })
  if (frase !== null) {
    await enviarAoChat(canal, mensagem.chatId, frase)
    return
  }
  await responderAoChat(canal, mensagem, conversa.id, mensagem.texto, opcoes)
}

/** Mantém o "digitando…" até `parar()`. Falha do indicador nunca atrapalha a resposta. */
function manterDigitando(token: string, chatId: number, intervaloMs: number): () => void {
  let ativo = true
  const mostrar = () => {
    if (ativo) sendChatAction(token, chatId).catch(() => undefined)
  }
  mostrar()
  const relogio = setInterval(mostrar, intervaloMs)
  return () => {
    ativo = false
    clearInterval(relogio)
  }
}

/** A linha final com os títulos das fontes citadas, ou nada se nenhuma foi. */
function linhaDeFontes(fontes: FonteDaResposta[]): string {
  const titulos = [...new Set(fontes.filter((f) => f.citada).map((f) => f.titulo.replace(/\s+/g, ' ').trim()).filter(Boolean))]
  return titulos.length === 0 ? '' : `\n\nFontes: ${titulos.join(', ')}`
}

/**
 * O turno do agente: `responderMensagem` com canal `telegram` e o chat id como
 * identificador externo. A resposta sai em texto puro, com `[n]` mantidos e a
 * linha de fontes; falha do provedor vira a frase única ao chat e a mensagem
 * segura do operador no último erro do canal.
 */
async function responderAoChat(
  canal: CanalAutenticado,
  mensagem: MensagemDoUpdate,
  conversaId: string,
  texto: string,
  opcoes: OpcoesDeAtendimento,
): Promise<void> {
  const token = decifrar(canal.tokenCifrado)
  const pararDigitando = manterDigitando(token, mensagem.chatId, opcoes.intervaloDigitandoMs ?? INTERVALO_DO_DIGITANDO_MS)
  let resposta = ''
  let fontes: FonteDaResposta[] = []
  let concluiu = false
  let erro: unknown
  try {
    for await (const evento of responderMensagem({
      agenteId: canal.agenteId,
      conversaId,
      canal: 'telegram',
      identificadorExterno: String(mensagem.chatId),
      mensagem: texto,
    })) {
      if (evento.tipo === 'trecho') resposta += evento.texto
      else if (evento.tipo === 'fontes') fontes = evento.fontes
      else if (evento.tipo === 'fim') concluiu = true
    }
  } catch (e) {
    erro = e
  } finally {
    pararDigitando()
  }

  if (erro !== undefined || !concluiu) {
    const segura = mensagemParaOperador(erro).mensagem
    await registrarErroDoCanal(canal.id, segura).catch(() => undefined)
    await enviarAoChat(canal, mensagem.chatId, mensagemParaVisitante(erro))
    return
  }
  const enviou = await enviarAoChat(canal, mensagem.chatId, resposta + linhaDeFontes(fontes))
  if (enviou) await limparErroDoCanal(canal.id)
}

async function limparErroDoCanal(canalId: string): Promise<void> {
  await prisma.canalTelegram.updateMany({ where: { id: canalId, NOT: { ultimoErro: null } }, data: { ultimoErro: null, ultimoErroEm: null } })
}
