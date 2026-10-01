/**
 * T-01.03 (FT-13, PR-09, PR-105): o apoio que gera, com o ffmpeg, um áudio com fala, silêncio e ruído, e o
 * OpenRouter falso que responde VAZIO para as partes escolhidas em `silencios` (o vazio vem do índice da
 * parte, não do áudio). São a base dos testes de trecho sem fala das próximas tasks.
 */
import { afterAll, afterEach, describe, expect, it } from 'vitest'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { descreverComFfmpeg, gerarAudioComSilencio, gerarMidia } from './apoio/ffmpeg'
import { CHAVE_VALIDA, iniciarOpenRouterFalso, type OpenRouterFalso } from './apoio/openrouter-falso'

const pasta = mkdtempSync(path.join(os.tmpdir(), 'converse-silencio-'))
let falso: OpenRouterFalso | undefined
afterEach(async () => {
  await falso?.fechar()
  falso = undefined
})
afterAll(() => rmSync(pasta, { recursive: true, force: true }))

async function transcrever(base64: string): Promise<string> {
  const r = await fetch(`${falso!.url}/chat/completions`, {
    method: 'POST',
    headers: { authorization: `Bearer ${CHAVE_VALIDA}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: [{ type: 'text', text: 'transcreva' }, { type: 'input_audio', input_audio: { data: base64, format: 'mp3' } }] }],
    }),
  })
  const corpo = (await r.json()) as { choices: Array<{ message: { content: string } }> }
  return corpo.choices[0]!.message.content
}

describe('OpenRouter falso com silencios (integração)', () => {
  it('responde vazio à parte listada em silencios e o texto simulado às demais', async () => {
    falso = await iniciarOpenRouterFalso({ silencios: [1], transcricoes: ['fala da parte um'] })
    const partes = [0, 1, 2].map((i) => gerarMidia({ formato: 'mp3', diretorio: pasta, nome: `parte-${i}`, ruido: true, segundos: 1 }))
    const base = partes.map((p) => readFileSync(p).toString('base64'))
    expect(await transcrever(base[0]!)).toBe('fala da parte um')
    expect(await transcrever(base[1]!)).toBe('')
    expect(await transcrever(base[2]!)).toBe('Transcrição simulada da parte 3.')
    // O mesmo áudio de novo (nova tentativa) é a mesma parte: continua vazio.
    expect(await transcrever(base[1]!)).toBe('')
  })

  it('sem silencios todas as partes têm texto', async () => {
    falso = await iniciarOpenRouterFalso({})
    const p = gerarMidia({ formato: 'mp3', diretorio: pasta, nome: 'sem-silencio', ruido: true, segundos: 1 })
    expect(await transcrever(readFileSync(p).toString('base64'))).toMatch(/Transcrição simulada/)
  })
})

descreverComFfmpeg('áudio com fala, silêncio e ruído gerado pelo ffmpeg', () => {
  const duracao = (arquivo: string) =>
    Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', arquivo], { encoding: 'utf8' }).stdout)

  it('gerarAudioComSilencio({fala:5,silencio:10,ruido:10}) dá um mp3 de 25 s com um trecho mudo de verdade', () => {
    const arquivo = gerarAudioComSilencio({ diretorio: pasta, fala: 5, silencio: 10, ruido: 10, nome: 'cinco-dez-dez' })
    expect(arquivo.endsWith('.mp3')).toBe(true)
    expect(Math.abs(duracao(arquivo) - 25)).toBeLessThanOrEqual(1)
    const r = spawnSync('ffmpeg', ['-v', 'info', '-i', arquivo, '-af', 'silencedetect=noise=-50dB:d=5', '-f', 'null', '-'], { encoding: 'utf8' })
    expect(r.stderr).toMatch(/silence_start: [45](\.\d+)?\b/)
  })

  it('as partes de 10 s são áudios distintos (fala, silêncio e ruído) e um áudio sem silêncio não tem trecho mudo', () => {
    const arquivo = gerarAudioComSilencio({ diretorio: pasta, fala: 10, silencio: 10, ruido: 5, nome: 'dez-dez-cinco' })
    expect(Math.abs(duracao(arquivo) - 25)).toBeLessThanOrEqual(1)
    const direto = gerarAudioComSilencio({ diretorio: pasta, fala: 6, silencio: 0, ruido: 0, nome: 'so-fala' })
    expect(Math.abs(duracao(direto) - 6)).toBeLessThanOrEqual(1)
    const r = spawnSync('ffmpeg', ['-v', 'info', '-i', direto, '-af', 'silencedetect=noise=-50dB:d=2', '-f', 'null', '-'], { encoding: 'utf8' })
    expect(r.stderr).not.toMatch(/silence_start/)
  })
})
