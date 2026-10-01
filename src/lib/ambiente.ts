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

export const ambiente = {
  get jwtSecret(): string {
    return obrigatoria('JWT_SECRET')
  },
  get jwtTtlSegundos(): number {
    return inteiroComPadrao('JWT_TTL_SEGUNDOS', 900)
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
