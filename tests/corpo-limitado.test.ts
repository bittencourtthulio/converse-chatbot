/**
 * T-03.01 (FT-13, PR-45, PR-106): `lerCorpoLimitado` lê um corpo em stream contando bytes e cancela a
 * leitura ao passar do teto, sem puxar o resto. É o que limita a memória do upload sem `Content-Length`.
 */
import { describe, it, expect } from 'vitest'
import { CorpoGrandeDemais, lerCorpoLimitado } from '@/lib/corpo-limitado'

const KB = 1024
const PEDACO = new Uint8Array(64 * KB).fill(7)

/** Um stream infinito de pedaços de 64 KB que conta quantos foram puxados e se foi cancelado. */
function streamInfinito() {
  const estado = { puxados: 0, cancelado: false }
  const corpo = new ReadableStream<Uint8Array>(
    {
      pull(c) {
        estado.puxados += 1
        c.enqueue(PEDACO)
      },
      cancel() {
        estado.cancelado = true
      },
    },
    { highWaterMark: 0 },
  )
  return { corpo, estado }
}

function streamDe(tamanho: number, pedaco = 10 * KB): ReadableStream<Uint8Array> {
  let resto = tamanho
  return new ReadableStream<Uint8Array>({
    pull(c) {
      if (resto <= 0) return c.close()
      const n = Math.min(pedaco, resto)
      resto -= n
      c.enqueue(new Uint8Array(n).fill(1))
    },
  })
}

describe('lerCorpoLimitado (integração)', () => {
  it('ao passar do teto lança CorpoGrandeDemais, cancela o stream e puxou no máximo 17 pedaços de 64 KB (teto de 1 MB)', async () => {
    const { corpo, estado } = streamInfinito()
    const erro = await lerCorpoLimitado(corpo, 1024 * KB).catch((e) => e)
    expect(erro).toBeInstanceOf(CorpoGrandeDemais)
    expect(erro.message).toMatch(/maior que o limite/)
    expect(estado.cancelado).toBe(true)
    expect(estado.puxados).toBeLessThanOrEqual(17)
    expect(estado.puxados).toBeGreaterThanOrEqual(16)
  })
})

describe('lerCorpoLimitado (funcional)', () => {
  it('um corpo de 100 KB sob o teto de 1 MB volta inteiro, na ordem', async () => {
    const lido = await lerCorpoLimitado(streamDe(100 * KB), 1024 * KB)
    expect(lido.length).toBe(100 * KB)
    expect(lido.every((b) => b === 1)).toBe(true)
  })

  it('um corpo exatamente do tamanho do teto passa e um byte acima lança', async () => {
    expect((await lerCorpoLimitado(streamDe(2048, 512), 2048)).length).toBe(2048)
    await expect(lerCorpoLimitado(streamDe(2049, 512), 2048)).rejects.toBeInstanceOf(CorpoGrandeDemais)
  })

  it('o teto vale mesmo com um único pedaço grande', async () => {
    const um = new ReadableStream<Uint8Array>({ start: (c) => (c.enqueue(new Uint8Array(5000)), c.close()) })
    await expect(lerCorpoLimitado(um, 4999)).rejects.toBeInstanceOf(CorpoGrandeDemais)
  })

  it('corpo nulo devolve vazio e o conteúdo é preservado byte a byte', async () => {
    expect((await lerCorpoLimitado(null, 10)).length).toBe(0)
    const a = new Uint8Array([1, 2, 3])
    const b = new Uint8Array([4, 5])
    const s = new ReadableStream<Uint8Array>({ start: (c) => (c.enqueue(a), c.enqueue(b), c.close()) })
    expect([...(await lerCorpoLimitado(s, 10))]).toEqual([1, 2, 3, 4, 5])
  })
})
