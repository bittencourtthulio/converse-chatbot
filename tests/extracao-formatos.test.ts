import { describe, it, expect } from 'vitest'
import {
  EXTENSOES_ACEITAS,
  FORMATOS,
  formatoDoNome,
  mimeDoFormato,
  sanitizarNome,
} from '@/lib/extracao/formatos'
import { LIMITES } from '@/lib/extracao/limites'

describe('formatos aceitos', () => {
  it('mapeia as dez extensões aceitas, com htm igual a html, sem diferenciar caixa', () => {
    const esperado: Record<string, string> = {
      'a.pdf': 'pdf',
      'a.docx': 'docx',
      'a.txt': 'txt',
      'a.md': 'md',
      'a.csv': 'csv',
      'a.html': 'html',
      'a.htm': 'html',
      'a.json': 'json',
      'a.srt': 'srt',
      'a.vtt': 'vtt',
      'RELATÓRIO FINAL.PDF': 'pdf',
      'com.varios.pontos.Md': 'md',
    }
    for (const [nome, formato] of Object.entries(esperado)) expect(formatoDoNome(nome), nome).toBe(formato)
    expect(EXTENSOES_ACEITAS).toEqual(
      ['.pdf', '.docx', '.txt', '.md', '.csv', '.html', '.htm', '.json', '.srt', '.vtt'],
    )
  })

  it('recusa o que não está na lista', () => {
    for (const nome of ['a.exe', 'a.doc', 'a.xlsx', 'a', 'pdf', '.pdf.exe', 'a.pdf ', 'a.', '', 'a.php', 'a.svg']) {
      expect(formatoDoNome(nome), nome).toBeNull()
    }
  })

  it('o tipo MIME vem do formato, não do que o navegador disse', () => {
    expect(mimeDoFormato('pdf')).toBe('application/pdf')
    expect(mimeDoFormato('docx')).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
    expect(mimeDoFormato('txt')).toBe('text/plain')
    expect(mimeDoFormato('html')).toBe('text/html')
    expect(mimeDoFormato('json')).toBe('application/json')
    expect(Object.keys(FORMATOS)).toHaveLength(9)
  })

  it('o PDF e o DOCX são binários; o resto é texto', () => {
    expect(FORMATOS.pdf.binario).toBe(true)
    expect(FORMATOS.docx.binario).toBe(true)
    for (const f of ['txt', 'md', 'csv', 'html', 'json', 'srt', 'vtt'] as const) {
      expect(FORMATOS[f].binario, f).toBe(false)
    }
  })
})

describe('limites', () => {
  it('trazem os números da PR-45 num só lugar', () => {
    expect(LIMITES.paginasDoPdf).toBe(500)
    expect(LIMITES.caracteresExtraidos).toBe(5_000_000)
    expect(LIMITES.descompactadoDoDocxBytes).toBe(100 * 1024 * 1024)
    expect(LIMITES.razaoDeCompressao).toBe(100)
    expect(LIMITES.prazoDaExtracaoMs).toBe(120_000)
    expect(LIMITES.arquivosPorEnvio).toBe(10)
    expect(LIMITES.tituloDoTexto).toBe(120)
    expect(LIMITES.conteudoDoTexto).toBe(200_000)
    expect(LIMITES.nomeDoArquivo).toBe(200)
  })
})

describe('nome de exibição', () => {
  it('fica só com o último segmento, de qualquer separador', () => {
    expect(sanitizarNome('..\\..\\etc/passwd.txt')).toBe('passwd.txt')
    expect(sanitizarNome('C:\\Users\\ana\\Manual.pdf')).toBe('Manual.pdf')
    expect(sanitizarNome('/var/www/../../etc/hosts.txt')).toBe('hosts.txt')
  })

  it('tira caracteres de controle e de direção de texto e colapsa espaços', () => {
    expect(sanitizarNome('a\u0000b\u0007c.txt')).toBe('abc.txt')
    expect(sanitizarNome('  manual   do\t\tusuário \n.pdf ')).toBe('manual do usuário .pdf')
    expect(sanitizarNome('fatura\u202Efdp.exe')).toBe('faturafdp.exe')
  })

  it('devolve "arquivo" para nome vazio ou só de pontos', () => {
    for (const nome of ['', '   ', '..', '.', '/', '\\', '\u0000']) {
      expect(sanitizarNome(nome), JSON.stringify(nome)).toBe('arquivo')
    }
  })

  it('corta em 200 caracteres mantendo a extensão', () => {
    const nome = sanitizarNome(`${'a'.repeat(400)}.pdf`)
    expect(nome).toHaveLength(200)
    expect(nome.endsWith('.pdf')).toBe(true)
    expect(sanitizarNome('b'.repeat(300))).toHaveLength(200)
  })
})
