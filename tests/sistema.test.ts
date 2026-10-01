/**
 * Os dados da tela Configurações > Sistema (FT-11, PR-95): versão do app e do esquema, atividade,
 * Node, fuso, tamanhos, mídia, fila, agendador e a configuração (sim ou não, nunca o valor). Só o
 * admin lê; nada que seja segredo sai.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync, readdirSync, rmSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { prisma } from '../src/lib/prisma.js'
import { ambiente } from '../src/lib/ambiente.js'
import { cifrar } from '../src/lib/cripto.js'
import { reiniciarCacheDaSaude } from '../src/servicos/saude.js'
import { medirDiretorio, obterSistema } from '../src/servicos/sistema.js'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarFonteDeTeste } from './apoio/fontes'

const MIDIA = async () => ({ ffmpeg: true, ffprobe: true, versao: 'ffmpeg version 7.0' })
const temporarios: string[] = []
const original = { ...process.env }

beforeEach(async () => {
  reiniciarCacheDaSaude()
  await limparBanco()
})
afterEach(() => {
  for (const d of temporarios.splice(0)) rmSync(d, { recursive: true, force: true })
  for (const chave of ['APP_URL', 'ENCRYPTION_KEY', 'TZ']) {
    if (original[chave] === undefined) delete process.env[chave]
    else process.env[chave] = original[chave]
  }
})

describe('obterSistema', () => {
  it('para um admin devolve versão, esquema, atividade, Node, fuso, tamanhos, mídia, fila e agendador', async () => {
    const admin = await criarAdmin()
    const { agente } = await criarAgenteDeTeste()
    await criarFonteDeTeste({ agenteId: agente.id, status: 'pendente', bytes: Buffer.from('um') })
    await criarFonteDeTeste({ agenteId: agente.id, status: 'processando', bytes: Buffer.from('dois') })
    await criarFonteDeTeste({ agenteId: agente.id, status: 'processando', bytes: Buffer.from('tres') })
    await criarFonteDeTeste({ agenteId: agente.id, status: 'erro', bytes: Buffer.from('quatro') })
    await criarFonteDeTeste({ agenteId: agente.id, status: 'pronto', bytes: Buffer.from('cinco') })

    const s = await obterSistema(admin, { midia: MIDIA })

    expect(s.saude.status).toBe('ok')
    expect(s.aplicacao.versao).toMatch(/^\d+\.\d+\.\d+/)
    expect(s.aplicacao.node).toBe(process.version)
    expect(s.aplicacao.atividadeSegundos).toBeGreaterThan(0)
    expect(s.aplicacao.fuso).toBe(ambiente.fusoHorario)

    const migracoes = readdirSync(path.join(process.cwd(), 'prisma', 'migrations')).filter((n) => /^\d{14}_/.test(n)).sort()
    expect(s.esquema.aplicadas).toBe(migracoes.length)
    expect(s.esquema.esperadas).toBe(migracoes.length)
    expect(s.esquema.ultima).toBe(migracoes.at(-1))

    expect(s.dados.bancoBytes).toBe(statSync(ambiente.bancoArquivo).size)
    expect(s.dados.storageBytes).toBeGreaterThan(0)
    expect(s.dados.storageArquivos).toBe(5)
    expect(s.dados.storageParcial).toBe(false)

    expect(s.midia).toEqual({ ffmpeg: true, ffprobe: true, versao: 'ffmpeg version 7.0' })
    expect(s.fila).toEqual({ pendentes: 1, processando: 2, erro: 1 })
    expect(s.expurgo).toEqual({ ativo: expect.any(Boolean), ultimaExecucaoEm: null })
    expect(s.ultimoBackup).toBeNull()
  })

  it('a configuração é só sim ou não: chave de criptografia, URL HTTPS e chave do OpenRouter', async () => {
    const admin = await criarAdmin()
    process.env.APP_URL = 'https://converse.exemplo.com.br'
    let s = await obterSistema(admin, { midia: MIDIA })
    expect(s.configuracao).toEqual({
      chaveDeCriptografiaDefinida: true,
      chaveDeCriptografiaValida: true,
      appUrlDefinida: true,
      appUrlHttps: true,
      openrouterConfigurado: false,
    })

    await prisma.configuracaoDoWorkspace.create({ data: { id: 'unica', openrouterChaveCifrada: cifrar('chave-do-openrouter-xyz') } })
    process.env.APP_URL = 'http://converse.exemplo.com.br'
    process.env.ENCRYPTION_KEY = 'curta'
    reiniciarCacheDaSaude()
    s = await obterSistema(admin, { midia: MIDIA })
    expect(s.configuracao).toEqual({
      chaveDeCriptografiaDefinida: true,
      chaveDeCriptografiaValida: false,
      appUrlDefinida: true,
      appUrlHttps: false,
      openrouterConfigurado: true,
    })
    delete process.env.APP_URL
    delete process.env.ENCRYPTION_KEY
    s = await obterSistema(admin, { midia: MIDIA })
    expect(s.configuracao).toMatchObject({ chaveDeCriptografiaDefinida: false, appUrlDefinida: false, appUrlHttps: false })
  })

  it('o resultado serializado não contém nenhum valor de segredo', async () => {
    const admin = await criarAdmin()
    const chaveClara = 'chave-do-openrouter-que-nao-pode-sair'
    const cifrada = cifrar(chaveClara)
    await prisma.configuracaoDoWorkspace.create({ data: { id: 'unica', openrouterChaveCifrada: cifrada } })
    const texto = JSON.stringify(await obterSistema(admin, { midia: MIDIA }))
    for (const proibido of [process.env.ENCRYPTION_KEY!, process.env.JWT_SECRET!, chaveClara, cifrada, 'v1:']) {
      expect(texto, proibido).not.toContain(proibido)
    }
  })

  it('usuário comum recebe 403 e nada é lido', async () => {
    const comum = await criarUsuario()
    await expect(obterSistema(comum, { midia: MIDIA })).rejects.toMatchObject({ status: 403 })
  })

  it('o último backup vem do BACKUP_DIR: o mais novo do padrão, com nome, data do nome e tamanho', async () => {
    const admin = await criarAdmin()
    const dir = process.env.BACKUP_DIR!
    writeFileSync(path.join(dir, 'backup-20260101-000000.tar.gz'), 'a')
    writeFileSync(path.join(dir, 'backup-20260301-120000.tar.gz'), 'bbbb')
    writeFileSync(path.join(dir, 'notas.txt'), 'x')
    try {
      const s = await obterSistema(admin, { midia: MIDIA })
      expect(s.ultimoBackup).toEqual({ nome: 'backup-20260301-120000.tar.gz', criadoEm: new Date('2026-03-01T12:00:00.000Z'), bytes: 4 })
    } finally {
      rmSync(path.join(dir, 'backup-20260101-000000.tar.gz'), { force: true })
      rmSync(path.join(dir, 'backup-20260301-120000.tar.gz'), { force: true })
      rmSync(path.join(dir, 'notas.txt'), { force: true })
    }
  })

  it('o agendador do expurgo aparece com ativo e última execução', async () => {
    const admin = await criarAdmin()
    const s = await obterSistema(admin, {
      midia: MIDIA,
      expurgo: { ativo: () => true, ultimaExecucaoEm: () => new Date('2026-05-05T10:00:00.000Z') },
    })
    expect(s.expurgo).toEqual({ ativo: true, ultimaExecucaoEm: new Date('2026-05-05T10:00:00.000Z') })
  })
})

describe('medirDiretorio', () => {
  it('soma os bytes e conta os arquivos de todas as pastas', async () => {
    const pasta = mkdtempSync(path.join(os.tmpdir(), 'converse-medir-'))
    temporarios.push(pasta)
    mkdirSync(path.join(pasta, 'a', 'b'), { recursive: true })
    writeFileSync(path.join(pasta, 'um'), Buffer.alloc(10))
    writeFileSync(path.join(pasta, 'a', 'dois'), Buffer.alloc(20))
    writeFileSync(path.join(pasta, 'a', 'b', 'tres'), Buffer.alloc(30))
    expect(await medirDiretorio(pasta)).toEqual({ bytes: 60, arquivos: 3, parcial: false })
  })

  it('diretório que não existe mede zero e a varredura para no teto de entradas, marcada como parcial', async () => {
    expect(await medirDiretorio(path.join(os.tmpdir(), 'converse-nao-existe-xyz'))).toEqual({ bytes: 0, arquivos: 0, parcial: false })
    const pasta = mkdtempSync(path.join(os.tmpdir(), 'converse-medir-'))
    temporarios.push(pasta)
    for (let i = 0; i < 12; i += 1) writeFileSync(path.join(pasta, `f${i}`), Buffer.alloc(1))
    const r = await medirDiretorio(pasta, { limiteDeEntradas: 5 })
    expect(r.parcial).toBe(true)
    expect(r.arquivos).toBeLessThanOrEqual(5)
  })
})
