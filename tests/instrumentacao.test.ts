import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { criarFila, type Fila } from '@/servicos/fontes-fila'
import { register } from '@/instrumentation'
import { limparBanco } from './ajuda'
import { armazenamentoDeTeste, criarAgenteDeTeste, criarFonteDeTeste } from './apoio/fontes'

const CHAVE = Symbol.for('converse.filaDeFontes')
const global_ = globalThis as unknown as Record<symbol, Fila | undefined>
const runtimeOriginal = process.env.NEXT_RUNTIME

let agenteId: string
beforeEach(async () => {
  await limparBanco()
  agenteId = (await criarAgenteDeTeste()).agente.id
})
afterEach(() => {
  delete global_[CHAVE]
  if (runtimeOriginal === undefined) delete process.env.NEXT_RUNTIME
  else process.env.NEXT_RUNTIME = runtimeOriginal
  vi.restoreAllMocks()
})
afterAll(limparBanco)

const statusDe = async (id: string) => (await prisma.fonte.findUniqueOrThrow({ where: { id } })).status

describe('register (src/instrumentation.ts)', () => {
  it('no runtime Node devolve a fonte interrompida a pendente, liga a fila e ela chega a pronto', async () => {
    const interrompida = await criarFonteDeTeste({ agenteId, status: 'processando', bytes: Buffer.from('Texto.') })
    const fila = criarFila({ armazenamento: armazenamentoDeTeste() })
    global_[CHAVE] = fila
    process.env.NEXT_RUNTIME = 'nodejs'

    await register()
    await fila.ocioso()

    expect(await statusDe(interrompida.id)).toBe('pronto')
  })

  it('devolve sem esperar o fim do processamento de uma fonte lenta', async () => {
    const f = await criarFonteDeTeste({ agenteId, status: 'processando', bytes: Buffer.from('Texto.') })
    let solta: (() => void) | undefined
    const fila = criarFila({
      armazenamento: armazenamentoDeTeste(),
      extrair: () => new Promise<string>((r) => { solta = () => r('texto') }),
    })
    global_[CHAVE] = fila
    process.env.NEXT_RUNTIME = 'nodejs'

    const inicio = Date.now()
    await register()
    expect(Date.now() - inicio).toBeLessThan(2000)
    expect(await statusDe(f.id)).not.toBe('pronto')

    await vi.waitFor(() => expect(solta).toBeDefined())
    solta?.()
    await fila.ocioso()
    expect(await statusDe(f.id)).toBe('pronto')
  })

  it('no runtime edge ou sem runtime não faz nada', async () => {
    const f = await criarFonteDeTeste({ agenteId, status: 'processando' })
    const pendente = await criarFonteDeTeste({ agenteId, status: 'pendente' })
    const fila = criarFila({ armazenamento: armazenamentoDeTeste() })
    global_[CHAVE] = fila

    for (const runtime of ['edge', undefined]) {
      if (runtime === undefined) delete process.env.NEXT_RUNTIME
      else process.env.NEXT_RUNTIME = runtime
      await register()
    }
    await fila.ocioso()

    expect(await statusDe(f.id)).toBe('processando')
    expect(await statusDe(pendente.id)).toBe('pendente')
  })

  it('banco vazio não lança, e falha na retomada vai para o log sem impedir a subida', async () => {
    process.env.NEXT_RUNTIME = 'nodejs'
    global_[CHAVE] = criarFila({ armazenamento: armazenamentoDeTeste() })
    await expect(register()).resolves.toBeUndefined()

    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const quebrada = {
      retomar: () => Promise.reject(new Error('banco indisponível /var/x')),
      iniciar: vi.fn(),
    } as unknown as Fila
    global_[CHAVE] = quebrada
    await expect(register()).resolves.toBeUndefined()
    expect(log).toHaveBeenCalledTimes(1)
    const linha = JSON.parse(String(log.mock.calls[0]![0])) as Record<string, string>
    expect(linha.evento).toBe('fila_nao_iniciou')
    expect(JSON.stringify(linha)).not.toMatch(/\/var/)
  })

  it('importa a fila por import dinâmico, para não carregá-la fora do runtime Node', () => {
    const fonte = readFileSync(path.resolve(process.cwd(), 'src/instrumentation.ts'), 'utf8')
    expect(fonte).toMatch(/await import\('@\/servicos\/fontes-fila'\)/)
    expect(fonte).not.toMatch(/^import .*fontes-fila/m)
  })
})
