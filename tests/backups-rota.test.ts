/**
 * GET /api/backups/[nome] (FT-11, PR-96) contra o servidor de produção (exige `npm run build`): só admin,
 * cabeçalhos seguros, o arquivo inteiro por stream e nenhuma travessia de diretório.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { list } from 'tar'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { ambiente } from '@/lib/ambiente'
import { gerarBackup } from '@/lib/backup'
import { limparBanco } from './ajuda'
import { bancoDoTeste, semearInstalacao } from './apoio/instalacao'
import { cookieDe, subirServidor, type Servidor } from './apoio/servidor'

const SENHA = 'senha-de-rota-123'
let servidor: Servidor
let pasta: string
let nome: string
let cookieAdmin: string
let cookieComum: string

const pegar = (caminho: string, cookie?: string) => fetch(`${servidor.base}${caminho}`, { headers: cookie ? { cookie } : {}, redirect: 'manual' })

beforeAll(async () => {
  await limparBanco()
  const inst = await semearInstalacao()
  const senhaHash = await hashDeSenha(SENHA)
  await prisma.usuario.create({ data: { nome: 'Maria', email: 'maria.backup@teste.local', senhaHash, papel: 'usuario' } })
  await prisma.usuario.update({ where: { id: inst.admin.id }, data: { senhaHash } })
  cookieAdmin = await cookieDe(inst.admin.email, SENHA)
  cookieComum = await cookieDe('maria.backup@teste.local', SENHA)
  pasta = mkdtempSync(path.join(os.tmpdir(), 'converse-rota-backup-'))
  const r = await gerarBackup({ bancoArquivo: bancoDoTeste(), storageDir: ambiente.storageDir, backupDir: pasta, versaoDoApp: '1.0.0' })
  nome = r.nome
  writeFileSync(path.join(pasta, 'notas.txt'), 'conteúdo que não pode sair')
  servidor = await subirServidor(3230, { BACKUP_DIR: pasta })
}, 180_000)
afterAll(async () => {
  servidor?.parar()
  rmSync(pasta, { recursive: true, force: true })
  await limparBanco()
})

describe('download do backup', () => {
  it('o admin baixa o arquivo inteiro com os cabeçalhos seguros e os bytes do disco', async () => {
    const r = await pegar(`/api/backups/${nome}`, cookieAdmin)
    expect(r.status).toBe(200)
    expect(r.headers.get('content-type')).toBe('application/gzip')
    expect(r.headers.get('content-disposition')).toBe(`attachment; filename="${nome}"`)
    expect(r.headers.get('cache-control')).toBe('no-store')
    expect(r.headers.get('x-content-type-options')).toBe('nosniff')
    expect(r.headers.get('x-correlacao')).toMatch(/^[0-9a-f]{8}$/)
    const bytes = Buffer.from(await r.arrayBuffer())
    const noDisco = readFileSync(path.join(pasta, nome))
    expect(Number(r.headers.get('content-length'))).toBe(noDisco.length)
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(createHash('sha256').update(noDisco).digest('hex'))
  })

  it('o arquivo baixado é um backup válido: tem o manifest.json e o banco', async () => {
    const r = await pegar(`/api/backups/${nome}`, cookieAdmin)
    const arquivo = path.join(pasta, 'baixado.tar.gz')
    writeFileSync(arquivo, Buffer.from(await r.arrayBuffer()))
    const caminhos: string[] = []
    await list({ file: arquivo, onReadEntry: (e) => void (e.type === 'File' && caminhos.push(e.path)) })
    expect(caminhos).toEqual(expect.arrayContaining(['manifest.json', 'banco/app.db']))
    rmSync(arquivo)
  })

  it('sem sessão responde 401 em JSON e usuário comum 403, sem o conteúdo', async () => {
    const sem = await pegar(`/api/backups/${nome}`)
    expect(sem.status).toBe(401)
    expect(sem.headers.get('content-type')).toContain('application/json')
    const comum = await pegar(`/api/backups/${nome}`, cookieComum)
    expect(comum.status).toBe(403)
    expect(comum.headers.get('content-type')).toContain('application/json')
  })

  it('nome inexistente, de outro padrão ou com travessia responde 404 sem ler nada fora do BACKUP_DIR', async () => {
    const ruins = [
      'backup-20000101-000000.tar.gz',
      'notas.txt',
      '..%2Fnotas.txt',
      '%2e%2e%2fnotas.txt',
      '..%2F..%2Fetc%2Fpasswd',
      `${encodeURIComponent(path.join(pasta, nome))}`,
      `${nome}%00.txt`,
    ]
    for (const ruim of ruins) {
      const r = await pegar(`/api/backups/${ruim}`, cookieAdmin)
      const texto = await r.text()
      expect(r.status, ruim).toBe(404)
      expect(texto, ruim).not.toContain('conteúdo que não pode sair')
      expect(texto, ruim).not.toContain('root:')
    }
  })
})
