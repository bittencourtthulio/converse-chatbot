/**
 * T-02.01 (FT-08): `src/lib/midia.ts` chama ffprobe por `spawn` com vetor de
 * argumentos (nunca shell), sonda duração e faixa de áudio, aplica o limite de
 * minutos e diz com clareza quando o binário não existe (PR-72).
 */
import { describe, it, expect, afterEach, afterAll } from 'vitest'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { executar, MENSAGEM_SEM_FFMPEG, sondar, verificarMidia } from '@/lib/midia'
import { ErroDeAplicacao } from '@/lib/erros'
import { descreverComFfmpeg, gerarMidia } from './apoio/ffmpeg'

const pasta = mkdtempSync(path.join(os.tmpdir(), 'converse-midia-'))
const original = { ...process.env }
afterEach(() => {
  for (const c of ['FFMPEG_PATH', 'FFPROBE_PATH']) {
    if (original[c] === undefined) delete process.env[c]
    else process.env[c] = original[c]
  }
})
afterAll(() => rmSync(pasta, { recursive: true, force: true }))

describe('binário ausente e processo externo (sem ffmpeg)', () => {
  it('com FFPROBE_PATH inexistente, sondar lança a mensagem de ffmpeg ausente', async () => {
    process.env.FFPROBE_PATH = '/caminho/que/nao/existe/ffprobe'
    const arquivo = path.join(pasta, 'qualquer.mp3')
    writeFileSync(arquivo, 'x')
    const erro = await sondar(arquivo).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroDeAplicacao)
    expect(erro.message).toBe(MENSAGEM_SEM_FFMPEG)
    expect(erro.message).toBe('Não encontrei o ffmpeg neste servidor. Instale o ffmpeg ou use a imagem de contêiner do projeto.')
    expect(erro.codigo).toBe('ffmpeg_ausente')
  })

  it('verificarMidia informa quais binários respondem', async () => {
    process.env.FFMPEG_PATH = '/caminho/que/nao/existe/ffmpeg'
    process.env.FFPROBE_PATH = '/caminho/que/nao/existe/ffprobe'
    expect(await verificarMidia()).toMatchObject({ ffmpeg: false, ffprobe: false })
  })

  it('o executor usa spawn com vetor de argumentos, sem shell, e não repassa a saída de erro', async () => {
    const fonte = readFileSync('src/lib/midia.ts', 'utf8')
    expect(fonte).toMatch(/spawn\(/)
    expect(fonte).not.toMatch(/\bexec\(|execSync|shell:\s*true|execFile\(/)
    const erro = await executar(process.execPath, ['-e', "console.error('segredo-no-stderr'); process.exit(3)"], { prazoMs: 5000 }).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroDeAplicacao)
    expect(erro.message).not.toContain('segredo-no-stderr')
  })

  it('um caminho relativo ou que começa com hífen é recusado antes de chamar o binário', async () => {
    for (const ruim of ['relativo.mp3', '-i', '../x.mp3']) {
      await expect(sondar(ruim), ruim).rejects.toMatchObject({ codigo: 'caminho_invalido' })
    }
  })
})

descreverComFfmpeg('sonda com ffprobe de verdade', () => {
  it('um MP3 gerado pelo ffmpeg tem duração e áudio, e um MP4 só de vídeo não tem áudio', async () => {
    const mp3 = gerarMidia({ formato: 'mp3', segundos: 3, diretorio: pasta })
    const sonda = await sondar(mp3)
    expect(sonda.temAudio).toBe(true)
    expect(sonda.duracaoSegundos).toBeGreaterThan(2.5)
    expect(sonda.duracaoSegundos).toBeLessThan(3.5)
    const mudo = gerarMidia({ formato: 'mp4', segundos: 2, diretorio: pasta, semAudio: true, nome: 'mudo' })
    expect((await sondar(mudo)).temAudio).toBe(false)
  })

  it('uma duração acima do limite de minutos lança erro claro; um arquivo corrompido também', async () => {
    const mp3 = gerarMidia({ formato: 'mp3', segundos: 3, diretorio: pasta, nome: 'curto' })
    const erro = await sondar(mp3, { maxMinutos: 0.01 }).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroDeAplicacao)
    expect(erro.codigo).toBe('midia_longa_demais')
    expect(erro.message).toMatch(/limite/)
    const lixo = path.join(pasta, 'lixo.mp3')
    writeFileSync(lixo, Buffer.from('isto não é áudio nenhum, só texto qualquer'.repeat(20)))
    await expect(sondar(lixo)).rejects.toMatchObject({ codigo: 'midia_invalida' })
  })

  it('verificarMidia confirma os dois binários e traz a versão', async () => {
    const r = await verificarMidia()
    expect(r.ffmpeg).toBe(true)
    expect(r.ffprobe).toBe(true)
    expect(r.versao).toMatch(/ffmpeg/i)
  })
})
