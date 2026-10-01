/**
 * T-02.02 (FT-08): extração do áudio (MP3 mono, 16 kHz, 32 kbps) e divisão em
 * partes de 10 minutos sem reencodar, com prazo por processo e sem deixar
 * arquivo parcial (PR-72).
 */
import { describe, it, expect, afterAll } from 'vitest'
import { existsSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { dividirEmSegmentos, extrairAudio, SEGUNDOS_POR_PARTE } from '@/lib/midia'
import { descreverComFfmpeg, gerarMidia } from './apoio/ffmpeg'

const pasta = mkdtempSync(path.join(os.tmpdir(), 'converse-extracao-'))
afterAll(() => rmSync(pasta, { recursive: true, force: true }))

function propriedades(arquivo: string) {
  const r = spawnSync(
    process.env.FFPROBE_PATH || 'ffprobe',
    ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=channels,sample_rate,codec_name,bit_rate:format=duration', '-of', 'json', arquivo],
    { encoding: 'utf8' },
  )
  const j = JSON.parse(r.stdout) as { streams: Array<{ channels: number; sample_rate: string; codec_name: string; bit_rate?: string }>; format: { duration: string } }
  return { ...j.streams[0]!, duracao: Number(j.format.duration) }
}

describe('constantes', () => {
  it('a parte tem 10 minutos', () => {
    expect(SEGUNDOS_POR_PARTE).toBe(600)
  })
})

descreverComFfmpeg('extração e divisão com ffmpeg de verdade', () => {
  it('a extração de um vídeo com áudio gera MP3 mono de 16 kHz', async () => {
    const video = gerarMidia({ formato: 'mp4', segundos: 4, diretorio: pasta })
    const saida = path.join(pasta, 'extraido.mp3')
    await extrairAudio(video, saida)
    const p = propriedades(saida)
    expect(p).toMatchObject({ channels: 1, sample_rate: '16000', codec_name: 'mp3' })
    expect(p.duracao).toBeGreaterThan(3.5)
    expect(statSync(saida).size).toBeLessThan(40_000)
  })

  it('a divisão de um áudio de 25 segundos em partes de 10 produz 3 arquivos em ordem', async () => {
    const audio = gerarMidia({ formato: 'mp3', segundos: 25, diretorio: pasta, nome: 'longo', ruido: true })
    const destino = path.join(pasta, 'partes')
    const partes = await dividirEmSegmentos(audio, destino, { segundosPorParte: 10 })
    expect(partes).toHaveLength(3)
    expect(partes.map((p) => path.basename(p))).toEqual(['000.mp3', '001.mp3', '002.mp3'])
    expect(readdirSync(destino).sort()).toEqual(['000.mp3', '001.mp3', '002.mp3'])
    const duracoes = partes.map((p) => propriedades(p).duracao)
    expect(duracoes[0]).toBeGreaterThan(9)
    expect(duracoes[0]).toBeLessThan(11)
    expect(duracoes[2]).toBeLessThan(6.5)
  })

  it('um arquivo corrompido lança erro claro, sem repassar a saída do ffmpeg, e não deixa saída parcial', async () => {
    const lixo = path.join(pasta, 'corrompido.mp4')
    writeFileSync(lixo, Buffer.from('nada de vídeo aqui'.repeat(50)))
    const saida = path.join(pasta, 'nao-deve-existir.mp3')
    const erro = await extrairAudio(lixo, saida).catch((e) => e)
    expect(erro.codigo).toBe('midia_invalida')
    expect(erro.message).not.toMatch(/Invalid data|moov atom|ffmpeg version/i)
    expect(existsSync(saida)).toBe(false)
  })

  it('um prazo de 1 ms mata o processo com erro de tempo esgotado e não deixa saída parcial', async () => {
    const video = gerarMidia({ formato: 'mp4', segundos: 4, diretorio: pasta, nome: 'prazo' })
    const saida = path.join(pasta, 'prazo.mp3')
    const erro = await extrairAudio(video, saida, { prazoMs: 1 }).catch((e) => e)
    expect(erro.codigo).toBe('midia_tempo_esgotado')
    expect(existsSync(saida)).toBe(false)
    const destino = path.join(pasta, 'partes-prazo')
    const erro2 = await dividirEmSegmentos(video.replace('.mp4', '.mp4'), destino, { prazoMs: 1 }).catch((e) => e)
    expect(erro2.codigo).toBe('midia_tempo_esgotado')
    expect(existsSync(destino) ? readdirSync(destino) : []).toEqual([])
  })

  it('recusa caminho relativo na entrada e na saída', async () => {
    await expect(extrairAudio('relativo.mp4', path.join(pasta, 'x.mp3'))).rejects.toMatchObject({ codigo: 'caminho_invalido' })
    await expect(extrairAudio(path.join(pasta, 'a.mp4'), 'x.mp3')).rejects.toMatchObject({ codigo: 'caminho_invalido' })
  })
})
