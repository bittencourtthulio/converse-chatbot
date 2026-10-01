// O log estruturado do servidor (FT-11, PR-21, PR-92): o único ponto de saída de log de `src/`.
// Cada evento é UMA linha JSON com `nivel`, `quando`, `msg` (nome curto do evento), `correlacao`
// (quando há) e os campos. A redação é central: quem escreve o evento não precisa lembrar de
// tirar segredo nem texto de conversa, e um `Error` sai só com o nome e o código. O log nunca
// lança: uma falha ao registrar não pode derrubar a requisição que ele descreve.
//
// A saída vai pelos métodos de `console` do nível (`error`, `warn`, `info`, `debug`): é a única
// exceção à regra de não usar `console` em `src/` (provada por `tests/log-arquitetura.test.ts`),
// e é o que o contêiner e o Next capturam como stdout e stderr.
import { AsyncLocalStorage } from 'node:async_hooks'
import { randomBytes } from 'node:crypto'
import { NIVEIS_DE_LOG, ambiente, type NivelDeLog } from './ambiente'

const PESO: Record<NivelDeLog, number> = { debug: 10, info: 20, aviso: 30, erro: 40 }
const OCULTO = '[oculto]'
const PROFUNDIDADE_MAXIMA = 4
const ITENS_MAXIMOS = 20
const TEXTO_MAXIMO = 500

// ---- correlação -------------------------------------------------------------------------------

const contexto = new AsyncLocalStorage<string>()

/** Identificador curto que liga a tela, o cabeçalho `X-Correlacao` e as linhas do log. */
export function novaCorrelacao(): string {
  return randomBytes(4).toString('hex')
}

/** Roda `fn` com `id` como correlação do contexto: toda linha de log dentro dele a leva. */
export function comCorrelacao<T>(id: string, fn: () => T): T {
  return contexto.run(id, fn)
}

/** A correlação do contexto atual, ou `undefined` fora de `comCorrelacao`. */
export function correlacaoAtual(): string | undefined {
  return contexto.getStore()
}

// ---- redação ----------------------------------------------------------------------------------

const normalizar = (chave: string) =>
  chave
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

// Chave que carrega segredo: o valor sai oculto qualquer que seja.
const CHAVES_DE_SEGREDO = ['senha', 'password', 'passwd', 'token', 'chave', 'apikey', 'secret', 'segredo', 'authorization', 'cookie', 'credencial']
// Chave que carrega texto de conversa (do visitante, do usuário ou do modelo).
const CHAVES_DE_CONTEUDO = ['conteudo', 'texto', 'mensagem', 'pergunta', 'resposta', 'prompt', 'corpo', 'trechotexto']

function chaveSensivel(chave: string): boolean {
  const n = normalizar(chave)
  return CHAVES_DE_SEGREDO.some((s) => n.includes(s)) || CHAVES_DE_CONTEUDO.some((s) => n === s)
}

const PARECE_SEGREDO: RegExp[] = [
  /\bsk-[A-Za-z0-9_-]{8,}/g, // chave do OpenRouter
  /\bv1:[A-Za-z0-9+/=_:-]{10,}/g, // texto cifrado em repouso
  /\b(?:bot)?\d{6,}:[A-Za-z0-9_-]{20,}/g, // token de bot do Telegram
  /\beyJ[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]*/g, // JWT
  /\bBearer\s+\S+/gi,
]
const EMAIL = /([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g

function limparTexto(texto: string): string {
  let t = texto
  for (const r of PARECE_SEGREDO) t = t.replace(r, OCULTO)
  t = t.replace(EMAIL, '$1***@$2')
  return t.length > TEXTO_MAXIMO ? `${t.slice(0, TEXTO_MAXIMO)}…` : t
}

function dadosDoErro(e: Error): Record<string, unknown> {
  const codigo = (e as { codigo?: unknown }).codigo
  return { nome: e.name, ...(typeof codigo === 'string' && { codigo }) }
}

function redigirValor(valor: unknown, profundidade: number): unknown {
  if (valor === null || valor === undefined) return valor
  if (typeof valor === 'string') return limparTexto(valor)
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : String(valor)
  if (typeof valor === 'boolean') return valor
  if (typeof valor === 'bigint') return valor.toString()
  if (valor instanceof Error) return dadosDoErro(valor)
  if (valor instanceof Date) return Number.isNaN(valor.getTime()) ? null : valor.toISOString()
  if (typeof valor === 'function' || typeof valor === 'symbol') return undefined
  if (profundidade >= PROFUNDIDADE_MAXIMA) return '[fundo]'
  if (Array.isArray(valor)) {
    const itens = valor.slice(0, ITENS_MAXIMOS).map((v) => redigirValor(v, profundidade + 1))
    if (valor.length > ITENS_MAXIMOS) itens.push(`[+${valor.length - ITENS_MAXIMOS}]`)
    return itens
  }
  const saida: Record<string, unknown> = {}
  let n = 0
  for (const chave of Object.keys(valor as object)) {
    if (n >= ITENS_MAXIMOS * 2) break
    n += 1
    try {
      const v = (valor as Record<string, unknown>)[chave]
      saida[chave] = chaveSensivel(chave) && typeof v !== 'boolean' && v !== null && v !== undefined ? OCULTO : redigirValor(v, profundidade + 1)
    } catch {
      saida[chave] = '[ilegivel]'
    }
  }
  return saida
}

/** O valor pronto para virar JSON: sem segredo, sem texto de conversa, e-mail mascarado, tamanho limitado. */
export function redigir(valor: unknown): unknown {
  return redigirValor(valor, 0)
}

/** Nome e código de um erro capturado, para o campo de um evento (nunca a mensagem nem a pilha). */
export function camposDoErro(erro: unknown): { erro: string; codigo?: string } {
  if (!(erro instanceof Error)) return { erro: 'desconhecido' }
  const { nome, codigo } = dadosDoErro(erro) as { nome: string; codigo?: string }
  return { erro: nome, ...(codigo && { codigo }) }
}

// ---- saída ------------------------------------------------------------------------------------

function nivelMinimo(): NivelDeLog {
  try {
    return ambiente.logLevel
  } catch {
    return 'info'
  }
}

const RESERVADOS = new Set(['nivel', 'quando', 'msg'])

function escrever(nivel: NivelDeLog, msg: string, campos?: Record<string, unknown>): void {
  try {
    if (PESO[nivel] < PESO[nivelMinimo()]) return
    const limpos = (campos ? redigir(campos) : {}) as Record<string, unknown>
    for (const r of RESERVADOS) delete limpos[r]
    const correlacao = typeof limpos.correlacao === 'string' && limpos.correlacao ? limpos.correlacao : correlacaoAtual()
    delete limpos.correlacao
    const linha = JSON.stringify({
      nivel,
      quando: new Date().toISOString(),
      msg: limparTexto(String(msg)),
      ...(correlacao && { correlacao }),
      ...limpos,
    })
    if (nivel === 'erro') console.error(linha)
    else if (nivel === 'aviso') console.warn(linha)
    else if (nivel === 'info') console.info(linha)
    else console.debug(linha)
  } catch {
    // O log nunca derruba quem o chama.
  }
}

export const log = {
  debug: (msg: string, campos?: Record<string, unknown>) => escrever('debug', msg, campos),
  info: (msg: string, campos?: Record<string, unknown>) => escrever('info', msg, campos),
  aviso: (msg: string, campos?: Record<string, unknown>) => escrever('aviso', msg, campos),
  erro: (msg: string, campos?: Record<string, unknown>) => escrever('erro', msg, campos),
}

export { NIVEIS_DE_LOG }
export type { NivelDeLog }
