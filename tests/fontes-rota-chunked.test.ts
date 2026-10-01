/**
 * T-03.02 (FT-13, PR-45, PR-106): `POST /api/agentes/[id]/fontes` contra o servidor de produção com
 * `MAX_UPLOAD_MB=1`: o corpo em `Transfer-Encoding: chunked`, sem `Content-Length`, é contado em stream e
 * recusado com 413 ao passar do teto (`MAX_UPLOAD_MB` x 10 arquivos + 1 MB de folga = 11 MB), sem ler o resto;
 * o multipart válido continua aceito, inclusive vários arquivos.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { rmSync } from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { ambiente } from '@/lib/ambiente'
import { hashDeSenha } from '@/lib/senha'
import { limparBanco } from './ajuda'
import { enviarChunked } from './apoio/corpo-chunked'
import { cookieDe, subirServidor, type Servidor } from './apoio/servidor'

const SENHA = 'senha-de-rota-123'
const PORTA = 3253
const MB = 1024 * 1024
let servidor: Servidor
let cookie: string
let agenteId: string

const url = () => `${servidor.base}/api/agentes/${agenteId}/fontes`
const pastaDoAgente = () => path.join(ambiente.storageDir, 'fontes', agenteId)

beforeAll(async () => {
  await limparBanco()
  const admin = await prisma.usuario.create({
    data: { nome: 'Admin', email: 'admin.chunked@teste.local', senhaHash: await hashDeSenha(SENHA), papel: 'admin' },
  })
  agenteId = (await prisma.agente.create({ data: { nome: 'Agente', modelo: 'openai/gpt-4o-mini', criadoPorId: admin.id } })).id
  cookie = await cookieDe('admin.chunked@teste.local', SENHA)
  servidor = await subirServidor(PORTA, { MAX_UPLOAD_MB: '1' })
}, 120_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

beforeEach(async () => {
  await prisma.fonte.deleteMany()
  rmSync(pastaDoAgente(), { recursive: true, force: true })
})

describe('corpo chunked sem Content-Length (integração)', () => {
  it('14 MB em pedaços, com multipart inválido, recebem 413 corpo_grande_demais (o código antigo daria 422) e o cliente não conseguiu enviar tudo', async () => {
    const r = await enviarChunked({
      url: url(),
      totalBytes: 200 * MB,
      tamanhoDoPedaco: 64 * 1024,
      tipo: 'multipart/form-data; boundary=zzz',
      headers: { cookie },
    })
    expect(r.status).toBe(413)
    expect(JSON.parse(r.corpo)).toMatchObject({ codigo: 'corpo_grande_demais' })
    // O servidor parou de ler logo depois do teto de 11 MB: o cliente não despejou os 200 MB.
    expect(r.bytesEnviados).toBeLessThan(100 * MB)
    expect(await prisma.fonte.count()).toBe(0)
  })

  it('um corpo chunked sob o teto e inválido segue para o parse e dá 422, não 413', async () => {
    const r = await enviarChunked({ url: url(), totalBytes: 300_000, tipo: 'multipart/form-data; boundary=zzz', headers: { cookie } })
    expect(r.status).toBe(422)
    expect(await prisma.fonte.count()).toBe(0)
  })
})

describe('multipart válido continua aceito (funcional)', () => {
  it('dois arquivos pequenos recebem 202 e viram fontes', async () => {
    const f = new FormData()
    f.append('arquivos', new File(['Primeiro texto de teste.'], 'um.txt', { type: 'text/plain' }))
    f.append('arquivos', new File(['Segundo texto de teste.'], 'dois.txt', { type: 'text/plain' }))
    const r = await fetch(url(), { method: 'POST', headers: { cookie }, body: f })
    expect(r.status).toBe(202)
    expect(((await r.json()) as { resultados: Array<{ aceito: boolean }> }).resultados.every((x) => x.aceito)).toBe(true)
    expect(await prisma.fonte.count()).toBe(2)
  })

  it('três arquivos de 400 KB, com MAX_UPLOAD_MB=1, recebem 202 (o corpo de 1,2 MB passa do limite de UM arquivo, mas não do teto de dez)', async () => {
    const f = new FormData()
    for (const nome of ['a', 'b', 'c']) f.append('arquivos', new File([randomBytes(400 * 1024).toString('base64').slice(0, 400 * 1024)], `${nome}.txt`, { type: 'text/plain' }))
    const r = await fetch(url(), { method: 'POST', headers: { cookie }, body: f })
    expect(r.status).toBe(202)
    expect(await prisma.fonte.count()).toBe(3)
  })

  it('o Content-Length declarado acima do teto continua recusado antes de ler o corpo', async () => {
    const status = await new Promise<number | null>((resolver) => {
      const req = http.request(
        url(),
        { method: 'POST', headers: { cookie, 'content-type': 'multipart/form-data; boundary=zzz', 'content-length': String(12 * MB) } },
        (res) => {
          resolver(res.statusCode ?? null)
          res.resume()
          req.destroy()
        },
      )
      req.on('error', () => resolver(null))
      req.write('x')
    })
    expect(status).toBe(413)
    expect(await prisma.fonte.count()).toBe(0)
  })
})
