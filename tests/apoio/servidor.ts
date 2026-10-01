// Servidor de produção (`next start`) para os testes de rota: sobe numa porta,
// herda o ambiente do teste (banco, STORAGE_DIR, segredos) e espera ficar de pé.
// Exige `npm run build` antes. O OpenRouter não é chamado pelas rotas de fontes.
import { spawn, type ChildProcess } from 'node:child_process'
import { entrar } from '../../src/servicos/autenticacao.js'
import { COOKIE_SESSAO } from '../../src/lib/sessao.js'

export interface Servidor {
  base: string
  parar(): void
  /** Tudo que o servidor escreveu em stdout e stderr; vazio sem `capturarLogs`. */
  logs(): string
}

export async function subirServidor(
  porta: number,
  env: Record<string, string> = {},
  opcoes: { capturarLogs?: boolean } = {},
): Promise<Servidor> {
  const base = `http://localhost:${porta}`
  const processo: ChildProcess = spawn('npx', ['next', 'start', '-p', String(porta)], {
    env: { ...process.env, NODE_ENV: 'production', ...env },
    stdio: opcoes.capturarLogs ? ['ignore', 'pipe', 'pipe'] : 'ignore',
  })
  let saida = ''
  processo.stdout?.on('data', (parte: Buffer) => void (saida += parte.toString('utf8')))
  processo.stderr?.on('data', (parte: Buffer) => void (saida += parte.toString('utf8')))
  for (let tentativa = 0; tentativa < 80; tentativa += 1) {
    try {
      await fetch(`${base}/entrar`)
      return { base, parar: () => processo.kill(), logs: () => saida }
    } catch {
      await new Promise((r) => setTimeout(r, 500))
    }
  }
  processo.kill()
  throw new Error('O servidor não subiu a tempo.')
}

/** O cabeçalho Cookie de uma sessão válida para o usuário de teste. */
export async function cookieDe(email: string, senha: string): Promise<string> {
  return `${COOKIE_SESSAO}=${(await entrar({ email, senha })).token}`
}

/** Espera `verificar` devolver valor (ou lança ao estourar o prazo). */
export async function esperar<T>(verificar: () => Promise<T | undefined | false>, ms = 20_000): Promise<T> {
  const limite = Date.now() + ms
  for (;;) {
    const valor = await verificar()
    if (valor) return valor
    if (Date.now() > limite) throw new Error('A condição não se cumpriu a tempo.')
    await new Promise((r) => setTimeout(r, 200))
  }
}
