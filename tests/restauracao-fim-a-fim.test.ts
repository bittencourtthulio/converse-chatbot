/**
 * O teste que prova a PR-20 (FT-11): backup nunca restaurado é hipótese. Monta uma instalação com dados
 * de TODAS as camadas (usuários, agente com chat e canal Telegram cifrado, fontes com trechos e índice
 * FTS, conversa com mensagens e fontes, auditoria, arquivo original no storage e temporários que NÃO
 * devem ir), gera o backup, DESTRÓI e ALTERA a instalação, restaura pelo comando em diretórios limpos e
 * confere linha a linha que os dados voltaram. Nenhuma parte toca o banco ou o storage do desenvolvedor.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { extract } from 'tar'
import { PrismaClient } from '../src/gerado/prisma/client.js'
import { ambiente } from '../src/lib/ambiente.js'
import { gerarBackup } from '../src/lib/backup.js'
import { decifrar } from '../src/lib/cripto.js'
import { prisma } from '../src/lib/prisma.js'
import { limparBanco } from './ajuda'
import { limparBackupsDeTeste, novoDiretorioDeTeste } from './apoio/backups-de-teste'
import { rodarScript } from './apoio/comando'
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
  limparBackupsDeTeste()
  await limparBanco()
})

const TEMPORARIO = /\/(audio|segmentos)\/|\.parcial$/

describe('backup -> destruição -> restauração numa instalação limpa (PR-20)', () => {
  it('os dados de todas as camadas voltam linha a linha, a busca FTS responde, o original existe e os temporários ficaram de fora', async () => {
    // 1. A instalação, com tudo.
    const inst = await semearInstalacao()
    const bancoAntes = retratoDoBanco()
    const arquivosAntes = retratoDoStorage()
    expect(arquivosAntes.map((a) => a.caminho).filter((c) => TEMPORARIO.test(c))).toHaveLength(3)
    const idsDaBusca = buscarNoIndice(bancoDoTeste(), PALAVRA_DE_BUSCA)
    expect(idsDaBusca).toHaveLength(3)

    // 2. O backup.
    const pastaDeBackups = novoDiretorioDeTeste('converse-e2e-backups-')
    const backup = await gerarBackup({
      bancoArquivo: bancoDoTeste(),
      storageDir: ambiente.storageDir,
      backupDir: pastaDeBackups,
      versaoDoApp: '1.0.0',
    })

    // 3. A instalação é destruída e alterada.
    await limparBanco()
    expect(await prisma.usuario.count()).toBe(0)
    rmSync(inst.caminhos.original)
    writeFileSync(path.join(path.dirname(inst.caminhos.original), 'lixo-novo'), 'alterado depois do backup')

    // 4. A restauração pelo comando, em diretórios LIMPOS.
    const raiz = novoDiretorioDeTeste('converse-e2e-limpa-')
    const novo = { banco: path.join(raiz, 'dados', 'app.db'), storage: path.join(raiz, 'dados', 'storage'), backups: path.join(raiz, 'dados', 'backups') }
    const r = await rodarScript(
      'restore',
      { DATABASE_URL: `file:${novo.banco}`, STORAGE_DIR: novo.storage, BACKUP_DIR: novo.backups, NODE_ENV: 'test', PORT: '3297' },
      [backup.caminho],
    )
    expect(r.stderr).not.toMatch(/\n\s+at\s/)
    expect(r.codigo).toBe(0)

    // 5. Linha a linha, com um cliente do Prisma só do banco restaurado.
    const depois = retratoDoBanco(novo.banco)
    expect(Object.keys(depois)).toEqual(Object.keys(bancoAntes))
    for (const tabela of Object.keys(bancoAntes)) {
      if (tabela === 'registros_de_auditoria') continue
      expect(depois[tabela], `tabela ${tabela}`).toEqual(bancoAntes[tabela])
    }
    expect(depois.usuarios).toHaveLength(2)
    expect(depois.trechos).toHaveLength(3)
    expect(depois.mensagens).toHaveLength(2)

    const restaurado = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: `file:${novo.banco}` }) })
    try {
      const usuarios = await restaurado.usuario.findMany({ orderBy: { email: 'asc' } })
      expect(usuarios.map((u) => u.email).sort()).toEqual([inst.admin.email, inst.usuario.email].sort())
      expect(usuarios.find((u) => u.email === inst.admin.email)).toMatchObject({ papel: 'admin', ativo: true })

      const agente = await restaurado.agente.findUniqueOrThrow({ where: { id: inst.agenteId }, include: { chat: true, telegram: true } })
      expect(agente).toMatchObject({ nome: 'Agente da instalação', modelo: 'openai/gpt-4o-mini' })
      expect(agente.chat).toMatchObject({ ativo: true, titulo: 'Atendimento', cor: '#336699' })
      expect(agente.telegram).toMatchObject({ botId: '123456789', botUsername: 'bot_de_teste' })

      const conversa = await restaurado.conversa.findUniqueOrThrow({ where: { id: inst.conversaId }, include: { mensagens: { orderBy: { criadoEm: 'asc' } } } })
      expect(conversa.mensagens.map((m) => m.papel)).toEqual(['user', 'assistant'])
      const fontesDaResposta = JSON.parse(conversa.mensagens[1]!.fontes!) as Array<{ fonteId: string; titulo: string }>
      expect(fontesDaResposta[0]).toMatchObject({ fonteId: inst.fonteId, titulo: 'Manual' })

      // A chave cifrada ainda decifra com a MESMA ENCRYPTION_KEY, no banco restaurado.
      expect(decifrar(agente.telegram!.tokenCifrado)).toBe(TOKEN_DO_TELEGRAM_DE_TESTE)
      const config = await restaurado.configuracaoDoWorkspace.findUniqueOrThrow({ where: { id: 'unica' } })
      expect(decifrar(config.openrouterChaveCifrada!)).toBe(CHAVE_DO_OPENROUTER_DE_TESTE)
      expect(config.retencaoDiasConversas).toBe(45)

      // A auditoria: o que havia, mais a entrada da restauração.
      const auditoria = await restaurado.registroDeAuditoria.findMany({ orderBy: { quando: 'asc' } })
      expect(auditoria.map((a) => a.acao)).toEqual([...bancoAntes.registros_de_auditoria!.map((a) => String(a.acao)), 'restauracao'])
      const entrada = auditoria.at(-1)!
      expect(entrada).toMatchObject({ usuarioRotulo: 'Sistema', alvoTipo: 'sistema' })
      expect(JSON.parse(entrada.detalhes)).toEqual({ origem: backup.nome, resultado: 'concluida' })
    } finally {
      await restaurado.$disconnect()
    }

    // A busca FTS5 responde com os mesmos trechos.
    expect(buscarNoIndice(novo.banco, PALAVRA_DE_BUSCA)).toEqual(idsDaBusca)

    // O arquivo original voltou idêntico; o que foi alterado depois do backup não existe; os temporários ficaram de fora.
    const restaurados = retratoDoStorage(novo.storage)
    expect(restaurados).toEqual(arquivosAntes.filter((a) => !TEMPORARIO.test(a.caminho)))
    const original = restaurados.find((a) => a.caminho === inst.originalRelativo)!
    expect(readFileSync(path.join(novo.storage, inst.originalRelativo))).toEqual(
      Buffer.from('Conteúdo original do manual, com acentuação e bytes: \u0000\u0001ÿ.', 'utf8'),
    )
    expect(original.sha256).toBe(arquivosAntes.find((a) => a.caminho === inst.originalRelativo)!.sha256)
    expect(restaurados.some((a) => a.caminho.endsWith('lixo-novo'))).toBe(false)
    for (const a of restaurados) expect(TEMPORARIO.test(a.caminho), a.caminho).toBe(false)
    expect(existsSync(path.join(path.dirname(path.join(novo.storage, inst.originalRelativo)), 'audio'))).toBe(false)
    expect(existsSync(path.join(path.dirname(path.join(novo.storage, inst.originalRelativo)), 'segmentos'))).toBe(false)
  }, 180_000)

  it('o backup não contém a ENCRYPTION_KEY nem o JWT_SECRET, e sem a chave certa o token cifrado não decifra', async () => {
    const inst = await semearInstalacao()
    const backup = await gerarBackup({ bancoArquivo: bancoDoTeste(), storageDir: ambiente.storageDir, backupDir: novoDiretorioDeTeste('converse-e2e-chave-'), versaoDoApp: '1.0.0' })
    const dir = novoDiretorioDeTeste('converse-e2e-extraido-')
    await extract({ file: backup.caminho, cwd: dir })
    const todos = (function listar(d: string): string[] {
      return readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? listar(path.join(d, e.name)) : [path.join(d, e.name)]))
    })(dir)
    const chave = process.env.ENCRYPTION_KEY!
    const jwt = process.env.JWT_SECRET!
    for (const arquivo of todos) {
      const bytes = readFileSync(arquivo)
      expect(bytes.includes(chave), arquivo).toBe(false)
      expect(bytes.includes(Buffer.from(chave, 'hex')), arquivo).toBe(false)
      expect(bytes.includes(jwt), arquivo).toBe(false)
    }
    // O token está no banco, mas só cifrado: com outra chave não se lê.
    const canal = await prisma.canalTelegram.findFirstOrThrow({ where: { agenteId: inst.agenteId } })
    expect(canal.tokenCifrado.startsWith('v1:')).toBe(true)
    const original = process.env.ENCRYPTION_KEY
    process.env.ENCRYPTION_KEY = 'ff'.repeat(32)
    try {
      expect(() => decifrar(canal.tokenCifrado)).toThrow()
    } finally {
      process.env.ENCRYPTION_KEY = original
    }
    expect(decifrar(canal.tokenCifrado)).toBe(TOKEN_DO_TELEGRAM_DE_TESTE)
    expect(ambiente.chaveDeCriptografiaValida).toBe(true)
  })
})
