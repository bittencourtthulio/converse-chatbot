/**
 * GET /api/saude (FT-11, PR-95) contra o servidor de produção (exige `npm run build`): público,
 * sem sessão, `no-store`, e devolve só `{status}`: 200 para ok e degradado, 503 para falha.
 */
import { afterAll, describe, expect, it } from 'vitest'
import { ffmpegDisponivel } from './apoio/ffmpeg'
import { subirServidor, type Servidor } from './apoio/servidor'

const servidores: Servidor[] = []
afterAll(() => servidores.forEach((s) => s.parar()))

async function consultar(porta: number, env: Record<string, string>) {
  const servidor = await subirServidor(porta, env)
  servidores.push(servidor)
  const resposta = await fetch(`${servidor.base}/api/saude`)
  return { resposta, corpo: (await resposta.json()) as Record<string, unknown> }
}

describe('GET /api/saude', () => {
  it.skipIf(!ffmpegDisponivel)('com tudo no lugar responde 200 e só {status:"ok"}, sem sessão e sem cache', async () => {
    const { resposta, corpo } = await consultar(3226, {})
    expect(resposta.status).toBe(200)
    expect(corpo).toEqual({ status: 'ok' })
    expect(resposta.headers.get('cache-control')).toBe('no-store')
    expect(resposta.headers.get('x-correlacao')).toMatch(/^[0-9a-f]{8}$/)
  }, 180_000)

  it('sem ffmpeg responde 200 degradado (não falha)', async () => {
    const { resposta, corpo } = await consultar(3227, { FFMPEG_PATH: '/caminho/que/nao/existe/ffmpeg' })
    expect(resposta.status).toBe(200)
    expect(corpo).toEqual({ status: 'degradado' })
  }, 180_000)

  it('com o banco inacessível responde 503 falha, ainda só com o status', async () => {
    const { resposta, corpo } = await consultar(3228, { DATABASE_URL: 'file:/diretorio/que/nao/existe/app.db' })
    expect(resposta.status).toBe(503)
    expect(corpo).toEqual({ status: 'falha' })
    expect(resposta.headers.get('cache-control')).toBe('no-store')
    expect(JSON.stringify(corpo)).not.toMatch(/banco|sqlite|prisma|\//i)
  }, 180_000)
})
