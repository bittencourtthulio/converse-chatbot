/**
 * As recusas da restauração pelo comando (FT-11, PR-20, PR-98): arquivo adulterado, sem manifest, de
 * esquema mais novo, truncado e BACKUP_DIR sem permissão de escrita. Em cada uma o comando sai com
 * código diferente de zero, diz o motivo e a instalação existente fica byte a byte igual ao antes.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { limparBanco } from './ajuda'
import {
  adulterar,
  alterarUmByte,
  comMigrationNova,
  gerarBackupDeTeste,
  limparBackupsDeTeste,
  novoDiretorioDeTeste,
  truncarAoMeio,
} from './apoio/backups-de-teste'
import { rodarScript } from './apoio/comando'
import { retratoDoStorage } from './apoio/instalacao'

afterEach(async () => {
  limparBackupsDeTeste()
  await limparBanco()
})

interface Instalacao {
  raiz: string
  banco: string
  storage: string
  backups: string
}

const variaveis = (i: Instalacao, extra: Record<string, string | undefined> = {}) => ({
  DATABASE_URL: `file:${i.banco}`,
  STORAGE_DIR: i.storage,
  BACKUP_DIR: i.backups,
  NODE_ENV: 'test',
  PORT: '3296',
  ...extra,
})

/** Uma instalação existente, criada de verdade por uma restauração, e o retrato dela byte a byte. */
async function instalacaoExistente(arquivo: string) {
  const raiz = novoDiretorioDeTeste('converse-recusas-')
  const i: Instalacao = { raiz, banco: path.join(raiz, 'dados', 'app.db'), storage: path.join(raiz, 'dados', 'storage'), backups: path.join(raiz, 'dados', 'backups') }
  const r = await rodarScript('restore', variaveis(i), [arquivo])
  expect(r.codigo).toBe(0)
  return { i, retrato: retratar(i) }
}

function retratar(i: Instalacao) {
  return {
    banco: createHash('sha256').update(readFileSync(i.banco)).digest('hex'),
    storage: retratoDoStorage(i.storage),
    dados: readdirSync(path.dirname(i.banco)).sort(),
    backups: existsSync(i.backups) ? readdirSync(i.backups).sort() : [],
  }
}

async function recusar(arquivo: string, i: Instalacao, motivo: RegExp, extra: Record<string, string | undefined> = {}) {
  const r = await rodarScript('restore', variaveis(i, extra), [arquivo])
  expect(r.codigo, r.stdout + r.stderr).not.toBe(0)
  expect(r.stderr).toMatch(motivo)
  expect(r.stderr).not.toMatch(/\n\s+at\s/)
  return r
}

describe('a instalação existente não muda quando o backup é recusado', () => {
  it('arquivo adulterado', async () => {
    const b = await gerarBackupDeTeste()
    const { i, retrato } = await instalacaoExistente(b.caminho)
    const ruim = await adulterar(b.caminho, (dir) => alterarUmByte(path.join(dir, 'banco', 'app.db')), { reescreverManifesto: false })
    await recusar(ruim, i, /alterado|não confere/)
    expect(retratar(i)).toEqual(retrato)
  }, 180_000)

  it('manifest ausente', async () => {
    const b = await gerarBackupDeTeste()
    const { i, retrato } = await instalacaoExistente(b.caminho)
    const ruim = await adulterar(b.caminho, (dir) => rmSync(path.join(dir, 'manifest.json')), { reescreverManifesto: false })
    await recusar(ruim, i, /manifest/)
    expect(retratar(i)).toEqual(retrato)
  }, 180_000)

  it('esquema mais novo que o do app', async () => {
    const b = await gerarBackupDeTeste()
    const { i, retrato } = await instalacaoExistente(b.caminho)
    const ruim = await adulterar(b.caminho, (dir, m) => comMigrationNova(dir, m))
    await recusar(ruim, i, /mais nova|mais novo/)
    expect(retratar(i)).toEqual(retrato)
  }, 180_000)

  it('backup truncado', async () => {
    const b = await gerarBackupDeTeste()
    const { i, retrato } = await instalacaoExistente(b.caminho)
    await recusar(truncarAoMeio(b.caminho), i, /truncado|corrompido|válido/)
    expect(retratar(i)).toEqual(retrato)
  }, 180_000)

  it('BACKUP_DIR sem permissão de escrita: a cópia de segurança não pode ser feita, então nada é trocado', async () => {
    if (process.getuid?.() === 0) return // como root a permissão não impede a gravação (declarado: o teste é pulado)
    const b = await gerarBackupDeTeste()
    const { i, retrato } = await instalacaoExistente(b.caminho)
    const somenteLeitura = path.join(i.raiz, 'so-leitura')
    mkdirSync(somenteLeitura)
    chmodSync(somenteLeitura, 0o500)
    try {
      const r = await recusar(b.caminho, i, /Não foi possível trocar|estado anterior/, { BACKUP_DIR: path.join(somenteLeitura, 'backups') })
      expect(r.stderr).toMatch(/mantido/)
    } finally {
      chmodSync(somenteLeitura, 0o700)
    }
    expect(retratar(i)).toEqual(retrato)
  }, 180_000)
})
