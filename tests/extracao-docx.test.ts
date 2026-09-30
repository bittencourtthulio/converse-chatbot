import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { deflateRawSync } from 'node:zlib'
import { ErroDeAplicacao } from '@/lib/erros'
import { extrairDocx } from '@/lib/extracao/docx'
import { montarZip } from './apoio/fixtures-fontes'

const docx = readFileSync(path.resolve(process.cwd(), 'tests/fixtures/exemplo.docx'))
const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'

function docxCom(documento: string): Buffer {
  return montarZip(
    [
      { nome: '[Content_Types].xml', dados: Buffer.from('<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>') },
      { nome: '_rels/.rels', dados: Buffer.from('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>') },
      { nome: 'word/document.xml', dados: Buffer.from(documento) },
    ],
    deflateRawSync,
  )
}

async function erroDe(promessa: Promise<unknown>): Promise<ErroDeAplicacao> {
  try {
    await promessa
  } catch (e) {
    expect(e).toBeInstanceOf(ErroDeAplicacao)
    return e as ErroDeAplicacao
  }
  throw new Error('devia ter lançado')
}

describe('DOCX', () => {
  it('extrai o texto fictício de exemplo.docx com o mammoth real, um parágrafo por linha', async () => {
    const texto = await extrairDocx(docx)
    expect(texto).toContain('Loja Exemplo')
    expect(texto).toContain('A política de troca permite devolver produtos em até 7 dias.')
    expect(texto.split('\n').filter(Boolean)).toHaveLength(2)
  })

  it('documento sem nenhum texto lança erro próprio em português', async () => {
    const erro = await erroDe(extrairDocx(docxCom(`<w:document ${NS}><w:body><w:p/></w:body></w:document>`)))
    expect(erro.message).toMatch(/não tem texto/)
    expect(erro.codigo).toBe('docx_sem_texto')
  })

  it('arquivo que não é ZIP lança a mensagem de documento Word inválido', async () => {
    const erro = await erroDe(extrairDocx(Buffer.from('isto é texto puro, não um zip')))
    expect(erro.message).toMatch(/Word/)
    expect(erro.message).not.toMatch(/zip|jszip|mammoth|central directory/i)
  })

  it('XML quebrado dentro do ZIP vira frase nossa, sem a mensagem da biblioteca', async () => {
    const erro = await erroDe(extrairDocx(docxCom('<w:document><w:body><w:p><w:t>oi</w:body>')))
    expect(erro.message).not.toMatch(/mammoth|xml|Unexpected|Opening and ending tag/i)
  })

  it('ZIP com bomba é recusado antes de chegar ao mammoth', async () => {
    const bomba = montarZip(
      [{ nome: 'word/document.xml', dados: Buffer.alloc(30 * 1024 * 1024), comprimir: true }],
      deflateRawSync,
    )
    const erro = await erroDe(extrairDocx(bomba))
    expect(erro.codigo).toBe('arquivo_comprimido_demais')
  })
})
