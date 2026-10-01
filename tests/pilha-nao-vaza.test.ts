/**
 * A pilha não vaza (FT-11, PR-93, L17): contra o servidor de produção (exige `npm run build`), com
 * o banco do servidor quebrado DEPOIS do login (a tabela de conversas some), uma rota de API e uma
 * página falham por erro inesperado. Nenhuma das duas respostas mostra pilha, caminho de arquivo,
 * mensagem do Prisma ou nome de tabela: só a frase genérica e o código de referência, o mesmo do
 * cabeçalho X-Correlacao (API) ou o `digest` que a linha `erro_na_requisicao` do log traz (página).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import Database from 'better-sqlite3'
import { mkdtempSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { criarAdmin, limparBanco } from './ajuda'
import { cookieDe, subirServidor, type Servidor } from './apoio/servidor'
import { bancoDoTeste } from './apoio/instalacao'

const VAZAMENTO = /\n\s+at\s|node_modules|\/Users\/|\.next\/server|webpack-internal|PrismaClient|no such table|does not exist|P2021/i
// No log, o nome do erro (`PrismaClientKnownRequestError`) é permitido; a mensagem, a pilha e os caminhos não.
const VAZAMENTO_NO_LOG = /^\s+at\s|node_modules|\/Users\/|\.next\/server|webpack-internal|no such table|does not exist|P2021|Invalid `prisma|⨯/im

let servidor: Servidor
let cookie: string
let pasta: string

beforeAll(async () => {
  await limparBanco()
  const admin = await criarAdmin()
  cookie = await cookieDe(admin.email, admin.senha)
  pasta = mkdtempSync(path.join(os.tmpdir(), 'converse-pilha-'))
  const copia = path.join(pasta, 'servidor.db')
  const origem = new Database(bancoDoTeste(), { readonly: true })
  await origem.backup(copia)
  origem.close()
  // O login continua funcionando (usuarios intacta); só a leitura de conversas falha.
  const quebrado = new Database(copia)
  quebrado.exec('DROP TABLE mensagens; DROP TABLE conversas;')
  quebrado.close()
  servidor = await subirServidor(3221, { DATABASE_URL: `file:${copia}` }, { capturarLogs: true })
}, 180_000)

afterAll(async () => {
  servidor?.parar()
  rmSync(pasta, { recursive: true, force: true })
  await limparBanco()
})

const linhasEstruturadas = () =>
  servidor
    .logs()
    .split('\n')
    .filter((l) => l.startsWith('{'))
    .map((l) => JSON.parse(l) as Record<string, unknown>)

const pegar = (caminho: string, comCookie = true) =>
  fetch(`${servidor.base}${caminho}`, { headers: comCookie ? { cookie } : {} })

describe('rota de API', () => {
  it('erro inesperado devolve 500 com a frase genérica e o código de referência igual ao X-Correlacao, sem pilha', async () => {
    const r = await pegar('/api/conversas/qualquer/exportar')
    expect(r.status).toBe(500)
    const id = r.headers.get('x-correlacao')!
    expect(id).toMatch(/^[0-9a-f]{8}$/)
    const corpo = await r.text()
    expect(JSON.parse(corpo)).toEqual({ codigo: 'erro_inesperado', mensagem: `Não foi possível concluir. Código de referência: ${id}.` })
    expect(corpo).not.toMatch(VAZAMENTO)
    expect(JSON.stringify([...r.headers])).not.toMatch(VAZAMENTO)
  })

  it('o log tem a linha erro_inesperado com a mesma correlação e só o nome do erro', async () => {
    const r = await pegar('/api/conversas/outra/exportar')
    const id = r.headers.get('x-correlacao')!
    const linha = linhasEstruturadas().find((l) => l.msg === 'erro_inesperado' && l.correlacao === id)
    expect(linha).toMatchObject({ nivel: 'erro', rota: 'conversas', correlacao: id, erro: 'PrismaClientKnownRequestError' })
  })
})

describe('página', () => {
  it('erro inesperado numa tela do sistema entrega só o digest ao navegador, e o log liga o digest à correlação', async () => {
    const r = await pegar('/conversas')
    const html = await r.text()
    const id = r.headers.get('x-correlacao')!
    expect(id).toMatch(/^[0-9a-f]{8}$/)
    expect(html).not.toMatch(VAZAMENTO)
    // O Next entrega o erro à tela só como `digest`; a tela de erro o mostra como código de referência.
    const linha = linhasEstruturadas().find((l) => l.msg === 'erro_na_requisicao' && l.correlacao === id)
    expect(linha).toMatchObject({ nivel: 'erro', rota: '/conversas', tipo: 'render', erro: 'PrismaClientKnownRequestError' })
    expect(String(linha!.referencia)).toMatch(/^\d+$/)
    expect(html).toContain(String(linha!.referencia))
  })

  it('a página não encontrada mostra o código igual ao X-Correlacao', async () => {
    const r = await pegar('/uma-pagina-que-nao-existe')
    expect(r.status).toBe(404)
    const id = r.headers.get('x-correlacao')!
    const html = await r.text()
    expect(html).toContain('Página não encontrada')
    expect(html).toContain(`<code>${id}</code>`)
    expect(html).not.toMatch(VAZAMENTO)
  })
})

describe('o log do servidor', () => {
  it('depois dos erros, nenhuma linha traz pilha, caminho, mensagem do Prisma ou o prefixo de erro do Next', async () => {
    await pegar('/conversas')
    await pegar('/api/conversas/x/exportar')
    const saida = servidor.logs()
    expect(saida).not.toMatch(VAZAMENTO_NO_LOG)
    expect(linhasEstruturadas().some((l) => l.msg === 'erro_do_next')).toBe(true)
  })
})
