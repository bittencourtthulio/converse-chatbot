/**
 * Upload multipart da base de conhecimento (PR-49) contra o servidor de
 * produção, com FormData real: resposta por arquivo, 413 cedo, 415 e 422.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { limparBanco } from './ajuda'
import { cookieDe, esperar, subirServidor, type Servidor } from './apoio/servidor'

const SENHA = 'senha-de-rota-123'
const fixture = (nome: string) => readFileSync(path.resolve(process.cwd(), 'tests/fixtures', nome))
let servidor: Servidor
let cookie: string
let agenteId: string

const url = () => `${servidor.base}/api/agentes/${agenteId}/fontes`

function formulario(arquivos: Array<[string, Uint8Array]>, campo = 'arquivos'): FormData {
  const f = new FormData()
  for (const [nome, bytes] of arquivos) f.append(campo, new File([bytes as BlobPart], nome))
  return f
}

const enviar = (corpo: FormData | string, cabecalhos: Record<string, string> = {}) =>
  fetch(url(), { method: 'POST', headers: { cookie, ...cabecalhos }, body: corpo })

beforeAll(async () => {
  await limparBanco()
  const admin = await prisma.usuario.create({
    data: { nome: 'Admin', email: 'admin.upload@teste.local', senhaHash: await hashDeSenha(SENHA), papel: 'admin' },
  })
  agenteId = (
    await prisma.agente.create({ data: { nome: 'Agente', modelo: 'openai/gpt-4o-mini', criadoPorId: admin.id } })
  ).id
  cookie = await cookieDe('admin.upload@teste.local', SENHA)
  servidor = await subirServidor(3181, { MAX_UPLOAD_MB: '1' })
}, 120_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

beforeEach(async () => {
  await prisma.fonte.deleteMany()
})

describe('envio de vários arquivos', () => {
  it('PDF, DOCX e CSV reais: 202 com três aceitos, e as três fontes chegam a pronto', async () => {
    const r = await enviar(
      formulario([
        ['manual.pdf', fixture('exemplo.pdf')],
        ['contrato.docx', fixture('exemplo.docx')],
        ['precos.csv', fixture('exemplo.csv')],
      ]),
    )
    expect(r.status).toBe(202)
    const { resultados } = (await r.json()) as { resultados: Array<Record<string, any>> }
    expect(resultados.map((x) => [x.nome, x.aceito])).toEqual([
      ['manual.pdf', true],
      ['contrato.docx', true],
      ['precos.csv', true],
    ])
    expect(resultados[0]!.fonte).toMatchObject({ tipo: 'arquivo', tipoMime: 'application/pdf', titulo: 'manual.pdf' })
    expect(JSON.stringify(resultados)).not.toContain('caminhoArquivo')

    await esperar(async () => {
      const l = (await (await fetch(url(), { headers: { cookie } })).json()) as { resumo: { prontas: number } }
      return l.resumo.prontas === 3
    })
  })

  it('lote misto: aceita o válido, recusa o resto com motivo por arquivo e responde 202', async () => {
    const r = await enviar(
      formulario([
        ['vazio.txt', new Uint8Array()],
        ['virus.exe', Buffer.from('MZ')],
        ['falso.pdf', Buffer.from('<html></html>')],
        ['ok.txt', Buffer.from('conteúdo bom')],
      ]),
    )
    expect(r.status).toBe(202)
    const { resultados } = (await r.json()) as { resultados: Array<Record<string, any>> }
    expect(resultados.map((x) => x.aceito)).toEqual([false, false, false, true])
    expect(resultados.slice(0, 3).map((x) => x.codigo)).toEqual(['arquivo_vazio', 'formato_nao_aceito', 'conteudo_invalido'])
    for (const x of resultados.slice(0, 3)) expect(x.motivo).toBeTruthy()
    expect(await prisma.fonte.count()).toBe(1)
  })

  it('nenhum arquivo aceito: 422 com um motivo por arquivo', async () => {
    const r = await enviar(formulario([['a.exe', Buffer.from('x')], ['b.txt', new Uint8Array()]]))
    expect(r.status).toBe(422)
    const { resultados } = (await r.json()) as { resultados: Array<Record<string, any>> }
    expect(resultados).toHaveLength(2)
    expect(resultados.every((x) => x.aceito === false && x.motivo)).toBe(true)
  })

  it('arquivo acima de MAX_UPLOAD_MB é recusado por arquivo, sem derrubar o envio', async () => {
    const r = await enviar(
      formulario([
        ['grande.txt', Buffer.alloc(2 * 1024 * 1024, 97)],
        ['pequeno.txt', Buffer.from('ok')],
      ]),
    )
    expect(r.status).toBe(202)
    const { resultados } = (await r.json()) as { resultados: Array<Record<string, any>> }
    expect(resultados[0]).toMatchObject({ aceito: false, codigo: 'arquivo_grande_demais' })
    expect(resultados[1]).toMatchObject({ aceito: true })
  })

  it('o campo "arquivo" (singular) também é aceito', async () => {
    const r = await enviar(formulario([['um.txt', Buffer.from('oi')]], 'arquivo'))
    expect(r.status).toBe(202)
  })
})

describe('erros do envio todo', () => {
  it('sem sessão é 401 antes de ler o corpo', async () => {
    const r = await fetch(url(), { method: 'POST', body: formulario([['a.txt', Buffer.from('a')]]) })
    expect(r.status).toBe(401)
    expect(await prisma.fonte.count()).toBe(0)
  })

  it('agente inexistente é 404', async () => {
    const r = await fetch(`${servidor.base}/api/agentes/nao-existe/fontes`, {
      method: 'POST',
      headers: { cookie },
      body: formulario([['a.txt', Buffer.from('a')]]),
    })
    expect(r.status).toBe(404)
  })

  it('Content-Type que não é multipart: 415', async () => {
    const r = await enviar(JSON.stringify({ a: 1 }), { 'content-type': 'application/json' })
    expect(r.status).toBe(415)
    expect(await r.json()).toMatchObject({ codigo: 'tipo_nao_suportado' })
  })

  it('corpo acima do teto de 10 arquivos x MAX_UPLOAD_MB: 413', async () => {
    const r = await enviar(formulario([['enorme.txt', Buffer.alloc(12 * 1024 * 1024, 97)]]))
    expect(r.status).toBe(413)
    expect(await r.json()).toMatchObject({ codigo: 'corpo_grande_demais' })
    expect(await prisma.fonte.count()).toBe(0)
  })

  it('mais de 10 arquivos e nenhum arquivo: 422', async () => {
    const onze = Array.from({ length: 11 }, (_, i): [string, Uint8Array] => [`a${i}.txt`, Buffer.from('a')])
    const r11 = await enviar(formulario(onze))
    expect(r11.status).toBe(422)
    expect(((await r11.json()) as { mensagem: string }).mensagem).toMatch(/10 arquivos/)
    const vazio = await enviar(new FormData())
    expect(vazio.status).toBe(422)
    expect(((await vazio.json()) as { mensagem: string }).mensagem).toMatch(/ao menos um arquivo/)
  })

  it('multipart malformado: 422 em JSON, sem pilha', async () => {
    const r = await enviar('isto não é multipart', { 'content-type': 'multipart/form-data; boundary=xyz' })
    expect(r.status).toBe(422)
    const corpo = JSON.stringify(await r.json())
    expect(corpo).not.toMatch(/at \w+|node_modules|\.ts:/)
  })
})
