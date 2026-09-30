// Cada arquivo de teste roda contra um banco SQLite próprio, criado a
// partir do schema e apagado ao fim. É o que permite `test` rodar numa
// máquina limpa sem serviço externo e sem um teste sujar o outro.
import { execSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { beforeAll, afterAll } from 'vitest'

const arquivo = path.resolve(process.cwd(), 'prisma/test.db')

process.env.DATABASE_URL = `file:${arquivo}`
process.env.JWT_SECRET = 'segredo-de-teste-nao-usar-em-producao'
process.env.JWT_TTL_SEGUNDOS = '900'
// Chave de teste do AES-256-GCM (32 bytes em hexadecimal). Nunca usar em produção.
process.env.ENCRYPTION_KEY =
  '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff'
// NODE_ENV é somente-leitura nos tipos do Node; o vitest já o define como
// 'test', e a atribuição direta não compila.
Object.assign(process.env, { NODE_ENV: 'test' })
// Arquivos enviados (PR-11): um diretório temporário por arquivo de teste,
// apagado ao fim. Nenhum teste grava no ./storage do projeto.
const diretorioDeArquivos = mkdtempSync(path.join(os.tmpdir(), 'converse-storage-'))
process.env.STORAGE_DIR = diretorioDeArquivos

beforeAll(() => {
  for (const sufixo of ['', '-journal']) {
    if (existsSync(arquivo + sufixo)) rmSync(arquivo + sufixo)
  }
  // Aplica as migrations versionadas — as mesmas que rodam em produção.
  // Um banco de teste montado por outro caminho testaria um esquema que
  // ninguém vai usar.
  execSync('npx prisma migrate deploy', {
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: `file:${arquivo}` },
  })
})

afterAll(() => {
  rmSync(diretorioDeArquivos, { recursive: true, force: true })
  for (const sufixo of ['', '-journal']) {
    if (existsSync(arquivo + sufixo)) rmSync(arquivo + sufixo)
  }
})
