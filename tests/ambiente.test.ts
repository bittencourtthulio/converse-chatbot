import { describe, it, expect, afterEach } from 'vitest'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { ambiente, MODELO_DE_TRANSCRICAO_PADRAO } from '@/lib/ambiente'

const original = { ...process.env }
afterEach(() => {
  for (const chave of ['APP_NAME', 'TRUST_PROXY', 'MAX_TOKENS_RESPOSTA', 'MAX_UPLOAD_MB', 'TELEGRAM_API_BASE', 'TELEGRAM_PERMITIR_URL_NAO_HTTPS', 'MAX_VIDEO_MB', 'MAX_VIDEO_MINUTOS', 'FFMPEG_PATH', 'FFPROBE_PATH', 'OPENROUTER_MODELO_TRANSCRICAO', 'YOUTUBE_BASE', 'AUDITORIA_RETENCAO_DIAS', 'LOG_LEVEL', 'NODE_ENV']) {
    if (original[chave] === undefined) delete process.env[chave]
    else process.env[chave] = original[chave]
  }
})

describe('nome do produto', () => {
  it('sem APP_NAME, é Converse', () => {
    delete process.env.APP_NAME
    expect(ambiente.nomeDoProduto).toBe('Converse')
  })

  it('usa APP_NAME quando definido, sem espaços nas pontas', () => {
    process.env.APP_NAME = '  Acme Atende '
    expect(ambiente.nomeDoProduto).toBe('Acme Atende')
  })

  it('APP_NAME só com espaços volta ao padrão', () => {
    process.env.APP_NAME = '   '
    expect(ambiente.nomeDoProduto).toBe('Converse')
  })
})

describe('confiança no proxy', () => {
  it('só é verdadeira com TRUST_PROXY igual a 1', () => {
    delete process.env.TRUST_PROXY
    expect(ambiente.confiarNoProxy).toBe(false)
    process.env.TRUST_PROXY = '0'
    expect(ambiente.confiarNoProxy).toBe(false)
    process.env.TRUST_PROXY = 'true'
    expect(ambiente.confiarNoProxy).toBe(false)
    process.env.TRUST_PROXY = '1'
    expect(ambiente.confiarNoProxy).toBe(true)
  })
})

describe('chave de criptografia', () => {
  it('ler ambiente sem ENCRYPTION_KEY não lança: só o uso do segredo falha', () => {
    const guardada = process.env.ENCRYPTION_KEY
    delete process.env.ENCRYPTION_KEY
    try {
      expect(() => ambiente.nomeDoProduto).not.toThrow()
      expect(ambiente.chaveDeCriptografia).toBeUndefined()
    } finally {
      process.env.ENCRYPTION_KEY = guardada
    }
  })

  it('devolve o valor bruto quando definido', () => {
    expect(ambiente.chaveDeCriptografia).toBe(process.env.ENCRYPTION_KEY)
  })
})

describe('OpenRouter', () => {
  const guardadas = {
    base: process.env.OPENROUTER_BASE_URL,
    app: process.env.APP_URL,
  }
  afterEach(() => {
    for (const [nome, valor] of [
      ['OPENROUTER_BASE_URL', guardadas.base],
      ['APP_URL', guardadas.app],
    ] as const) {
      if (valor === undefined) delete process.env[nome]
      else process.env[nome] = valor
    }
  })

  it('a URL base tem o padrão do OpenRouter', () => {
    delete process.env.OPENROUTER_BASE_URL
    expect(ambiente.openrouterBaseUrl).toBe('https://openrouter.ai/api/v1')
  })

  it('lê OPENROUTER_BASE_URL e tira as barras finais', () => {
    process.env.OPENROUTER_BASE_URL = 'http://127.0.0.1:9999/api/v1//'
    expect(ambiente.openrouterBaseUrl).toBe('http://127.0.0.1:9999/api/v1')
  })

  it('OPENROUTER_BASE_URL só com espaços volta ao padrão', () => {
    process.env.OPENROUTER_BASE_URL = '  '
    expect(ambiente.openrouterBaseUrl).toBe('https://openrouter.ai/api/v1')
  })

  it('APP_URL tem padrão local e é lida sem barra final', () => {
    delete process.env.APP_URL
    expect(ambiente.appUrl).toBe('http://localhost:3000')
    process.env.APP_URL = 'https://converse.exemplo.com.br/'
    expect(ambiente.appUrl).toBe('https://converse.exemplo.com.br')
  })

  it('appUrlPublica distingue ausente de padrão (FT-06, PR-62)', () => {
    delete process.env.APP_URL
    expect(ambiente.appUrlPublica).toBeUndefined()
    expect(ambiente.appUrl).toBe('http://localhost:3000')
    process.env.APP_URL = '  '
    expect(ambiente.appUrlPublica).toBeUndefined()
    process.env.APP_URL = 'https://x.com/'
    expect(ambiente.appUrlPublica).toBe('https://x.com')
    expect(ambiente.appUrl).toBe('https://x.com')
  })

  it('appUrlPublica recusa valor que não é URL http(s), com erro claro', () => {
    process.env.APP_URL = 'converse.exemplo.com'
    expect(() => ambiente.appUrlPublica).toThrow(/APP_URL/)
    process.env.APP_URL = 'ftp://x.com'
    expect(() => ambiente.appUrlPublica).toThrow(/APP_URL/)
  })
})

describe('limite de tokens da resposta', () => {
  it('sem MAX_TOKENS_RESPOSTA, o padrão é 1024', () => {
    delete process.env.MAX_TOKENS_RESPOSTA
    expect(ambiente.maxTokensDaResposta).toBe(1024)
  })

  it('usa o valor definido', () => {
    process.env.MAX_TOKENS_RESPOSTA = '512'
    expect(ambiente.maxTokensDaResposta).toBe(512)
  })

  it.each(['abc', '0', '-5'])('valor inválido (%s) lança o erro de inteiro positivo', (valor) => {
    process.env.MAX_TOKENS_RESPOSTA = valor
    expect(() => ambiente.maxTokensDaResposta).toThrow(/inteiro positivo/)
  })

  it('ler o ambiente sem a variável não lança', () => {
    delete process.env.MAX_TOKENS_RESPOSTA
    expect(() => ambiente.nomeDoProduto).not.toThrow()
  })
})

describe('armazenamento e upload (PR-11, PR-45)', () => {
  const guardada = process.env.STORAGE_DIR
  afterEach(() => {
    if (guardada === undefined) delete process.env.STORAGE_DIR
    else process.env.STORAGE_DIR = guardada
  })

  it('o setup de teste aponta STORAGE_DIR para um diretório temporário que existe', () => {
    expect(guardada).toBeTruthy()
    expect(path.isAbsolute(guardada as string)).toBe(true)
    expect(existsSync(guardada as string)).toBe(true)
    expect(ambiente.storageDir).toBe(guardada)
  })

  it('sem STORAGE_DIR, o padrão é ./storage resolvido contra o diretório de execução', () => {
    delete process.env.STORAGE_DIR
    expect(ambiente.storageDir).toBe(path.resolve(process.cwd(), 'storage'))
    expect(ambiente.storageDir.endsWith('/storage')).toBe(true)
  })

  it('STORAGE_DIR relativo é resolvido contra o diretório de execução', () => {
    process.env.STORAGE_DIR = './dados/arquivos'
    expect(ambiente.storageDir).toBe(path.resolve(process.cwd(), 'dados/arquivos'))
  })

  it('MAX_UPLOAD_MB tem padrão 25 e vira bytes', () => {
    delete process.env.MAX_UPLOAD_MB
    expect(ambiente.maxUploadBytes).toBe(26214400)
    process.env.MAX_UPLOAD_MB = '2'
    expect(ambiente.maxUploadBytes).toBe(2 * 1024 * 1024)
  })

  it('MAX_UPLOAD_MB inválido lança erro claro', () => {
    process.env.MAX_UPLOAD_MB = 'abc'
    expect(() => ambiente.maxUploadBytes).toThrow(/MAX_UPLOAD_MB/)
    process.env.MAX_UPLOAD_MB = '0'
    expect(() => ambiente.maxUploadBytes).toThrow(/MAX_UPLOAD_MB/)
  })
})

describe('Telegram (FT-07, PR-70)', () => {
  it('sem TELEGRAM_API_BASE usa a API oficial e tira a barra final', () => {
    delete process.env.TELEGRAM_API_BASE
    expect(ambiente.telegramApiBase).toBe('https://api.telegram.org')
    process.env.TELEGRAM_API_BASE = ' http://127.0.0.1:5555/// '
    expect(ambiente.telegramApiBase).toBe('http://127.0.0.1:5555')
  })

  it('a permissão de URL não HTTPS só liga com 1 e fora de produção', () => {
    delete process.env.TELEGRAM_PERMITIR_URL_NAO_HTTPS
    expect(ambiente.telegramPermitirUrlNaoHttps).toBe(false)
    process.env.TELEGRAM_PERMITIR_URL_NAO_HTTPS = 'true'
    expect(ambiente.telegramPermitirUrlNaoHttps).toBe(false)
    process.env.TELEGRAM_PERMITIR_URL_NAO_HTTPS = '1'
    expect(ambiente.telegramPermitirUrlNaoHttps).toBe(true)
    Object.assign(process.env, { NODE_ENV: 'production' })
    expect(ambiente.telegramPermitirUrlNaoHttps).toBe(false)
  })
})

describe('vídeo, ffmpeg e YouTube (FT-08, PR-77)', () => {
  it('sem variáveis, os padrões são 500 MB, 180 minutos, ffmpeg, ffprobe, o modelo padrão e o YouTube oficial', () => {
    for (const v of ['MAX_VIDEO_MB', 'MAX_VIDEO_MINUTOS', 'FFMPEG_PATH', 'FFPROBE_PATH', 'OPENROUTER_MODELO_TRANSCRICAO', 'YOUTUBE_BASE']) delete process.env[v]
    expect(ambiente.maxVideoBytes).toBe(500 * 1024 * 1024)
    expect(ambiente.maxVideoMinutos).toBe(180)
    expect(ambiente.ffmpegPath).toBe('ffmpeg')
    expect(ambiente.ffprobePath).toBe('ffprobe')
    expect(MODELO_DE_TRANSCRICAO_PADRAO).toBe('google/gemini-2.5-flash')
    expect(ambiente.openrouterModeloTranscricao).toBe('google/gemini-2.5-flash')
    expect(ambiente.youtubeBase).toBe('https://www.youtube.com')
  })

  it('as variáveis definidas valem, com espaços aparados e sem barra final na base', () => {
    process.env.MAX_VIDEO_MB = '3'
    process.env.MAX_VIDEO_MINUTOS = '7'
    process.env.FFMPEG_PATH = ' /opt/ffmpeg '
    process.env.FFPROBE_PATH = '/opt/ffprobe'
    process.env.OPENROUTER_MODELO_TRANSCRICAO = ' openai/gpt-4o-audio-preview '
    process.env.YOUTUBE_BASE = ' http://127.0.0.1:5556/// '
    expect(ambiente.maxVideoBytes).toBe(3 * 1024 * 1024)
    expect(ambiente.maxVideoMinutos).toBe(7)
    expect(ambiente.ffmpegPath).toBe('/opt/ffmpeg')
    expect(ambiente.ffprobePath).toBe('/opt/ffprobe')
    expect(ambiente.openrouterModeloTranscricao).toBe('openai/gpt-4o-audio-preview')
    expect(ambiente.youtubeBase).toBe('http://127.0.0.1:5556')
  })

  it('MAX_VIDEO_MB zero, inválido ou acima de 2000 lança erro claro', () => {
    for (const ruim of ['0', 'abc', '2001']) {
      process.env.MAX_VIDEO_MB = ruim
      expect(() => ambiente.maxVideoBytes, ruim).toThrow(/MAX_VIDEO_MB/)
    }
    process.env.MAX_VIDEO_MB = '2000'
    expect(ambiente.maxVideoBytes).toBe(2000 * 1024 * 1024)
  })

  it('MAX_VIDEO_MINUTOS inválido lança erro claro', () => {
    process.env.MAX_VIDEO_MINUTOS = '0'
    expect(() => ambiente.maxVideoMinutos).toThrow(/MAX_VIDEO_MINUTOS/)
  })
})

describe('retenção dos registros de auditoria (FT-10, PR-86)', () => {
  it('sem AUDITORIA_RETENCAO_DIAS, são 365 dias', () => {
    delete process.env.AUDITORIA_RETENCAO_DIAS
    expect(ambiente.auditoriaRetencaoDias).toBe(365)
  })

  it('usa o valor informado', () => {
    process.env.AUDITORIA_RETENCAO_DIAS = '30'
    expect(ambiente.auditoriaRetencaoDias).toBe(30)
  })

  it('recusa zero, negativo e texto com erro claro', () => {
    for (const ruim of ['0', '-5', 'abc']) {
      process.env.AUDITORIA_RETENCAO_DIAS = ruim
      expect(() => ambiente.auditoriaRetencaoDias).toThrow(/AUDITORIA_RETENCAO_DIAS/)
    }
  })
})

describe('nível do log (FT-11, PR-92)', () => {
  it('sem LOG_LEVEL, é info', () => {
    delete process.env.LOG_LEVEL
    expect(ambiente.logLevel).toBe('info')
  })

  it('aceita debug, info, aviso e erro, sem distinguir maiúsculas', () => {
    for (const nivel of ['debug', 'info', 'aviso', 'erro']) {
      process.env.LOG_LEVEL = nivel.toUpperCase()
      expect(ambiente.logLevel).toBe(nivel)
    }
  })

  it('recusa outro valor com erro claro que nomeia a variável', () => {
    process.env.LOG_LEVEL = 'barulhento'
    expect(() => ambiente.logLevel).toThrow(/LOG_LEVEL.*debug, info, aviso ou erro/)
  })
})
