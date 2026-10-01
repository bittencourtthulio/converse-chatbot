/**
 * T-01.05 (FT-08): o servidor YouTube simulado serve a página do vídeo com
 * `ytInitialPlayerResponse` e as legendas em json3 e XML de fixture (PR-75).
 * O formato real não é documentado: a fixture o imita por suposição.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { iniciarYoutubeFalso, ID_COM_LEGENDAS, ID_SEM_LEGENDAS, type YoutubeFalso } from './apoio/youtube-falso'

let falso: YoutubeFalso | undefined
afterEach(async () => {
  await falso?.fechar()
  falso = undefined
})

function lerPlayer(html: string) {
  const m = /var ytInitialPlayerResponse = (\{.*?\});<\/script>/s.exec(html)
  expect(m).toBeTruthy()
  return JSON.parse(m![1]!) as {
    videoDetails: { title: string }
    captions?: { playerCaptionsTracklistRenderer: { captionTracks: Array<{ baseUrl: string; languageCode: string; kind?: string }> } }
  }
}

describe('simulado do YouTube', () => {
  it('sobe em porta livre, registra as requisições e fecha', async () => {
    falso = await iniciarYoutubeFalso()
    expect(falso.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/)
    await fetch(`${falso.url}/watch?v=${ID_COM_LEGENDAS}`)
    expect(falso.requisicoes).toEqual([expect.objectContaining({ caminho: '/watch', consulta: `v=${ID_COM_LEGENDAS}` })])
    const porta = falso.url
    await falso.fechar()
    falso = undefined
    await expect(fetch(`${porta}/watch?v=x`)).rejects.toThrow()
  })

  it('a página de um id conhecido traz o título e duas faixas', async () => {
    falso = await iniciarYoutubeFalso()
    const html = await (await fetch(`${falso.url}/watch?v=${ID_COM_LEGENDAS}`)).text()
    const player = lerPlayer(html)
    expect(player.videoDetails.title).toBe('Aula de exemplo')
    const faixas = player.captions!.playerCaptionsTracklistRenderer.captionTracks
    expect(faixas.map((f) => [f.languageCode, f.kind ?? 'manual'])).toEqual([['en', 'manual'], ['pt', 'asr']])
    expect(faixas[0]!.baseUrl.startsWith(falso.url)).toBe(true)
  })

  it('a legenda em json3 e em XML devolve as falas da fixture', async () => {
    falso = await iniciarYoutubeFalso()
    const player = lerPlayer(await (await fetch(`${falso.url}/watch?v=${ID_COM_LEGENDAS}`)).text())
    const base = player.captions!.playerCaptionsTracklistRenderer.captionTracks[0]!.baseUrl
    const json = (await (await fetch(`${base}&fmt=json3`)).json()) as { events: Array<{ tStartMs: number; segs: Array<{ utf8: string }> }> }
    expect(json.events[0]).toMatchObject({ tStartMs: 0 })
    expect(json.events.map((e) => e.segs.map((s) => s.utf8).join(''))).toEqual([
      'Welcome to the lesson.',
      "Today we talk about how it's done.",
      'Thanks for watching.',
    ])
    const xml = await (await fetch(base)).text()
    expect(xml).toContain('<transcript>')
    expect(xml).toContain('<text start="0" dur="4">Welcome to the lesson.</text>')
    expect(xml).toContain("it&amp;#39;s done")
  })

  it('um id desconhecido ou sem legendas devolve a página sem captionTracks', async () => {
    falso = await iniciarYoutubeFalso()
    for (const id of ['desconhecid', ID_SEM_LEGENDAS]) {
      const r = await fetch(`${falso.url}/watch?v=${id}`)
      expect(r.status).toBe(200)
      expect(lerPlayer(await r.text()).captions).toBeUndefined()
    }
  })

  it('o simulado não importa nada de src', () => {
    const fonte = readFileSync('tests/apoio/youtube-falso.ts', 'utf8')
    expect(fonte).not.toMatch(/from ['"][^'"]*src\//)
    expect(fonte).not.toMatch(/from ['"]@\//)
  })
})
