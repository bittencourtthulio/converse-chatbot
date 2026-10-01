import path from 'node:path'

// Configuração por ambiente (L20). Variável obrigatória ausente falha aqui,
// no start, e não em produção quando alguém tentar entrar.

function obrigatoria(nome: string): string {
  const valor = process.env[nome]
  if (!valor || valor.trim() === '') {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${nome}. ` +
        'Veja o .env.example.',
    )
  }
  return valor
}

function inteiroComPadrao(nome: string, padrao: number): number {
  const bruto = process.env[nome]
  if (!bruto) return padrao
  const valor = Number.parseInt(bruto, 10)
  if (Number.isNaN(valor) || valor <= 0) {
    throw new Error(`Variável ${nome} precisa ser um inteiro positivo.`)
  }
  return valor
}

/** Os níveis do log, do mais barulhento ao mais quieto (FT-11, PR-92). */
export const NIVEIS_DE_LOG = ['debug', 'info', 'aviso', 'erro'] as const
export type NivelDeLog = (typeof NIVEIS_DE_LOG)[number]

const TAMANHO_DA_CHAVE = 32

/**
 * Os 32 bytes da `ENCRYPTION_KEY` (hexadecimal de 64 caracteres ou base64), ou `null` se ela não
 * existe ou não tem 32 bytes. Um só lugar para a validação: `src/lib/cripto.ts` a usa ao cifrar e
 * `validarAmbiente`, a tela Sistema e o start de produção a usam para não divergir (PR-94).
 */
export function bytesDaChaveDeCriptografia(bruta: string | undefined): Buffer | null {
  const valor = bruta?.trim()
  if (!valor) return null
  let bytes: Buffer | null = null
  if (/^[0-9a-fA-F]{64}$/.test(valor)) bytes = Buffer.from(valor, 'hex')
  else if (/^[A-Za-z0-9+/_-]+={0,2}$/.test(valor)) bytes = Buffer.from(valor, 'base64')
  return bytes && bytes.length === TAMANHO_DA_CHAVE ? bytes : null
}

/** A configuração de produção está errada: lista os NOMES das variáveis, nunca os valores (PR-94). */
export class ErroDeConfiguracao extends Error {
  constructor(
    readonly erros: string[],
    readonly avisos: string[],
  ) {
    super(
      'Configuração inválida: o servidor não pode subir. Corrija estas variáveis (veja o arquivo de exemplo de ' +
        `ambiente e o README): ${erros.join('; ')}.`,
    )
    this.name = 'ErroDeConfiguracao'
  }
}

export interface ResultadoDaValidacao {
  /** Sempre vazio quando a função devolve: com erro ela lança `ErroDeConfiguracao`. */
  erros: string[]
  avisos: string[]
}

type Env = Record<string, string | undefined>

// Opcionais que, se informadas, precisam ser inteiros positivos (o teto de MAX_VIDEO_MB é conferido à parte).
const INTEIROS_OPCIONAIS = [
  'JWT_TTL_SEGUNDOS',
  'SESSAO_MAXIMA_HORAS',
  'MAX_TOKENS_RESPOSTA',
  'MAX_UPLOAD_MB',
  'MAX_VIDEO_MB',
  'MAX_VIDEO_MINUTOS',
  'AUDITORIA_RETENCAO_DIAS',
  'BACKUP_MANTER',
]

/**
 * Valida a configuração no start (L20, PR-94). Só age com `NODE_ENV=production`: `JWT_SECRET` (32
 * caracteres ou mais), `DATABASE_URL` (arquivo SQLite) e `ENCRYPTION_KEY` válida são obrigatórias, e
 * qualquer opcional informada com formato inválido também entra na lista; com erro, lança
 * `ErroDeConfiguracao` com os nomes (nunca os valores). `APP_URL` ausente ou sem HTTPS é só aviso, porque o
 * chat embutido e o Telegram dependem dela mas o sistema sobe sem. Fora de produção devolve listas vazias:
 * o comportamento lazy da `ENCRYPTION_KEY` continua (especializa a decisão D-02 da FT-02 só para produção).
 */
export function validarAmbiente(opcoes: { env?: Env } = {}): ResultadoDaValidacao {
  const env = opcoes.env ?? process.env
  if (env.NODE_ENV !== 'production') return { erros: [], avisos: [] }
  const erros: string[] = []
  const avisos: string[] = []
  const valor = (nome: string) => env[nome]?.trim()

  const segredo = valor('JWT_SECRET')
  if (!segredo) erros.push('JWT_SECRET (ausente)')
  else if (segredo.length < 32) erros.push('JWT_SECRET (precisa ter 32 caracteres ou mais)')

  const banco = valor('DATABASE_URL')
  if (!banco) erros.push('DATABASE_URL (ausente)')
  else if (!banco.startsWith('file:')) erros.push('DATABASE_URL (precisa ser um arquivo SQLite, file:...)')

  const chave = valor('ENCRYPTION_KEY')
  if (!chave) erros.push('ENCRYPTION_KEY (ausente)')
  else if (!bytesDaChaveDeCriptografia(chave)) erros.push('ENCRYPTION_KEY (precisa ter 32 bytes em hexadecimal ou base64)')

  for (const nome of INTEIROS_OPCIONAIS) {
    const bruto = valor(nome)
    if (bruto === undefined || bruto === '') continue
    const n = Number(bruto)
    if (!/^\d+$/.test(bruto) || !Number.isSafeInteger(n) || n <= 0) erros.push(`${nome} (precisa ser um inteiro positivo)`)
    else if (nome === 'MAX_VIDEO_MB' && n > MAXIMO_DE_VIDEO_MB) erros.push(`MAX_VIDEO_MB (no máximo ${MAXIMO_DE_VIDEO_MB})`)
  }
  const nivel = valor('LOG_LEVEL')
  if (nivel && !(NIVEIS_DE_LOG as readonly string[]).includes(nivel.toLowerCase())) {
    erros.push(`LOG_LEVEL (precisa ser ${NIVEIS_DE_LOG.slice(0, -1).join(', ')} ou ${NIVEIS_DE_LOG.at(-1)})`)
  }

  const url = valor('APP_URL')
  if (!url) {
    avisos.push('APP_URL não definida: o chat embutido e o webhook do Telegram precisam da URL pública HTTPS do sistema')
  } else {
    let protocolo: string | null = null
    try {
      protocolo = new URL(url).protocol
    } catch {
      protocolo = null
    }
    if (protocolo !== 'http:' && protocolo !== 'https:') erros.push('APP_URL (precisa ser uma URL http ou https)')
    else if (protocolo === 'http:') avisos.push('APP_URL sem HTTPS: o chat embutido e o Telegram exigem uma URL pública HTTPS')
  }

  if (erros.length > 0) throw new ErroDeConfiguracao(erros, avisos)
  return { erros, avisos }
}

export const ambiente = {
  get jwtSecret(): string {
    return obrigatoria('JWT_SECRET')
  },
  get jwtTtlSegundos(): number {
    return inteiroComPadrao('JWT_TTL_SEGUNDOS', 900)
  },
  /**
   * Duração máxima absoluta de uma sessão, em horas, contada do login (FT-12, PR-102). A renovação por
   * atividade nunca a ultrapassa. Padrão 12.
   */
  get sessaoMaximaHoras(): number {
    return inteiroComPadrao('SESSAO_MAXIMA_HORAS', 12)
  },
  /** Nome do produto na interface (PR-03). Opcional: o padrão é "Converse". */
  get nomeDoProduto(): string {
    const nome = process.env.APP_NAME?.trim()
    return nome ? nome : 'Converse'
  },
  /** Só com TRUST_PROXY=1 o IP vem de X-Forwarded-For (PR-36). */
  get confiarNoProxy(): boolean {
    return process.env.TRUST_PROXY === '1'
  },
  /**
   * Chave do AES-256-GCM (PR-39), valor bruto. Não é obrigatória no start:
   * só `src/lib/cripto.ts` a valida, quando um segredo é gravado ou lido.
   */
  get chaveDeCriptografia(): string | undefined {
    const valor = process.env.ENCRYPTION_KEY?.trim()
    return valor ? valor : undefined
  },
  /** Endereço da API do OpenRouter; os testes apontam para o servidor simulado. */
  get openrouterBaseUrl(): string {
    const url = process.env.OPENROUTER_BASE_URL?.trim()
    return (url ? url : 'https://openrouter.ai/api/v1').replace(/\/+$/, '')
  },
  /** URL pública deste sistema, enviada ao OpenRouter em `HTTP-Referer` (PR-38). */
  get appUrl(): string {
    const url = process.env.APP_URL?.trim()
    return (url ? url : 'http://localhost:3000').replace(/\/+$/, '')
  },
  /**
   * URL pública configurada, sem padrão (FT-06, PR-62): é a origem do snippet da
   * aba Publicar. Ausente, a tela usa a origem da requisição. Valor que não é
   * URL http(s) é erro de configuração, dito com clareza.
   */
  get appUrlPublica(): string | undefined {
    const bruto = process.env.APP_URL?.trim()
    if (!bruto) return undefined
    let url: URL
    try {
      url = new URL(bruto)
    } catch {
      throw new Error('Variável APP_URL precisa ser uma URL http ou https, como https://converse.exemplo.com.br.')
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('Variável APP_URL precisa ser uma URL http ou https, como https://converse.exemplo.com.br.')
    }
    return bruto.replace(/\/+$/, '')
  },
  /** Teto de tokens da resposta do modelo em cada turno de conversa (PR-41). */
  get maxTokensDaResposta(): number {
    return inteiroComPadrao('MAX_TOKENS_RESPOSTA', 1024)
  },
  /**
   * Raiz dos arquivos enviados (PR-11, PR-47). Relativa ao diretório de
   * execução; lida a cada uso para os testes trocarem por diretório temporário.
   */
  get storageDir(): string {
    const dir = process.env.STORAGE_DIR?.trim()
    // O caminho é de tempo de execução, não de build: sem o aviso, o Turbopack
    // incluiria o projeto inteiro no pacote do servidor.
    return path.resolve(/*turbopackIgnore: true*/ process.cwd(), dir ? dir : 'storage')
  },
  /** Tamanho máximo de um arquivo enviado, em bytes (PR-10, PR-45). Padrão 25 MB. */
  get maxUploadBytes(): number {
    return inteiroComPadrao('MAX_UPLOAD_MB', 25) * 1024 * 1024
  },
  /** Endereço da API do Telegram; os testes apontam para o servidor simulado (FT-07, PR-70). */
  get telegramApiBase(): string {
    const url = process.env.TELEGRAM_API_BASE?.trim()
    return (url ? url : 'https://api.telegram.org').replace(/\/+$/, '')
  },
  /**
   * Aceita `APP_URL` sem HTTPS ao conectar um bot (só desenvolvimento e teste,
   * PR-65). Desligada por padrão e sempre ignorada em produção.
   */
  get telegramPermitirUrlNaoHttps(): boolean {
    if (process.env.NODE_ENV === 'production') return false
    return process.env.TELEGRAM_PERMITIR_URL_NAO_HTTPS === '1'
  },
  get ehProducao(): boolean {
    return process.env.NODE_ENV === 'production'
  },
  /** Tamanho máximo de um vídeo ou áudio enviado, em bytes (PR-10, PR-71). Padrão 500 MB, no máximo 2000. */
  get maxVideoBytes(): number {
    const mb = inteiroComPadrao('MAX_VIDEO_MB', 500)
    if (mb > MAXIMO_DE_VIDEO_MB) {
      throw new Error(`Variável MAX_VIDEO_MB precisa ser um inteiro entre 1 e ${MAXIMO_DE_VIDEO_MB}.`)
    }
    return mb * 1024 * 1024
  },
  /** Duração máxima de um vídeo ou áudio, em minutos (PR-72). Padrão 180. */
  get maxVideoMinutos(): number {
    return inteiroComPadrao('MAX_VIDEO_MINUTOS', 180)
  },
  /** Caminho do ffmpeg (PR-72): o padrão procura `ffmpeg` no `PATH`. */
  get ffmpegPath(): string {
    return textoComPadrao('FFMPEG_PATH', 'ffmpeg')
  },
  /** Caminho do ffprobe (PR-72): o padrão procura `ffprobe` no `PATH`. */
  get ffprobePath(): string {
    return textoComPadrao('FFPROBE_PATH', 'ffprobe')
  },
  /** Modelo de transcrição padrão do ambiente; o do banco, se houver, vale mais (PR-73). */
  get openrouterModeloTranscricao(): string {
    return textoComPadrao('OPENROUTER_MODELO_TRANSCRICAO', MODELO_DE_TRANSCRICAO_PADRAO)
  },
  /**
   * Por quantos dias os registros de auditoria ficam guardados (FT-10, PR-86). Padrão 365;
   * o expurgo automático apaga os mais antigos.
   */
  get auditoriaRetencaoDias(): number {
    return inteiroComPadrao('AUDITORIA_RETENCAO_DIAS', 365)
  },
  /** A `ENCRYPTION_KEY` existe e tem 32 bytes? Só sim ou não: nunca o valor (tela Sistema, PR-94). */
  get chaveDeCriptografiaValida(): boolean {
    return bytesDaChaveDeCriptografia(process.env.ENCRYPTION_KEY) !== null
  },
  /**
   * Onde os backups são gravados (FT-11, PR-96). Relativa ao diretório de execução; o padrão é
   * `./backups`, que o `.gitignore` já ignora.
   */
  get backupDir(): string {
    return path.resolve(/*turbopackIgnore: true*/ process.cwd(), textoComPadrao('BACKUP_DIR', 'backups'))
  },
  /** Quantos backups do padrão de nome ficam em `BACKUP_DIR` (PR-96). Padrão 7. */
  get backupManter(): number {
    return inteiroComPadrao('BACKUP_MANTER', 7)
  },
  /**
   * O arquivo SQLite de `DATABASE_URL`, resolvido como o adaptador do Prisma faz: caminho absoluto
   * fica, relativo é relativo ao diretório de execução, e o que vem depois de `?` sai (FT-11, PR-96).
   */
  get bancoArquivo(): string {
    const url = process.env.DATABASE_URL?.trim()
    if (!url) throw new Error('Variável de ambiente obrigatória ausente: DATABASE_URL.')
    if (!url.startsWith('file:')) throw new Error('Variável DATABASE_URL precisa ser um arquivo SQLite, como file:/data/app.db.')
    const caminho = url.slice('file:'.length).split('?')[0]!.replace(/^\/\/(?=\/)/, '')
    return path.resolve(/*turbopackIgnore: true*/ process.cwd(), caminho)
  },
  /** O fuso do servidor: `TZ`, ou o do processo. O dia local do painel e o filtro da auditoria o seguem (FT-09). */
  get fusoHorario(): string {
    return textoComPadrao('TZ', Intl.DateTimeFormat().resolvedOptions().timeZone)
  },
  /** Nível mínimo do log (FT-11, PR-92). Opcional: o padrão é `info`. */
  get logLevel(): NivelDeLog {
    const valor = process.env.LOG_LEVEL?.trim().toLowerCase()
    if (!valor) return 'info'
    if ((NIVEIS_DE_LOG as readonly string[]).includes(valor)) return valor as NivelDeLog
    throw new Error('Variável LOG_LEVEL precisa ser debug, info, aviso ou erro.')
  },
  /** Endereço do YouTube; só o simulado de teste muda o padrão (PR-75, PR-77). */
  get youtubeBase(): string {
    return textoComPadrao('YOUTUBE_BASE', 'https://www.youtube.com').replace(/\/+$/, '')
  },
}

/**
 * Modelo do OpenRouter que transcreve áudio, quando nem o banco nem
 * `OPENROUTER_MODELO_TRANSCRICAO` definem outro (FT-08, PR-73). É o modelo do
 * exemplo da documentação de entrada de áudio do OpenRouter.
 */
export const MODELO_DE_TRANSCRICAO_PADRAO = 'google/gemini-2.5-flash'

/** Teto de `MAX_VIDEO_MB`: `Fonte.tamanhoBytes` é inteiro de 32 bits (PR-71). */
const MAXIMO_DE_VIDEO_MB = 2000

function textoComPadrao(nome: string, padrao: string): string {
  const valor = process.env[nome]?.trim()
  return valor ? valor : padrao
}
