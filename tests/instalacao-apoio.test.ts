/**
 * O apoio que monta a instalação de teste (FT-11, PR-20): sem ele a prova da restauração
 * conferiria uma instalação vazia. Aqui se prova que ele de fato semeia todas as camadas e que o
 * retrato distingue uma instalação alterada de uma igual.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '../src/lib/prisma.js'
import { ambiente } from '../src/lib/ambiente.js'
import { decifrar } from '../src/lib/cripto.js'
import { limparBanco } from './ajuda'
import {
  CHAVE_DO_OPENROUTER_DE_TESTE,
  PALAVRA_DE_BUSCA,
  TOKEN_DO_TELEGRAM_DE_TESTE,
  bancoDoTeste,
  buscarNoIndice,
  retratoDoBanco,
  retratoDoStorage,
  semearInstalacao,
} from './apoio/instalacao'

afterEach(async () => {
  await limparBanco()
})

describe('semearInstalacao', () => {
  it('grava dados em todas as camadas no banco e no storage do próprio teste', async () => {
    const inst = await semearInstalacao()
    expect(path.resolve(bancoDoTeste())).not.toContain(`${path.sep}dev.db`)

    const banco = retratoDoBanco()
    expect(banco.usuarios).toHaveLength(2)
    expect(banco.agentes).toHaveLength(1)
    expect(banco.configuracao_do_chat).toHaveLength(1)
    expect(banco.canais_telegram).toHaveLength(1)
    expect(banco.fontes).toHaveLength(1)
    expect(banco.trechos).toHaveLength(3)
    expect(banco.conversas).toHaveLength(1)
    expect(banco.mensagens).toHaveLength(2)
    expect(banco.registros_de_auditoria).toHaveLength(1)
    expect(banco.configuracao_do_workspace).toHaveLength(1)
    // O retrato não inclui a tabela virtual do FTS5 nem o histórico de migrations.
    expect(Object.keys(banco).some((t) => t.startsWith('trechos_fts') || t === '_prisma_migrations')).toBe(false)

    // Os segredos cifrados decifram com a ENCRYPTION_KEY do teste.
    const canal = await prisma.canalTelegram.findFirstOrThrow()
    expect(decifrar(canal.tokenCifrado)).toBe(TOKEN_DO_TELEGRAM_DE_TESTE)
    const config = await prisma.configuracaoDoWorkspace.findFirstOrThrow()
    expect(decifrar(config.openrouterChaveCifrada!)).toBe(CHAVE_DO_OPENROUTER_DE_TESTE)

    // O índice FTS5 responde com os três trechos.
    expect(buscarNoIndice(bancoDoTeste(), PALAVRA_DE_BUSCA)).toHaveLength(3)

    // O original e os três temporários existem dentro do storage do teste.
    for (const caminho of Object.values(inst.caminhos)) {
      expect(existsSync(caminho), caminho).toBe(true)
      expect(caminho.startsWith(ambiente.storageDir + path.sep)).toBe(true)
    }
    expect(inst.originalRelativo).toBe(`fontes/${inst.agenteId}/${inst.fonteId}/original`)
  })
})

describe('retratos', () => {
  it('duas leituras seguidas são iguais e uma alteração de uma linha muda o retrato', async () => {
    const inst = await semearInstalacao()
    const antes = retratoDoBanco()
    expect(retratoDoBanco()).toEqual(antes)
    const arquivosAntes = retratoDoStorage()
    expect(retratoDoStorage()).toEqual(arquivosAntes)

    await prisma.agente.update({ where: { id: inst.agenteId }, data: { nome: 'Outro nome' } })
    expect(retratoDoBanco()).not.toEqual(antes)
  })

  it('o retrato do storage lista cada arquivo com tamanho e SHA-256 e muda quando um byte muda', async () => {
    const inst = await semearInstalacao()
    const retrato = retratoDoStorage()
    const caminhos = retrato.map((a) => a.caminho)
    expect(caminhos).toContain(inst.originalRelativo)
    expect(caminhos).toContain(`fontes/${inst.agenteId}/${inst.fonteId}/audio/entrada.mp3`)
    expect(caminhos).toContain(`fontes/${inst.agenteId}/${inst.fonteId}/segmentos/000.txt`)
    expect(caminhos).toContain(`fontes/${inst.agenteId}/${inst.fonteId}/outro.parcial`)
    const original = retrato.find((a) => a.caminho === inst.originalRelativo)!
    expect(original.sha256).toMatch(/^[0-9a-f]{64}$/)
    expect(original.bytes).toBeGreaterThan(0)

    const { writeFileSync } = await import('node:fs')
    writeFileSync(inst.caminhos.original, 'alterado')
    const depois = retratoDoStorage().find((a) => a.caminho === inst.originalRelativo)!
    expect(depois.sha256).not.toBe(original.sha256)
  })
})
