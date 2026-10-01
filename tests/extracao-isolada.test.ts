/**
 * T-03.03 (FT-13, PR-45, PR-107): a extração de PDF, DOCX e HTML roda num processo filho (`node --import tsx`
 * sobre `src/lib/extracao/trabalhador.ts`) que o servidor encerra com SIGKILL ao estourar o prazo, o que
 * `Promise.race` nunca fez com um extrator que consome CPU. O limite de 500 páginas é conferido pelo filho ao
 * abrir o PDF, antes de extrair o texto. Estes testes rodam o trabalhador REAL.
 */
import { afterAll, describe, expect, it } from 'vitest'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { ErroDeAplicacao } from '@/lib/erros'
import { FORMATOS_ISOLADOS, extrairTextoIsolado } from '@/lib/extracao/isolada'
import { gerarPdf } from './apoio/pdf-sintetico'

const fixture = (nome: string) => readFileSync(path.resolve(process.cwd(), 'tests/fixtures', nome))
const pasta = mkdtempSync(path.join(os.tmpdir(), 'converse-isolada-'))
afterAll(() => rmSync(pasta, { recursive: true, force: true }))

async function erroDe(promessa: Promise<unknown>): Promise<ErroDeAplicacao> {
  try {
    await promessa
  } catch (e) {
    expect(e).toBeInstanceOf(ErroDeAplicacao)
    return e as ErroDeAplicacao
  }
  throw new Error('devia ter lançado')
}

const vivo = (pid: number) => {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

describe('extrairTextoIsolado com o trabalhador real (integração)', () => {
  it('um PDF de 3 páginas devolve o texto de todas', async () => {
    const texto = await extrairTextoIsolado({ formato: 'pdf', bytes: gerarPdf(3) })
    for (const t of ['Pagina 1', 'Pagina 2', 'Pagina 3']) expect(texto).toContain(t)
  })

  it('um DOCX e um HTML válidos devolvem o texto', async () => {
    const docx = await extrairTextoIsolado({ formato: 'docx', bytes: fixture('exemplo.docx') })
    expect(docx.trim().length).toBeGreaterThan(10)
    const html = await extrairTextoIsolado({ formato: 'html', bytes: fixture('exemplo.html') })
    expect(html.trim().length).toBeGreaterThan(10)
  })

  it('com um trabalhador que trava, o filho é morto no prazo de 1 s com extracao_demorou e o processo some', async () => {
    const arquivoDoPid = path.join(pasta, 'pid-travado.txt')
    const inicio = Date.now()
    const erro = await erroDe(
      extrairTextoIsolado(
        { formato: 'pdf', bytes: gerarPdf(1) },
        { prazoMs: 1000, comando: () => ({ executavel: process.execPath, args: [path.resolve(process.cwd(), 'tests/apoio/trabalhador-travado.mjs'), arquivoDoPid] }) },
      ),
    )
    expect(Date.now() - inicio).toBeLessThan(8000)
    expect(erro.codigo).toBe('extracao_demorou')
    expect(erro.status).toBe(422)
    expect(erro.message).toBe('A leitura do arquivo demorou demais e foi interrompida.')
    expect(existsSync(arquivoDoPid)).toBe(true)
    const pid = Number(readFileSync(arquivoDoPid, 'utf8'))
    expect(pid).toBeGreaterThan(1)
    for (let i = 0; i < 20 && vivo(pid); i += 1) await new Promise((r) => setTimeout(r, 100))
    expect(vivo(pid)).toBe(false)
  })
})

describe('extrairTextoIsolado: erros que voltam como erro nosso (funcional)', () => {
  it('um PDF de 501 páginas é recusado com pdf_paginas_demais, sem texto', async () => {
    const erro = await erroDe(extrairTextoIsolado({ formato: 'pdf', bytes: gerarPdf(501) }))
    expect(erro.codigo).toBe('pdf_paginas_demais')
    expect(erro.status).toBe(422)
    expect(erro.message).toBe('Este PDF tem 501 páginas e o limite é de 500 páginas.')
  })

  it('bytes que não são do formato voltam como conteudo_invalido, e o PDF escaneado como pdf_sem_texto', async () => {
    const lixo = await erroDe(extrairTextoIsolado({ formato: 'pdf', bytes: Buffer.from('isto não é um pdf') }))
    expect(lixo.codigo).toBe('conteudo_invalido')
    const escaneado = await erroDe(extrairTextoIsolado({ formato: 'pdf', bytes: fixture('escaneado.pdf') }))
    expect(escaneado.codigo).toBe('pdf_sem_texto')
  })

  it('um trabalhador que não existe vira extracao_falhou, sem vazar o caminho', async () => {
    const erro = await erroDe(
      extrairTextoIsolado({ formato: 'pdf', bytes: gerarPdf(1) }, { comando: () => ({ executavel: '/caminho/que/nao/existe/node', args: [] }) }),
    )
    expect(erro.codigo).toBe('extracao_falhou')
    expect(erro.message).toBe('Não foi possível extrair o texto deste arquivo.')
    expect(erro.message).not.toContain('/caminho')
  })

  it('só os formatos pesados são isolados', () => {
    expect([...FORMATOS_ISOLADOS].sort()).toEqual(['docx', 'html', 'pdf'])
  })
})
