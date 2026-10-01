/**
 * O serviço de backup (FT-11, PR-96): gerar (admin pela tela ou o sistema pelo comando), listar e
 * localizar o arquivo do download. Só admin; dois ao mesmo tempo dão 409; a auditoria
 * `backup_gerado` leva origem, tamanho e contagem, nunca o nome do arquivo; o download só serve
 * nomes do padrão, arquivos regulares dentro de BACKUP_DIR.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { prisma } from '../src/lib/prisma.js'
import { aguardarGravacoesPendentes } from '../src/servicos/auditoria.js'
import { caminhoDoBackup, dataDoNomeDoBackup, gerarBackupAgora, listarBackups, ultimoBackup } from '../src/servicos/backup.js'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'
import { semearInstalacao } from './apoio/instalacao'

const original = { ...process.env }
let dir: string

beforeEach(async () => {
  await limparBanco()
  dir = mkdtempSync(path.join(os.tmpdir(), 'converse-servico-backup-'))
  process.env.BACKUP_DIR = dir
  delete process.env.BACKUP_MANTER
})
afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
  for (const chave of ['BACKUP_DIR', 'BACKUP_MANTER']) {
    if (original[chave] === undefined) delete process.env[chave]
    else process.env[chave] = original[chave]
  }
})

describe('gerarBackupAgora', () => {
  it('para um admin cria o arquivo em BACKUP_DIR e devolve nome, data, tamanho e arquivos', async () => {
    const inst = await semearInstalacao()
    const r = await gerarBackupAgora(inst.admin, 'tela')
    expect(r.nome).toMatch(/^backup-\d{8}-\d{6}(-\d+)?\.tar\.gz$/)
    expect(readdirSync(dir)).toEqual([r.nome])
    expect(r.bytes).toBe(statSync(path.join(dir, r.nome)).size)
    // O storage do arquivo de teste acumula os originais dos testes anteriores.
    expect(r.arquivos).toBeGreaterThanOrEqual(1)
    expect(Math.abs(r.criadoEm.getTime() - Date.now())).toBeLessThan(60_000)
  })

  it('grava a auditoria backup_gerado com origem, bytes e arquivos, sem o nome do arquivo e com o admin como ator', async () => {
    const inst = await semearInstalacao()
    await prisma.registroDeAuditoria.deleteMany()
    const r = await gerarBackupAgora(inst.admin, 'tela')
    await aguardarGravacoesPendentes()
    const linhas = await prisma.registroDeAuditoria.findMany({ where: { acao: 'backup_gerado' } })
    expect(linhas).toHaveLength(1)
    expect(linhas[0]).toMatchObject({ usuarioId: inst.admin.id, alvoTipo: 'sistema' })
    expect(JSON.parse(linhas[0]!.detalhes)).toEqual({ origem: 'tela', bytes: r.bytes, arquivos: r.arquivos })
    expect(linhas[0]!.detalhes).not.toContain(r.nome)
  })

  it('o sistema (comando de linha de comando) também gera e audita, com o ator Sistema', async () => {
    await semearInstalacao()
    await prisma.registroDeAuditoria.deleteMany()
    await gerarBackupAgora('sistema', 'linha de comando')
    await aguardarGravacoesPendentes()
    const linha = await prisma.registroDeAuditoria.findFirstOrThrow({ where: { acao: 'backup_gerado' } })
    expect(linha).toMatchObject({ usuarioId: null, usuarioRotulo: 'Sistema' })
    expect(JSON.parse(linha.detalhes)).toMatchObject({ origem: 'linha de comando' })
  })

  it('usuário comum recebe 403 e nenhum arquivo é criado', async () => {
    await semearInstalacao()
    const comum = await criarUsuario()
    await expect(gerarBackupAgora(comum, 'tela')).rejects.toMatchObject({ status: 403 })
    expect(readdirSync(dir)).toEqual([])
  })

  it('dois ao mesmo tempo: o segundo recebe 409 e só um arquivo existe; depois de terminar, outro pode ser gerado', async () => {
    const inst = await semearInstalacao()
    const resultados = await Promise.allSettled([gerarBackupAgora(inst.admin, 'tela'), gerarBackupAgora(inst.admin, 'tela')])
    const rejeitados = resultados.filter((r) => r.status === 'rejected') as PromiseRejectedResult[]
    expect(resultados.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    expect(rejeitados).toHaveLength(1)
    expect(rejeitados[0]!.reason).toMatchObject({ status: 409 })
    expect(readdirSync(dir)).toHaveLength(1)
    await expect(gerarBackupAgora(inst.admin, 'tela')).resolves.toBeDefined()
  })

  it('a retenção BACKUP_MANTER vale pelo serviço', async () => {
    const inst = await semearInstalacao()
    process.env.BACKUP_MANTER = '2'
    for (const nome of ['backup-20200101-000000.tar.gz', 'backup-20200102-000000.tar.gz', 'backup-20200103-000000.tar.gz']) {
      writeFileSync(path.join(dir, nome), 'antigo')
    }
    await gerarBackupAgora(inst.admin, 'tela')
    expect(readdirSync(dir)).toHaveLength(2)
  })
})

describe('listarBackups e ultimoBackup', () => {
  it('lista só os arquivos do padrão, do mais novo ao mais antigo, com data do nome e tamanho', async () => {
    const admin = await criarAdmin()
    writeFileSync(path.join(dir, 'backup-20260101-000000.tar.gz'), 'a')
    writeFileSync(path.join(dir, 'backup-20260301-120000.tar.gz'), 'bbbb')
    writeFileSync(path.join(dir, 'notas.txt'), 'não é backup')
    mkdirSync(path.join(dir, 'pre-restauracao-20260101-000000'))
    const lista = await listarBackups(admin)
    expect(lista.map((b) => b.nome)).toEqual(['backup-20260301-120000.tar.gz', 'backup-20260101-000000.tar.gz'])
    expect(lista[0]).toMatchObject({ bytes: 4, criadoEm: new Date('2026-03-01T12:00:00.000Z') })
    expect((await ultimoBackup())?.nome).toBe('backup-20260301-120000.tar.gz')
  })

  it('sem backup a lista é vazia, o último é nulo e usuário comum recebe 403', async () => {
    expect(await listarBackups(await criarAdmin())).toEqual([])
    expect(await ultimoBackup()).toBeNull()
    await expect(listarBackups(await criarUsuario())).rejects.toMatchObject({ status: 403 })
  })

  it('dataDoNomeDoBackup lê o instante UTC do nome, com ou sem sufixo', () => {
    expect(dataDoNomeDoBackup('backup-20260505-102030.tar.gz')).toEqual(new Date('2026-05-05T10:20:30.000Z'))
    expect(dataDoNomeDoBackup('backup-20260505-102030-3.tar.gz')).toEqual(new Date('2026-05-05T10:20:30.000Z'))
  })
})

describe('caminhoDoBackup (download)', () => {
  it('devolve o caminho dentro de BACKUP_DIR e o tamanho de um arquivo regular do padrão', async () => {
    const admin = await criarAdmin()
    writeFileSync(path.join(dir, 'backup-20260101-000000.tar.gz'), '12345')
    const r = await caminhoDoBackup(admin, 'backup-20260101-000000.tar.gz')
    expect(r).toEqual({ caminho: path.join(dir, 'backup-20260101-000000.tar.gz'), nome: 'backup-20260101-000000.tar.gz', bytes: 5 })
  })

  it('recusa com 404 nome fora do padrão, com barra, com .., absoluto, com byte nulo, inexistente e que não é texto', async () => {
    const admin = await criarAdmin()
    writeFileSync(path.join(dir, 'notas.txt'), 'x')
    writeFileSync(path.join(os.tmpdir(), 'backup-20260101-000000.tar.gz'), 'fora do BACKUP_DIR')
    const ruins: unknown[] = [
      'notas.txt',
      '../backup-20260101-000000.tar.gz',
      'a/backup-20260101-000000.tar.gz',
      path.join(os.tmpdir(), 'backup-20260101-000000.tar.gz'),
      'backup-20260101-000000.tar.gz\u0000.txt',
      '..%2fbackup-20260101-000000.tar.gz',
      'backup-20260101-000000.tar.gz/',
      'backup-20991231-235959.tar.gz',
      '',
      undefined,
      null,
      42,
      ['backup-20260101-000000.tar.gz'],
    ]
    for (const ruim of ruins) {
      await expect(caminhoDoBackup(admin, ruim), String(ruim)).rejects.toMatchObject({ status: 404 })
    }
    rmSync(path.join(os.tmpdir(), 'backup-20260101-000000.tar.gz'), { force: true })
  })

  it('recusa link simbólico e pasta com nome do padrão', async () => {
    const admin = await criarAdmin()
    const alvo = path.join(os.tmpdir(), `converse-alvo-${process.pid}.txt`)
    writeFileSync(alvo, 'fora')
    symlinkSync(alvo, path.join(dir, 'backup-20260101-000000.tar.gz'))
    mkdirSync(path.join(dir, 'backup-20260102-000000.tar.gz'))
    await expect(caminhoDoBackup(admin, 'backup-20260101-000000.tar.gz')).rejects.toMatchObject({ status: 404 })
    await expect(caminhoDoBackup(admin, 'backup-20260102-000000.tar.gz')).rejects.toMatchObject({ status: 404 })
    rmSync(alvo, { force: true })
  })

  it('usuário comum recebe 403', async () => {
    writeFileSync(path.join(dir, 'backup-20260101-000000.tar.gz'), 'x')
    await expect(caminhoDoBackup(await criarUsuario(), 'backup-20260101-000000.tar.gz')).rejects.toMatchObject({ status: 403 })
  })
})
