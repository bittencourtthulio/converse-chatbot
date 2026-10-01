/**
 * T-01.04 (FT-13, PR-45, PR-106, PR-107): os apoios de PDF com N páginas e de envio de corpo `chunked` sem
 * Content-Length, usados pelos testes de teto do upload e de limite de páginas das próximas tasks.
 */
import { afterEach, describe, expect, it } from 'vitest'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { getDocumentProxy } from 'unpdf'
import { extrairPdf } from '@/lib/extracao/pdf'
import { enviarChunked } from './apoio/corpo-chunked'
import { gerarPdf } from './apoio/pdf-sintetico'

const servidores: http.Server[] = []
afterEach(async () => {
  await Promise.all(servidores.splice(0).map((s) => new Promise((r) => { s.closeAllConnections(); s.close(() => r(undefined)) })))
})

async function subir(tratar: http.RequestListener): Promise<string> {
  const s = http.createServer(tratar)
  servidores.push(s)
  await new Promise<void>((r) => s.listen(0, '127.0.0.1', () => r()))
  return `http://127.0.0.1:${(s.address() as AddressInfo).port}/`
}

describe('gerarPdf (integração)', () => {
  it('um PDF de 501 páginas é aberto pelo unpdf com numPages 501', async () => {
    const pdf = await getDocumentProxy(new Uint8Array(gerarPdf(501)))
    expect(pdf.numPages).toBe(501)
  })

  it('um PDF de 3 páginas tem texto extraível por extrairPdf', async () => {
    const texto = await extrairPdf(gerarPdf(3))
    for (const t of ['Pagina 1', 'Pagina 2', 'Pagina 3']) expect(texto).toContain(t)
  })
})

describe('enviarChunked (integração)', () => {
  it('entrega os bytes em Transfer-Encoding chunked, sem Content-Length', async () => {
    let visto: http.IncomingHttpHeaders = {}
    let recebidos = 0
    const url = await subir((req, res) => {
      visto = req.headers
      req.on('data', (p: Buffer) => void (recebidos += p.length))
      req.on('end', () => res.end('ok'))
    })
    const r = await enviarChunked({ url, totalBytes: 300_000, tamanhoDoPedaco: 50_000, tipo: 'multipart/form-data; boundary=x' })
    expect(r.status).toBe(200)
    expect(r.bytesEnviados).toBe(300_000)
    expect(recebidos).toBe(300_000)
    expect(visto['transfer-encoding']).toBe('chunked')
    expect(visto['content-length']).toBeUndefined()
    expect(visto['content-type']).toBe('multipart/form-data; boundary=x')
  })

  it('para de enviar quando o servidor recusa (413) e devolve o status e o que foi aceito', async () => {
    let recebidos = 0
    const url = await subir((req, res) => {
      req.on('data', (p: Buffer) => {
        recebidos += p.length
        if (recebidos > 1_000_000 && !res.headersSent) {
          res.writeHead(413)
          res.end('grande demais')
        }
      })
    })
    const r = await enviarChunked({ url, totalBytes: 200_000_000, tamanhoDoPedaco: 64 * 1024 })
    expect(r.status).toBe(413)
    expect(r.corpo).toBe('grande demais')
    expect(r.bytesEnviados).toBeLessThan(40_000_000)
    expect(r.bytesEnviados).toBeGreaterThan(1_000_000)
  })
})
