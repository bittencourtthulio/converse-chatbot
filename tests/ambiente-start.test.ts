/**
 * O start de produção derrubado por configuração ausente (FT-11, PR-94, L20): contra o servidor
 * de produção (exige `npm run build`), sem `JWT_SECRET`, `DATABASE_URL` e `ENCRYPTION_KEY` o
 * processo termina com código diferente de zero e a saída cita os três NOMES e nenhum valor; com
 * as variáveis o servidor sobe, e `APP_URL` sem HTTPS só gera aviso no log.
 */
import { describe, expect, it } from 'vitest'
import { spawn } from 'node:child_process'

interface Saida {
  codigo: number | null
  texto: string
}

/** Roda `next start` e espera ele terminar sozinho (ou o prazo, e então o encerra). */
function subirAteTerminar(porta: number, env: Record<string, string | undefined>, prazoMs: number): Promise<Saida & { terminou: boolean }> {
  return new Promise((resolver) => {
    const filho = spawn('npx', ['next', 'start', '-p', String(porta)], {
      env: env as NodeJS.ProcessEnv,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let texto = ''
    filho.stdout.on('data', (p: Buffer) => void (texto += p.toString('utf8')))
    filho.stderr.on('data', (p: Buffer) => void (texto += p.toString('utf8')))
    const relogio = setTimeout(() => {
      filho.kill()
    }, prazoMs)
    filho.on('exit', (codigo, sinal) => {
      clearTimeout(relogio)
      resolver({ codigo, texto, terminou: sinal === null })
    })
  })
}

const base = (): Record<string, string | undefined> => {
  const env: Record<string, string | undefined> = { ...process.env, NODE_ENV: 'production' }
  for (const nome of ['JWT_SECRET', 'DATABASE_URL', 'ENCRYPTION_KEY', 'APP_URL']) delete env[nome]
  return env
}

describe('start de produção sem configuração', () => {
  it('termina com código diferente de zero e a saída cita os três nomes, sem nenhum valor', async () => {
    const r = await subirAteTerminar(3222, { ...base(), JWT_SECRET: undefined }, 60_000)
    expect(r.terminou).toBe(true)
    expect(r.codigo).not.toBe(0)
    for (const nome of ['JWT_SECRET', 'DATABASE_URL', 'ENCRYPTION_KEY']) expect(r.texto).toContain(nome)
    expect(r.texto).not.toMatch(/\n\s+at\s/)
  }, 90_000)

  it('um segredo curto derruba o start sem repetir o valor na saída', async () => {
    const curto = 'valor-curto-de-teste'
    const r = await subirAteTerminar(
      3223,
      { ...base(), JWT_SECRET: curto, DATABASE_URL: process.env.DATABASE_URL, ENCRYPTION_KEY: process.env.ENCRYPTION_KEY },
      60_000,
    )
    expect(r.terminou).toBe(true)
    expect(r.codigo).not.toBe(0)
    expect(r.texto).toContain('JWT_SECRET')
    expect(r.texto).not.toContain(curto)
  }, 90_000)
})

describe('start de produção com configuração completa', () => {
  it('sobe e responde, e APP_URL ausente vira só o aviso configuracao_aviso no log', async () => {
    const porta = 3224
    const env = { ...base(), JWT_SECRET: process.env.JWT_SECRET, DATABASE_URL: process.env.DATABASE_URL, ENCRYPTION_KEY: process.env.ENCRYPTION_KEY }
    const filho = spawn('npx', ['next', 'start', '-p', String(porta)], { env: env as unknown as NodeJS.ProcessEnv, stdio: ['ignore', 'pipe', 'pipe'] })
    let texto = ''
    filho.stdout.on('data', (p: Buffer) => void (texto += p.toString('utf8')))
    filho.stderr.on('data', (p: Buffer) => void (texto += p.toString('utf8')))
    try {
      let status = 0
      for (let i = 0; i < 80 && status === 0; i += 1) {
        try {
          status = (await fetch(`http://localhost:${porta}/entrar`)).status
        } catch {
          await new Promise((r) => setTimeout(r, 500))
        }
      }
      expect(status).toBe(200)
      const aviso = texto
        .split('\n')
        .filter((l) => l.startsWith('{'))
        .map((l) => JSON.parse(l) as Record<string, unknown>)
        .find((l) => l.msg === 'configuracao_aviso')
      expect(aviso).toMatchObject({ nivel: 'aviso' })
      expect(String(aviso!.aviso)).toContain('APP_URL')
    } finally {
      filho.kill()
    }
  }, 90_000)
})
