/**
 * T-05.01 (FT-08): o id do vídeo sai de `watch`, `youtu.be`, `shorts` e
 * `embed`, e a URL do usuário só vale se o host for do YouTube; o servidor
 * nunca conecta ao host da URL do usuário, só à base configurada (PR-75).
 */
import { describe, it, expect, afterEach } from 'vitest'
import { extrairIdDoYoutube, urlDoVideo, urlDeOrigem } from '@/lib/youtube'
import { ErroDeAplicacao } from '@/lib/erros'

const ID = 'abcdefghijk'
const base = process.env.YOUTUBE_BASE
afterEach(() => {
  if (base === undefined) delete process.env.YOUTUBE_BASE
  else process.env.YOUTUBE_BASE = base
})

describe('extrairIdDoYoutube', () => {
  it.each([
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}&t=30s&list=PL123`,
    `https://m.youtube.com/watch?feature=share&v=${ID}`,
    `https://youtu.be/${ID}?si=abc`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/embed/${ID}?start=3`,
    `http://WWW.YOUTUBE.COM/watch?v=${ID}`,
    `  https://youtu.be/${ID}  `,
  ])('%s devolve o id', (url) => {
    expect(extrairIdDoYoutube(url)).toBe(ID)
  })

  it('ids com hífen e sublinhado valem', () => {
    expect(extrairIdDoYoutube('https://youtu.be/a-b_c-d_e-f')).toBe('a-b_c-d_e-f')
  })

  it('a URL gerada para o id usa só a base configurada, nunca o host que o usuário digitou', () => {
    delete process.env.YOUTUBE_BASE
    expect(urlDoVideo(ID)).toBe(`https://www.youtube.com/watch?v=${ID}`)
    process.env.YOUTUBE_BASE = 'http://127.0.0.1:7777/'
    expect(urlDoVideo(ID)).toBe(`http://127.0.0.1:7777/watch?v=${ID}`)
    // a origem exibida ao usuário é sempre a oficial, mesmo com base de teste
    expect(urlDeOrigem(ID)).toBe(`https://www.youtube.com/watch?v=${ID}`)
  })
})

describe('URLs recusadas', () => {
  const recusadas: unknown[] = [
    `https://evil.com/watch?v=${ID}`,
    `https://youtube.com.evil.com/watch?v=${ID}`,
    `https://evil.com/youtube.com/watch?v=${ID}`,
    `https://evilyoutube.com/watch?v=${ID}`,
    `https://music.youtube.com/watch?v=${ID}`,
    `https://user:senha@www.youtube.com/watch?v=${ID}`,
    `https://www.youtube.com:8443/watch?v=${ID}`,
    `ftp://www.youtube.com/watch?v=${ID}`,
    `javascript:alert('${ID}')`,
    `file:///etc/passwd`,
    `https://www.youtube.com/watch?v=curto`,
    `https://www.youtube.com/watch?v=${ID}x`,
    `https://www.youtube.com/watch?v=abc$efghijk`,
    `https://www.youtube.com/watch`,
    `https://www.youtube.com/`,
    `https://www.youtube.com/playlist?list=PL123`,
    `https://youtu.be/`,
    'isto não é uma URL',
    '',
    '   ',
    42,
    null,
    undefined,
  ]
  it.each(recusadas.map((u) => [String(u), u]))('%s é recusada com 422 url_invalida', (_nome, url) => {
    let erro: unknown
    try {
      extrairIdDoYoutube(url)
    } catch (e) {
      erro = e
    }
    expect(erro).toBeInstanceOf(ErroDeAplicacao)
    expect(erro).toMatchObject({ status: 422, codigo: 'url_invalida' })
    expect((erro as Error).message).toMatch(/YouTube/)
  })
})
