/**
 * T-06.01 (FT-08): lógica pura da tela de vídeo, sem DOM nem rede: a conferência barata no navegador (o servidor confere de novo), a
 * duração, o texto da etapa e a tradução da resposta do envio (PR-76).
 */
import { describe, it, expect } from 'vitest'
import {
  avisoDeCreditos,
  descreverLimitesDeVideo,
  ehLinkDoYoutube,
  formatarDuracao,
  interpretarRespostaDaFonte,
  textoDaEtapa,
  validarLinkDoYoutube,
  validarVideoNoNavegador,
} from '@/componentes/video-logica'

const MB = 1024 * 1024

describe('validarVideoNoNavegador', () => {
  it('aceita extensão da lista dentro do limite', () => {
    expect(validarVideoNoNavegador('Aula.MP4', 10 * MB, 500 * MB)).toEqual({ ok: true })
    expect(validarVideoNoNavegador('fala.flac', 1, 500 * MB)).toEqual({ ok: true })
  })

  it('recusa extensão estranha com a lista de formatos, arquivo vazio e arquivo grande com os dois tamanhos', () => {
    const feio = validarVideoNoNavegador('documento.txt', 10, 500 * MB)
    expect(feio).toMatchObject({ ok: false })
    expect((feio as { motivo: string }).motivo).toMatch(/\.mp4/)
    expect((feio as { motivo: string }).motivo).toMatch(/\.flac/)
    expect(validarVideoNoNavegador('a.mp3', 0, 500 * MB)).toEqual({ ok: false, motivo: 'O arquivo está vazio.' })
    const grande = validarVideoNoNavegador('a.mp3', 600 * MB, 500 * MB) as { motivo: string }
    expect(grande.motivo).toContain('600 MB')
    expect(grande.motivo).toContain('500 MB')
  })
})

describe('validarLinkDoYoutube', () => {
  it('aceita as formas de link do YouTube e dá o motivo para o resto, já ao digitar', () => {
    expect(validarLinkDoYoutube('https://youtu.be/abcdefghijk')).toEqual({ ok: true })
    expect(validarLinkDoYoutube('https://www.youtube.com/watch?v=abcdefghijk&t=3')).toEqual({ ok: true })
    expect(validarLinkDoYoutube('   ')).toEqual({ ok: false, motivo: 'Cole o link do vídeo do YouTube.' })
    const outro = validarLinkDoYoutube('https://evil.com/watch?v=abcdefghijk') as { motivo: string }
    expect(outro.motivo).toMatch(/YouTube/)
    expect(validarLinkDoYoutube('texto qualquer')).toMatchObject({ ok: false })
  })

  it('o link da lista só vira âncora se for do YouTube', () => {
    expect(ehLinkDoYoutube('https://www.youtube.com/watch?v=abcdefghijk')).toBe(true)
    expect(ehLinkDoYoutube('javascript:alert(1)')).toBe(false)
    expect(ehLinkDoYoutube('https://evil.com/watch?v=abcdefghijk')).toBe(false)
    expect(ehLinkDoYoutube(null)).toBe(false)
  })
})

describe('textos', () => {
  it('3725 segundos viram 1h 02min e a duração curta mostra minutos e segundos', () => {
    expect(formatarDuracao(3725)).toBe('1h 02min')
    expect(formatarDuracao(3600)).toBe('1h 00min')
    expect(formatarDuracao(125)).toBe('2min 05s')
    expect(formatarDuracao(45)).toBe('45s')
    expect(formatarDuracao(0)).toBeNull()
    expect(formatarDuracao(null)).toBeNull()
  })

  it('a etapa Transcrevendo parte 2 de 5 vira o texto com percentual, e sem etapa não inventa nada', () => {
    expect(textoDaEtapa('Transcrevendo parte 2 de 5', 45)).toBe('Transcrevendo parte 2 de 5 · 45%')
    expect(textoDaEtapa('Extraindo áudio', null)).toBe('Extraindo áudio')
    expect(textoDaEtapa(null, 45)).toBe('Processando · 45%')
    expect(textoDaEtapa(null, null)).toBeNull()
    expect(textoDaEtapa('X', 180)).toBe('X · 100%')
    expect(textoDaEtapa('X', -3)).toBe('X · 0%')
  })

  it('o aviso de créditos cita o OpenRouter e o modelo em uso, e os limites aparecem em MB e minutos', () => {
    const aviso = avisoDeCreditos('google/gemini-2.5-flash')
    expect(aviso).toMatch(/créditos do OpenRouter/)
    expect(aviso).toContain('google/gemini-2.5-flash')
    expect(descreverLimitesDeVideo(500 * MB, 180)).toBe('Até 500 MB e 180 minutos por arquivo.')
    expect(descreverLimitesDeVideo(500 * MB, 1)).toBe('Até 500 MB e 1 minuto por arquivo.')
  })
})

describe('interpretarRespostaDaFonte', () => {
  it('202 é aceito; 413, 415 e 422 trazem a mensagem da API; sem JSON usa a frase padrão com o status', () => {
    expect(interpretarRespostaDaFonte(202, JSON.stringify({ fonte: { id: 'x' } }))).toEqual({ aceito: true })
    expect(interpretarRespostaDaFonte(413, JSON.stringify({ codigo: 'corpo_grande_demais', mensagem: 'O envio é maior que o limite permitido.' }))).toEqual({
      aceito: false,
      motivo: 'O envio é maior que o limite permitido.',
    })
    expect(interpretarRespostaDaFonte(415, JSON.stringify({ mensagem: 'O conteúdo não parece ser um arquivo MP4.' }))).toEqual({
      aceito: false,
      motivo: 'O conteúdo não parece ser um arquivo MP4.',
    })
    expect(interpretarRespostaDaFonte(422, JSON.stringify({ mensagem: 'O arquivo está vazio.' }))).toEqual({ aceito: false, motivo: 'O arquivo está vazio.' })
    expect(interpretarRespostaDaFonte(500, 'não é json')).toEqual({ aceito: false, motivo: 'Não foi possível enviar (erro 500).' })
    expect(interpretarRespostaDaFonte(401, '{}')).toEqual({ aceito: false, motivo: 'Não foi possível enviar (erro 401).' })
  })
})
