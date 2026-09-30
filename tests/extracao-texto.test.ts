import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { extrairTextoSimples } from '@/lib/extracao/texto'
import { extrairLegenda } from '@/lib/extracao/legenda'

const fixture = (nome: string) => readFileSync(path.resolve(process.cwd(), 'tests/fixtures', nome))

describe('TXT e MD', () => {
  it('devolve o texto das fixtures como está, com o título do Markdown', () => {
    expect(extrairTextoSimples(fixture('exemplo.txt'))).toContain('A política de troca permite devolver')
    const md = extrairTextoSimples(fixture('exemplo.md'))
    expect(md).toContain('# Loja Exemplo')
    expect(md).toContain('- Embalagem original')
  })

  it('decodifica Latin-1 e tira o BOM', () => {
    expect(extrairTextoSimples(Buffer.from('ação', 'latin1'))).toBe('ação')
    expect(extrairTextoSimples(Buffer.from([0xef, 0xbb, 0xbf, 0x6f, 0x6b]))).toBe('ok')
  })
})

describe('legendas', () => {
  const FALAS =
    'Bem-vindo à Loja Exemplo. Hoje vamos falar da política de troca. A troca vale por sete dias.'

  it('SRT vira só as falas unidas por espaço, sem numeração, tempos nem tags', () => {
    expect(extrairLegenda(fixture('exemplo.srt'), 'srt')).toBe(FALAS)
  })

  it('VTT sem cabeçalho WEBVTT, blocos NOTE, identificador de cue, tempos e tags', () => {
    const texto = extrairLegenda(fixture('exemplo.vtt'), 'vtt')
    expect(texto).toBe(FALAS)
    expect(texto).not.toMatch(/WEBVTT|NOTE|cue-1|-->|<|align/)
  })

  it('junta várias linhas de uma mesma fala e entende entidades', () => {
    const srt = '1\r\n00:00:01,000 --> 00:00:03,000\r\nPrimeira linha\r\nsegunda linha &amp; fim\r\n\r\n2\r\n00:00:04,000 --> 00:00:05,000\r\nOutra.\r\n'
    expect(extrairLegenda(Buffer.from(srt), 'srt')).toBe('Primeira linha segunda linha & fim Outra.')
  })

  it('uma fala que é só um número não é confundida com a numeração', () => {
    const srt = '1\n00:00:01,000 --> 00:00:02,000\n2024\n\n2\n00:00:03,000 --> 00:00:04,000\nfoi o ano\n'
    expect(extrairLegenda(Buffer.from(srt), 'srt')).toBe('2024 foi o ano')
  })

  it('legenda sem nenhuma fala devolve texto vazio', () => {
    expect(extrairLegenda(Buffer.from('WEBVTT\n\nNOTE só uma nota\n'), 'vtt')).toBe('')
  })
})
