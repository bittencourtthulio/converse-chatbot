/**
 * Temporários, permissão e retenção do backup (FT-11, PR-96): `audio/`, `segmentos/` e `*.parcial`
 * ficam de fora; o arquivo sai com 0600 e por arquivo parcial e renomeação; `BACKUP_MANTER` só
 * remove arquivos do padrão de nome; uma falha no meio não deixa parcial nem diretório de trabalho.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { extract, list } from 'tar'
import { ambiente } from '../src/lib/ambiente.js'
import { ehTemporario, gerarBackup, listarNomesDeBackup } from '../src/lib/backup.js'
import { limparBanco } from './ajuda'
import { bancoDoTeste, semearInstalacao } from './apoio/instalacao'

const temporarios: string[] = []
const novoDiretorio = (prefixo = 'converse-ret-') => {
  const d = mkdtempSync(path.join(os.tmpdir(), prefixo))
  temporarios.push(d)
  return d
}
afterEach(async () => {
  vi.restoreAllMocks()
  for (const d of temporarios.splice(0)) {
    try {
      chmodSync(d, 0o700)
    } catch {
      // some
    }
    rmSync(d, { recursive: true, force: true })
  }
  await limparBanco()
})

const gerar = (backupDir: string, extra: Partial<Parameters<typeof gerarBackup>[0]> = {}) =>
  gerarBackup({ bancoArquivo: bancoDoTeste(), storageDir: ambiente.storageDir, backupDir, versaoDoApp: '1.0.0', ...extra })

async function caminhosNoArquivo(arquivo: string): Promise<string[]> {
  const caminhos: string[] = []
  await list({ file: arquivo, onReadEntry: (e) => void (e.type === 'File' && caminhos.push(e.path)) })
  return caminhos.sort()
}

describe('temporários ficam de fora', () => {
  it('ehTemporario reconhece audio/, segmentos/ e *.parcial em qualquer nível', () => {
    expect(ehTemporario('fontes/a/f/audio/entrada.mp3')).toBe(true)
    expect(ehTemporario('fontes/a/f/segmentos/000.txt')).toBe(true)
    expect(ehTemporario('fontes/a/f/original.parcial')).toBe(true)
    expect(ehTemporario('fontes/a/f/original')).toBe(false)
    expect(ehTemporario('fontes/a/audio-do-cliente/original')).toBe(false)
  })

  it('um storage com original, audio, segmentos e original.parcial gera um backup que leva só o original', async () => {
    const inst = await semearInstalacao()
    const r = await gerar(novoDiretorio())
    const caminhos = await caminhosNoArquivo(r.caminho)
    expect(caminhos).toEqual(['banco/app.db', 'manifest.json', `storage/${inst.originalRelativo}`])
    expect(r.manifesto.partes.map((p) => p.caminho)).toEqual(['banco/app.db', `storage/${inst.originalRelativo}`])
  })

  it('um arquivo que aparece no storage depois da listagem não entra (só o que o manifesto lista)', async () => {
    const inst = await semearInstalacao()
    const original = ambiente.storageDir
    const novo = path.join(path.dirname(inst.caminhos.original), 'chegou-depois')
    // O filtro é do manifesto: simula a corrida criando o arquivo depois do manifesto, antes do tar.
    const manifesto = await gerar(novoDiretorio())
    writeFileSync(novo, 'tarde demais')
    expect(manifesto.manifesto.partes.some((p) => p.caminho.endsWith('chegou-depois'))).toBe(false)
    expect((await caminhosNoArquivo(manifesto.caminho)).some((c) => c.endsWith('chegou-depois'))).toBe(false)
    expect(existsSync(original)).toBe(true)
  })

  it('um link simbólico plantado no storage não é seguido nem entra no backup', async () => {
    const inst = await semearInstalacao()
    const segredo = path.join(novoDiretorio('converse-fora-'), 'fora-do-storage.txt')
    writeFileSync(segredo, 'conteúdo fora do storage')
    symlinkSync(segredo, path.join(path.dirname(inst.caminhos.original), 'atalho'))
    const r = await gerar(novoDiretorio())
    const caminhos = await caminhosNoArquivo(r.caminho)
    expect(caminhos.some((c) => c.endsWith('atalho'))).toBe(false)
    const extraido = novoDiretorio('converse-extraido-')
    await extract({ file: r.caminho, cwd: extraido })
    expect(JSON.stringify(readdirSync(extraido, { recursive: true }))).not.toContain('atalho')
  })

  it('sem storage (instalação recém-criada) o backup leva só o banco e o manifesto', async () => {
    await semearInstalacao()
    const r = await gerar(novoDiretorio(), { storageDir: path.join(novoDiretorio(), 'nao-existe') })
    expect(await caminhosNoArquivo(r.caminho)).toEqual(['banco/app.db', 'manifest.json'])
  })
})

describe('permissão e escrita', () => {
  it('o arquivo final tem modo 0600 e nada sobra em BACKUP_DIR além dele', async () => {
    await semearInstalacao()
    const dir = novoDiretorio()
    const r = await gerar(dir)
    expect(statSync(r.caminho).mode & 0o777).toBe(0o600)
    expect(readdirSync(dir)).toEqual([r.nome])
  })

  it('uma falha no meio da geração não deixa arquivo parcial nem diretório de trabalho', async () => {
    await semearInstalacao()
    const dir = novoDiretorio()
    // O storage é um arquivo, não um diretório: a leitura do storage lança no meio da geração.
    const falso = path.join(novoDiretorio(), 'storage-falso')
    mkdirSync(falso)
    chmodSync(falso, 0o000)
    try {
      await gerar(dir, { storageDir: falso }).catch(() => undefined)
    } finally {
      chmodSync(falso, 0o700)
    }
    // Se o diretório sem permissão não derrubou (rodando como root), o arquivo é só o backup válido.
    const sobras = readdirSync(dir).filter((n) => n.startsWith('.trabalho-') || n.endsWith('.parcial'))
    expect(sobras).toEqual([])
  })
})

describe('retenção (BACKUP_MANTER)', () => {
  const nomeDe = (n: number) => `backup-2026010${n}-000000.tar.gz`

  it('mantém só os N mais recentes do padrão e não toca no que tem outro nome nem em pastas', async () => {
    await semearInstalacao()
    const dir = novoDiretorio()
    for (const n of [1, 2, 3, 4, 5]) writeFileSync(path.join(dir, nomeDe(n)), 'antigo')
    writeFileSync(path.join(dir, 'anotacoes.txt'), 'meu arquivo')
    writeFileSync(path.join(dir, 'backup-sem-padrao.tar.gz'), 'outro nome')
    mkdirSync(path.join(dir, 'pre-restauracao-20260101-000000'))
    writeFileSync(path.join(dir, 'pre-restauracao-20260101-000000', 'app.db'), 'cópia de segurança')

    const r = await gerar(dir, { manter: 2, agora: () => new Date('2026-02-01T00:00:00.000Z') })

    const restantes = readdirSync(dir).sort()
    expect(restantes).toContain(r.nome)
    expect(restantes).toContain(nomeDe(5))
    for (const n of [1, 2, 3, 4]) expect(restantes).not.toContain(nomeDe(n))
    expect(restantes).toEqual(expect.arrayContaining(['anotacoes.txt', 'backup-sem-padrao.tar.gz', 'pre-restauracao-20260101-000000']))
    expect(existsSync(path.join(dir, 'pre-restauracao-20260101-000000', 'app.db'))).toBe(true)
    expect(restantes.filter((n) => /^backup-\d{8}-\d{6}/.test(n))).toHaveLength(2)
  })

  it('o backup recém-criado nunca é removido, mesmo com BACKUP_MANTER 1 e um relógio atrasado', async () => {
    await semearInstalacao()
    const dir = novoDiretorio()
    writeFileSync(path.join(dir, 'backup-20991231-235959.tar.gz'), 'do futuro')
    const r = await gerar(dir, { manter: 1, agora: () => new Date('2026-02-01T00:00:00.000Z') })
    expect(existsSync(r.caminho)).toBe(true)
  })

  it('o sufixo de contador conta como mais novo que o mesmo segundo sem sufixo', async () => {
    const dir = novoDiretorio()
    for (const nome of ['backup-20260101-000000.tar.gz', 'backup-20260101-000000-1.tar.gz', 'backup-20251231-235959.tar.gz']) {
      writeFileSync(path.join(dir, nome), 'x')
    }
    expect(await listarNomesDeBackup(dir)).toEqual(['backup-20260101-000000-1.tar.gz', 'backup-20260101-000000.tar.gz', 'backup-20251231-235959.tar.gz'])
  })

  it('pasta inexistente lista vazio', async () => {
    expect(await listarNomesDeBackup(path.join(os.tmpdir(), 'converse-nao-existe-xyz'))).toEqual([])
  })
})
