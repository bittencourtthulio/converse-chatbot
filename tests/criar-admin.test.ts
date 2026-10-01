/**
 * `npm run admin:criar -- <e-mail> <nome>` (FT-11, PR-100): o primeiro administrador de uma instalação
 * limpa, já que a seed de demonstração nunca roda em produção. A senha vem de ADMIN_SENHA ou da entrada
 * padrão, nunca de argumento, e nunca é impressa nem gravada em log.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import Database from 'better-sqlite3'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { senhaConfere } from '../src/lib/senha.js'
import { limparBanco } from './ajuda'
import { rodarScript } from './apoio/comando'
import { bancoDoTeste } from './apoio/instalacao'

const SENHA_DE_TESTE = 'senha-inicial-do-admin-77'
let pasta: string
let banco: string

const variaveis = (extra: Record<string, string | undefined> = {}) => ({ DATABASE_URL: `file:${banco}`, NODE_ENV: 'test', ...extra })
const usuarios = () => {
  const db = new Database(banco, { readonly: true })
  try {
    return db.prepare('SELECT nome, email, papel, ativo, senhaHash FROM usuarios').all() as Array<{ nome: string; email: string; papel: string; ativo: number; senhaHash: string }>
  } finally {
    db.close()
  }
}

beforeEach(async () => {
  await limparBanco()
  pasta = mkdtempSync(path.join(os.tmpdir(), 'converse-admin-'))
  banco = path.join(pasta, 'app.db')
  // Uma instalação limpa: o esquema migrado e nenhum usuário (cópia do banco do teste, que está vazio).
  const origem = new Database(bancoDoTeste(), { readonly: true })
  await origem.backup(banco)
  origem.close()
})
afterEach(() => rmSync(pasta, { recursive: true, force: true }))

describe('npm run admin:criar', () => {
  it('com ADMIN_SENHA cria o administrador, que entra com a senha, e imprime o e-mail sem a senha', async () => {
    const r = await rodarScript('criar-admin', variaveis({ ADMIN_SENHA: SENHA_DE_TESTE }), ['Maria.Admin@Exemplo.Local', 'Maria', 'Souza'])
    expect(r.stderr).not.toMatch(/\n\s+at\s/)
    expect(r.codigo).toBe(0)
    expect(r.stdout).toContain('maria.admin@exemplo.local')
    expect(r.stdout + r.stderr).not.toContain(SENHA_DE_TESTE)
    const [u] = usuarios()
    expect(u).toMatchObject({ nome: 'Maria Souza', email: 'maria.admin@exemplo.local', papel: 'admin', ativo: 1 })
    expect(await senhaConfere(SENHA_DE_TESTE, u!.senhaHash)).toBe(true)
    expect(u!.senhaHash).not.toContain(SENHA_DE_TESTE)
  }, 90_000)

  it('grava a auditoria usuario_criado com o ator Sistema, sem a senha', async () => {
    await rodarScript('criar-admin', variaveis({ ADMIN_SENHA: SENHA_DE_TESTE }), ['admin@exemplo.local', 'Admin'])
    const db = new Database(banco, { readonly: true })
    const linha = db.prepare("SELECT usuarioRotulo, usuarioId, detalhes FROM registros_de_auditoria WHERE acao = 'usuario_criado'").get() as {
      usuarioRotulo: string
      usuarioId: string | null
      detalhes: string
    }
    db.close()
    expect(linha.usuarioRotulo).toBe('Sistema')
    expect(linha.usuarioId).toBeNull()
    expect(linha.detalhes).not.toContain(SENHA_DE_TESTE)
  }, 90_000)

  it('sem ADMIN_SENHA lê a senha da entrada padrão', async () => {
    const r = await rodarScript('criar-admin', variaveis(), ['pipe@exemplo.local', 'Pelo Pipe'], { entrada: `${SENHA_DE_TESTE}\n` })
    expect(r.codigo).toBe(0)
    expect(r.stdout + r.stderr).not.toContain(SENHA_DE_TESTE)
    expect(await senhaConfere(SENHA_DE_TESTE, usuarios()[0]!.senhaHash)).toBe(true)
  }, 90_000)

  it('sem senha em lugar nenhum, e-mail que já existe, senha curta e argumentos que faltam saem com código diferente de zero e mensagem clara', async () => {
    const semSenha = await rodarScript('criar-admin', variaveis(), ['a@exemplo.local', 'A'])
    expect(semSenha.codigo).not.toBe(0)
    expect(semSenha.stderr).toMatch(/ADMIN_SENHA|entrada padrão/)

    expect((await rodarScript('criar-admin', variaveis({ ADMIN_SENHA: SENHA_DE_TESTE }), ['dup@exemplo.local', 'Primeiro'])).codigo).toBe(0)
    const duplicado = await rodarScript('criar-admin', variaveis({ ADMIN_SENHA: SENHA_DE_TESTE }), ['dup@exemplo.local', 'Segundo'])
    expect(duplicado.codigo).not.toBe(0)
    expect(duplicado.stderr).toMatch(/Já existe/)

    const curta = await rodarScript('criar-admin', variaveis({ ADMIN_SENHA: '1234567' }), ['curta@exemplo.local', 'Curta'])
    expect(curta.codigo).not.toBe(0)
    expect(curta.stderr).toMatch(/ao menos 8/)
    expect(curta.stderr).not.toContain('1234567')

    const faltando = await rodarScript('criar-admin', variaveis({ ADMIN_SENHA: SENHA_DE_TESTE }), ['so-email@exemplo.local'])
    expect(faltando.codigo).not.toBe(0)
    expect(faltando.stderr).toMatch(/Uso:/)

    for (const r of [semSenha, duplicado, curta, faltando]) expect(r.stderr).not.toMatch(/\n\s+at\s/)
    expect(usuarios().map((u) => u.email)).toEqual(['dup@exemplo.local'])
  }, 180_000)

  it('recusa a senha como argumento e não a repete na saída', async () => {
    for (const args of [['x@exemplo.local', 'X', '--senha=meu-segredo-12345'], ['--senha', 'meu-segredo-12345', 'x@exemplo.local', 'X']]) {
      const r = await rodarScript('criar-admin', variaveis({ ADMIN_SENHA: SENHA_DE_TESTE }), args)
      expect(r.codigo).not.toBe(0)
      expect(r.stderr).toMatch(/argumento/)
      expect(r.stdout + r.stderr).not.toContain('meu-segredo-12345')
    }
    expect(usuarios()).toHaveLength(0)
  }, 120_000)

  it('o script usa o serviço, não imprime a senha e o package.json tem o comando admin:criar', () => {
    const fonte = readFileSync(path.join(process.cwd(), 'scripts/criar-admin.ts'), 'utf8')
    expect(fonte).toContain('criarAdministradorInicial')
    // Nenhuma chamada de console recebe a variável da senha (as mensagens só citam a palavra).
    expect(fonte).not.toMatch(/console\.\w+\(\s*senha\b|console\.\w+\([^)]*\$\{\s*senha\b/)
    const pacote = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')) as { scripts: Record<string, string> }
    expect(pacote.scripts['admin:criar']).toBe('tsx scripts/criar-admin.ts')
  })
})
