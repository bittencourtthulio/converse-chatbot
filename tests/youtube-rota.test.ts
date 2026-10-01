/**
 * T-05.05 (FT-08): `POST /api/agentes/[id]/fontes/youtube` contra o servidor de
 * produção: sessão, JSON, corpo pequeno, URL só do YouTube (PR-75, PR-76).
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { limparBanco } from './ajuda'
import { cookieDe, subirServidor, type Servidor } from './apoio/servidor'
import { iniciarYoutubeFalso, type YoutubeFalso } from './apoio/youtube-falso'

const SENHA = 'senha-de-rota-123'
let servidor: Servidor
let falso: YoutubeFalso
let cookie: string
let agenteId: string

const url = (id = agenteId) => `${servidor.base}/api/agentes/${id}/fontes/youtube`
const enviar = (corpo: unknown, cabecalhos: Record<string, string> = { 'content-type': 'application/json' }, id = agenteId) =>
  fetch(url(id), {
    method: 'POST',
    headers: { cookie, ...cabecalhos },
    body: typeof corpo === 'string' ? corpo : JSON.stringify(corpo),
  })

beforeAll(async () => {
  await limparBanco()
  const admin = await prisma.usuario.create({
    data: { nome: 'Admin', email: 'admin.youtube@teste.local', senhaHash: await hashDeSenha(SENHA), papel: 'admin' },
  })
  agenteId = (await prisma.agente.create({ data: { nome: 'Agente', modelo: 'openai/gpt-4o-mini', criadoPorId: admin.id } })).id
  cookie = await cookieDe('admin.youtube@teste.local', SENHA)
  falso = await iniciarYoutubeFalso()
  servidor = await subirServidor(3192, { YOUTUBE_BASE: falso.url })
}, 120_000)

afterAll(async () => {
  servidor?.parar()
  await falso?.fechar()
  await limparBanco()
})

beforeEach(async () => {
  await prisma.fonte.deleteMany()
})

describe('rota do link do YouTube', () => {
  it('um POST com URL válida responde 202 com a fonte pendente e ela aparece na lista', async () => {
    const r = await enviar({ url: 'https://www.youtube.com/watch?v=abcdefghijk' })
    expect(r.status).toBe(202)
    const texto = await r.text()
    expect(texto).not.toMatch(/caminhoArquivo/)
    const { fonte } = JSON.parse(texto) as { fonte: { id: string; tipo: string; status: string; urlOrigem: string } }
    expect(fonte).toMatchObject({ tipo: 'youtube', urlOrigem: 'https://www.youtube.com/watch?v=abcdefghijk' })
    const lista = (await (await fetch(`${servidor.base}/api/agentes/${agenteId}/fontes`, { headers: { cookie } })).json()) as {
      fontes: Array<{ id: string; tipo: string }>
    }
    expect(lista.fontes.find((f) => f.id === fonte.id)?.tipo).toBe('youtube')
  })

  it('sem sessão responde 401, tipo de conteúdo errado 415 e agente inexistente 404', async () => {
    const semSessao = await fetch(url(), { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })
    expect(semSessao.status).toBe(401)
    expect((await enviar('url=https://youtu.be/abcdefghijk', { 'content-type': 'text/plain' })).status).toBe(415)
    expect((await enviar({ url: 'https://youtu.be/abcdefghijk' }, { 'content-type': 'application/json' }, 'agente-que-nao-existe')).status).toBe(404)
    expect(await prisma.fonte.count()).toBe(0)
  })

  it('URL de outro host responde 422 com a mensagem, JSON inválido 422 e corpo vazio 422', async () => {
    const r = await enviar({ url: 'https://evil.com/watch?v=abcdefghijk' })
    expect(r.status).toBe(422)
    const corpo = (await r.json()) as { codigo: string; mensagem: string }
    expect(corpo.codigo).toBe('url_invalida')
    expect(corpo.mensagem).toMatch(/YouTube/)
    expect((await enviar('{isto não é json')).status).toBe(422)
    expect((await enviar('')).status).toBe(422)
    expect((await enviar({ url: 123 })).status).toBe(422)
    expect(await prisma.fonte.count()).toBe(0)
  })

  it('corpo acima do teto responde 413, por Content-Length e sem ele', async () => {
    const grande = JSON.stringify({ url: 'https://youtu.be/abcdefghijk', enchimento: 'x'.repeat(20_000) })
    expect((await enviar(grande)).status).toBe(413)
    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(Buffer.from(grande))
        c.close()
      },
    })
    const semLength = await fetch(url(), {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: stream,
      // @ts-expect-error `duplex` ainda não está nos tipos do fetch do DOM
      duplex: 'half',
    })
    expect(semLength.status).toBe(413)
    expect(await prisma.fonte.count()).toBe(0)
  })
})
