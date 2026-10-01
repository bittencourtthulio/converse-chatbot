/**
 * T-01.04 (FT-08): o apoio de teste detecta o ffmpeg, gera mídia pequena com
 * `lavfi` e, com EXIGIR_FFMPEG=1 (CI), faz a ausência do ffmpeg falhar em vez
 * de pular os testes (PR-72).
 */
import { describe, it, expect, afterAll } from 'vitest'
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  detectarFfmpeg,
  ffmpegDisponivel,
  gerarMidia,
  verificarExigenciaDeFfmpeg,
  descreverComFfmpeg,
  type FormatoGerado,
} from './apoio/ffmpeg'

const pasta = mkdtempSync(path.join(os.tmpdir(), 'converse-ffmpeg-'))
afterAll(() => rmSync(pasta, { recursive: true, force: true }))

const lerInicio = (arquivo: string, n = 16) => readFileSync(arquivo).subarray(0, n)

describe('detecção e exigência do ffmpeg', () => {
  it('um caminho que não existe não é ffmpeg disponível', () => {
    expect(detectarFfmpeg('/caminho/que/nao/existe/ffmpeg', '/caminho/que/nao/existe/ffprobe')).toBe(false)
  })

  it('com EXIGIR_FFMPEG=1 a ausência lança erro; sem a variável apenas não lança', () => {
    expect(() => verificarExigenciaDeFfmpeg({ exigir: true, disponivel: false })).toThrow(/ffmpeg/)
    expect(() => verificarExigenciaDeFfmpeg({ exigir: false, disponivel: false })).not.toThrow()
    expect(() => verificarExigenciaDeFfmpeg({ exigir: true, disponivel: true })).not.toThrow()
  })
})

descreverComFfmpeg('mídia gerada pelo ffmpeg', () => {
  it('o ffmpeg local responde', () => {
    expect(ffmpegDisponivel).toBe(true)
  })

  it('gera um MP3, um WAV e um MP4 de 3 segundos com a assinatura esperada', () => {
    const mp3 = gerarMidia({ formato: 'mp3', segundos: 3, diretorio: pasta })
    const wav = gerarMidia({ formato: 'wav', segundos: 3, diretorio: pasta })
    const mp4 = gerarMidia({ formato: 'mp4', segundos: 3, diretorio: pasta })
    const a = lerInicio(mp3)
    expect(a.subarray(0, 3).toString('latin1') === 'ID3' || (a[0] === 0xff && (a[1]! & 0xe0) === 0xe0)).toBe(true)
    const b = lerInicio(wav)
    expect(b.subarray(0, 4).toString('latin1')).toBe('RIFF')
    expect(b.subarray(8, 12).toString('latin1')).toBe('WAVE')
    expect(lerInicio(mp4).subarray(4, 8).toString('latin1')).toBe('ftyp')
    for (const f of [mp3, wav, mp4]) expect(statSync(f).size).toBeGreaterThan(1000)
  })

  it('gera todos os formatos pedidos e a opção de ruído muda o conteúdo', () => {
    const formatos: FormatoGerado[] = ['m4a', 'ogg', 'flac', 'aac', 'webm', 'mkv', 'mov', 'm4v', 'avi']
    for (const formato of formatos) {
      const arquivo = gerarMidia({ formato, segundos: 1, diretorio: pasta })
      expect(statSync(arquivo).size, formato).toBeGreaterThan(100)
    }
    const a = gerarMidia({ formato: 'mp3', segundos: 2, diretorio: pasta, ruido: true, nome: 'ruido-a' })
    const b = gerarMidia({ formato: 'mp3', segundos: 2, diretorio: pasta, ruido: true, nome: 'ruido-b' })
    expect(readFileSync(a).equals(readFileSync(b))).toBe(false)
  })
})
