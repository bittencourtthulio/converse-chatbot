/**
 * T-01.01 (FT-13, PR-26, PR-112): nenhum teste abre conexão com host que não seja loopback. A trava é
 * instalada por `tests/setup-rede.ts` (setupFiles); este arquivo roda SOB essa trava e prova que ela
 * recusa `fetch`, `http`, `https` e `net.connect` para hosts públicos e deixa o loopback funcionar.
 */
import { describe, it, expect, afterEach } from 'vitest'
import http from 'node:http'
import https from 'node:https'
import net from 'node:net'
import { HOSTS_PERMITIDOS, ehLoopback, instalarTravaDeRede } from './apoio/trava-de-rede'

const BLOQUEIO = /Rede real bloqueada nos testes \(PR-26\)/

const servidores: http.Server[] = []
afterEach(async () => {
  await Promise.all(servidores.splice(0).map((s) => new Promise((r) => s.close(() => r(undefined)))))
})

async function servidorLocal(): Promise<number> {
  const s = http.createServer((_req, res) => res.end('local'))
  servidores.push(s)
  await new Promise<void>((r) => s.listen(0, '127.0.0.1', () => r()))
  return (s.address() as net.AddressInfo).port
}

const erroDe = (acionar: (resolver: (e: Error) => void) => void) =>
  new Promise<Error>((resolver) => acionar(resolver))

describe('a trava recusa host que não é loopback (integração)', () => {
  it('fetch para um host público é recusado com a mensagem da PR-112', async () => {
    await expect(fetch('https://example.com/')).rejects.toThrow(BLOQUEIO)
  })

  it('http.get e https.get para hosts públicos emitem o erro, sem abrir conexão', async () => {
    const a = await erroDe((r) => http.get('http://example.org/').on('error', r))
    expect(a.message).toMatch(BLOQUEIO)
    expect(a.message).toContain('example.org')
    const b = await erroDe((r) => https.get('https://example.org/').on('error', r))
    expect(b.message).toMatch(BLOQUEIO)
  })

  it('net.connect recusa pelas três formas de argumento: (porta, host), ([opções]) e opções', async () => {
    const a = await erroDe((r) => net.connect(80, '203.0.113.1').on('error', r))
    expect(a.message).toMatch(BLOQUEIO)
    const b = await erroDe((r) => net.connect({ port: 80, host: '203.0.113.2' }).on('error', r))
    expect(b.message).toContain('203.0.113.2')
    const c = await erroDe((r) => new net.Socket().connect([{ port: 80, host: 'example.net' }] as never).on('error', r))
    expect(c.message).toContain('example.net')
  })

  it('um servidor em 127.0.0.1 continua respondendo a fetch e a http.get', async () => {
    const porta = await servidorLocal()
    const viaFetch = await (await fetch(`http://127.0.0.1:${porta}/`)).text()
    expect(viaFetch).toBe('local')
    const viaLocalhost = await (await fetch(`http://localhost:${porta}/`)).text()
    expect(viaLocalhost).toBe('local')
    const viaHttp = await new Promise<string>((resolver, rejeitar) => {
      http.get(`http://127.0.0.1:${porta}/`, (res) => {
        let corpo = ''
        res.on('data', (p: Buffer) => void (corpo += p.toString()))
        res.on('end', () => resolver(corpo))
      }).on('error', rejeitar)
    })
    expect(viaHttp).toBe('local')
  })
})

describe('ehLoopback e a lista de permissões (funcional)', () => {
  it('aceita só endereços locais', () => {
    for (const host of ['localhost', 'LOCALHOST', '127.0.0.1', '127.1.2.3', '::1', '[::1]', '::ffff:127.0.0.1', '0.0.0.0', '::']) {
      expect(ehLoopback(host), host).toBe(true)
    }
    for (const host of ['example.com', '93.184.216.34', '10.0.0.1', '192.168.0.10', 'localhost.evil.com', '128.0.0.1', '']) {
      expect(ehLoopback(host), host).toBe(false)
    }
  })

  it('a lista de permissões é vazia por padrão', () => {
    expect(HOSTS_PERMITIDOS).toEqual([])
  })

  it('instalar duas vezes não empilha a troca', async () => {
    instalarTravaDeRede()
    instalarTravaDeRede()
    const porta = await servidorLocal()
    expect(await (await fetch(`http://127.0.0.1:${porta}/`)).text()).toBe('local')
    await expect(fetch('https://example.com/')).rejects.toThrow(BLOQUEIO)
  })
})
