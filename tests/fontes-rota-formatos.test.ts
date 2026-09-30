/**
 * Ponta a ponta pelo servidor de produção: os nove formatos enviados por
 * multipart real chegam a pronto com o texto esperado, o PDF escaneado chega a
 * erro, o DOCX adulterado é recusado no envio, e uma fonte deixada pendente ou
 * processando antes da subida é retomada pela fila sem nenhuma requisição (PR-05).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { deflateRawSync } from 'node:zlib'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { limparBanco } from './ajuda'
import { cookieDe, esperar, subirServidor, type Servidor } from './apoio/servidor'
import { criarFonteDeTeste } from './apoio/fontes'
import { montarZip } from './apoio/fixtures-fontes'

const SENHA = 'senha-de-rota-123'
const fixture = (nome: string) => readFileSync(path.resolve(process.cwd(), 'tests/fixtures', nome))
let servidor: Servidor
let cookie: string
let agenteId: string
let retomadaId: string
let interrompidaId: string

const NOVE: Array<[string, string]> = [
  ['exemplo.pdf', 'Loja Exemplo vende material de escritório'],
  ['exemplo.docx', 'política de troca permite devolver'],
  ['exemplo.txt', 'horário de atendimento é de segunda a sexta'],
  ['exemplo.md', 'A troca é aceita em até 7 dias'],
  ['exemplo.csv', 'produto: Grampeador, médio'],
  ['exemplo.html', 'Atendimento de segunda a sexta'],
  ['exemplo.json', 'produtos[1].nome: Caneta azul'],
  ['exemplo.srt', 'Hoje vamos falar da política de troca'],
  ['exemplo.vtt', 'A troca vale por sete dias'],
]

beforeAll(async () => {
  await limparBanco()
  const admin = await prisma.usuario.create({
    data: { nome: 'Admin', email: 'admin.formatos@teste.local', senhaHash: await hashDeSenha(SENHA), papel: 'admin' },
  })
  agenteId = (
    await prisma.agente.create({ data: { nome: 'Agente', modelo: 'openai/gpt-4o-mini', criadoPorId: admin.id } })
  ).id
  // Deixadas antes de subir o servidor: a fila precisa retomá-las sozinha.
  retomadaId = (await criarFonteDeTeste({ agenteId, status: 'pendente', bytes: Buffer.from('Pendente antes da subida.') })).id
  interrompidaId = (
    await criarFonteDeTeste({ agenteId, status: 'processando', bytes: Buffer.from('Interrompida pelo reinício.') })
  ).id
  cookie = await cookieDe('admin.formatos@teste.local', SENHA)
  servidor = await subirServidor(3183)
}, 120_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

const url = () => `${servidor.base}/api/agentes/${agenteId}/fontes`

function multipart(arquivos: Array<[string, Uint8Array]>): FormData {
  const f = new FormData()
  for (const [nome, bytes] of arquivos) f.append('arquivos', new File([bytes as BlobPart], nome))
  return f
}

describe('retomada na subida', () => {
  it('a fonte pendente e a interrompida chegam a pronto sem nenhuma requisição às rotas de fontes', async () => {
    for (const id of [retomadaId, interrompidaId]) {
      await esperar(async () => (await prisma.fonte.findUniqueOrThrow({ where: { id } })).status === 'pronto')
      expect(await prisma.trecho.count({ where: { fonteId: id } })).toBe(1)
    }
  })
})

describe('os nove formatos pelo servidor de produção', () => {
  it('chegam a pronto e os trechos contêm o texto esperado de cada um', async () => {
    const r = await fetch(url(), { method: 'POST', headers: { cookie }, body: multipart(NOVE.map(([n]) => [n, fixture(n)])) })
    expect(r.status).toBe(202)
    const { resultados } = (await r.json()) as { resultados: Array<{ aceito: boolean; fonte: { id: string; titulo: string } }> }
    expect(resultados.every((x) => x.aceito)).toBe(true)

    for (const x of resultados) {
      await esperar(async () => (await prisma.fonte.findUniqueOrThrow({ where: { id: x.fonte.id } })).status !== 'pendente' && (await prisma.fonte.findUniqueOrThrow({ where: { id: x.fonte.id } })).status !== 'processando')
    }
    for (const [nome, esperado] of NOVE) {
      const fonte = await prisma.fonte.findFirstOrThrow({ where: { titulo: nome } })
      expect(fonte.status, `${nome}: ${fonte.mensagemErro}`).toBe('pronto')
      const trechos = await prisma.trecho.findMany({ where: { fonteId: fonte.id }, orderBy: { indice: 'asc' } })
      expect(trechos.map((t) => t.texto).join('\n'), nome).toContain(esperado)
      expect(fonte.caracteres).toBeGreaterThan(0)
    }
  })

  it('o PDF escaneado chega a erro com a mensagem de OCR', async () => {
    const r = await fetch(url(), { method: 'POST', headers: { cookie }, body: multipart([['scan.pdf', fixture('escaneado.pdf')]]) })
    expect(r.status).toBe(202)
    const fonte = await esperar(async () => {
      const f = await prisma.fonte.findFirstOrThrow({ where: { titulo: 'scan.pdf' } })
      return f.status === 'erro' ? f : false
    })
    expect(fonte.mensagemErro).toBe('Este PDF não tem texto selecionável (parece escaneado). OCR não é suportado.')
    expect(fonte.totalTrechos).toBe(0)
  })

  it('DOCX com cabeçalho de tamanho mentiroso é recusado no envio', async () => {
    const adulterado = montarZip(
      [{ nome: 'word/document.xml', dados: Buffer.alloc(5 * 1024 * 1024), comprimir: true, tamanhoDeclarado: 50 }],
      deflateRawSync,
    )
    const r = await fetch(url(), { method: 'POST', headers: { cookie }, body: multipart([['adulterado.docx', adulterado]]) })
    expect(r.status).toBe(422)
    const { resultados } = (await r.json()) as { resultados: Array<{ aceito: boolean; motivo: string }> }
    expect(resultados[0]!.aceito).toBe(false)
    expect(resultados[0]!.motivo).not.toMatch(/\/|storage/)
    expect(await prisma.fonte.count({ where: { titulo: 'adulterado.docx' } })).toBe(0)
  })
})
