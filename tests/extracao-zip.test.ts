import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { deflateRawSync } from 'node:zlib'
import { ErroDeAplicacao } from '@/lib/erros'
import { conferirDocx } from '@/lib/extracao/zip'
import { montarZip, type EntradaDeZip } from './apoio/fixtures-fontes'

const docx = readFileSync(path.resolve(process.cwd(), 'tests/fixtures/exemplo.docx'))
const zip = (entradas: EntradaDeZip[]) => montarZip(entradas, deflateRawSync)
const XML = Buffer.from('<w:document/>')

function erroDe(bytes: Uint8Array, limites?: Parameters<typeof conferirDocx>[1]): ErroDeAplicacao {
  try {
    conferirDocx(bytes, limites)
  } catch (e) {
    expect(e).toBeInstanceOf(ErroDeAplicacao)
    return e as ErroDeAplicacao
  }
  throw new Error('devia ter lançado')
}

describe('DOCX legítimo', () => {
  it('passa a fixture exemplo.docx', () => {
    expect(() => conferirDocx(docx)).not.toThrow()
  })

  it('passa um DOCX com entradas comprimidas', () => {
    const bytes = zip([
      { nome: 'word/document.xml', dados: Buffer.from('<w:t>texto</w:t>'.repeat(200)), comprimir: true },
      { nome: '[Content_Types].xml', dados: XML, comprimir: true },
    ])
    expect(() => conferirDocx(bytes)).not.toThrow()
  })
})

describe('arquivo que não é DOCX', () => {
  it('recusa o que não é ZIP, o ZIP cortado e o ZIP sem word/document.xml', () => {
    expect(erroDe(Buffer.from('não sou um zip')).status).toBe(422)
    expect(erroDe(docx.subarray(0, docx.length - 30)).message).toMatch(/Word/)
    expect(erroDe(zip([{ nome: 'outro.xml', dados: XML }])).message).toMatch(/Word/)
    expect(erroDe(Buffer.alloc(0)).message).toMatch(/Word/)
  })

  it('recusa entrada cifrada com mensagem própria', () => {
    const bytes = zip([{ nome: 'word/document.xml', dados: XML, cifrada: true }])
    expect(erroDe(bytes).message).toMatch(/senha|cifrado/)
  })
})

describe('zip bomb', () => {
  it('recusa um ZIP de poucos KB que descompacta para mais de 100 MB', () => {
    const bomba = Buffer.alloc(110 * 1024 * 1024)
    const bytes = zip([{ nome: 'word/document.xml', dados: bomba, comprimir: true }])
    expect(bytes.length).toBeLessThan(500 * 1024)
    const erro = erroDe(bytes)
    expect(erro.message).toMatch(/comprimidos demais/)
    expect(erro.message).not.toMatch(/\//)
  })

  it('recusa razão de compressão acima de 100 para 1 mesmo abaixo do teto de tamanho', () => {
    const bytes = zip([{ nome: 'word/document.xml', dados: Buffer.alloc(20 * 1024 * 1024), comprimir: true }])
    expect(erroDe(bytes).message).toMatch(/comprimidos demais/)
  })

  it('não confia no tamanho declarado: cabeçalho pequeno com dados enormes é recusado', () => {
    const bytes = zip([
      { nome: 'word/document.xml', dados: Buffer.alloc(5 * 1024 * 1024), comprimir: true, tamanhoDeclarado: 50 },
    ])
    expect(erroDe(bytes, { descompactadoBytes: 1024 * 1024 }).message).toMatch(/comprimidos demais|adulterado/)
  })

  it('tamanho declarado diferente do real, dentro do teto, também é recusado', () => {
    const bytes = zip([{ nome: 'word/document.xml', dados: Buffer.from('<w:t>abc</w:t>'), tamanhoDeclarado: 999 }])
    expect(erroDe(bytes).message).toMatch(/Word|adulterado/)
  })

  it('respeita limites injetados', () => {
    const bytes = zip([{ nome: 'word/document.xml', dados: Buffer.alloc(3000, 65) }])
    expect(() => conferirDocx(bytes, { descompactadoBytes: 4000, razao: 1000 })).not.toThrow()
    expect(erroDe(bytes, { descompactadoBytes: 2000, razao: 1000 }).message).toMatch(/comprimidos demais/)
  })
})

describe('isolamento', () => {
  it('não usa jszip', () => {
    const fonte = readFileSync(path.resolve(process.cwd(), 'src/lib/extracao/zip.ts'), 'utf8')
    expect(fonte).not.toMatch(/jszip/i)
  })
})
