/**
 * Desligamento limpo (FT-11, PR-99): a fila para de reivindicar fontes e deixa a em curso terminar o passo
 * (ou a devolve a `pendente` ao fim do prazo), o desligamento para o expurgo, espera a auditoria e sai com
 * 0, e o servidor de produção, com NEXT_MANUAL_SIG_HANDLE, faz isso ao receber SIGTERM.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { prisma } from '../src/lib/prisma.js'
import { criarFila } from '../src/servicos/fontes-fila.js'
import { desligarComCalma } from '../src/instrumentation.js'
import { limparBanco } from './ajuda'
import { armazenamentoDeTeste, criarAgenteDeTeste, criarFonteDeTeste } from './apoio/fontes'

let agenteId: string
beforeEach(async () => {
  await limparBanco()
  agenteId = (await criarAgenteDeTeste()).agente.id
})
afterEach(() => vi.restoreAllMocks())

const statusDe = async (id: string) => (await prisma.fonte.findUniqueOrThrow({ where: { id } })).status

describe('fila de fontes: parar e aguardarEncerramento', () => {
  it('depois de parar() a fila não reivindica fonte nova', async () => {
    const a = await criarFonteDeTeste({ agenteId, bytes: Buffer.from('um') })
    const b = await criarFonteDeTeste({ agenteId, bytes: Buffer.from('dois') })
    const fila = criarFila({ armazenamento: armazenamentoDeTeste() })
    fila.parar()
    expect(await fila.processarPendentes()).toBe(0)
    expect(await statusDe(a.id)).toBe('pendente')
    expect(await statusDe(b.id)).toBe('pendente')
    // iniciar() depois de parar não religa: o processo está desligando.
    fila.iniciar()
    await fila.ocioso()
    expect(await statusDe(a.id)).toBe('pendente')
  })

  it('a fonte em curso termina o passo e as seguintes ficam pendentes; aguardarEncerramento resolve verdadeiro', async () => {
    const a = await criarFonteDeTeste({ agenteId, bytes: Buffer.from('um') })
    const b = await criarFonteDeTeste({ agenteId, bytes: Buffer.from('dois') })
    let liberar: () => void = () => undefined
    const travada = new Promise<void>((r) => void (liberar = r))
    let entrou: () => void = () => undefined
    const comecou = new Promise<void>((r) => void (entrou = r))
    const fila = criarFila({
      armazenamento: armazenamentoDeTeste(),
      concorrencia: 1,
      extrair: async () => {
        entrou()
        await travada
        return 'texto extraído'
      },
    })
    const emCurso = fila.processarPendentes()
    await comecou
    fila.parar()
    liberar()
    await emCurso
    expect(await fila.aguardarEncerramento(2_000)).toBe(true)
    const status = [await statusDe(a.id), await statusDe(b.id)].sort()
    expect(status).toEqual(['pendente', 'pronto'])
  })

  it('passado o prazo com a fonte ainda em curso, devolve falso e já a marca como pendente para o próximo start', async () => {
    const a = await criarFonteDeTeste({ agenteId, bytes: Buffer.from('um') })
    let liberar: () => void = () => undefined
    const travada = new Promise<void>((r) => void (liberar = r))
    let entrou: () => void = () => undefined
    const comecou = new Promise<void>((r) => void (entrou = r))
    const fila = criarFila({
      armazenamento: armazenamentoDeTeste(),
      extrair: async () => {
        entrou()
        await travada
        return 'texto'
      },
    })
    const emCurso = fila.processarPendentes()
    await comecou
    expect(await statusDe(a.id)).toBe('processando')
    fila.parar()
    expect(await fila.aguardarEncerramento(60)).toBe(false)
    expect(await statusDe(a.id)).toBe('pendente')
    liberar()
    await emCurso
  })

  it('sem nada em curso aguardarEncerramento resolve verdadeiro na hora', async () => {
    const fila = criarFila({ armazenamento: armazenamentoDeTeste() })
    fila.parar()
    expect(await fila.aguardarEncerramento(1_000)).toBe(true)
  })
})

describe('desligarComCalma', () => {
  it('para o expurgo e a fila, espera a fila e a auditoria nessa ordem e sai com 0', async () => {
    const chamadas: string[] = []
    const sair = vi.fn()
    vi.spyOn(console, 'info').mockImplementation(() => undefined)
    await desligarComCalma({
      agendador: { parar: () => void chamadas.push('expurgo.parar') },
      fila: {
        parar: () => void chamadas.push('fila.parar'),
        aguardarEncerramento: async (prazo) => {
          chamadas.push(`fila.aguardar(${prazo})`)
          return true
        },
      },
      auditoria: async () => void chamadas.push('auditoria.aguardar'),
      prazoDaFilaMs: 1234,
      sair,
    })
    expect(chamadas).toEqual(['expurgo.parar', 'fila.parar', 'fila.aguardar(1234)', 'auditoria.aguardar'])
    expect(sair).toHaveBeenCalledExactlyOnceWith(0)
  })

  it('uma falha em um passo não impede os outros nem a saída, e vira linha de log com o nome do erro', async () => {
    const sair = vi.fn()
    const erro = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(console, 'info').mockImplementation(() => undefined)
    await desligarComCalma({
      agendador: {
        parar: () => {
          throw new Error('quebrou o agendador /var/x')
        },
      },
      fila: { parar: () => undefined, aguardarEncerramento: async () => false },
      auditoria: async () => undefined,
      sair,
    })
    expect(sair).toHaveBeenCalledExactlyOnceWith(0)
    const linhas = erro.mock.calls.map((c) => String(c[0]))
    expect(linhas.some((l) => l.includes('desligamento_falhou') && l.includes('"erro":"Error"'))).toBe(true)
    expect(linhas.join('\n')).not.toContain('/var/x')
  })
})

describe('servidor de produção (exige npm run build)', () => {
  it('com NEXT_MANUAL_SIG_HANDLE o SIGTERM encerra com 0 e as linhas desligamento_iniciado e desligamento_concluido', async () => {
    const porta = 3231
    const filho = spawn(process.execPath, [path.join('node_modules', 'next', 'dist', 'bin', 'next'), 'start', '-p', String(porta)], {
      env: { ...process.env, NODE_ENV: 'production', NEXT_MANUAL_SIG_HANDLE: '1' } as unknown as NodeJS.ProcessEnv,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let saida = ''
    filho.stdout.on('data', (p: Buffer) => void (saida += p.toString('utf8')))
    filho.stderr.on('data', (p: Buffer) => void (saida += p.toString('utf8')))
    const terminou = new Promise<{ codigo: number | null; sinal: string | null }>((resolver) => filho.on('exit', (codigo, sinal) => resolver({ codigo, sinal })))
    let pronto = false
    for (let i = 0; i < 80 && !pronto; i += 1) {
      try {
        pronto = (await fetch(`http://localhost:${porta}/entrar`)).status === 200
      } catch {
        await new Promise((r) => setTimeout(r, 500))
      }
    }
    expect(pronto).toBe(true)
    filho.kill('SIGTERM')
    filho.kill('SIGTERM') // o segundo sinal não reinicia o desligamento
    const fim = await Promise.race([terminou, new Promise<never>((_, rejeitar) => setTimeout(() => rejeitar(new Error('o servidor não encerrou em 30 s')), 30_000))])
    expect(fim).toEqual({ codigo: 0, sinal: null })
    const msgs = saida
      .split('\n')
      .filter((l) => l.startsWith('{'))
      .map((l) => (JSON.parse(l) as { msg: string }).msg)
    expect(msgs).toEqual(expect.arrayContaining(['desligamento_iniciado', 'desligamento_concluido']))
    expect(msgs.indexOf('desligamento_iniciado')).toBeLessThan(msgs.indexOf('desligamento_concluido'))
    expect(msgs.filter((m) => m === 'desligamento_iniciado')).toHaveLength(1)
  }, 120_000)
})
