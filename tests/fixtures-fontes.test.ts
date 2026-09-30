import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { getDocumentProxy, extractText } from 'unpdf'
import mammoth from 'mammoth'
import { gerarFixtures, NOMES_BINARIOS, NOMES_DE_TEXTO } from './apoio/fixtures-fontes'

const pasta = path.resolve(process.cwd(), 'tests/fixtures')

describe('fixtures de texto', () => {
  const geradas = gerarFixtures()

  it('as sete fixtures textuais commitadas são iguais às geradas por código', () => {
    expect(NOMES_DE_TEXTO).toHaveLength(7)
    for (const nome of NOMES_DE_TEXTO) {
      const arquivo = path.join(pasta, nome)
      expect(existsSync(arquivo), nome).toBe(true)
      expect(readFileSync(arquivo).equals(geradas[nome]!), nome).toBe(true)
    }
  })

  it('trazem só texto fictício da Loja Exemplo, sem dado pessoal', () => {
    for (const nome of NOMES_DE_TEXTO) {
      const texto = geradas[nome]!.toString('utf8')
      expect(texto, nome).toContain('Loja Exemplo')
      expect(texto, nome).not.toMatch(/@|\d{3}\.\d{3}\.\d{3}-\d{2}|\(\d{2}\)\s?\d{4,5}-\d{4}/)
    }
  })

  it('cada formato traz o que o adaptador dele precisa exercitar', () => {
    expect(geradas['exemplo.csv']!.toString()).toContain('"Grampeador, médio"')
    expect(geradas['exemplo.html']!.toString()).toMatch(/<script>[\s\S]*<\/script>/)
    expect(geradas['exemplo.srt']!.toString()).toContain('-->')
    expect(geradas['exemplo.vtt']!.toString().startsWith('WEBVTT')).toBe(true)
    expect(() => JSON.parse(geradas['exemplo.json']!.toString())).not.toThrow()
  })
})

describe('fixtures de PDF e DOCX', () => {
  const geradas = gerarFixtures()

  it('os três binários commitados são iguais aos gerados por código', () => {
    expect(NOMES_BINARIOS).toEqual(['exemplo.pdf', 'escaneado.pdf', 'exemplo.docx'])
    for (const nome of NOMES_BINARIOS) {
      expect(readFileSync(path.join(pasta, nome)).equals(geradas[nome]!), nome).toBe(true)
    }
  })

  it('o unpdf extrai o texto fictício de exemplo.pdf', async () => {
    const pdf = await getDocumentProxy(new Uint8Array(readFileSync(path.join(pasta, 'exemplo.pdf'))))
    const { totalPages, text } = await extractText(pdf, { mergePages: true })
    expect(totalPages).toBe(1)
    expect(text).toContain('Loja Exemplo vende material de escritório')
  })

  it('o unpdf abre escaneado.pdf e não encontra texto', async () => {
    const pdf = await getDocumentProxy(new Uint8Array(readFileSync(path.join(pasta, 'escaneado.pdf'))))
    const { text } = await extractText(pdf, { mergePages: true })
    expect(text.trim()).toBe('')
  })

  it('o mammoth extrai o texto de exemplo.docx, que é um ZIP com word/document.xml', async () => {
    const bytes = readFileSync(path.join(pasta, 'exemplo.docx'))
    expect(bytes.subarray(0, 4).toString('hex')).toBe('504b0304')
    expect(bytes.includes(Buffer.from('word/document.xml'))).toBe(true)
    const { value } = await mammoth.extractRawText({ buffer: bytes })
    expect(value).toContain('Loja Exemplo')
    expect(value).toContain('política de troca')
  })
})
