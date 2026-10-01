/**
 * T-03.02 (FT-08): pastas de trabalho do vídeo dentro da pasta da fonte
 * (`audio/` e `segmentos/NN.txt`) e o caminho absoluto interno do original
 * (PR-72, PR-74). Só ids de alfabeto fechado entram no caminho (PR-47).
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { criarArmazenamento } from '@/lib/armazenamento'

let pai: string
let raiz: string
beforeEach(() => {
  pai = mkdtempSync(path.join(os.tmpdir(), 'armazenamento-segmentos-'))
  raiz = path.join(pai, 'raiz')
})
afterEach(() => rmSync(pai, { recursive: true, force: true }))

describe('pastas de trabalho e segmentos', () => {
  it('gravar os segmentos 0 e 2 e listar devolve exatamente esses índices, lendo o texto de cada um', async () => {
    const a = criarArmazenamento(raiz)
    await a.gravarSegmento('ag', 'fo', 0, '[00:00] primeira parte')
    await a.gravarSegmento('ag', 'fo', 2, 'terceira parte com acentuação ção')
    expect(await a.listarSegmentos('ag', 'fo')).toEqual([0, 2])
    expect(await a.lerSegmento('ag', 'fo', 0)).toBe('[00:00] primeira parte')
    expect(await a.lerSegmento('ag', 'fo', 2)).toBe('terceira parte com acentuação ção')
    expect(await a.lerSegmento('ag', 'fo', 1)).toBeNull()
    expect(readdirSync(path.join(raiz, 'fontes/ag/fo/segmentos')).sort()).toEqual(['00.txt', '02.txt'])
  })

  it('listar sem pasta devolve vazio e ignora arquivo que não é segmento', async () => {
    const a = criarArmazenamento(raiz)
    expect(await a.listarSegmentos('ag', 'fo')).toEqual([])
    await a.gravarSegmento('ag', 'fo', 1, 'x')
    writeFileSync(path.join(raiz, 'fontes/ag/fo/segmentos/lixo.txt'), 'x')
    writeFileSync(path.join(raiz, 'fontes/ag/fo/segmentos/03.txt.parcial'), 'x')
    expect(await a.listarSegmentos('ag', 'fo')).toEqual([1])
  })

  it('apagar a pasta de trabalho remove áudio e segmentos mas mantém o original', async () => {
    const a = criarArmazenamento(raiz)
    await a.gravar('ag', 'fo', Buffer.from('original'))
    await a.gravarSegmento('ag', 'fo', 0, 'x')
    const audio = a.pastaDeTrabalho('ag', 'fo', 'audio')
    await import('node:fs/promises').then((fs) => fs.mkdir(audio, { recursive: true }))
    writeFileSync(path.join(audio, '000.mp3'), 'x')
    await a.apagarTrabalho('ag', 'fo')
    expect(existsSync(audio)).toBe(false)
    expect(existsSync(path.join(raiz, 'fontes/ag/fo/segmentos'))).toBe(false)
    expect((await a.ler('fontes/ag/fo/original')).toString()).toBe('original')
    await expect(a.apagarTrabalho('ag', 'fo')).resolves.toBeUndefined()
  })

  it('id fora do alfabeto fechado lança erro de identificador e o índice de segmento inválido também', async () => {
    const a = criarArmazenamento(raiz)
    await expect(a.gravarSegmento('../x', 'fo', 0, 'x')).rejects.toMatchObject({ codigo: 'armazenamento_invalido' })
    expect(() => a.pastaDeTrabalho('ag', 'a/b', 'audio')).toThrow(/Identificador/)
    for (const ruim of [-1, 1.5, Number.NaN, 100000]) {
      await expect(a.gravarSegmento('ag', 'fo', ruim, 'x'), String(ruim)).rejects.toMatchObject({ codigo: 'armazenamento_invalido' })
    }
  })

  it('o caminho absoluto do original e das pastas fica dentro da raiz e nunca começa por hífen', () => {
    const a = criarArmazenamento(raiz)
    const original = a.caminhoDoOriginal('ag', 'fo')
    expect(original).toBe(path.join(path.resolve(raiz), 'fontes/ag/fo/original'))
    expect(path.isAbsolute(original)).toBe(true)
    for (const tipo of ['audio', 'segmentos'] as const) {
      const pasta = a.pastaDeTrabalho('ag', 'fo', tipo)
      expect(pasta.startsWith(path.resolve(raiz) + path.sep)).toBe(true)
    }
  })
})
