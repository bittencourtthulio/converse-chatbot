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
    expect(linha).toMatchObject({ nivel: 'erro', msg: 'fila_nao_iniciou', erro: 'Error' })
    expect(JSON.stringify(linha)).not.toMatch(/\/var|indisponível/)
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
      ultimaExecucaoEm: () => null,
      ocioso: async () => undefined,
    }
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await expect(register()).resolves.toBeUndefined()
    await fila.ocioso()
    expect(await statusDe(fonte.id)).toBe('pronto')
    const linhas = log.mock.calls.map((c) => JSON.parse(String(c[0])) as Record<string, unknown>)
    expect(linhas).toHaveLength(1)
    expect(linhas[0]).toMatchObject({ nivel: 'erro', msg: 'expurgo_nao_iniciou', erro: 'Error' })
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

describe('register e a configuração de produção (FT-11, PR-94)', () => {
  const NOMES = ['NODE_ENV', 'JWT_SECRET', 'DATABASE_URL', 'ENCRYPTION_KEY', 'APP_URL']
  const guardadas = NOMES.map((n) => [n, process.env[n]] as const)
  const FILTRO = Symbol.for('converse.filtroDoConsoleDoNext')
  const atribuir = (nome: string, valor: string | undefined) => {
    if (valor === undefined) delete process.env[nome]
    else Object.assign(process.env, { [nome]: valor })
  }
  afterEach(() => {
    for (const [n, v] of guardadas) atribuir(n, v)
    delete (globalThis as unknown as Record<symbol, unknown>)[FILTRO]
  })

  it('em produção sem as variáveis obrigatórias lança antes de ligar a fila, o expurgo e a auditoria, e loga só os nomes', async () => {
    process.env.NEXT_RUNTIME = 'nodejs'
    const iniciar = vi.fn()
    global_[CHAVE] = { retomar: vi.fn(), iniciar } as unknown as Fila
    atribuir('NODE_ENV', 'production')
    for (const n of ['JWT_SECRET', 'DATABASE_URL', 'ENCRYPTION_KEY']) delete process.env[n]
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(register()).rejects.toThrow(/JWT_SECRET.*DATABASE_URL.*ENCRYPTION_KEY/)

    expect(iniciar).not.toHaveBeenCalled()
    expect(globalAgendador[CHAVE_DO_AGENDADOR]).toBeUndefined()
    const linha = log.mock.calls.map((c) => String(c[0])).find((l) => l.includes('configuracao_invalida'))!
    expect(JSON.parse(linha)).toMatchObject({ nivel: 'erro', msg: 'configuracao_invalida' })
    expect(linha).toContain('JWT_SECRET')
  })

  it('em produção com tudo definido e APP_URL sem HTTPS segue e grava só o aviso', async () => {
    process.env.NEXT_RUNTIME = 'nodejs'
    atribuir('NODE_ENV', 'production')
    atribuir('JWT_SECRET', 'x'.repeat(40))
    atribuir('DATABASE_URL', 'file:./prisma/test.db')
    atribuir('ENCRYPTION_KEY', '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff')
    atribuir('APP_URL', 'http://converse.exemplo.com.br')
    global_[CHAVE] = criarFila({ armazenamento: armazenamentoDeTeste() })
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    await expect(register()).resolves.toBeUndefined()

    const linhas = aviso.mock.calls.map((c) => JSON.parse(String(c[0])) as Record<string, unknown>)
    expect(linhas).toHaveLength(1)
    expect(linhas[0]).toMatchObject({ nivel: 'aviso', msg: 'configuracao_aviso' })
    expect(String(linhas[0]!.aviso)).toContain('HTTPS')
  })

  it('fora de produção não valida nada e não lança sem as variáveis', async () => {
    process.env.NEXT_RUNTIME = 'nodejs'
    atribuir('NODE_ENV', 'test')
    for (const n of ['JWT_SECRET', 'ENCRYPTION_KEY']) delete process.env[n]
    global_[CHAVE] = criarFila({ armazenamento: armazenamentoDeTeste() })
    await expect(register()).resolves.toBeUndefined()
  })
})
