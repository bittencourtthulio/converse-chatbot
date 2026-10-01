import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { criarFila, type Fila } from '@/servicos/fontes-fila'
import { register } from '@/instrumentation'
import { aguardarGravacoesPendentes } from '@/servicos/auditoria'
import { desligarAuditoria } from '@/servicos/auditoria-ouvintes'
import { apagarConversas } from '@/servicos/historico'
import { criarAgendadorDoExpurgo, type AgendadorDoExpurgo } from '@/servicos/expurgo'
import { criarAdmin } from './ajuda'
import { criarConversaDeTeste } from './apoio/historico'
import { limparBanco } from './ajuda'
import { armazenamentoDeTeste, criarAgenteDeTeste, criarFonteDeTeste } from './apoio/fontes'

const CHAVE = Symbol.for('converse.filaDeFontes')
const global_ = globalThis as unknown as Record<symbol, Fila | undefined>
const CHAVE_DO_AGENDADOR = Symbol.for('converse.agendadorDoExpurgo')
const globalAgendador = globalThis as unknown as Record<symbol, AgendadorDoExpurgo | undefined>
const runtimeOriginal = process.env.NEXT_RUNTIME

let agenteId: string
beforeEach(async () => {
  await limparBanco()
  agenteId = (await criarAgenteDeTeste()).agente.id
})
afterEach(() => {
  globalAgendador[CHAVE_DO_AGENDADOR]?.parar()
  delete globalAgendador[CHAVE_DO_AGENDADOR]
  desligarAuditoria()
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

  it('liga a auditoria na subida: depois de register, apagar conversa grava o registro (FT-10)', async () => {
    process.env.NEXT_RUNTIME = 'nodejs'
    global_[CHAVE] = criarFila({ armazenamento: armazenamentoDeTeste() })
    const admin = await criarAdmin()
    const c = await criarConversaDeTeste({ agenteId, canal: 'widget', mensagens: [{ papel: 'user', conteudo: 'x' }] })
    await apagarConversas([c.id], admin.id)
    await aguardarGravacoesPendentes()
    expect(await prisma.registroDeAuditoria.count()).toBe(0)

    await register()
    const d = await criarConversaDeTeste({ agenteId, canal: 'widget', mensagens: [{ papel: 'user', conteudo: 'y' }] })
    await apagarConversas([d.id], admin.id)
    await aguardarGravacoesPendentes()
    expect(await prisma.registroDeAuditoria.count()).toBe(1)
  })

  it('fora do runtime Node a auditoria não é ligada, e a ligação é por import dinâmico', async () => {
    process.env.NEXT_RUNTIME = 'edge'
    await register()
    const admin = await criarAdmin()
    const c = await criarConversaDeTeste({ agenteId, canal: 'widget', mensagens: [{ papel: 'user', conteudo: 'x' }] })
    await apagarConversas([c.id], admin.id)
    await aguardarGravacoesPendentes()
    expect(await prisma.registroDeAuditoria.count()).toBe(0)
    const fonte = readFileSync(path.resolve(process.cwd(), 'src/instrumentation.ts'), 'utf8')
    expect(fonte).toMatch(/await import\('@\/servicos\/auditoria-ouvintes'\)/)
  })

  it('inicia o expurgo na subida sem esperar a primeira rodada (FT-10)', async () => {
    process.env.NEXT_RUNTIME = 'nodejs'
    global_[CHAVE] = criarFila({ armazenamento: armazenamentoDeTeste() })
    const agendados: Array<{ fn: () => void; ms: number }> = []
    const executar = vi.fn(async () => undefined)
    globalAgendador[CHAVE_DO_AGENDADOR] = criarAgendadorDoExpurgo({
      executar,
      agendar: (fn, ms) => {
        agendados.push({ fn, ms })
        return agendados.length
      },
      cancelar: () => undefined,
    })
    await register()
    expect(globalAgendador[CHAVE_DO_AGENDADOR]?.ativo()).toBe(true)
    expect(executar).not.toHaveBeenCalled()
    expect(agendados.map((a) => a.ms)).toEqual([60_000])
  })

  it('falha ao iniciar o expurgo vai para o log e não impede a fila de subir', async () => {
    process.env.NEXT_RUNTIME = 'nodejs'
    const fonte = await criarFonteDeTeste({ agenteId, status: 'processando', bytes: Buffer.from('Texto.') })
    const fila = criarFila({ armazenamento: armazenamentoDeTeste() })
    global_[CHAVE] = fila
    globalAgendador[CHAVE_DO_AGENDADOR] = {
      iniciar: () => {
        throw new Error('quebrou /var/x')
      },
      parar: () => undefined,
      ativo: () => false,
      ocioso: async () => undefined,
    }
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await expect(register()).resolves.toBeUndefined()
    await fila.ocioso()
    expect(await statusDe(fonte.id)).toBe('pronto')
    const linhas = log.mock.calls.map((c) => String(c[0]))
    expect(linhas).toEqual([JSON.stringify({ evento: 'expurgo_nao_iniciou' })])
  })

  it('fora do runtime Node o expurgo não é iniciado, e a importação é dinâmica', async () => {
    process.env.NEXT_RUNTIME = 'edge'
    const executar = vi.fn(async () => undefined)
    const ag = criarAgendadorDoExpurgo({ executar, agendar: () => 1, cancelar: () => undefined })
    globalAgendador[CHAVE_DO_AGENDADOR] = ag
    await register()
    expect(ag.ativo()).toBe(false)
    const fonte = readFileSync(path.resolve(process.cwd(), 'src/instrumentation.ts'), 'utf8')
    expect(fonte).toMatch(/await import\('@\/servicos\/expurgo'\)/)
  })
})
