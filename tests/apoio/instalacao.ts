// Uma instalação completa para os testes de backup e de restauração (FT-11, PR-20): dados de todas as
// camadas no banco e no STORAGE_DIR do próprio teste (nunca no banco nem no storage do desenvolvedor),
// mais o retrato de banco e de disco que permite conferir linha a linha o que voltou.
import Database from 'better-sqlite3'
import { createHash } from 'node:crypto'
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '../../src/lib/prisma.js'
import { ambiente } from '../../src/lib/ambiente.js'
import { cifrar } from '../../src/lib/cripto.js'
import { registrar } from '../../src/servicos/auditoria.js'
import { criarAdmin, criarUsuario } from '../ajuda'
import { armazenamentoDeTeste } from './fontes'

/** Valores fictícios que, depois da restauração, precisam decifrar com a mesma ENCRYPTION_KEY. */
export const CHAVE_DO_OPENROUTER_DE_TESTE = 'chave-do-openrouter-de-teste-nao-real'
export const TOKEN_DO_TELEGRAM_DE_TESTE = '123456789:token-de-teste-nao-real-abcdefghijklmnop'
/** Palavra que só os trechos semeados têm: a busca FTS5 por ela devolve exatamente esses trechos. */
export const PALAVRA_DE_BUSCA = 'abacaxi'

export interface InstalacaoSemeada {
  admin: Awaited<ReturnType<typeof criarAdmin>>
  usuario: Awaited<ReturnType<typeof criarUsuario>>
  agenteId: string
  fonteId: string
  conversaId: string
  /** Caminhos absolutos dentro de `ambiente.storageDir`. */
  caminhos: { original: string; audio: string; segmento: string; parcial: string }
  /** Caminho do original relativo ao storage, como o backup o grava. */
  originalRelativo: string
}

export const bancoDoTeste = () => process.env.DATABASE_URL!.replace(/^file:/, '')

/** Monta a instalação e devolve o que o teste precisa para conferi-la. */
export async function semearInstalacao(): Promise<InstalacaoSemeada> {
  const admin = await criarAdmin()
  const usuario = await criarUsuario()
  await prisma.configuracaoDoWorkspace.create({
    data: { id: 'unica', openrouterChaveCifrada: cifrar(CHAVE_DO_OPENROUTER_DE_TESTE), retencaoDiasConversas: 45, atualizadoPor: admin.id },
  })
  const agente = await prisma.agente.create({
    data: { nome: 'Agente da instalação', modelo: 'openai/gpt-4o-mini', instrucoes: 'Responda em português.', criadoPorId: admin.id },
  })
  await prisma.configuracaoDoChat.create({
    data: { agenteId: agente.id, ativo: true, titulo: 'Atendimento', cor: '#336699', dominiosPermitidos: '["https://exemplo.local"]' },
  })
  await prisma.canalTelegram.create({
    data: {
      agenteId: agente.id,
      tokenCifrado: cifrar(TOKEN_DO_TELEGRAM_DE_TESTE),
      botId: '123456789',
      botUsername: 'bot_de_teste',
      botNome: 'Bot de teste',
      segredoDoWebhookHash: 'a'.repeat(64),
      webhookUrl: 'https://exemplo.local/api/telegram/webhook',
    },
  })

  const fonte = await prisma.fonte.create({
    data: { agenteId: agente.id, tipo: 'arquivo', titulo: 'Manual', nomeOriginal: 'manual.txt', tamanhoBytes: 40, status: 'pronto', criadoPorId: admin.id },
  })
  const original = Buffer.from('Conteúdo original do manual, com acentuação e bytes: \u0000\u0001ÿ.', 'utf8')
  const originalRelativo = await armazenamentoDeTeste().gravar(agente.id, fonte.id, original)
  await prisma.fonte.update({ where: { id: fonte.id }, data: { caminhoArquivo: originalRelativo, totalTrechos: 3 } })
  for (let i = 0; i < 3; i += 1) {
    await prisma.trecho.create({
      data: { fonteId: fonte.id, agenteId: agente.id, indice: i, texto: `Trecho ${i}: o ${PALAVRA_DE_BUSCA} e a laranja do manual.`, caracteres: 50 },
    })
  }

  const conversa = await prisma.conversa.create({
    data: { agenteId: agente.id, canal: 'widget', identificadorExterno: 'visitante-de-teste-0123456789', titulo: 'Pergunta sobre o manual' },
  })
  await prisma.mensagem.create({ data: { conversaId: conversa.id, papel: 'user', conteudo: 'O que o manual diz sobre abacaxi?' } })
  await prisma.mensagem.create({
    data: {
      conversaId: conversa.id,
      papel: 'assistant',
      conteudo: 'O manual fala do abacaxi [1].',
      modelo: 'openai/gpt-4o-mini',
      tokensEntrada: 12,
      tokensSaida: 8,
      fontes: JSON.stringify([{ fonteId: fonte.id, titulo: 'Manual', citada: true, trechos: [{ n: 1, posicao: 1, trechoTexto: 'Trecho 0' }] }]),
    },
  })
  await registrar({ ator: admin, acao: 'usuario_criado', alvoTipo: 'usuario', alvoId: usuario.id, detalhes: { papel: 'usuario' } })

  // Os temporários que o backup NÃO leva: áudio extraído, texto das partes e envio pela metade.
  const pasta = path.dirname(path.join(ambiente.storageDir, originalRelativo))
  const caminhos = {
    original: path.join(ambiente.storageDir, originalRelativo),
    audio: path.join(pasta, 'audio', 'entrada.mp3'),
    segmento: path.join(pasta, 'segmentos', '000.txt'),
    parcial: path.join(pasta, 'outro.parcial'),
  }
  mkdirSync(path.dirname(caminhos.audio), { recursive: true })
  mkdirSync(path.dirname(caminhos.segmento), { recursive: true })
  writeFileSync(caminhos.audio, Buffer.from('audio temporario'))
  writeFileSync(caminhos.segmento, 'texto da parte 0')
  writeFileSync(caminhos.parcial, 'envio pela metade')

  return { admin, usuario, agenteId: agente.id, fonteId: fonte.id, conversaId: conversa.id, caminhos, originalRelativo }
}

export type RetratoDoBanco = Record<string, Array<Record<string, unknown>>>

/**
 * Todas as linhas de todas as tabelas do arquivo SQLite, em ordem estável e com o `rowid` de cada
 * uma (a tabela virtual do FTS5, as de sombra dela e o histórico de migrations ficam de fora).
 */
export function retratoDoBanco(arquivo: string = bancoDoTeste()): RetratoDoBanco {
  const db = new Database(arquivo, { readonly: true, fileMustExist: true })
  try {
    const tabelas = (db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all() as Array<{ name: string }>)
      .map((t) => t.name)
      .filter((n) => !n.startsWith('sqlite_') && !n.startsWith('trechos_fts') && n !== '_prisma_migrations')
    const retrato: RetratoDoBanco = {}
    for (const nome of tabelas) {
      const colunas = (db.prepare(`PRAGMA table_info("${nome}")`).all() as Array<{ name: string }>).map((c) => c.name)
      const ordem = colunas.includes('id') ? 'id' : colunas[0]!
      retrato[nome] = db.prepare(`SELECT rowid AS _rowid, * FROM "${nome}" ORDER BY "${ordem}"`).all() as Array<Record<string, unknown>>
    }
    return retrato
  } finally {
    db.close()
  }
}

/** Os ids de trecho que a busca FTS5 por `termo` devolve, em ordem. */
export function buscarNoIndice(arquivo: string, termo: string): string[] {
  const db = new Database(arquivo, { readonly: true, fileMustExist: true })
  try {
    return (
      db
        .prepare('SELECT t.id AS id FROM trechos_fts f JOIN trechos t ON t.rowid = f.rowid WHERE trechos_fts MATCH ? ORDER BY t.id')
        .all(`"${termo}"`) as Array<{ id: string }>
    ).map((l) => l.id)
  } finally {
    db.close()
  }
}

export interface ArquivoDoRetrato {
  caminho: string
  bytes: number
  sha256: string
}

/** Todos os arquivos regulares sob `raiz`, com tamanho e SHA-256, em ordem estável (caminho relativo com `/`). */
export function retratoDoStorage(raiz: string = ambiente.storageDir): ArquivoDoRetrato[] {
  const achados: ArquivoDoRetrato[] = []
  const visitar = (dir: string) => {
    for (const entrada of readdirSync(dir, { withFileTypes: true })) {
      const completo = path.join(dir, entrada.name)
      if (entrada.isDirectory()) visitar(completo)
      else if (entrada.isFile()) {
        const conteudo = readFileSync(completo)
        achados.push({
          caminho: path.relative(raiz, completo).split(path.sep).join('/'),
          bytes: statSync(completo).size,
          sha256: createHash('sha256').update(conteudo).digest('hex'),
        })
      }
    }
  }
  try {
    visitar(raiz)
  } catch (erro) {
    if ((erro as NodeJS.ErrnoException).code !== 'ENOENT') throw erro
  }
  return achados.sort((a, b) => a.caminho.localeCompare(b.caminho))
}
