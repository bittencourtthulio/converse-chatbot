/**
 * T-03.04 (FT-13, PR-45, PR-107): a fila extrai PDF, DOCX e HTML no processo filho (`extrairParaFila`) e o
 * resto no próprio servidor. Banco real; o trabalhador real roda o PDF; um trabalhador que trava prova o
 * encerramento no prazo e a fonte virando erro com a mensagem clara.
 */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { extrairTextoIsolado } from '@/lib/extracao/isolada'
import { criarFila, type OpcoesDaFila } from '@/servicos/fontes-fila'
import { limparBanco } from './ajuda'
import { armazenamentoDeTeste, criarAgenteDeTeste, criarFonteDeTeste } from './apoio/fontes'
import { gerarPdf } from './apoio/pdf-sintetico'

const AGORA = new Date('2026-10-01T12:00:00.000Z')
const fixture = (nome: string) => readFileSync(path.resolve(process.cwd(), 'tests/fixtures', nome))
let agenteId: string
beforeEach(async () => {
  await limparBanco()
  agenteId = (await criarAgenteDeTeste()).agente.id
})
afterAll(limparBanco)

const fila = (extra: OpcoesDaFila = {}) => criarFila({ relogio: () => AGORA, armazenamento: armazenamentoDeTeste(), ...extra })
const fonte = (nomeOriginal: string, bytes: Uint8Array) => criarFonteDeTeste({ agenteId, nomeOriginal, bytes, titulo: nomeOriginal })
const ler = (id: string) => prisma.fonte.findUniqueOrThrow({ where: { id } })

describe('a fila e a extração isolada (integração, trabalhador real)', () => {
  it('um PDF de 3 páginas chega a pronto com o texto das páginas', async () => {
    const f = await fonte('tres.pdf', gerarPdf(3))
    await fila().processarUma(f.id)
    expect(await ler(f.id)).toMatchObject({ status: 'pronto', mensagemErro: null })
    const texto = (await prisma.trecho.findMany({ where: { fonteId: f.id } })).map((t) => t.texto).join('\n')
    expect(texto).toContain('Pagina 1')
    expect(texto).toContain('Pagina 3')
  })

  it('um PDF de 501 páginas vira erro com a mensagem do limite, sem trechos', async () => {
    const f = await fonte('grande.pdf', gerarPdf(501))
    await fila().processarUma(f.id)
    const depois = await ler(f.id)
    expect(depois.status).toBe('erro')
    expect(depois.mensagemErro).toBe('Este PDF tem 501 páginas e o limite é de 500 páginas.')
    expect(await prisma.trecho.count({ where: { fonteId: f.id } })).toBe(0)
  })

  it('com o trabalhador travado e prazo de 1 s a fonte vira erro: A leitura do arquivo demorou demais e foi interrompida.', async () => {
    const f = await fonte('trava.pdf', gerarPdf(2))
    const travado: OpcoesDaFila['extrairIsolado'] = (entrada) =>
      extrairTextoIsolado(entrada, {
        prazoMs: 1000,
        comando: () => ({ executavel: process.execPath, args: [path.resolve(process.cwd(), 'tests/apoio/trabalhador-travado.mjs'), path.join(process.env.STORAGE_DIR!, 'pid-fila.txt')] }),
      })
    const inicio = Date.now()
    await fila({ extrairIsolado: travado }).processarUma(f.id)
    expect(Date.now() - inicio).toBeLessThan(10_000)
    const depois = await ler(f.id)
    expect(depois.status).toBe('erro')
    expect(depois.mensagemErro).toBe('A leitura do arquivo demorou demais e foi interrompida.')
  })
})

describe('quem passa pelo processo filho (funcional)', () => {
  it('PDF, DOCX e HTML passam pelo extrairIsolado; TXT e CSV não', async () => {
    const isolado = vi.fn(async () => 'texto do filho')
    const f = fila({ extrairIsolado: isolado })
    const pesados = [await fonte('a.pdf', gerarPdf(1)), await fonte('b.docx', fixture('exemplo.docx')), await fonte('c.html', fixture('exemplo.html'))]
    for (const p of pesados) await f.processarUma(p.id)
    expect(isolado).toHaveBeenCalledTimes(3)
    expect(isolado.mock.calls.map((c) => (c as unknown as [{ formato: string }])[0].formato)).toEqual(['pdf', 'docx', 'html'])

    const leves = [await fonte('d.txt', Buffer.from('Texto simples de teste.')), await fonte('e.csv', fixture('exemplo.csv'))]
    for (const l of leves) await f.processarUma(l.id)
    expect(isolado).toHaveBeenCalledTimes(3)
    for (const l of leves) expect((await ler(l.id)).status).toBe('pronto')
  })

  it('o extrair injetado continua mandando em tudo (os testes antigos de fila não mudam)', async () => {
    const extrair = vi.fn(async () => 'injetado')
    const f = await fonte('a.pdf', gerarPdf(1))
    await fila({ extrair }).processarUma(f.id)
    expect(extrair).toHaveBeenCalledTimes(1)
    expect((await ler(f.id)).status).toBe('pronto')
  })
})
