/**
 * T-02.03 (FT-08): extensões aceitas de vídeo e áudio e conferência da
 * assinatura real dos primeiros bytes, para o arquivo renomeado não passar
 * (PR-71, PR-13). Módulo puro: a tela também o importa.
 */
import { describe, it, expect, afterAll } from 'vitest'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  BYTES_DE_ASSINATURA,
  EXTENSOES_DE_MIDIA,
  conferirAssinaturaDeMidia,
  formatoDeMidia,
  type FormatoDeMidia,
} from '@/lib/midia-formatos'
import { descreverComFfmpeg, gerarMidia, type FormatoGerado } from './apoio/ffmpeg'

const pasta = mkdtempSync(path.join(os.tmpdir(), 'converse-formatos-'))
afterAll(() => rmSync(pasta, { recursive: true, force: true }))

const bytes = (...partes: Array<number[] | string>) =>
  Uint8Array.from(partes.flatMap((p) => (typeof p === 'string' ? [...Buffer.from(p, 'latin1')] : p)))
const ftyp = (marca = 'isom') => bytes([0, 0, 0, 0x18], 'ftyp', marca, [0, 0, 2, 0])

describe('extensões e formato pelo nome', () => {
  it('a lista tem as doze extensões do briefing', () => {
    expect([...EXTENSOES_DE_MIDIA].sort()).toEqual(
      ['.aac', '.avi', '.flac', '.m4a', '.m4v', '.mkv', '.mov', '.mp3', '.mp4', '.ogg', '.wav', '.webm'].sort(),
    )
  })

  it('o formato sai da extensão sem diferenciar caixa, e extensão estranha dá nulo', () => {
    expect(formatoDeMidia('Aula Final.MP4')).toBe('mp4')
    expect(formatoDeMidia('a.b.c.mkv')).toBe('mkv')
    expect(formatoDeMidia('doc.pdf')).toBeNull()
    expect(formatoDeMidia('semextensao')).toBeNull()
    expect(formatoDeMidia('')).toBeNull()
  })
})

describe('assinatura dos primeiros bytes (sintética, sem ffmpeg)', () => {
  const certos: Array<[FormatoDeMidia, Uint8Array]> = [
    ['mp4', ftyp()], ['mov', ftyp('qt  ')], ['m4v', ftyp('M4V ')], ['m4a', ftyp('M4A ')],
    ['webm', bytes([0x1a, 0x45, 0xdf, 0xa3], 'xxxxxxxx')], ['mkv', bytes([0x1a, 0x45, 0xdf, 0xa3], 'xxxxxxxx')],
    ['mp3', bytes('ID3', [3, 0, 0, 0, 0, 0, 0, 0, 0])], ['mp3', bytes([0xff, 0xfb, 0x90, 0x00], 'xxxxxxxx')],
    ['aac', bytes([0xff, 0xf1, 0x50, 0x80], 'xxxxxxxx')], ['aac', bytes('ID3', [4, 0, 0, 0, 0, 0, 0, 0, 0])],
    ['wav', bytes('RIFF', [0, 0, 0, 0], 'WAVE')], ['avi', bytes('RIFF', [0, 0, 0, 0], 'AVI ')],
    ['ogg', bytes('OggS', [0, 2, 0, 0, 0, 0, 0, 0])], ['flac', bytes('fLaC', [0, 0, 0, 0x22, 0, 0, 0, 0])],
  ]
  it.each(certos)('%s com a assinatura própria passa', (formato, inicio) => {
    expect(conferirAssinaturaDeMidia(formato, inicio)).toBe(true)
  })

  it('um txt renomeado, um formato trocado e o arquivo vazio são rejeitados', () => {
    const texto = bytes('Isto é só um texto qualquer renomeado.')
    for (const f of EXTENSOES_DE_MIDIA.map((e) => e.slice(1) as FormatoDeMidia)) {
      expect(conferirAssinaturaDeMidia(f, texto), f).toBe(false)
      expect(conferirAssinaturaDeMidia(f, new Uint8Array(0)), `${f} vazio`).toBe(false)
    }
    expect(conferirAssinaturaDeMidia('mkv', ftyp())).toBe(false)
    expect(conferirAssinaturaDeMidia('mp4', bytes('RIFF', [0, 0, 0, 0], 'WAVE'))).toBe(false)
    expect(conferirAssinaturaDeMidia('wav', bytes('RIFF', [0, 0, 0, 0], 'AVI '))).toBe(false)
    expect(conferirAssinaturaDeMidia('avi', bytes('RIFF', [0, 0, 0, 0], 'WAVE'))).toBe(false)
  })

  it('lê no máximo BYTES_DE_ASSINATURA bytes: 12 bastam para todas', () => {
    expect(BYTES_DE_ASSINATURA).toBe(12)
    expect(conferirAssinaturaDeMidia('mp4', ftyp().subarray(0, 8))).toBe(true)
    expect(conferirAssinaturaDeMidia('mp4', ftyp().subarray(0, 7))).toBe(false)
  })

  it('o módulo é puro: não importa node: nem next', () => {
    const fonte = readFileSync('src/lib/midia-formatos.ts', 'utf8')
    expect(fonte).not.toMatch(/from ['"](node:|next)/)
  })
})

descreverComFfmpeg('assinatura de arquivos gerados pelo ffmpeg', () => {
  const formatos: FormatoGerado[] = ['mp4', 'webm', 'mkv', 'mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'mov', 'm4v', 'avi']
  it.each(formatos)('o %s gerado passa na conferência da própria extensão', (formato) => {
    const arquivo = gerarMidia({ formato, segundos: 1, diretorio: pasta })
    const inicio = readFileSync(arquivo).subarray(0, BYTES_DE_ASSINATURA)
    expect(conferirAssinaturaDeMidia(formato, inicio)).toBe(true)
  })

  it('um mp4 gerado não passa como mkv nem como wav', () => {
    const inicio = readFileSync(gerarMidia({ formato: 'mp4', segundos: 1, diretorio: pasta })).subarray(0, 12)
    expect(conferirAssinaturaDeMidia('mkv', inicio)).toBe(false)
    expect(conferirAssinaturaDeMidia('wav', inicio)).toBe(false)
  })
})
