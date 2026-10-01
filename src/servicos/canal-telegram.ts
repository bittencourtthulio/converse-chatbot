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
import { ErroDoTelegram, deleteWebhook, getMe, getWebhookInfo, redigirToken, setWebhook, tokenTemFormatoValido } from '@/lib/telegram'
import type { UsuarioAutenticado } from '@/servicos/autenticacao'

export type AcaoNoCanal = 'conectar' | 'desconectar' | 'pausar' | 'retomar' | 'limite'

/** O que a auditoria (FT-10) recebe: quem fez o quê em qual agente. Nunca token, segredo nem conteúdo. */
export interface AlteracaoDoCanal {
  acao: AcaoNoCanal
  agenteId: string
  usuarioId: string
}

const CHAVE_DOS_OUVINTES = Symbol.for('converse.ouvintesDoCanal')

/**
 * Os ouvintes moram em `globalThis`: o Next pode carregar este módulo mais de uma vez e a
 * auditoria (FT-10, PR-86) precisa ser vista por todos.
 */
function obterOuvintes(): Set<(alteracao: AlteracaoDoCanal) => void> {
  const g = globalThis as unknown as Record<symbol, Set<(alteracao: AlteracaoDoCanal) => void> | undefined>
  return (g[CHAVE_DOS_OUVINTES] ??= new Set())
}

/**
 * Ponto de extensão da FT-10: registra um ouvinte das alterações do canal e
 * devolve a função que o remove. Ouvinte que lança não derruba a operação.
 */
export function aoAlterarCanal(ouvinte: (alteracao: AlteracaoDoCanal) => void): () => void {
  const conjunto = obterOuvintes()
  conjunto.add(ouvinte)
  return () => void conjunto.delete(ouvinte)
}

function avisarAlteracao(acao: AcaoNoCanal, autor: UsuarioAutenticado, agenteId: string): void {
  for (const ouvinte of [...obterOuvintes()]) {
    try {
      ouvinte({ acao, agenteId, usuarioId: autor.id })
    } catch {
      console.error(JSON.stringify({ evento: 'ouvinte_do_canal_falhou', agenteId }))
    }
  }
}

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
  avisarAlteracao('conectar', autor, agente.id)
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

async function exigirCanal(agenteId: string) {
  const canal = await prisma.canalTelegram.findUnique({ where: { agenteId } })
  if (!canal) throw naoEncontrado('Este agente não tem um bot do Telegram conectado.')
  return canal
}

/**
 * Desconecta o bot: tenta soltar o webhook no Telegram (a falha não impede a
 * limpeza local), apaga canal, token, segredo e dedupe, e mantém as conversas.
 */
export async function desconectar(
  autor: UsuarioAutenticado,
  agenteId: string,
): Promise<{ webhookRemovido: boolean }> {
  exigirAutor(autor)
  const canal = await exigirCanal(agenteId)
  let webhookRemovido = true
  try {
    await deleteWebhook(decifrar(canal.tokenCifrado))
  } catch {
    webhookRemovido = false
  }
  await prisma.canalTelegram.delete({ where: { agenteId } })
  avisarAlteracao('desconectar', autor, agenteId)
  return { webhookRemovido }
}

async function marcarAtivo(autor: UsuarioAutenticado, agenteId: string, ativo: boolean): Promise<EstadoDoCanal> {
  exigirAutor(autor)
  await exigirCanal(agenteId)
  const canal = await prisma.canalTelegram.update({ where: { agenteId }, data: { ativo } })
  avisarAlteracao(ativo ? 'retomar' : 'pausar', autor, agenteId)
  return paraEstado(canal)
}

/** Pausa: o webhook segue registrado e o app responde 200 sem atender (PR-65). */
export const pausar = (autor: UsuarioAutenticado, agenteId: string) => marcarAtivo(autor, agenteId, false)
export const retomar = (autor: UsuarioAutenticado, agenteId: string) => marcarAtivo(autor, agenteId, true)

export interface ResultadoDaVerificacao {
  urlConfere: boolean
  urlEsperada: string
  urlRegistrada: string
  pendentes: number
  /** O último erro de entrega que o Telegram reporta, já sem token e curto. */
  ultimoErroDoTelegram: string | null
  ultimoErroDoTelegramEm: Date | null
}

/** "Verificar": compara o webhook registrado no Telegram com o esperado. */
export async function verificar(autor: UsuarioAutenticado, agenteId: string): Promise<ResultadoDaVerificacao> {
  exigirAutor(autor)
  const canal = await exigirCanal(agenteId)
  const token = decifrar(canal.tokenCifrado)
  try {
    const info = await getWebhookInfo(token)
    return {
      urlConfere: info.url === canal.webhookUrl,
      urlEsperada: canal.webhookUrl,
      urlRegistrada: info.url,
      pendentes: info.pendentes,
      ultimoErroDoTelegram: info.ultimoErro === null ? null : redigirToken(info.ultimoErro, token).slice(0, 200),
      ultimoErroDoTelegramEm: info.ultimoErroEm,
    }
  } catch (erro) {
    if (erro instanceof ErroDoTelegram) await registrarErroDoCanal(canal.id, erro.message)
    throw erro
  }
}

/** Grava o último erro do canal (mensagem já segura, em português). */
export async function registrarErroDoCanal(canalId: string, mensagem: string): Promise<void> {
  await prisma.canalTelegram.updateMany({
    where: { id: canalId },
    data: { ultimoErro: mensagem.slice(0, 300), ultimoErroEm: new Date() },
  })
}

export const LIMITE_DIARIO_MINIMO = 1
export const LIMITE_DIARIO_MAXIMO = 100_000

export async function definirLimiteDiario(
  autor: UsuarioAutenticado,
  agenteId: string,
  valor: unknown,
): Promise<EstadoDoCanal> {
  exigirAutor(autor)
  const texto = typeof valor === 'string' ? valor.trim() : valor
  const numero = typeof texto === 'string' && /^\d+$/.test(texto) ? Number(texto) : texto
  if (typeof numero !== 'number' || !Number.isInteger(numero) || numero < LIMITE_DIARIO_MINIMO || numero > LIMITE_DIARIO_MAXIMO) {
    throw entradaInvalida(`O limite diário precisa ser um número inteiro de ${LIMITE_DIARIO_MINIMO} a ${LIMITE_DIARIO_MAXIMO}.`)
  }
  await exigirCanal(agenteId)
  const canal = await prisma.canalTelegram.update({ where: { agenteId }, data: { limiteDiario: numero } })
  avisarAlteracao('limite', autor, agenteId)
  return paraEstado(canal)
}
