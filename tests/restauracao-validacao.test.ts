/**
 * A validação do backup antes de tocar em qualquer coisa (FT-11, PR-20, PR-98): extração segura para
 * um diretório temporário, manifesto, tamanho e SHA-256 de cada parte, nenhuma parte fora do
 * manifesto, integridade do banco, e a comparação do esquema com o do app. Em toda recusa nada fica
 * no diretório de trabalho e nada é escrito fora dele.
 */
import { afterEach, describe, expect, it } from 'vitest'
import Database from 'better-sqlite3'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import { create } from 'tar'
import { compararEsquema, descartarBackupValidado, lerEValidarBackup } from '../src/lib/restauracao.js'
import { migracoesDoApp } from '../src/lib/versao.js'
import { limparBanco } from './ajuda'
import {
  adulterar,
  alterarUmByte,
  comMigrationNova,
  gerarBackupDeTeste,
  limparBackupsDeTeste,
  novoDiretorioDeTeste,
  refazerParte,
  semUltimaMigration,
  symlinkSync,
  truncarAoMeio,
} from './apoio/backups-de-teste'

afterEach(async () => {
  limparBackupsDeTeste()
  await limparBanco()
})

const sobras = (dir: string) => readdirSync(dir).filter((n) => n.startsWith('.restauracao-'))

async function recusa(arquivo: string, dir: string, padrao: RegExp) {
  await expect(lerEValidarBackup(arquivo, { diretorioDeTrabalho: dir })).rejects.toMatchObject({ codigo: 'backup_invalido', message: expect.stringMatching(padrao) })
  expect(sobras(dir), 'o diretório temporário de extração não pode sobrar').toEqual([])
}

describe('backup válido', () => {
  it('extrai para um diretório temporário do diretório de trabalho e devolve o manifesto, as migrations e as partes conferidas', async () => {
    const b = await gerarBackupDeTeste()
    const trabalho = novoDiretorioDeTeste('converse-trabalho-')
    const v = await lerEValidarBackup(b.caminho, { diretorioDeTrabalho: trabalho })
    expect(path.dirname(v.diretorio)).toBe(trabalho)
    expect(v.manifesto).toEqual(b.manifesto)
    expect(v.migracoes).toEqual(migracoesDoApp())
    expect(existsSync(path.join(v.diretorio, 'banco', 'app.db'))).toBe(true)
    expect(existsSync(path.join(v.diretorio, 'storage', b.inst.originalRelativo))).toBe(true)
    const db = new Database(path.join(v.diretorio, 'banco', 'app.db'), { readonly: true })
    expect(db.pragma('integrity_check')).toEqual([{ integrity_check: 'ok' }])
    db.close()
    await descartarBackupValidado(v)
    expect(existsSync(v.diretorio)).toBe(false)
  })
})

describe('recusas, sem efeitos', () => {
  it('arquivo adulterado: um byte do banco muda e o SHA-256 deixa de conferir', async () => {
    const b = await gerarBackupDeTeste()
    const ruim = await adulterar(b.caminho, (dir) => alterarUmByte(path.join(dir, 'banco', 'app.db')), { reescreverManifesto: false })
    await recusa(ruim, novoDiretorioDeTeste('converse-trabalho-'), /alterado|não confere/i)
  })

  it('arquivo adulterado no storage: o conteúdo do original muda', async () => {
    const b = await gerarBackupDeTeste()
    const ruim = await adulterar(b.caminho, (dir) => alterarUmByte(path.join(dir, 'storage', b.inst.originalRelativo)), { reescreverManifesto: false })
    await recusa(ruim, novoDiretorioDeTeste('converse-trabalho-'), /alterado|não confere/i)
  })

  it('tamanho diferente do manifesto também é recusado', async () => {
    const b = await gerarBackupDeTeste()
    const ruim = await adulterar(b.caminho, (dir, m) => {
      writeFileSync(path.join(dir, 'storage', b.inst.originalRelativo), 'curto')
      m.partes.find((p) => p.caminho.startsWith('storage/'))!.sha256 = m.partes.find((p) => p.caminho.startsWith('storage/'))!.sha256
    })
    await recusa(ruim, novoDiretorioDeTeste('converse-trabalho-'), /alterado|não confere/i)
  })

  it('sem manifest.json', async () => {
    const b = await gerarBackupDeTeste()
    const ruim = await adulterar(b.caminho, async (dir) => (await import('node:fs/promises')).rm(path.join(dir, 'manifest.json')), { reescreverManifesto: false })
    await recusa(ruim, novoDiretorioDeTeste('converse-trabalho-'), /manifest/i)
  })

  it('manifest que não é JSON ou de outro formato', async () => {
    const b = await gerarBackupDeTeste()
    const dir1 = novoDiretorioDeTeste('converse-trabalho-')
    const naoJson = await adulterar(b.caminho, (d) => writeFileSync(path.join(d, 'manifest.json'), 'isto não é json'), { reescreverManifesto: false })
    await recusa(naoJson, dir1, /manifest/i)
    const dir2 = novoDiretorioDeTeste('converse-trabalho-')
    const outroFormato = await adulterar(b.caminho, (_d, m) => void ((m as unknown as { formato: number }).formato = 2))
    await recusa(outroFormato, dir2, /formato|manifest/i)
  })

  it('backup truncado', async () => {
    const b = await gerarBackupDeTeste()
    await recusa(truncarAoMeio(b.caminho), novoDiretorioDeTeste('converse-trabalho-'), /truncado|corrompido|válido/i)
  })

  it('arquivo que não é um backup (texto qualquer, vazio) e arquivo inexistente ou pasta', async () => {
    const trabalho = novoDiretorioDeTeste('converse-trabalho-')
    const texto = path.join(novoDiretorioDeTeste(), 'notas.tar.gz')
    writeFileSync(texto, 'não sou um backup')
    await recusa(texto, trabalho, /válido|corrompido|truncado/i)
    const vazio = path.join(novoDiretorioDeTeste(), 'vazio.tar.gz')
    writeFileSync(vazio, '')
    await recusa(vazio, trabalho, /válido|corrompido|truncado|vazio/i)
    await recusa(path.join(trabalho, 'nao-existe.tar.gz'), trabalho, /não foi encontrado|existe/i)
    await recusa(novoDiretorioDeTeste(), trabalho, /não é um arquivo|arquivo/i)
  })

  it('parte extra fora do manifesto', async () => {
    const b = await gerarBackupDeTeste()
    const ruim = await adulterar(b.caminho, (dir) => writeFileSync(path.join(dir, 'storage', 'intruso.txt'), 'não listado'))
    await recusa(ruim, novoDiretorioDeTeste('converse-trabalho-'), /fora do manifest|não listad/i)
  })

  it('parte listada no manifesto mas ausente do arquivo', async () => {
    const b = await gerarBackupDeTeste()
    const ruim = await adulterar(b.caminho, async (dir) => (await import('node:fs/promises')).rm(path.join(dir, 'storage', b.inst.originalRelativo)))
    await recusa(ruim, novoDiretorioDeTeste('converse-trabalho-'), /ausente|falta|não confere/i)
  })

  it('caminho com ../ no arquivo: recusado e nada é escrito fora do diretório de trabalho', async () => {
    const fora = novoDiretorioDeTeste('converse-fora-')
    const trabalho = path.join(fora, 'trabalho')
    await mkdir(trabalho)
    const origem = novoDiretorioDeTeste('converse-origem-')
    await mkdir(path.join(origem, 'sub'))
    writeFileSync(path.join(origem, 'fugiu.txt'), 'escapou')
    const perigoso = path.join(novoDiretorioDeTeste(), 'perigoso.tar.gz')
    await create({ gzip: true, cwd: path.join(origem, 'sub'), file: perigoso, preservePaths: true }, ['../fugiu.txt'])
    await recusa(perigoso, trabalho, /caminho|inválid|inseguro/i)
    expect(existsSync(path.join(fora, 'fugiu.txt'))).toBe(false)
    expect(existsSync(path.join(trabalho, '..', 'fugiu.txt'))).toBe(false)
  })

  it('caminho absoluto e link simbólico no arquivo', async () => {
    const trabalho = novoDiretorioDeTeste('converse-trabalho-')
    const origem = novoDiretorioDeTeste('converse-origem-')
    writeFileSync(path.join(origem, 'dentro.txt'), 'x')
    const absoluto = path.join(novoDiretorioDeTeste(), 'absoluto.tar.gz')
    await create({ gzip: true, cwd: '/', file: absoluto, preservePaths: true }, [path.join(origem, 'dentro.txt')])
    await recusa(absoluto, trabalho, /caminho|inválid|inseguro/i)

    symlinkSync('/etc/hosts', path.join(origem, 'atalho'))
    const comLink = path.join(novoDiretorioDeTeste(), 'link.tar.gz')
    await create({ gzip: true, cwd: origem, file: comLink }, ['atalho'])
    await recusa(comLink, trabalho, /link|tipo|inválid|inseguro|caminho/i)
  })

  it('banco que não é SQLite (com o SHA-256 refeito) é recusado pela conferência de integridade', async () => {
    const b = await gerarBackupDeTeste()
    const ruim = await adulterar(b.caminho, (dir, m) => {
      writeFileSync(path.join(dir, 'banco', 'app.db'), 'isto não é um banco sqlite, só texto com tamanho suficiente '.repeat(200))
      refazerParte(dir, m, 'banco/app.db')
    })
    await recusa(ruim, novoDiretorioDeTeste('converse-trabalho-'), /banco|integridade/i)
  })

  it('manifest que diz outras migrations que as do banco é recusado', async () => {
    const b = await gerarBackupDeTeste()
    const ruim = await adulterar(b.caminho, (_d, m) => void (m.migracoes = [...m.migracoes, '29991231000000_inventada']))
    await recusa(ruim, novoDiretorioDeTeste('converse-trabalho-'), /migration|esquema|manifest/i)
  })
})

describe('compararEsquema', () => {
  const app = ['20260101000000_a', '20260201000000_b', '20260301000000_c']

  it('igual, mais antigo (o backup é um prefixo), mais novo (migration que o app não conhece) e divergente', () => {
    expect(compararEsquema(app, app)).toBe('igual')
    expect(compararEsquema(app.slice(0, 2), app)).toBe('mais_antigo')
    expect(compararEsquema([], app)).toBe('mais_antigo')
    expect(compararEsquema([...app, '20260401000000_d'], app)).toBe('mais_novo')
    expect(compararEsquema(['20260101000000_a', '29991231000000_x'], app)).toBe('mais_novo')
    expect(compararEsquema(['20260101000000_a', '20260301000000_c'], app)).toBe('divergente')
    expect(compararEsquema(['20260201000000_b', '20260101000000_a'], app)).toBe('divergente')
  })

  it('o backup de esquema mais novo e o de esquema mais antigo são lidos e classificados', async () => {
    const b = await gerarBackupDeTeste()
    const novo = await adulterar(b.caminho, (dir, m) => comMigrationNova(dir, m))
    const trabalho = novoDiretorioDeTeste('converse-trabalho-')
    const v1 = await lerEValidarBackup(novo, { diretorioDeTrabalho: trabalho })
    expect(compararEsquema(v1.migracoes, migracoesDoApp())).toBe('mais_novo')
    await descartarBackupValidado(v1)

    const antigo = await adulterar(b.caminho, (dir, m) => void semUltimaMigration(dir, m))
    const v2 = await lerEValidarBackup(antigo, { diretorioDeTrabalho: trabalho })
    expect(compararEsquema(v2.migracoes, migracoesDoApp())).toBe('mais_antigo')
    expect(v2.migracoes).toHaveLength(migracoesDoApp().length - 1)
    await descartarBackupValidado(v2)
    expect(readFileSync(b.caminho).length).toBeGreaterThan(0)
  })
})
