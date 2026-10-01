// Canal Telegram de um agente (FT-07, PR-07, PR-14, PR-65): conectar o token de
// um bot, ler o estado e (nas próximas tasks) pausar, retomar, verificar e
// desconectar. Qualquer usuário autenticado gerencia (PR-12). O token fica
// cifrado, o segredo do webhook só existe em hash, e nada disso volta ao
// navegador: o estado devolve o bot (nome, @usuário, link), nunca o token.
import { createHash, randomBytes } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { ambiente } from '@/lib/ambiente'
import { cifrar, decifrar } from '@/lib/cripto'
import { ErroDeAplicacao, entradaInvalida, naoAutenticado, naoEncontrado } from '@/lib/erros'
import { deleteWebhook, getMe, setWebhook, tokenTemFormatoValido } from '@/lib/telegram'
import type { UsuarioAutenticado } from '@/servicos/autenticacao'

export type SituacaoDoCanal = 'conectado' | 'pausado' | 'com_erro'

export interface EstadoDoCanal {
  conectado: true
  ativo: boolean
  estado: SituacaoDoCanal
  bot: { id: string; username: string; nome: string; url: string }
  webhookUrl: string
  conectadoEm: Date
  ultimoErro: string | null
  ultimoErroEm: Date | null
  ultimaMensagemEm: Date | null
  limiteDiario: number
}

export const MENSAGEM_DE_URL_NAO_HTTPS =
  'Para conectar o Telegram, defina APP_URL com o endereço HTTPS público deste sistema. ' +
  'O Telegram só aceita webhook em HTTPS público; em desenvolvimento, exponha o servidor por um ' +
  'túnel (por exemplo ngrok ou Cloudflare Tunnel) e use o endereço dele em APP_URL.'

const MENSAGEM_DE_TOKEN =
  'O token do bot não parece válido. Ele tem o formato 123456789:ABC… e é entregue pelo @BotFather.'

function exigirAutor(autor: UsuarioAutenticado | null | undefined): asserts autor {
  if (!autor?.id) throw naoAutenticado()
}

export const hashDoSegredo = (segredo: string): string => createHash('sha256').update(segredo).digest('hex')

/** `APP_URL` lida sem lançar: valor inválido conta como ausente. */
function appUrlConfigurada(): string | undefined {
  try {
    return ambiente.appUrlPublica
  } catch {
    return undefined
  }
}

/** A origem pública que o Telegram vai chamar; exige HTTPS (PR-65). */
export function origemDoWebhook(): string {
  const url = appUrlConfigurada()
  const https = url?.startsWith('https://') === true
  const http = url?.startsWith('http://') === true && ambiente.telegramPermitirUrlNaoHttps
  if (!url || !(https || http)) {
    throw new ErroDeAplicacao(MENSAGEM_DE_URL_NAO_HTTPS, 422, 'telegram_url_nao_https')
  }
  return url
}

export function urlDoWebhook(agenteId: string): string {
  return `${origemDoWebhook()}/api/telegram/${agenteId}/webhook`
}

/** `true` quando o Telegram aceitaria a `APP_URL` atual (para a tela avisar). */
export function appUrlServeAoTelegram(): boolean {
  try {
    origemDoWebhook()
    return true
  } catch {
    return false
  }
}

interface LinhaDoCanal {
  ativo: boolean
  botId: string
  botUsername: string
  botNome: string
  webhookUrl: string
  conectadoEm: Date
  ultimoErro: string | null
  ultimoErroEm: Date | null
  ultimaMensagemEm: Date | null
  limiteDiario: number
}

export function paraEstado(canal: LinhaDoCanal): EstadoDoCanal {
  return {
    conectado: true,
    ativo: canal.ativo,
    estado: !canal.ativo ? 'pausado' : canal.ultimoErro !== null ? 'com_erro' : 'conectado',
    bot: {
      id: canal.botId,
      username: canal.botUsername,
      nome: canal.botNome,
      url: `https://t.me/${canal.botUsername}`,
    },
    webhookUrl: canal.webhookUrl,
    conectadoEm: canal.conectadoEm,
    ultimoErro: canal.ultimoErro,
    ultimoErroEm: canal.ultimoErroEm,
    ultimaMensagemEm: canal.ultimaMensagemEm,
    limiteDiario: canal.limiteDiario,
  }
}

async function exigirAgente(agenteId: string): Promise<{ id: string; nome: string }> {
  const agente = await prisma.agente.findUnique({ where: { id: agenteId }, select: { id: true, nome: true } })
  if (!agente) throw naoEncontrado('Agente não encontrado.')
  return agente
}

/** O estado do canal do agente, ou `null` se não há bot conectado. */
export async function estado(autor: UsuarioAutenticado, agenteId: string): Promise<EstadoDoCanal | null> {
  exigirAutor(autor)
  const canal = await prisma.canalTelegram.findUnique({ where: { agenteId } })
  return canal ? paraEstado(canal) : null
}

function lerToken(entrada: unknown): string {
  if (typeof entrada !== 'string' || entrada.trim() === '') throw entradaInvalida('Informe o token do bot.')
  const token = entrada.trim()
  // A mensagem não repete o que foi digitado: pode ser um segredo errado de outro lugar.
  if (!tokenTemFormatoValido(token)) throw entradaInvalida(MENSAGEM_DE_TOKEN)
  return token
}

/**
 * Conecta o bot ao agente: confere o formato, a URL pública e o bot (`getMe`),
 * cifra o token, registra o webhook com um segredo novo e só então grava. Sem
 * `ENCRYPTION_KEY` ou com `APP_URL` sem HTTPS, falha antes de falar com o Telegram.
 * Reconectar gira o segredo; se o bot mudou, o webhook do antigo é solto.
 */
export async function conectar(
  autor: UsuarioAutenticado,
  agenteId: string,
  tokenBruto: unknown,
): Promise<EstadoDoCanal> {
  exigirAutor(autor)
  const agente = await exigirAgente(agenteId)
  const token = lerToken(tokenBruto)
  const url = urlDoWebhook(agente.id)
  const tokenCifrado = cifrar(token)

  const bot = await getMe(token)
  const dono = await prisma.canalTelegram.findUnique({
    where: { botId: bot.id },
    select: { agenteId: true, agente: { select: { nome: true } } },
  })
  if (dono && dono.agenteId !== agente.id) {
    throw new ErroDeAplicacao(
      `Este bot já está conectado ao agente "${dono.agente.nome}". Desconecte-o lá antes de usá-lo aqui.`,
      409,
      'telegram_bot_em_uso',
    )
  }

  const segredo = randomBytes(32).toString('hex')
  await setWebhook(token, { url, secretToken: segredo })

  const anterior = await prisma.canalTelegram.findUnique({ where: { agenteId: agente.id } })
  const dados = {
    tokenCifrado,
    botId: bot.id,
    botUsername: bot.username,
    botNome: bot.nome,
    segredoDoWebhookHash: hashDoSegredo(segredo),
    ativo: true,
    webhookUrl: url,
    conectadoEm: new Date(),
    ultimoErro: null,
    ultimoErroEm: null,
  }
  let canal
  try {
    canal = await prisma.canalTelegram.upsert({
      where: { agenteId: agente.id },
      create: { agenteId: agente.id, ...dados },
      update: { ...dados, ...(anterior && anterior.botId !== bot.id && { ultimaMensagemEm: null }) },
    })
  } catch (erro) {
    // Não deixa um webhook registrado sem canal que o atenda.
    await deleteWebhook(token).catch(() => undefined)
    throw erro
  }

  if (anterior && anterior.botId !== bot.id) await soltarWebhookDoBotAntigo(anterior.tokenCifrado)
  return paraEstado(canal)
}

/** Melhor esforço: o bot antigo deixa de mandar updates para este agente. */
async function soltarWebhookDoBotAntigo(tokenCifrado: string): Promise<void> {
  try {
    await deleteWebhook(decifrar(tokenCifrado))
  } catch {
    // Token antigo ilegível ou Telegram fora do ar: nada a fazer.
  }
}
