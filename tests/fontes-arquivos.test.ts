import { describe, it, expect, beforeEach, afterAll, afterEach, vi } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { deflateRawSync } from 'node:zlib'
import { prisma } from '@/lib/prisma'
import { ambiente } from '@/lib/ambiente'
import { obterFila } from '@/servicos/fontes-fila'
import { adicionarArquivos } from '@/servicos/fontes'
import { criarUsuario, limparBanco } from './ajuda'
import { criarAgenteDeTeste } from './apoio/fontes'
import { NOMES_BINARIOS, NOMES_DE_TEXTO, montarZip } from './apoio/fixtures-fontes'

const fixture = (nome: string) => readFileSync(path.resolve(process.cwd(), 'tests/fixtures', nome))
const TODAS = [...NOMES_DE_TEXTO, ...NOMES_BINARIOS].filter((n) => n !== 'escaneado.pdf')

let autor: Awaited<ReturnType<typeof criarUsuario>>
let agenteId: string
const limiteOriginal = process.env.MAX_UPLOAD_MB

beforeEach(async () => {
  await limparBanco()
  autor = await criarUsuario()
  agenteId = (await criarAgenteDeTeste()).agente.id
})
afterEach(() => {
  if (limiteOriginal === undefined) delete process.env.MAX_UPLOAD_MB
  else process.env.MAX_UPLOAD_MB = limiteOriginal
  vi.restoreAllMocks()
})
afterAll(limparBanco)

describe('adicionarArquivos', () => {
  it('aceita as nove fixtures reais e, depois da fila, todas ficam prontas com trechos', async () => {
    const resultados = await adicionarArquivos(
      autor,
      agenteId,
      TODAS.slice(0, 9).map((nome) => ({ nome, bytes: fixture(nome) })),
    )
    expect(resultados.every((r) => r.aceito)).toBe(true)
    expect(resultados).toHaveLength(9)

    await obterFila().processarPendentes()

    const fontes = await prisma.fonte.findMany()
    expect(fontes.map((f) => f.status)).toEqual(Array(9).fill('pronto'))
    for (const f of fontes) expect(f.totalTrechos).toBeGreaterThan(0)
    const pdf = fontes.find((f) => f.nomeOriginal === 'exemplo.pdf')!
    expect(pdf).toMatchObject({ tipo: 'arquivo', tipoMime: 'application/pdf', titulo: 'exemplo.pdf', criadoPorId: autor.id })
    expect(pdf.tamanhoBytes).toBe(fixture('exemplo.pdf').length)
  })

  it('um lote com vazio, .exe, .pdf falso, acima do limite e um válido recusa os quatro e aceita o válido', async () => {
    process.env.MAX_UPLOAD_MB = '1'
    const resultados = await adicionarArquivos(autor, agenteId, [
      { nome: 'vazio.txt', bytes: Buffer.alloc(0) },
      { nome: 'programa.exe', bytes: Buffer.from('MZ') },
      { nome: 'falso.pdf', bytes: Buffer.from('<html>oi</html>') },
      { nome: 'enorme.txt', bytes: Buffer.alloc(1024 * 1024 + 1, 97) },
      { nome: 'bom.txt', bytes: Buffer.from('conteúdo bom') },
    ])

    const [vazio, exe, falso, enorme, bom] = resultados
    expect(vazio).toMatchObject({ aceito: false, codigo: 'arquivo_vazio' })
    expect(exe).toMatchObject({ aceito: false, codigo: 'formato_nao_aceito' })
    expect(falso).toMatchObject({ aceito: false, codigo: 'conteudo_invalido' })
    expect(enorme).toMatchObject({ aceito: false, codigo: 'arquivo_grande_demais' })
    expect(bom).toMatchObject({ aceito: true })

    const motivos = [vazio, exe, falso, enorme].map((r) => (r as { motivo: string }).motivo)
    expect(new Set(motivos).size).toBe(4)
    expect(motivos[0]).toMatch(/vazio/)
    expect(motivos[1]).toMatch(/\.pdf, \.docx/)
    expect(motivos[2]).toMatch(/PDF/)
    expect(motivos[3]).toMatch(/1 MB/)
    for (const motivo of motivos) expect(motivo).not.toMatch(new RegExp(`${ambiente.storageDir}|/tmp|/var`))
    expect(await prisma.fonte.count()).toBe(1)
  })

  it('o arquivo no limite exato entra e um byte a mais sai', async () => {
    process.env.MAX_UPLOAD_MB = '1'
    const [no, acima] = await adicionarArquivos(autor, agenteId, [
      { nome: 'limite.txt', bytes: Buffer.alloc(1024 * 1024, 97) },
      { nome: 'acima.txt', bytes: Buffer.alloc(1024 * 1024 + 1, 97) },
    ])
    expect(no!.aceito).toBe(true)
    expect(acima!.aceito).toBe(false)
  })

  it('DOCX que é bomba de compressão é recusado no envio', async () => {
    const bomba = montarZip([{ nome: 'word/document.xml', dados: Buffer.alloc(20 * 1024 * 1024), comprimir: true }], deflateRawSync)
    const [r] = await adicionarArquivos(autor, agenteId, [{ nome: 'bomba.docx', bytes: bomba }])
    expect(r).toMatchObject({ aceito: false, codigo: 'arquivo_comprimido_demais' })
  })

  it('o nome enviado nunca entra em caminho: só o título e o banco o guardam, sanitizado', async () => {
    const [r] = await adicionarArquivos(autor, agenteId, [
      { nome: '../../etc/Relatório Final.TXT', bytes: Buffer.from('dados') },
    ])
    expect(r).toMatchObject({ aceito: true, nome: 'Relatório Final.TXT' })
    const fonte = await prisma.fonte.findFirstOrThrow()
    expect(fonte.titulo).toBe('Relatório Final.TXT')
    expect(fonte.nomeOriginal).toBe('Relatório Final.TXT')
    expect(fonte.caminhoArquivo).toBe(`fontes/${agenteId}/${fonte.id}/original`)
    const arquivos = readdirSync(path.join(ambiente.storageDir, 'fontes', agenteId, fonte.id))
    expect(arquivos).toEqual(['original'])
  })

  it('o resultado não traz o caminho do arquivo', async () => {
    const [r] = await adicionarArquivos(autor, agenteId, [{ nome: 'a.txt', bytes: Buffer.from('a') }])
    expect(JSON.stringify(r)).not.toMatch(/caminhoArquivo|original"/)
  })

  it('recusa o envio todo: nenhum arquivo, mais de 10, agente inexistente e sem autor', async () => {
    const um = { nome: 'a.txt', bytes: Buffer.from('a') }
    await expect(adicionarArquivos(autor, agenteId, [])).rejects.toMatchObject({ status: 422, message: /ao menos um/ })
    await expect(adicionarArquivos(autor, agenteId, Array(11).fill(um))).rejects.toMatchObject({
      status: 422,
      message: /10 arquivos/,
    })
    await expect(adicionarArquivos(autor, 'nao-existe', [um])).rejects.toMatchObject({ status: 404 })
    await expect(adicionarArquivos(null as never, agenteId, [um])).rejects.toMatchObject({ status: 401 })
    expect(await prisma.fonte.count()).toBe(0)
  })

  it('10 arquivos é aceito', async () => {
    const lote = Array.from({ length: 10 }, (_, i) => ({ nome: `a${i}.txt`, bytes: Buffer.from(`t${i}`) }))
    const resultados = await adicionarArquivos(autor, agenteId, lote)
    expect(resultados.every((r) => r.aceito)).toBe(true)
  })
})
