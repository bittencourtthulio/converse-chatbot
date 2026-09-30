/**
 * T-05.03 (FT-06, PR-60): a rota /widget.js contra o servidor de produção: o
 * conteúdo é o do arquivo versionado e os cabeçalhos são os de um script de
 * terceiros incluído em outros sites.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { subirServidor, type Servidor } from './apoio/servidor'

let servidor: Servidor
const arquivo = readFileSync(path.join(process.cwd(), 'src/widget/widget.js'), 'utf8')

beforeAll(async () => {
  servidor = await subirServidor(3195)
}, 180_000)

afterAll(() => servidor?.parar())

describe('GET /widget.js', () => {
  it('devolve o conteúdo do arquivo versionado, sem login', async () => {
    const r = await fetch(`${servidor.base}/widget.js`, { redirect: 'manual' })
    expect(r.status).toBe(200)
    expect(await r.text()).toBe(arquivo)
  })

  it('tem os cabeçalhos do PR-60', async () => {
    const r = await fetch(`${servidor.base}/widget.js`)
    expect(r.headers.get('content-type')).toMatch(/^application\/javascript/)
    expect(r.headers.get('cache-control')).toBe('public, max-age=300')
    expect(r.headers.get('access-control-allow-origin')).toBe('*')
    expect(r.headers.get('cross-origin-resource-policy')).toBe('cross-origin')
    expect(r.headers.get('x-content-type-options')).toBe('nosniff')
  })

  it('aceita a query de cache-busting', async () => {
    const r = await fetch(`${servidor.base}/widget.js?v=2`)
    expect(r.status).toBe(200)
    expect(await r.text()).toBe(arquivo)
  })

  it('não carrega segredo, variável de ambiente nem endereço fixo', async () => {
    const corpo = await (await fetch(`${servidor.base}/widget.js`)).text()
    expect(corpo).not.toMatch(/sk-or|JWT_SECRET|ENCRYPTION_KEY|process\.[e]nv|localhost/)
  })

  it('o conteúdo é o mesmo em requisições seguidas (estático)', async () => {
    const a = await (await fetch(`${servidor.base}/widget.js`)).text()
    const b = await (await fetch(`${servidor.base}/widget.js`)).text()
    expect(a).toBe(b)
  })
})
