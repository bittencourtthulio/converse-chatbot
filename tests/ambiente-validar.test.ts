/**
 * Configuração validada no start (FT-11, PR-94, L20): em produção, `JWT_SECRET` (32 caracteres ou
 * mais), `DATABASE_URL` e `ENCRYPTION_KEY` válida são obrigatórias e a falta delas derruba o start
 * com os NOMES das variáveis (nunca os valores); `APP_URL` ausente ou sem HTTPS é só aviso. Fora de
 * produção nada é validado: o comportamento lazy da `ENCRYPTION_KEY` continua.
 */
import { afterEach, describe, expect, it } from 'vitest'
import path from 'node:path'
import { ErroDeConfiguracao, ambiente, validarAmbiente } from '../src/lib/ambiente.js'

const SEGREDO_VALIDO = 'a'.repeat(32)
const CHAVE_VALIDA = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff'

const producao = (env: Record<string, string | undefined>) => validarAmbiente({ env: { NODE_ENV: 'production', ...env } })
const completo = {
  JWT_SECRET: SEGREDO_VALIDO,
  DATABASE_URL: 'file:/data/app.db',
  ENCRYPTION_KEY: CHAVE_VALIDA,
  APP_URL: 'https://converse.exemplo.com.br',
}
const falha = (env: Record<string, string | undefined>): ErroDeConfiguracao => {
  try {
    producao(env)
  } catch (e) {
    expect(e).toBeInstanceOf(ErroDeConfiguracao)
    return e as ErroDeConfiguracao
  }
  throw new Error('devia ter lançado')
}

describe('validarAmbiente em produção', () => {
  it('sem JWT_SECRET, DATABASE_URL e ENCRYPTION_KEY lança um erro que lista os três nomes', () => {
    const e = falha({})
    expect(e.message).toContain('JWT_SECRET')
    expect(e.message).toContain('DATABASE_URL')
    expect(e.message).toContain('ENCRYPTION_KEY')
    expect(e.erros).toHaveLength(3)
  })

  it('com as três válidas devolve sem erro', () => {
    expect(producao(completo)).toEqual({ erros: [], avisos: [] })
  })

  it('JWT_SECRET de 31 caracteres é recusado e de 32 passa, sem repetir o valor', () => {
    const curto = 'b'.repeat(31)
    const e = falha({ ...completo, JWT_SECRET: curto })
    expect(e.erros).toEqual([expect.stringContaining('JWT_SECRET')])
    expect(e.message).not.toContain(curto)
    expect(producao({ ...completo, JWT_SECRET: 'b'.repeat(32) }).erros).toEqual([])
  })

  it('ENCRYPTION_KEY inválida (curta, com letras fora de hexadecimal e base64 de tamanho errado) é recusada sem repetir o valor', () => {
    for (const ruim of ['curta', 'z'.repeat(64) + '!!', 'AAAA']) {
      const e = falha({ ...completo, ENCRYPTION_KEY: ruim })
      expect(e.erros).toEqual([expect.stringContaining('ENCRYPTION_KEY')])
      expect(e.message).not.toContain(ruim)
    }
  })

  it('ENCRYPTION_KEY em base64 de 32 bytes passa', () => {
    const base64 = Buffer.from(CHAVE_VALIDA, 'hex').toString('base64')
    expect(producao({ ...completo, ENCRYPTION_KEY: base64 }).erros).toEqual([])
  })

  it('DATABASE_URL que não é de arquivo SQLite é recusada, sem repetir o valor', () => {
    const url = ['postgres:', '//usuario:', 'valor-secreto-na-url', '@host/banco'].join('')
    const e = falha({ ...completo, DATABASE_URL: url })
    expect(e.erros).toEqual([expect.stringContaining('DATABASE_URL')])
    expect(e.message).not.toContain('valor-secreto-na-url')
  })

  it('variável opcional com formato inválido entra na lista pelo nome: BACKUP_MANTER 0, LOG_LEVEL ruim, MAX_VIDEO_MB acima do teto', () => {
    const e = falha({ ...completo, BACKUP_MANTER: '0', LOG_LEVEL: 'barulhento', MAX_VIDEO_MB: '5000', MAX_UPLOAD_MB: 'abc' })
    const nomes = e.erros.join(' | ')
    for (const nome of ['BACKUP_MANTER', 'LOG_LEVEL', 'MAX_VIDEO_MB', 'MAX_UPLOAD_MB']) expect(nomes).toContain(nome)
    expect(e.message).not.toContain('barulhento')
    expect(e.message).not.toContain('5000')
  })

  it('SESSAO_MAXIMA_HORAS inválida entra na lista pelo nome, sem repetir o valor, e válida passa (FT-12)', () => {
    for (const ruim of ['0', 'abc', '-1', '1.5']) {
      const e = falha({ ...completo, SESSAO_MAXIMA_HORAS: ruim })
      expect(e.erros).toEqual([expect.stringContaining('SESSAO_MAXIMA_HORAS')])
    }
    expect(producao({ ...completo, SESSAO_MAXIMA_HORAS: '12' }).erros).toEqual([])
    expect(producao(completo).erros).toEqual([])
  })

  it('APP_URL ausente vira aviso, http vira aviso e https não gera aviso; nenhum derruba o start', () => {
    const { APP_URL: _ausente, ...semUrl } = completo
    const ausente = producao(semUrl)
    expect(ausente.erros).toEqual([])
    expect(ausente.avisos).toEqual([expect.stringContaining('APP_URL')])
    const http = producao({ ...completo, APP_URL: 'http://converse.exemplo.com.br' })
    expect(http.avisos).toEqual([expect.stringContaining('HTTPS')])
    expect(producao(completo).avisos).toEqual([])
  })

  it('APP_URL que não é URL é erro de configuração', () => {
    const e = falha({ ...completo, APP_URL: 'isto nao e url' })
    expect(e.erros).toEqual([expect.stringContaining('APP_URL')])
  })

  it('lê o NODE_ENV do ambiente passado e usa o process.env por padrão', () => {
    expect(() => validarAmbiente({ env: { NODE_ENV: 'production' } })).toThrow(ErroDeConfiguracao)
    // O processo de teste não é produção: sem env passado, nada é validado.
    expect(validarAmbiente()).toEqual({ erros: [], avisos: [] })
  })
})

describe('validarAmbiente fora de produção', () => {
  it('em desenvolvimento e em teste devolve listas vazias mesmo sem nenhuma variável', () => {
    for (const NODE_ENV of ['development', 'test', undefined]) {
      expect(validarAmbiente({ env: { NODE_ENV } })).toEqual({ erros: [], avisos: [] })
    }
  })

  it('o comportamento lazy da ENCRYPTION_KEY continua: o getter devolve undefined sem a variável', () => {
    const antes = process.env.ENCRYPTION_KEY
    delete process.env.ENCRYPTION_KEY
    try {
      expect(ambiente.chaveDeCriptografia).toBeUndefined()
      expect(ambiente.chaveDeCriptografiaValida).toBe(false)
    } finally {
      process.env.ENCRYPTION_KEY = antes
    }
    expect(ambiente.chaveDeCriptografiaValida).toBe(true)
  })
})

describe('variáveis de operação (PR-96)', () => {
  const guardadas = ['BACKUP_DIR', 'BACKUP_MANTER', 'DATABASE_URL', 'TZ'].map((k) => [k, process.env[k]] as const)
  afterEach(() => {
    for (const [k, v] of guardadas) {
      if (v === undefined) delete process.env[k]
      else process.env[k] = v
    }
  })

  it('BACKUP_DIR padrão é ./backups e BACKUP_MANTER padrão é 7', () => {
    delete process.env.BACKUP_DIR
    delete process.env.BACKUP_MANTER
    expect(ambiente.backupDir).toBe(path.resolve(process.cwd(), 'backups'))
    expect(ambiente.backupManter).toBe(7)
    process.env.BACKUP_DIR = '/data/backups'
    process.env.BACKUP_MANTER = '3'
    expect(ambiente.backupDir).toBe('/data/backups')
    expect(ambiente.backupManter).toBe(3)
    process.env.BACKUP_MANTER = '0'
    expect(() => ambiente.backupManter).toThrow(/BACKUP_MANTER/)
  })

  it('bancoArquivo resolve DATABASE_URL: absoluto fica, relativo vai para o diretório de execução, query sai', () => {
    process.env.DATABASE_URL = 'file:/data/app.db'
    expect(ambiente.bancoArquivo).toBe('/data/app.db')
    process.env.DATABASE_URL = 'file:./dev.db'
    expect(ambiente.bancoArquivo).toBe(path.resolve(process.cwd(), 'dev.db'))
    process.env.DATABASE_URL = 'file:/data/app.db?connection_limit=1'
    expect(ambiente.bancoArquivo).toBe('/data/app.db')
    process.env.DATABASE_URL = 'postgres://x/y'
    expect(() => ambiente.bancoArquivo).toThrow(/DATABASE_URL/)
    delete process.env.DATABASE_URL
    expect(() => ambiente.bancoArquivo).toThrow(/DATABASE_URL/)
  })

  it('fusoHorario devolve TZ quando definido e o fuso do processo quando não', () => {
    process.env.TZ = 'America/Sao_Paulo'
    expect(ambiente.fusoHorario).toBe('America/Sao_Paulo')
    delete process.env.TZ
    expect(ambiente.fusoHorario).toMatch(/\S/)
  })
})
