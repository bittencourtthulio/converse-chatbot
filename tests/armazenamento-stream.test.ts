/**
 * T-03.01 (FT-08): `gravarDeStream` escreve o corpo em `original.parcial` por
 * stream, conta os bytes, aborta no teto, confere os primeiros bytes e só
 * então renomeia para `original`; qualquer falha apaga o parcial (PR-71).
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { criarArmazenamento } from '@/lib/armazenamento'
import { ErroDeAplicacao } from '@/lib/erros'

let pai: string
let raiz: string
beforeEach(() => {
  pai = mkdtempSync(path.join(os.tmpdir(), 'armazenamento-stream-'))
  raiz = path.join(pai, 'raiz')
})
afterEach(() => rmSync(pai, { recursive: true, force: true }))

const diretorio = (a = 'agente1', f = 'fonte1') => path.join(raiz, 'fontes', a, f)

/** Um stream de pedaços, com marcação de cancelamento. */
function fluxo(pedacos: Uint8Array[], opcoes: { falhaDepois?: number } = {}) {
  const estado = { cancelado: false, lidos: 0 }
  let i = 0
  const stream = new ReadableStream<Uint8Array>({
    pull(controle) {
      if (opcoes.falhaDepois !== undefined && i >= opcoes.falhaDepois) {
        controle.error(new Error('conexão caiu'))
        return
      }
      if (i >= pedacos.length) return controle.close()
      estado.lidos += 1
      controle.enqueue(pedacos[i++]!)
    },
    cancel() {
      estado.cancelado = true
    },
  })
  return { stream, estado }
}
const pedacosDe = (total: number, tamanho = 65536) => {
  const bruto = randomBytes(total)
  const pedacos: Uint8Array[] = []
  for (let i = 0; i < total; i += tamanho) pedacos.push(bruto.subarray(i, Math.min(total, i + tamanho)))
  return { bruto, pedacos }
}

describe('gravarDeStream', () => {
  it('um stream de 5 MB vira o original com os mesmos bytes, sem parcial, e devolve caminho e tamanho', async () => {
    const { bruto, pedacos } = pedacosDe(5 * 1024 * 1024)
    const armazenamento = criarArmazenamento(raiz)
    const r = await armazenamento.gravarDeStream('agente1', 'fonte1', fluxo(pedacos).stream, { maxBytes: 10 * 1024 * 1024 })
    expect(r).toEqual({ caminho: 'fontes/agente1/fonte1/original', tamanhoBytes: 5 * 1024 * 1024 })
    expect(readFileSync(path.join(diretorio(), 'original')).equals(bruto)).toBe(true)
    expect(readdirSync(diretorio())).toEqual(['original'])
    expect(statSync(path.join(diretorio(), 'original')).mode & 0o777).toBe(0o600)
  })

  it('acima do teto aborta com 413, cancela a leitura e apaga o parcial', async () => {
    const { pedacos } = pedacosDe(300_000, 10_000)
    const { stream, estado } = fluxo(pedacos)
    const armazenamento = criarArmazenamento(raiz)
    const erro = await armazenamento.gravarDeStream('agente1', 'fonte1', stream, { maxBytes: 100_000 }).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroDeAplicacao)
    expect(erro.status).toBe(413)
    expect(erro.codigo).toBe('arquivo_grande_demais')
    expect(estado.cancelado).toBe(true)
    expect(estado.lidos).toBeLessThan(pedacos.length)
    expect(existsSync(path.join(diretorio(), 'original'))).toBe(false)
    expect(existsSync(path.join(diretorio(), 'original.parcial'))).toBe(false)
  })

  it('um conferidor de início que rejeita apaga o parcial e o erro dele sobe', async () => {
    const { pedacos } = pedacosDe(200_000)
    const { stream, estado } = fluxo(pedacos)
    const armazenamento = criarArmazenamento(raiz)
    const erro = await armazenamento
      .gravarDeStream('agente1', 'fonte1', stream, {
        maxBytes: 1_000_000,
        conferirInicio: () => {
          throw new ErroDeAplicacao('assinatura ruim', 415, 'assinatura_incoerente')
        },
      })
      .catch((e) => e)
    expect(erro.codigo).toBe('assinatura_incoerente')
    expect(estado.cancelado).toBe(true)
    expect(existsSync(path.join(diretorio(), 'original.parcial'))).toBe(false)
    expect(existsSync(path.join(diretorio(), 'original'))).toBe(false)
  })

  it('um stream que falha no meio apaga o parcial', async () => {
    const { pedacos } = pedacosDe(300_000, 10_000)
    const { stream } = fluxo(pedacos, { falhaDepois: 5 })
    const armazenamento = criarArmazenamento(raiz)
    await expect(armazenamento.gravarDeStream('agente1', 'fonte1', stream, { maxBytes: 1_000_000 })).rejects.toThrow()
    expect(existsSync(path.join(diretorio(), 'original.parcial'))).toBe(false)
    expect(existsSync(path.join(diretorio(), 'original'))).toBe(false)
  })

  it('o conferidor recebe os primeiros bytes mesmo quando chegam de um em um, e o total ao fim', async () => {
    const um = Array.from({ length: 40 }, (_, i) => Uint8Array.of(i))
    let visto: Uint8Array | null = null
    let chamadas = 0
    const armazenamento = criarArmazenamento(raiz)
    await armazenamento.gravarDeStream('agente1', 'fonte1', fluxo(um).stream, {
      maxBytes: 1000,
      bytesDeInicio: 12,
      conferirInicio: (b) => {
        visto = Uint8Array.from(b)
        chamadas += 1
      },
    })
    expect(chamadas).toBe(1)
    expect([...visto!]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  })

  it('um stream vazio chama o conferidor com zero bytes e o erro dele apaga tudo', async () => {
    const armazenamento = criarArmazenamento(raiz)
    let recebido = -1
    const erro = await armazenamento
      .gravarDeStream('agente1', 'fonte1', fluxo([]).stream, {
        maxBytes: 1000,
        conferirInicio: (b) => {
          recebido = b.length
          throw new ErroDeAplicacao('vazio', 422, 'arquivo_vazio')
        },
      })
      .catch((e) => e)
    expect(recebido).toBe(0)
    expect(erro.codigo).toBe('arquivo_vazio')
    expect(existsSync(path.join(diretorio(), 'original'))).toBe(false)
  })

  it('id fora do alfabeto fechado é recusado antes de tocar o disco', async () => {
    const armazenamento = criarArmazenamento(raiz)
    for (const [a, f] of [['../x', 'f'], ['a', 'f/../../g'], ['a b', 'f']] as const) {
      await expect(armazenamento.gravarDeStream(a, f, fluxo([Uint8Array.of(1)]).stream, { maxBytes: 10 })).rejects.toMatchObject({
        codigo: 'armazenamento_invalido',
      })
    }
    expect(existsSync(raiz)).toBe(false)
  })
})
