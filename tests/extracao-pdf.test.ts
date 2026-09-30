import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { ErroDeAplicacao } from '@/lib/erros'
import { extrairPdf } from '@/lib/extracao/pdf'

const fixture = (nome: string) => readFileSync(path.resolve(process.cwd(), 'tests/fixtures', nome))

/** PDF com `n` páginas de texto, montado aqui para testar o limite de páginas. */
function pdfComPaginas(n: number): Buffer {
  const filhos = Array.from({ length: n }, (_, i) => `${3 + i * 2} 0 R`).join(' ')
  const objetos = ['<< /Type /Catalog /Pages 2 0 R >>', `<< /Type /Pages /Kids [${filhos}] /Count ${n} >>`]
  for (let i = 0; i < n; i += 1) {
    const conteudo = `BT /F1 12 Tf 20 100 Td (Pagina ${i + 1}) Tj ET`
    objetos.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents ${4 + i * 2} 0 R /Resources << /Font << /F1 ${3 + n * 2} 0 R >> >> >>`)
    objetos.push(`<< /Length ${conteudo.length} >>\nstream\n${conteudo}\nendstream`)
  }
  objetos.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  let saida = '%PDF-1.4\n'
  const posicoes: number[] = []
  objetos.forEach((o, i) => {
    posicoes.push(saida.length)
    saida += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const xref = saida.length
  saida += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`
  for (const p of posicoes) saida += `${String(p).padStart(10, '0')} 00000 n \n`
  saida += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(saida, 'latin1')
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

describe('PDF', () => {
  it('extrai o texto fictício de exemplo.pdf com o unpdf real', async () => {
    const texto = await extrairPdf(fixture('exemplo.pdf'))
    expect(texto).toContain('Loja Exemplo vende material de escritório')
  })

  it('junta o texto de várias páginas', async () => {
    const texto = await extrairPdf(pdfComPaginas(3))
    expect(texto).toContain('Pagina 1')
    expect(texto).toContain('Pagina 3')
  })

  it('PDF sem texto selecionável lança a mensagem exata de OCR', async () => {
    const erro = await erroDe(extrairPdf(fixture('escaneado.pdf')))
    expect(erro.message).toBe(
      'Este PDF não tem texto selecionável (parece escaneado). OCR não é suportado.',
    )
    expect(erro.status).toBe(422)
    expect(erro.codigo).toBe('pdf_sem_texto')
  })

  it('PDF inválido lança frase genérica sem repassar a mensagem da biblioteca', async () => {
    const erro = await erroDe(extrairPdf(Buffer.from('%PDF-1.4\nisto não é um pdf de verdade\n')))
    expect(erro.message).toMatch(/PDF/)
    expect(erro.message).not.toMatch(/Invalid|pdfjs|Unexpected|XRef/i)
  })

  it('arquivo que não começa por %PDF- é recusado antes de abrir', async () => {
    const erro = await erroDe(extrairPdf(Buffer.from('<html></html>')))
    expect(erro.codigo).toBe('conteudo_invalido')
  })

  it('PDF acima do limite de páginas é recusado com a contagem', async () => {
    const erro = await erroDe(extrairPdf(pdfComPaginas(4), { maxPaginas: 3 }))
    expect(erro.message).toMatch(/3 páginas/)
    expect(erro.codigo).toBe('pdf_paginas_demais')
    await expect(extrairPdf(pdfComPaginas(3), { maxPaginas: 3 })).resolves.toContain('Pagina 3')
  })
})
