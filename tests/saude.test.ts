/**
 * O serviço de saúde (FT-11, PR-95): banco (SELECT 1 com prazo), diretório de dados gravável, tabela
 * FTS5 e mídia. `degradado` (ffmpeg ou ffprobe ausente) não é `falha`; a sonda de mídia é guardada
 * por 60 segundos para o endpoint público não poder ser usado para disparar processos em série.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, readdirSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { prisma } from '../src/lib/prisma.js'
import { ambiente } from '../src/lib/ambiente.js'
import { reiniciarCacheDaSaude, verificarSaude } from '../src/servicos/saude.js'

const MIDIA_OK = async () => ({ ffmpeg: true, ffprobe: true, versao: 'ffmpeg version teste' })
const MIDIA_SEM_FFMPEG = async () => ({ ffmpeg: false, ffprobe: true, versao: null })
const temporarios: string[] = []

beforeEach(() => reiniciarCacheDaSaude())
afterEach(() => {
  vi.restoreAllMocks()
  for (const d of temporarios.splice(0)) rmSync(d, { recursive: true, force: true })
})

const situacaoDe = (s: Awaited<ReturnType<typeof verificarSaude>>, nome: string) => s.itens.find((i) => i.nome === nome)?.situacao

describe('verificarSaude', () => {
  it('banco, storage e FTS5 sadios com a mídia presente dão ok, com os quatro itens ok', async () => {
    const s = await verificarSaude({ midia: MIDIA_OK })
    expect(s.status).toBe('ok')
    expect(s.itens.map((i) => [i.nome, i.situacao])).toEqual([
      ['banco', 'ok'],
      ['disco', 'ok'],
      ['busca', 'ok'],
      ['midia', 'ok'],
    ])
  })

  it('sem ffmpeg ou sem ffprobe é degradado, nunca falha', async () => {
    const s = await verificarSaude({ midia: MIDIA_SEM_FFMPEG })
    expect(s.status).toBe('degradado')
    expect(situacaoDe(s, 'midia')).toBe('degradado')
    expect(situacaoDe(s, 'banco')).toBe('ok')
    reiniciarCacheDaSaude()
    const so = await verificarSaude({ midia: async () => ({ ffmpeg: true, ffprobe: false, versao: 'x' }) })
    expect(so.status).toBe('degradado')
  })

  it('a sonda de mídia que lança vira degradado, não derruba a verificação', async () => {
    const s = await verificarSaude({
      midia: async () => {
        throw new Error('spawn quebrou')
      },
    })
    expect(s.status).toBe('degradado')
  })

  it('banco que não responde no prazo é falha e a verificação não espera mais que o prazo', async () => {
    vi.spyOn(prisma, '$queryRaw').mockImplementation((() => new Promise(() => undefined)) as never)
    const inicio = Date.now()
    const s = await verificarSaude({ midia: MIDIA_OK, prazoDoBancoMs: 60 })
    expect(Date.now() - inicio).toBeLessThan(2000)
    expect(s.status).toBe('falha')
    expect(situacaoDe(s, 'banco')).toBe('falha')
  })

  it('banco que lança é falha, sem a mensagem do erro no resultado', async () => {
    vi.spyOn(prisma, '$queryRaw').mockRejectedValue(new Error('SQLITE_CORRUPT em /var/dados/segredo.db'))
    const s = await verificarSaude({ midia: MIDIA_OK })
    expect(s.status).toBe('falha')
    expect(JSON.stringify(s)).not.toMatch(/SQLITE|segredo|\/var/)
  })

  it('tabela trechos_fts ausente é falha na busca', async () => {
    const original = prisma.$queryRaw.bind(prisma)
    vi.spyOn(prisma, '$queryRaw').mockImplementation(((strings: TemplateStringsArray, ...resto: unknown[]) =>
      strings.join('').includes('sqlite_master') ? Promise.resolve([]) : original(strings, ...resto)) as never)
    const s = await verificarSaude({ midia: MIDIA_OK })
    expect(s.status).toBe('falha')
    expect(situacaoDe(s, 'busca')).toBe('falha')
    expect(situacaoDe(s, 'banco')).toBe('ok')
  })

  it('diretório de dados que não aceita gravação é falha no disco, e a prova de gravação não deixa arquivo', async () => {
    const pasta = mkdtempSync(path.join(os.tmpdir(), 'converse-saude-'))
    temporarios.push(pasta)
    const arquivo = path.join(pasta, 'e-um-arquivo')
    writeFileSync(arquivo, 'x')
    const ruim = await verificarSaude({ midia: MIDIA_OK, storageDir: path.join(arquivo, 'dentro') })
    expect(ruim.status).toBe('falha')
    expect(situacaoDe(ruim, 'disco')).toBe('falha')

    const bom = await verificarSaude({ midia: MIDIA_OK, storageDir: path.join(pasta, 'novo-storage') })
    expect(situacaoDe(bom, 'disco')).toBe('ok')
    expect(readdirSync(path.join(pasta, 'novo-storage'))).toEqual([])
  })

  it('usa o storage do ambiente quando não recebe outro', async () => {
    const s = await verificarSaude({ midia: MIDIA_OK })
    expect(situacaoDe(s, 'disco')).toBe('ok')
    expect(readdirSync(ambiente.storageDir).filter((n) => n.startsWith('.saude'))).toEqual([])
  })
})

describe('cache da sonda de mídia', () => {
  it('duas verificações em 60 segundos rodam a sonda uma vez; passados os 60 segundos, de novo', async () => {
    const sonda = vi.fn(MIDIA_OK)
    let agora = 1_000_000
    await verificarSaude({ midia: sonda, agora: () => agora })
    agora += 59_000
    await verificarSaude({ midia: sonda, agora: () => agora })
    expect(sonda).toHaveBeenCalledTimes(1)
    agora += 2_000
    await verificarSaude({ midia: sonda, agora: () => agora })
    expect(sonda).toHaveBeenCalledTimes(2)
  })

  it('verificações simultâneas compartilham a mesma sonda', async () => {
    const sonda = vi.fn(async () => {
      await new Promise((r) => setTimeout(r, 30))
      return { ffmpeg: true, ffprobe: true, versao: 'x' }
    })
    await Promise.all([verificarSaude({ midia: sonda }), verificarSaude({ midia: sonda }), verificarSaude({ midia: sonda })])
    expect(sonda).toHaveBeenCalledTimes(1)
  })
})
