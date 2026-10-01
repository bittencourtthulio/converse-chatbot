/**
 * A ação de servidor "Gerar backup agora" (FT-11, PR-96): só as bordas do framework são trocadas
 * (sessão, redirecionamento, revalidação); o serviço, o banco e o disco são os reais. Para o admin cria
 * o backup e devolve o sucesso com o nome; para o usuário comum devolve erro sem criar arquivo; falha
 * inesperada devolve a mensagem genérica com o código de referência.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, readdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'
import { semearInstalacao } from './apoio/instalacao'

let sessao: Awaited<ReturnType<typeof criarUsuario>> | null = null
const revalidatePath = vi.fn()

vi.mock('@/app/sessao-servidor', () => ({
  exigirUsuario: async () => {
    if (!sessao) throw new Error('sem sessão')
    return sessao
  },
  exigirUsuarioAdmin: async () => {
    if (!sessao) throw new Error('sem sessão')
    return sessao
  },
  gravarCookieDeSessao: async () => undefined,
  apagarCookieDeSessao: async () => undefined,
}))
vi.mock('next/navigation', () => ({ redirect: () => undefined }))
vi.mock('next/cache', () => ({ revalidatePath: (caminho: string) => revalidatePath(caminho) }))
vi.mock('next/headers', () => ({ headers: async () => new Headers({ 'x-correlacao': 'abcd1234' }) }))

const { gerarBackupDaTela } = await import('@/app/acoes')

const original = { ...process.env }
let dir: string

beforeEach(async () => {
  revalidatePath.mockClear()
  await limparBanco()
  dir = mkdtempSync(path.join(os.tmpdir(), 'converse-acao-backup-'))
  process.env.BACKUP_DIR = dir
})
afterEach(() => {
  vi.restoreAllMocks()
  rmSync(dir, { recursive: true, force: true })
  if (original.BACKUP_DIR === undefined) delete process.env.BACKUP_DIR
  else process.env.BACKUP_DIR = original.BACKUP_DIR
})

describe('gerarBackupDaTela', () => {
  it('para o admin cria o backup, devolve o sucesso com o nome e o tamanho e revalida a tela Sistema', async () => {
    const inst = await semearInstalacao()
    sessao = inst.admin
    const r = await gerarBackupDaTela({}, new FormData())
    const [arquivo] = readdirSync(dir)
    expect(arquivo).toMatch(/^backup-\d{8}-\d{6}(-\d+)?\.tar\.gz$/)
    expect(r.erro).toBeUndefined()
    expect(r.sucesso).toContain(arquivo)
    expect(r.sucesso).toMatch(/\d+(,\d)? (B|KB|MB)/)
    expect(revalidatePath).toHaveBeenCalledWith('/configuracoes/sistema')
  })

  it('para o usuário comum não cria arquivo e devolve o erro de permissão', async () => {
    await semearInstalacao()
    sessao = await criarUsuario()
    const r = await gerarBackupDaTela({}, new FormData())
    expect(r.sucesso).toBeUndefined()
    expect(r.erro).toBe('Você não tem acesso a este recurso.')
    expect(readdirSync(dir)).toEqual([])
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('falha inesperada devolve a frase genérica com o código de referência, sem a mensagem do erro', async () => {
    sessao = await criarAdmin()
    process.env.BACKUP_DIR = path.join(dir, 'arquivo-no-lugar-da-pasta', 'x')
    const { writeFileSync } = await import('node:fs')
    writeFileSync(path.join(dir, 'arquivo-no-lugar-da-pasta'), 'x')
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const r = await gerarBackupDaTela({}, new FormData())
    expect(r.sucesso).toBeUndefined()
    // O erro do banco/disco vira a mensagem do serviço (de aplicação) ou o código de referência: nunca o texto técnico.
    expect(r.erro).toMatch(/Não foi possível gerar o backup|Código de referência: abcd1234/)
    expect(r.erro).not.toMatch(/ENOTDIR|EEXIST|\//)
  })
})
