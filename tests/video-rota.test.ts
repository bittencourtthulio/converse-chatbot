/**
 * T-03.04 (FT-08): `POST /api/agentes/[id]/fontes/video?nome=` contra o
 * servidor de produção: corpo bruto em stream até o disco, 413 cedo por
 * `Content-Length`, 413 por contagem sem `Content-Length`, 415, 422 e 401
 * (PR-71). Prova também a lacuna 6 da base: stream grande em `next start`.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import http from 'node:http'
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { ambiente } from '@/lib/ambiente'
import { hashDeSenha } from '@/lib/senha'
import { limparBanco } from './ajuda'
import { cookieDe, subirServidor, type Servidor } from './apoio/servidor'

const SENHA = 'senha-de-rota-123'
let servidor: Servidor
let cookie: string
let agenteId: string
const PORTA = 3191

const url = (nome?: string, id = agenteId) =>
  `${servidor.base}/api/agentes/${id}/fontes/video${nome === undefined ? '' : `?nome=${encodeURIComponent(nome)}`}`
const mp3 = (tamanho: number) => Buffer.concat([Buffer.from('ID3'), Buffer.from([3, 0, 0, 0, 0, 0, 0, 0, 0]), randomBytes(tamanho)])
const enviar = (nome: string | undefined, corpo: BodyInit | null, cabecalhos: Record<string, string> = {}) =>
  fetch(url(nome), { method: 'POST', headers: { cookie, 'content-type': 'application/octet-stream', ...cabecalhos }, body: corpo })
const pastaDoAgente = () => path.join(ambiente.storageDir, 'fontes', agenteId)

beforeAll(async () => {
  await limparBanco()
  const admin = await prisma.usuario.create({
    data: { nome: 'Admin', email: 'admin.video@teste.local', senhaHash: await hashDeSenha(SENHA), papel: 'admin' },
  })
  agenteId = (await prisma.agente.create({ data: { nome: 'Agente', modelo: 'openai/gpt-4o-mini', criadoPorId: admin.id } })).id
  cookie = await cookieDe('admin.video@teste.local', SENHA)
  servidor = await subirServidor(PORTA, { MAX_VIDEO_MB: '1' })
}, 120_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

beforeEach(async () => {
  await prisma.fonte.deleteMany()
  rmSync(pastaDoAgente(), { recursive: true, force: true })
})

describe('envio de vídeo em stream', () => {
  it('um MP3 com o nome na query vira fonte pendente, aparece na lista e o original em disco tem os mesmos bytes', async () => {
    const bytes = mp3(300_000)
    const r = await enviar('Aula 1.mp3', bytes)
    expect(r.status).toBe(202)
    const texto = await r.text()
    expect(texto).not.toMatch(/caminhoArquivo|storage|original/)
    const { fonte } = JSON.parse(texto) as { fonte: { id: string; tipo: string; titulo: string; tamanhoBytes: number } }
    expect(fonte).toMatchObject({ tipo: 'video', titulo: 'Aula 1.mp3', tamanhoBytes: bytes.length })
    const lista = (await (await fetch(`${servidor.base}/api/agentes/${agenteId}/fontes`, { headers: { cookie } })).json()) as {
      fontes: Array<{ id: string }>
    }
    expect(lista.fontes.map((f) => f.id)).toContain(fonte.id)
    const linha = await prisma.fonte.findUniqueOrThrow({ where: { id: fonte.id } })
    expect(readFileSync(path.join(ambiente.storageDir, linha.caminhoArquivo!)).equals(bytes)).toBe(true)
  })

  it('um corpo em stream, em vários pedaços e sem Content-Length, chega inteiro ao disco (lacuna 6 da base)', async () => {
    const pedacos = Array.from({ length: 12 }, () => randomBytes(64 * 1024))
    pedacos[0] = Buffer.concat([Buffer.from('ID3'), Buffer.from([3, 0, 0, 0, 0, 0, 0, 0, 0]), pedacos[0]!])
    let i = 0
    const stream = new ReadableStream<Uint8Array>({
      pull(c) {
        if (i >= pedacos.length) return c.close()
        c.enqueue(pedacos[i++]!)
      },
    })
    const r = await fetch(url('stream.mp3'), {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/octet-stream' },
      body: stream,
      // @ts-expect-error `duplex` ainda não está nos tipos do fetch do DOM
      duplex: 'half',
    })
    expect(r.status).toBe(202)
    const { fonte } = (await r.json()) as { fonte: { id: string; tamanhoBytes: number } }
    const total = pedacos.reduce((s, p) => s + p.length, 0)
    expect(fonte.tamanhoBytes).toBe(total)
    const linha = await prisma.fonte.findUniqueOrThrow({ where: { id: fonte.id } })
    expect(readFileSync(path.join(ambiente.storageDir, linha.caminhoArquivo!)).equals(Buffer.concat(pedacos))).toBe(true)
  })

  it('sem sessão responde 401 e não grava nada', async () => {
    const r = await fetch(url('a.mp3'), { method: 'POST', body: mp3(1000) })
    expect(r.status).toBe(401)
    expect(await prisma.fonte.count()).toBe(0)
  })

  it('Content-Length acima do limite responde 413 sem esperar o corpo', async () => {
    const resposta = await new Promise<{ status: number; antesDoCorpo: boolean }>((resolver, rejeitar) => {
      let corpoEnviado = false
      const req = http.request(
        {
          host: 'localhost',
          port: PORTA,
          path: `/api/agentes/${agenteId}/fontes/video?nome=grande.mp3`,
          method: 'POST',
          headers: { cookie, 'content-type': 'application/octet-stream', 'content-length': String(5 * 1024 * 1024) },
        },
        (res) => {
          res.resume()
          resolver({ status: res.statusCode ?? 0, antesDoCorpo: !corpoEnviado })
          req.destroy()
        },
      )
      req.on('error', () => undefined)
      req.write(mp3(1000))
      setTimeout(() => rejeitar(new Error('o servidor não respondeu a tempo')), 8000).unref()
    })
    expect(resposta).toEqual({ status: 413, antesDoCorpo: true })
    expect(await prisma.fonte.count()).toBe(0)
  })

  it('sem Content-Length, 2 MB com limite de 1 MB respondem 413 e não deixam arquivo', async () => {
    const pedacos = Array.from({ length: 32 }, () => randomBytes(64 * 1024))
    pedacos[0] = Buffer.concat([Buffer.from('ID3'), Buffer.from([3, 0, 0, 0, 0, 0, 0, 0, 0]), pedacos[0]!])
    let i = 0
    const stream = new ReadableStream<Uint8Array>({
      pull(c) {
        if (i >= pedacos.length) return c.close()
        c.enqueue(pedacos[i++]!)
      },
    })
    const r = await fetch(url('passa.mp3'), {
      method: 'POST',
      // `connection: close`: a conexão de um envio recusado no meio não deve ser reaproveitada pelo teste seguinte.
      headers: { cookie, 'content-type': 'application/octet-stream', connection: 'close' },
      body: stream,
      // @ts-expect-error `duplex` ainda não está nos tipos do fetch do DOM
      duplex: 'half',
    }).catch(() => null)
    // O servidor pode fechar a conexão ao recusar: a resposta 413 ou a queda do envio são aceitáveis; o que não pode é sobrar arquivo ou linha.
    if (r) expect(r.status).toBe(413)
    expect(await prisma.fonte.count()).toBe(0)
    const sobras = existsSync(pastaDoAgente()) ? readdirSync(pastaDoAgente()) : []
    expect(sobras).toEqual([])
  })

  it('um txt com nome mp4 responde 415, extensão estranha 415, corpo vazio 422, sem nome 422 e agente inexistente 404', async () => {
    const texto = Buffer.from('isto é só um texto, nada de vídeo. '.repeat(50))
    expect((await enviar('falso.mp4', texto)).status).toBe(415)
    expect((await enviar('doc.pdf', mp3(100))).status).toBe(415)
    expect((await enviar('vazio.mp3', new Uint8Array(0))).status).toBe(422)
    expect((await enviar(undefined, mp3(100))).status).toBe(422)
    const r404 = await fetch(url('a.mp3', 'agente-que-nao-existe'), { method: 'POST', headers: { cookie }, body: mp3(100) })
    expect(r404.status).toBe(404)
    expect(await prisma.fonte.count()).toBe(0)
    const corpo = (await (await enviar('falso.mp4', texto)).json()) as { codigo: string }
    expect(corpo.codigo).toBe('assinatura_incoerente')
  })
})
