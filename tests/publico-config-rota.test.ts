/**
 * T-03.01 (FT-06, PR-56, PR-58): GET config e OPTIONS da API pública contra o
 * servidor de produção: sem sessão, só campos visuais, 404 idêntico e CORS pela
 * lista de domínios do agente.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { salvarConfiguracao } from '@/servicos/chat-publico-config'
import { criarAdmin, limparBanco } from './ajuda'
import { subirServidor, type Servidor } from './apoio/servidor'

let servidor: Servidor
let aberto: string
let restrito: string
let inativo: string

const config = (id: string, origem?: string) =>
  fetch(`${servidor.base}/api/publico/agentes/${id}/config`, { headers: origem ? { Origin: origem } : {} })

beforeAll(async () => {
  await limparBanco()
  const admin = await criarAdmin()
  const criar = (nome: string) =>
    prisma.agente.create({
      data: {
        nome,
        modelo: 'modelo-secreto/xyz',
        instrucoes: 'Instrução secreta PROMO-INTERNO-77',
        mensagemInicial: 'Olá!',
        criadoPorId: admin.id,
      },
    })
  aberto = (await criar('Aberto')).id
  restrito = (await criar('Restrito')).id
  inativo = (await criar('Inativo')).id
  await salvarConfiguracao(admin, aberto, { ativo: true, titulo: 'Fale com a Ana', cor: '#2563eb', sugestoes: ['Oi'] })
  await salvarConfiguracao(admin, restrito, {
    ativo: true,
    dominiosPermitidos: ['exemplo.com', '*.parceiro.com', 'localhost:4321'],
    limiteDiario: 4321,
  })
  await salvarConfiguracao(admin, inativo, { ativo: false, dominiosPermitidos: ['exemplo.com'] })
  servidor = await subirServidor(3190, { TRUST_PROXY: '1' })
}, 180_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

describe('GET config', () => {
  it('sem cookie de sessão devolve 200 com só os campos visuais', async () => {
    const r = await config(aberto)
    expect(r.status).toBe(200)
    expect(r.headers.get('cache-control')).toBe('no-store')
    expect(r.headers.get('content-type')).toMatch(/application\/json/)
    const corpo = (await r.json()) as Record<string, unknown>
    expect(corpo).toMatchObject({ ativo: true, titulo: 'Fale com a Ana', cor: '#2563eb', posicao: 'direita', avatar: 'iniciais', mensagemInicial: 'Olá!', sugestoes: ['Oi'], avisoDePrivacidade: null })
    expect(Object.keys(corpo).sort()).toEqual(['ativo', 'avatar', 'avisoDePrivacidade', 'cor', 'mensagemInicial', 'posicao', 'sugestoes', 'titulo'])
  })

  it('nunca traz instruções, modelo, domínios nem limite', async () => {
    const texto = await (await config(restrito, 'https://exemplo.com')).text()
    for (const proibido of ['PROMO-INTERNO', 'modelo-secreto', 'exemplo.com', 'parceiro.com', '4321', 'instrucoes', 'limiteDiario', 'dominios']) {
      expect(texto, proibido).not.toContain(proibido)
    }
  })

  it('agente inativo e agente inexistente dão o mesmo 404, com o mesmo corpo e os mesmos cabeçalhos de CORS', async () => {
    const a = await config(inativo, 'https://exemplo.com')
    const b = await config('nao-existe-0123', 'https://exemplo.com')
    expect(a.status).toBe(404)
    expect(b.status).toBe(404)
    expect(await a.text()).toBe(await b.text())
    for (const nome of ['access-control-allow-origin', 'vary', 'cache-control', 'content-type']) {
      expect(a.headers.get(nome), nome).toBe(b.headers.get(nome))
    }
  })

  it('lista vazia: Access-Control-Allow-Origin é * e Vary: Origin está presente', async () => {
    const r = await config(aberto, 'https://qualquer-site.com')
    expect(r.headers.get('access-control-allow-origin')).toBe('*')
    expect(r.headers.get('vary')).toMatch(/origin/i)
  })

  it('com lista: ecoa o Origin permitido e não manda o cabeçalho para o de fora', async () => {
    const permitido = await config(restrito, 'https://exemplo.com')
    expect(permitido.headers.get('access-control-allow-origin')).toBe('https://exemplo.com')
    expect((await config(restrito, 'https://app.parceiro.com')).headers.get('access-control-allow-origin')).toBe('https://app.parceiro.com')
    expect((await config(restrito, 'http://localhost:4321')).headers.get('access-control-allow-origin')).toBe('http://localhost:4321')
    for (const fora of ['https://atacante.com', 'https://exemplo.com.atacante.com', 'https://parceiro.com', 'http://localhost:9999']) {
      const r = await config(restrito, fora)
      expect(r.status).toBe(200)
      expect(r.headers.get('access-control-allow-origin'), fora).toBeNull()
      expect(r.headers.get('vary')).toMatch(/origin/i)
    }
    // sem Origin (chamada de servidor) com lista: sem cabeçalho de CORS
    expect((await config(restrito)).headers.get('access-control-allow-origin')).toBeNull()
  })
})

describe('OPTIONS config', () => {
  const opcoes = (id: string, origem: string) =>
    fetch(`${servidor.base}/api/publico/agentes/${id}/config`, {
      method: 'OPTIONS',
      headers: { Origin: origem, 'Access-Control-Request-Method': 'GET' },
    })

  it('responde 204 com os métodos e o CORS da lista', async () => {
    const r = await opcoes(restrito, 'https://exemplo.com')
    expect(r.status).toBe(204)
    expect(r.headers.get('access-control-allow-origin')).toBe('https://exemplo.com')
    expect(r.headers.get('access-control-allow-methods')).toMatch(/GET/)
    expect(r.headers.get('vary')).toMatch(/origin/i)
  })

  it('origem de fora não recebe Allow-Origin e lista vazia recebe *', async () => {
    expect((await opcoes(restrito, 'https://atacante.com')).headers.get('access-control-allow-origin')).toBeNull()
    expect((await opcoes(aberto, 'https://qualquer.com')).headers.get('access-control-allow-origin')).toBe('*')
  })
})
