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
    return path.resolve(process.cwd(), dir ? dir : 'storage')
  },
  /** Tamanho máximo de um arquivo enviado, em bytes (PR-10, PR-45). Padrão 25 MB. */
  get maxUploadBytes(): number {
    return inteiroComPadrao('MAX_UPLOAD_MB', 25) * 1024 * 1024
  },
  get ehProducao(): boolean {
    return process.env.NODE_ENV === 'production'
  },
}
