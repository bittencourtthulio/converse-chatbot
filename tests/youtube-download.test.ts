import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { ambiente } from '@/lib/ambiente'
import { baixarAudioDoYoutube, executarYtdlp, inspecionarVideo } from '@/lib/youtube-download'

vi.mock('node:child_process', () => ({ execFile: vi.fn() }))
const url = 'https://youtu.be/abcdefghijk?list=qualquer'
const video = { id: 'abcdefghijk', titulo: 'Título', duracaoSegundos: 20, aoVivo: false, faixas: [] }
const destino = () => path.join(ambiente.storageDir, 'download', 'audio')
function responder(dados: unknown, erro: object | null = null) {
  vi.mocked(execFile).mockImplementation(((_bin: string, _args: string[], _op: unknown, cb: (e: unknown, s: string) => void) => {
    cb(erro, JSON.stringify(dados))
  }) as typeof execFile)
}
beforeEach(() => vi.clearAllMocks())

describe('yt-dlp', () => {
  it('extrai metadados e legendas manuais/automáticas sem shell ou playlist', async () => {
    responder({ id: video.id, title: ' Aula ', duration: 20.1, subtitles: { pt: [{ ext: 'vtt' }, { ext: 'json3', url: 'https://www.youtube.com/api/timedtext' }] }, automatic_captions: { en: [{ ext: 'json3', url: 'https://www.youtube.com/api/timedtext?lang=en' }] } })
    expect(await inspecionarVideo(url)).toMatchObject({ titulo: 'Aula', duracaoSegundos: 21, faixas: [{ idioma: 'pt', automatica: false }, { idioma: 'en', automatica: true }] })
    const chamada = vi.mocked(execFile).mock.calls[0]!
    expect(chamada[1]).toEqual(expect.arrayContaining(['--ignore-config', '--no-plugin-dirs', '--no-playlist', '--', 'https://www.youtube.com/watch?v=abcdefghijk']))
    expect(chamada[2]).toMatchObject({ shell: false, timeout: 60_000 })
    expect(chamada[1]).not.toContain(url)
  })

  it('não executa binário para URL de outro host', async () => {
    await expect(inspecionarVideo('https://evil.com/watch?v=abcdefghijk')).rejects.toMatchObject({ codigo: 'url_invalida' })
    expect(execFile).not.toHaveBeenCalled()
  })

  it.each([
    [{ code: 'ENOENT' }, 'ytdlp_ausente'],
    [{ killed: true }, 'youtube_tempo_esgotado'],
    [{ code: 1, message: 'token secreto', stderr: 'segredo' }, 'youtube_download_falhou'],
  ])('traduz erro de processo sem vazar stdout/stderr', async (erro, codigo) => {
    responder({ segredo: 'token' }, erro)
    await expect(executarYtdlp([], 10)).rejects.toMatchObject({ codigo })
    await expect(executarYtdlp([], 10)).rejects.not.toThrow(/segredo|token/)
  })

  it('rejeita metadados de outro vídeo', async () => {
    responder({ id: 'outro-id' })
    await expect(inspecionarVideo(url)).rejects.toMatchObject({ codigo: 'youtube_formato' })
  })

  it('rejeita live, duração desconhecida e vídeo longo antes do download', async () => {
    for (const v of [{ ...video, aoVivo: true }, { ...video, duracaoSegundos: null }, { ...video, duracaoSegundos: ambiente.maxVideoMinutos * 60 + 1 }]) {
      await expect(baixarAudioDoYoutube(v, destino())).rejects.toBeDefined()
    }
    expect(execFile).not.toHaveBeenCalled()
  })

  it('pede áudio com limite de tamanho e confere o arquivo final', async () => {
    await mkdir(path.dirname(destino()), { recursive: true })
    await writeFile(destino(), 'audio')
    responder({})
    await baixarAudioDoYoutube(video, destino())
    expect(vi.mocked(execFile).mock.calls[0]![1]).toEqual(expect.arrayContaining(['--format', 'bestaudio/best', '--max-filesize', String(ambiente.maxVideoBytes)]))
  })

  it('download que termina sem arquivo vira falha em vez de transcrição vazia', async () => {
    responder({})
    await expect(baixarAudioDoYoutube(video, `${destino()}-ausente`)).rejects.toMatchObject({ codigo: 'youtube_audio_invalido' })
  })
})
