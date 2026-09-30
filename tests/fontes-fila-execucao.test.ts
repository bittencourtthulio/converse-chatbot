import { describe, it, expect, beforeEach, afterAll, vi, afterEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { criarFila, obterFila } from '@/servicos/fontes-fila'
import { limparBanco } from './ajuda'
import { armazenamentoDeTeste, criarAgenteDeTeste, criarFonteDeTeste } from './apoio/fontes'

let agenteId: string
beforeEach(async () => {
  await limparBanco()
  agenteId = (await criarAgenteDeTeste()).agente.id
})
afterEach(() => vi.restoreAllMocks())
afterAll(limparBanco)

const pausa = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function criarPendentes(n: number) {
  const ids: string[] = []
  for (let i = 0; i < n; i += 1) {
    const f = await criarFonteDeTeste({
      agenteId,
      titulo: `F${i}`,
      bytes: Buffer.from(`Conteúdo da fonte ${i}.`),
      criadoEm: new Date(Date.UTC(2026, 0, 1, 0, 0, i)),
    })
    ids.push(f.id)
  }
  return ids
}

describe('processarPendentes', () => {
  it('com cinco pendentes e extrator lento nunca passa de dois ao mesmo tempo e termina todas prontas', async () => {
    const ids = await criarPendentes(5)
    let ativos = 0
    let maximo = 0
    const fila = criarFila({
      armazenamento: armazenamentoDeTeste(),
      extrair: async ({ bytes }) => {
        ativos += 1
        maximo = Math.max(maximo, ativos)
        await pausa(40)
        ativos -= 1
        return Buffer.from(bytes).toString()
      },
    })

    expect(await fila.processarPendentes()).toBe(5)

    expect(maximo).toBe(2)
    const fontes = await prisma.fonte.findMany({ where: { id: { in: ids } } })
    expect(fontes.map((f) => f.status)).toEqual(Array(5).fill('pronto'))
  })

  it('processa a mais antiga primeiro e devolve 0 quando não há pendente', async () => {
    const ids = await criarPendentes(3)
    const ordem: string[] = []
    const fila = criarFila({
      armazenamento: armazenamentoDeTeste(),
      concorrencia: 1,
      extrair: async ({ bytes }) => {
        ordem.push(Buffer.from(bytes).toString())
        return 'ok'
      },
    })
    await fila.processarPendentes()
    expect(ordem).toEqual(['Conteúdo da fonte 0.', 'Conteúdo da fonte 1.', 'Conteúdo da fonte 2.'])
    expect(await fila.processarPendentes()).toBe(0)
    expect(ids).toHaveLength(3)
  })

  it('a falha de uma fonte grava erro nela e não derruba a fila', async () => {
    await criarPendentes(4)
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    let chamadas = 0
    const fila = criarFila({
      armazenamento: armazenamentoDeTeste(),
      extrair: async () => {
        chamadas += 1
        if (chamadas === 2) throw new Error('quebrou')
        return 'texto'
      },
    })
    await expect(fila.processarPendentes()).resolves.toBe(4)
    const status = (await prisma.fonte.findMany()).map((f) => f.status).sort()
    expect(status).toEqual(['erro', 'pronto', 'pronto', 'pronto'])
    expect(log).toHaveBeenCalledTimes(1)
  })

  it('fonte excluída durante o processamento tem o resultado descartado, sem erro nem log', async () => {
    const [id] = await criarPendentes(1)
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const fila = criarFila({
      armazenamento: armazenamentoDeTeste(),
      extrair: async () => {
        await prisma.fonte.delete({ where: { id: id! } })
        return 'texto que ninguém vai ver'
      },
    })
    await expect(fila.processarPendentes()).resolves.toBe(1)
    expect(await prisma.fonte.count()).toBe(0)
    expect(await prisma.trecho.count()).toBe(0)
    expect(log).not.toHaveBeenCalled()
  })
})

describe('retomar', () => {
  it('converte processando em pendente e deixa o resto como está', async () => {
    const interrompida = await criarFonteDeTeste({ agenteId, status: 'processando' })
    const pronta = await criarFonteDeTeste({ agenteId, status: 'pronto' })
    const comErro = await criarFonteDeTeste({ agenteId, status: 'erro' })
    const fila = criarFila({ armazenamento: armazenamentoDeTeste() })

    expect(await fila.retomar()).toBe(1)

    const status = async (id: string) => (await prisma.fonte.findUniqueOrThrow({ where: { id } })).status
    expect(await status(interrompida.id)).toBe('pendente')
    expect(await status(pronta.id)).toBe('pronto')
    expect(await status(comErro.id)).toBe('erro')
    expect(await fila.processarPendentes()).toBe(1)
    expect(await status(interrompida.id)).toBe('pronto')
  })
})

describe('acordar e iniciar', () => {
  it('acordar não faz nada antes de iniciar', async () => {
    const [id] = await criarPendentes(1)
    const fila = criarFila({ armazenamento: armazenamentoDeTeste() })
    fila.acordar()
    await fila.ocioso()
    await pausa(50)
    expect((await prisma.fonte.findUniqueOrThrow({ where: { id: id! } })).status).toBe('pendente')
  })

  it('depois de iniciar, processa as pendentes sem ser chamada de novo, e acordar pega as novas', async () => {
    const [id] = await criarPendentes(1)
    const fila = criarFila({ armazenamento: armazenamentoDeTeste() })
    fila.iniciar() // devolve na hora: o processamento segue em segundo plano
    await fila.ocioso()
    expect((await prisma.fonte.findUniqueOrThrow({ where: { id: id! } })).status).toBe('pronto')

    const nova = await criarFonteDeTeste({ agenteId, bytes: Buffer.from('Nova.') })
    fila.acordar()
    await fila.ocioso()
    expect((await prisma.fonte.findUniqueOrThrow({ where: { id: nova.id } })).status).toBe('pronto')
  })

  it('uma fonte que chega durante a drenagem também é processada', async () => {
    await criarPendentes(1)
    let solta: (() => void) | undefined
    const fila = criarFila({
      armazenamento: armazenamentoDeTeste(),
      extrair: () => new Promise<string>((r) => { solta = () => r('texto') }),
    })
    fila.iniciar()
    await pausa(30)
    const tardia = await criarFonteDeTeste({ agenteId, bytes: Buffer.from('Tardia.') })
    fila.acordar()
    solta?.()
    await pausa(30)
    solta?.()
    await fila.ocioso()
    expect((await prisma.fonte.findUniqueOrThrow({ where: { id: tardia.id } })).status).toBe('pronto')
  })
})

describe('singleton do processo', () => {
  it('obterFila devolve sempre a mesma fila', () => {
    expect(obterFila()).toBe(obterFila())
  })
})
