import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { existsSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { readFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { criarArmazenamento } from '@/lib/armazenamento'
import { ErroDeAplicacao } from '@/lib/erros'

let raiz: string
let fora: string

beforeEach(() => {
  const pai = mkdtempSync(path.join(os.tmpdir(), 'armazenamento-'))
  raiz = path.join(pai, 'raiz')
  fora = pai
})
afterEach(() => {
  rmSync(fora, { recursive: true, force: true })
})

describe('armazenamento em disco', () => {
  it('grava, lê e apaga o original no caminho combinado', async () => {
    const armazenamento = criarArmazenamento(raiz)
    const relativo = await armazenamento.gravar('agente1', 'fonte1', Buffer.from('conteúdo'))

    expect(relativo).toBe('fontes/agente1/fonte1/original')
    expect(existsSync(path.join(raiz, 'fontes/agente1/fonte1/original'))).toBe(true)
    expect((await armazenamento.ler(relativo)).toString('utf8')).toBe('conteúdo')

    await armazenamento.apagarFonte('agente1', 'fonte1')
    expect(existsSync(path.join(raiz, 'fontes/agente1/fonte1'))).toBe(false)
    expect(existsSync(path.join(raiz, 'fontes/agente1'))).toBe(true)
  })

  it('apagar o agente remove o diretório dele e mantém o dos outros', async () => {
    const armazenamento = criarArmazenamento(raiz)
    await armazenamento.gravar('agenteA', 'f1', Buffer.from('a'))
    await armazenamento.gravar('agenteA', 'f2', Buffer.from('b'))
    await armazenamento.gravar('agenteB', 'f3', Buffer.from('c'))

    await armazenamento.apagarAgente('agenteA')

    expect(existsSync(path.join(raiz, 'fontes/agenteA'))).toBe(false)
    expect(readdirSync(path.join(raiz, 'fontes'))).toEqual(['agenteB'])
  })

  it('apagar o que não existe não lança', async () => {
    const armazenamento = criarArmazenamento(raiz)
    await expect(armazenamento.apagarFonte('nada', 'nada')).resolves.toBeUndefined()
    await expect(armazenamento.apagarAgente('nada')).resolves.toBeUndefined()
  })

  it('regravar substitui o conteúdo e o arquivo fica só do dono', async () => {
    const armazenamento = criarArmazenamento(raiz)
    await armazenamento.gravar('a', 'f', Buffer.from('um'))
    const relativo = await armazenamento.gravar('a', 'f', Buffer.from('dois'))
    const arquivo = path.join(raiz, relativo)
    expect(readFileSync(arquivo, 'utf8')).toBe('dois')
    expect(statSync(arquivo).mode & 0o777).toBe(0o600)
    expect(statSync(path.dirname(arquivo)).mode & 0o777).toBe(0o700)
    expect(readdirSync(path.dirname(arquivo))).toEqual(['original'])
  })

  it('recusa ids com .., barra ou fora do alfabeto permitido e não escreve fora da raiz', async () => {
    const armazenamento = criarArmazenamento(raiz)
    for (const ruim of ['..', '../x', 'a/b', 'a\\b', '', ' ', 'a b', 'ç', '.', 'a'.repeat(65)]) {
      await expect(armazenamento.gravar(ruim, 'f', Buffer.from('x')), ruim).rejects.toBeInstanceOf(
        ErroDeAplicacao,
      )
      await expect(armazenamento.gravar('a', ruim, Buffer.from('x')), ruim).rejects.toBeInstanceOf(
        ErroDeAplicacao,
      )
      await expect(armazenamento.apagarFonte(ruim, 'f'), ruim).rejects.toBeInstanceOf(ErroDeAplicacao)
      await expect(armazenamento.apagarAgente(ruim), ruim).rejects.toBeInstanceOf(ErroDeAplicacao)
    }
    expect(existsSync(raiz)).toBe(false)
    expect(readdirSync(fora)).toEqual([])
  })

  it('ler recusa caminho absoluto, com .. ou fora do padrão fontes/<agente>/<fonte>/original', async () => {
    const armazenamento = criarArmazenamento(raiz)
    writeFileSync(path.join(fora, 'segredo.txt'), 'nao')
    const segredo = path.join(fora, 'segredo.txt')
    for (const ruim of [
      segredo,
      '../segredo.txt',
      'fontes/../../segredo.txt',
      'fontes/a/../../../segredo.txt',
      'fontes/a/f/outro',
      'fontes/a/original',
      '',
    ]) {
      await expect(armazenamento.ler(ruim), ruim).rejects.toBeInstanceOf(ErroDeAplicacao)
    }
  })

  it('ler um original que sumiu dá erro em português, sem o caminho', async () => {
    const armazenamento = criarArmazenamento(raiz)
    const erro = await armazenamento.ler('fontes/a/f/original').catch((e: unknown) => e)
    expect(erro).toBeInstanceOf(ErroDeAplicacao)
    expect((erro as ErroDeAplicacao).message).toMatch(/arquivo/i)
    expect((erro as ErroDeAplicacao).message).not.toContain(raiz)
  })

  it('não importa nada com alias @/ (a seed o usa)', () => {
    const fonte = readFileSync(path.resolve(process.cwd(), 'src/lib/armazenamento.ts'), 'utf8')
    expect(fonte).not.toMatch(/from '@\//)
  })
})
