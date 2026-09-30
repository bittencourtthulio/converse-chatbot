import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { ErroDeAplicacao } from '@/lib/erros'
import { conferirConteudoDeTexto, conferirPdf, decodificarTexto } from '@/lib/extracao/conteudo'

const fixture = (nome: string) => readFileSync(path.resolve(process.cwd(), 'tests/fixtures', nome))

describe('PDF', () => {
  it('aceita os PDFs das fixtures', () => {
    expect(() => conferirPdf(fixture('exemplo.pdf'))).not.toThrow()
    expect(() => conferirPdf(fixture('escaneado.pdf'))).not.toThrow()
  })

  it('recusa arquivo que não começa por %PDF-, mesmo com a extensão certa', () => {
    const erro = (() => {
      try {
        conferirPdf(Buffer.from('<html>não sou pdf</html>'))
      } catch (e) {
        return e
      }
    })()
    expect(erro).toBeInstanceOf(ErroDeAplicacao)
    expect((erro as ErroDeAplicacao).status).toBe(422)
    expect((erro as ErroDeAplicacao).message).toMatch(/PDF/)
    expect(() => conferirPdf(Buffer.from('  %PDF-1.4'))).toThrow(ErroDeAplicacao)
    expect(() => conferirPdf(Buffer.alloc(0))).toThrow(ErroDeAplicacao)
  })
})

describe('decodificação de texto', () => {
  it('lê UTF-8 das fixtures', () => {
    expect(decodificarTexto(fixture('exemplo.txt'))).toContain('horário de atendimento')
    expect(decodificarTexto(fixture('exemplo.json'))).toContain('Loja Exemplo')
  })

  it('tira o BOM do UTF-8', () => {
    const bytes = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('olá', 'utf8')])
    expect(decodificarTexto(bytes)).toBe('olá')
  })

  it('cai para Latin-1 quando os bytes não são UTF-8 válido', () => {
    const bytes = Buffer.from('coração e ação', 'latin1')
    expect(() => new TextDecoder('utf-8', { fatal: true }).decode(bytes)).toThrow()
    expect(decodificarTexto(bytes)).toBe('coração e ação')
  })

  it('recusa byte nulo, que indica arquivo binário ou UTF-16', () => {
    expect(() => decodificarTexto(Buffer.from([0x61, 0x00, 0x62]))).toThrow(ErroDeAplicacao)
    expect(() => decodificarTexto(Buffer.from('ab\u0000cd', 'utf8'))).toThrow(/texto/)
    expect(() => decodificarTexto(Buffer.from([0xff, 0xfe, 0x61, 0x00]))).toThrow(ErroDeAplicacao)
  })
})

describe('conferência do conteúdo de texto por formato', () => {
  it('aceita as fixtures textuais, inclusive o JSON válido', () => {
    for (const [nome, formato] of [
      ['exemplo.txt', 'txt'],
      ['exemplo.md', 'md'],
      ['exemplo.csv', 'csv'],
      ['exemplo.html', 'html'],
      ['exemplo.json', 'json'],
      ['exemplo.srt', 'srt'],
      ['exemplo.vtt', 'vtt'],
    ] as const) {
      expect(() => conferirConteudoDeTexto(formato, fixture(nome)), nome).not.toThrow()
    }
  })

  it('recusa .json que não é JSON e devolve o texto decodificado quando está certo', () => {
    expect(() => conferirConteudoDeTexto('json', Buffer.from('{ chave: 1 }'))).toThrow(/JSON/)
    expect(() => conferirConteudoDeTexto('json', Buffer.from(''))).toThrow(ErroDeAplicacao)
    expect(conferirConteudoDeTexto('json', Buffer.from('{"a":1}'))).toBe('{"a":1}')
    expect(conferirConteudoDeTexto('txt', Buffer.from('oi'))).toBe('oi')
  })

  it('a mensagem de erro não vaza caminho interno', () => {
    try {
      conferirConteudoDeTexto('txt', Buffer.from([0, 1, 2]))
    } catch (e) {
      expect((e as Error).message).not.toMatch(/\/|\\/)
    }
  })
})
