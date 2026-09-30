// Configuração do chat embutido por agente (FT-06, PR-55). Qualquer usuário
// autenticado lê e edita a de qualquer agente (PR-12); a verificação de sessão
// é da camada de apresentação e o serviço exige um autor. A linha ausente vale
// os padrões, e nada vai ao público enquanto `ativo` for falso.
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { entradaInvalida, naoAutenticado, naoEncontrado } from '@/lib/erros'
import { COR_PADRAO, normalizarCor } from '@/lib/cor'
import { LIMITE_DE_DOMINIOS, normalizarLista } from '@/lib/dominios-permitidos'
import type { UsuarioAutenticado } from '@/servicos/autenticacao'

export const POSICOES = ['direita', 'esquerda'] as const
export const AVATARES = ['iniciais', 'chat', 'robo', 'estrela', 'fone'] as const
export type PosicaoDoChat = (typeof POSICOES)[number]
export type AvatarDoChat = (typeof AVATARES)[number]

export const LIMITE_DO_TITULO_DO_CHAT = 60
export const LIMITE_DO_AVISO = 300
export const LIMITE_DA_URL_DO_AVISO = 500
export const MAXIMO_DE_SUGESTOES = 3
export const LIMITE_DA_SUGESTAO = 80
export const LIMITE_DIARIO_PADRAO = 500
export const LIMITE_DIARIO_MINIMO = 1
export const LIMITE_DIARIO_MAXIMO = 100_000

export interface ConfiguracaoDoChat {
  agenteId: string
  ativo: boolean
  /** Vazio: o chat mostra o nome do agente. */
  titulo: string
  cor: string
  posicao: PosicaoDoChat
  avatar: AvatarDoChat
  avisoDePrivacidade: string
  avisoDePrivacidadeUrl: string
  dominiosPermitidos: string[]
  limiteDiario: number
  sugestoes: string[]
  /** `null` enquanto a linha não existe (valem os padrões). */
  atualizadoEm: Date | null
}

export function configuracaoPadrao(agenteId: string): ConfiguracaoDoChat {
  return {
    agenteId,
    ativo: false,
    titulo: '',
    cor: COR_PADRAO,
    posicao: 'direita',
    avatar: 'iniciais',
    avisoDePrivacidade: '',
    avisoDePrivacidadeUrl: '',
    dominiosPermitidos: [],
    limiteDiario: LIMITE_DIARIO_PADRAO,
    sugestoes: [],
    atualizadoEm: null,
  }
}

function lerLista(json: string): string[] {
  try {
    const v: unknown = JSON.parse(json)
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

type Linha = NonNullable<Awaited<ReturnType<typeof prisma.configuracaoDoChat.findUnique>>>

/** A linha do banco na forma do serviço; valor fora do vocabulário volta ao padrão. */
export function configuracaoDeLinha(linha: Linha): ConfiguracaoDoChat {
  const padrao = configuracaoPadrao(linha.agenteId)
  return {
    agenteId: linha.agenteId,
    ativo: linha.ativo,
    titulo: linha.titulo,
    cor: normalizarCor(linha.cor) ?? padrao.cor,
    posicao: (POSICOES as readonly string[]).includes(linha.posicao) ? (linha.posicao as PosicaoDoChat) : padrao.posicao,
    avatar: (AVATARES as readonly string[]).includes(linha.avatar) ? (linha.avatar as AvatarDoChat) : padrao.avatar,
    avisoDePrivacidade: linha.avisoDePrivacidade,
    avisoDePrivacidadeUrl: linha.avisoDePrivacidadeUrl,
    dominiosPermitidos: lerLista(linha.dominiosPermitidos),
    limiteDiario: linha.limiteDiario,
    sugestoes: lerLista(linha.sugestoes),
    atualizadoEm: linha.atualizadoEm,
  }
}

// --- validação ---------------------------------------------------------------

/** O formulário manda texto; aceita também o valor já tipado. */
const booleano = z.preprocess(
  (v) => {
    if (v === 'on' || v === 'true' || v === '1') return true
    if (v === 'false' || v === '0' || v === '') return false
    return v
  },
  z.boolean({ message: 'O valor de publicar precisa ser sim ou não.' }),
)

const titulo = z
  .string({ message: 'O título precisa ser um texto.' })
  .trim()
  .max(LIMITE_DO_TITULO_DO_CHAT, `O título pode ter até ${LIMITE_DO_TITULO_DO_CHAT} caracteres.`)

const cor = z
  .string({ message: 'Escolha uma cor em hexadecimal, no formato #rrggbb.' })
  .transform((v, ctx) => {
    const n = normalizarCor(v)
    if (n === null) ctx.addIssue({ code: 'custom', message: 'Escolha uma cor em hexadecimal, no formato #rrggbb.' })
    return n ?? ''
  })

const posicao = z.enum(POSICOES, { message: 'A posição precisa ser direita ou esquerda.' })
const avatar = z.enum(AVATARES, { message: 'Escolha um avatar da lista.' })

const aviso = z
  .string({ message: 'O aviso de privacidade precisa ser um texto.' })
  .trim()
  .max(LIMITE_DO_AVISO, `O aviso de privacidade pode ter até ${LIMITE_DO_AVISO} caracteres.`)

const MENSAGEM_DO_LINK = 'O link do aviso precisa ser um endereço http ou https.'

const avisoUrl = z
  .string({ message: MENSAGEM_DO_LINK })
  .trim()
  .max(LIMITE_DA_URL_DO_AVISO, `O link do aviso pode ter até ${LIMITE_DA_URL_DO_AVISO} caracteres.`)
  .refine((v) => {
    if (v === '') return true
    try {
      const u = new URL(v)
      return u.protocol === 'http:' || u.protocol === 'https:'
    } catch {
      return false
    }
  }, MENSAGEM_DO_LINK)

const MENSAGEM_DO_LIMITE = `O limite diário precisa ser um número inteiro de ${LIMITE_DIARIO_MINIMO} a 100.000.`

const limiteDiario = z.preprocess(
  (v) => (typeof v === 'string' ? (v.trim() === '' ? undefined : Number(v.trim())) : v),
  z
    .number({ message: MENSAGEM_DO_LIMITE })
    .int(MENSAGEM_DO_LIMITE)
    .min(LIMITE_DIARIO_MINIMO, MENSAGEM_DO_LIMITE)
    .max(LIMITE_DIARIO_MAXIMO, MENSAGEM_DO_LIMITE),
)

/** Texto do formulário (uma por linha) ou lista: vira lista de textos. */
function comoLista(v: unknown, separador: RegExp): unknown {
  if (typeof v === 'string') return v.split(separador)
  return v
}

const dominios = z.preprocess(
  (v) => comoLista(v, /[\r\n,]+/),
  z.array(z.unknown(), { message: 'Informe os domínios como uma lista.' }).transform((entradas, ctx) => {
    const r = normalizarLista(entradas)
    if (r.invalidas.length > 0) {
      ctx.addIssue({
        code: 'custom',
        message: `Domínio inválido: ${r.invalidas[0]}. Use exemplo.com, *.exemplo.com ou localhost:3000.`,
      })
    } else if (r.excedeu) {
      ctx.addIssue({ code: 'custom', message: `Informe até ${LIMITE_DE_DOMINIOS} domínios.` })
    }
    return r.lista
  }),
)

const sugestoes = z.preprocess(
  (v) => comoLista(v, /[\r\n]+/),
  z.array(z.string({ message: 'Cada pergunta sugerida precisa ser um texto.' })).transform((entradas, ctx) => {
    const lista: string[] = []
    for (const e of entradas.map((t) => t.trim())) {
      if (e !== '' && !lista.includes(e)) lista.push(e)
    }
    if (lista.length > MAXIMO_DE_SUGESTOES) {
      ctx.addIssue({ code: 'custom', message: `Informe até ${MAXIMO_DE_SUGESTOES} perguntas sugeridas.` })
    }
    if (lista.some((e) => e.length > LIMITE_DA_SUGESTAO)) {
      ctx.addIssue({
        code: 'custom',
        message: `Cada pergunta sugerida pode ter até ${LIMITE_DA_SUGESTAO} caracteres.`,
      })
    }
    return lista
  }),
)

const entradaDeEdicao = z.object({
  ativo: booleano.optional(),
  titulo: titulo.optional(),
  cor: cor.optional(),
  posicao: posicao.optional(),
  avatar: avatar.optional(),
  avisoDePrivacidade: aviso.optional(),
  avisoDePrivacidadeUrl: avisoUrl.optional(),
  dominiosPermitidos: dominios.optional(),
  limiteDiario: limiteDiario.optional(),
  sugestoes: sugestoes.optional(),
})

function exigirAutor(autor: UsuarioAutenticado | null | undefined): asserts autor {
  if (!autor?.id) throw naoAutenticado()
}

async function exigirAgente(agenteId: string): Promise<void> {
  if (!(await prisma.agente.findUnique({ where: { id: agenteId }, select: { id: true } }))) {
    throw naoEncontrado('Agente não encontrado.')
  }
}

/** A configuração do agente para o painel; sem linha, os padrões. */
export async function obterConfiguracao(
  autor: UsuarioAutenticado,
  agenteId: string,
): Promise<ConfiguracaoDoChat> {
  exigirAutor(autor)
  await exigirAgente(agenteId)
  const linha = await prisma.configuracaoDoChat.findUnique({ where: { agenteId } })
  return linha ? configuracaoDeLinha(linha) : configuracaoPadrao(agenteId)
}

/**
 * Grava a configuração. Só os campos informados mudam; o que não veio fica como
 * está (ou no padrão, na primeira vez). Entrada inválida é 422 com a primeira
 * mensagem e nada é gravado.
 */
export async function salvarConfiguracao(
  autor: UsuarioAutenticado,
  agenteId: string,
  entrada: unknown,
): Promise<ConfiguracaoDoChat> {
  exigirAutor(autor)
  const r = entradaDeEdicao.safeParse(entrada)
  if (!r.success) throw entradaInvalida(r.error.issues[0]?.message ?? 'Entrada inválida.')
  await exigirAgente(agenteId)

  const atual = await obterConfiguracao(autor, agenteId)
  const novo = { ...atual, ...Object.fromEntries(Object.entries(r.data).filter(([, v]) => v !== undefined)) }
  if (novo.avisoDePrivacidadeUrl !== '' && novo.avisoDePrivacidade === '') {
    throw entradaInvalida('Escreva o aviso de privacidade para usar o link.')
  }

  const dados = {
    ativo: novo.ativo,
    titulo: novo.titulo,
    cor: novo.cor,
    posicao: novo.posicao,
    avatar: novo.avatar,
    avisoDePrivacidade: novo.avisoDePrivacidade,
    avisoDePrivacidadeUrl: novo.avisoDePrivacidadeUrl,
    dominiosPermitidos: JSON.stringify(novo.dominiosPermitidos),
    limiteDiario: novo.limiteDiario,
    sugestoes: JSON.stringify(novo.sugestoes),
  }
  const linha = await prisma.configuracaoDoChat.upsert({
    where: { agenteId },
    create: { agenteId, ...dados },
    update: dados,
  })
  return configuracaoDeLinha(linha)
}

// --- visão pública -----------------------------------------------------------

export interface ConfiguracaoPublica {
  ativo: true
  titulo: string
  cor: string
  posicao: PosicaoDoChat
  avatar: AvatarDoChat
  mensagemInicial: string
  avisoDePrivacidade: { texto: string; url: string | null } | null
  sugestoes: string[]
}

type AgenteParaExibir = { nome: string; mensagemInicial: string }

/** O que se mostra do agente: os campos visuais, sem nada interno. */
function paraExibir(c: ConfiguracaoDoChat, agente: AgenteParaExibir): Omit<ConfiguracaoPublica, 'ativo'> {
  return {
    titulo: c.titulo !== '' ? c.titulo : agente.nome,
    cor: c.cor,
    posicao: c.posicao,
    avatar: c.avatar,
    mensagemInicial: agente.mensagemInicial,
    avisoDePrivacidade:
      c.avisoDePrivacidade === ''
        ? null
        : { texto: c.avisoDePrivacidade, url: c.avisoDePrivacidadeUrl === '' ? null : c.avisoDePrivacidadeUrl },
    sugestoes: c.sugestoes,
  }
}

/**
 * O que o visitante pode ver (PR-56): só campos visuais. Agente inexistente e
 * agente com o chat inativo dão o mesmo resultado, `null`: quem chama responde
 * o mesmo 404 nos dois casos. Nunca sai instrução, modelo, domínio, limite, id
 * de usuário nem data.
 */
export async function configuracaoPublica(agenteId: string): Promise<ConfiguracaoPublica | null> {
  const linha = await prisma.configuracaoDoChat.findUnique({
    where: { agenteId },
    include: { agente: { select: { nome: true, mensagemInicial: true } } },
  })
  if (!linha || !linha.ativo) return null
  return { ativo: true, ...paraExibir(configuracaoDeLinha(linha), linha.agente) }
}

export interface ConfiguracaoDaPrevia extends Omit<ConfiguracaoPublica, 'ativo'> {
  /** O chat está publicado? A prévia mostra o chat de qualquer jeito (PR-61). */
  ativo: boolean
}

/**
 * A configuração para a prévia da aba Publicar: a mesma visão do visitante, mas
 * também para o agente com o chat inativo, e só para usuário autenticado.
 */
export async function configuracaoDaPrevia(
  autor: UsuarioAutenticado,
  agenteId: string,
): Promise<ConfiguracaoDaPrevia> {
  exigirAutor(autor)
  const agente = await prisma.agente.findUnique({
    where: { id: agenteId },
    select: { nome: true, mensagemInicial: true },
  })
  if (!agente) throw naoEncontrado('Agente não encontrado.')
  const c = await obterConfiguracao(autor, agenteId)
  return { ativo: c.ativo, ...paraExibir(c, agente) }
}

export interface DominiosDoEmbed {
  ativo: boolean
  dominios: string[]
}

/**
 * Os domínios que podem emoldurar o chat (PR-58), para o `proxy.ts` e para o
 * CORS. Agente inexistente e inativo dão o mesmo resultado: ativo falso, sem
 * domínios.
 */
export async function dominiosDoEmbed(agenteId: string): Promise<DominiosDoEmbed> {
  const linha = await prisma.configuracaoDoChat.findUnique({ where: { agenteId } })
  if (!linha || !linha.ativo) return { ativo: false, dominios: [] }
  return { ativo: true, dominios: configuracaoDeLinha(linha).dominiosPermitidos }
}
