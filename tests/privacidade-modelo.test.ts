/**
 * Modelo de dados da privacidade e da auditoria (FT-10, PR-86, PR-89, PR-91): a tabela
 * `registros_de_auditoria` e as colunas novas de `configuracao_do_workspace`, criadas pela
 * migration versionada (aplicada por `prisma migrate deploy` no setup).
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { criarUsuario, limparBanco } from './ajuda'

beforeEach(limparBanco)
afterAll(limparBanco)

const pasta = path.join(process.cwd(), 'prisma/migrations')
const migrationDaFeature = readdirSync(pasta).find((n) => n.endsWith('_privacidade_e_auditoria'))

describe('migration de privacidade e auditoria (integração)', () => {
  it('a migration existe e só acrescenta (sem DROP, que exigiria a marca de migração destrutiva)', () => {
    expect(migrationDaFeature).toBeDefined()
    const sql = readFileSync(path.join(pasta, migrationDaFeature as string, 'migration.sql'), 'utf8')
    expect(sql).not.toMatch(/\bDROP\b/i)
  })

  it('cria registros_de_auditoria com os índices por quando e por ação', async () => {
    const indices = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'registros_de_auditoria'`
    const nomes = indices.map((i) => i.name)
    expect(nomes).toContain('registros_de_auditoria_quando_idx')
    expect(nomes).toContain('registros_de_auditoria_acao_idx')
  })

  it('cria as colunas novas de configuracao_do_workspace', async () => {
    const colunas = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM pragma_table_info('configuracao_do_workspace')`
    const nomes = colunas.map((c) => c.name)
    expect(nomes).toEqual(
      expect.arrayContaining(['retencaoDiasConversas', 'avisoDePrivacidadePadrao', 'avisoDePrivacidadePadraoUrl']),
    )
  })
})

describe('registro de auditoria e configuração (funcional)', () => {
  it('o registro sobrevive com usuarioId nulo quando o usuário é apagado e guarda o rótulo', async () => {
    const usuario = await criarUsuario()
    const registro = await prisma.registroDeAuditoria.create({
      data: {
        usuarioId: usuario.id,
        usuarioRotulo: `${usuario.nome} <${usuario.email}>`,
        acao: 'usuario_criado',
        alvoTipo: 'usuario',
        alvoId: 'qualquer',
        detalhes: JSON.stringify({ papel: 'usuario' }),
      },
    })
    expect(registro.detalhes).toBe('{"papel":"usuario"}')

    await prisma.usuario.delete({ where: { id: usuario.id } })

    const depois = await prisma.registroDeAuditoria.findUniqueOrThrow({ where: { id: registro.id } })
    expect(depois.usuarioId).toBeNull()
    expect(depois.usuarioRotulo).toBe(`${usuario.nome} <${usuario.email}>`)
  })

  it('a configuração criada sem os campos novos vale retenção 90 e aviso vazio', async () => {
    const linha = await prisma.configuracaoDoWorkspace.create({ data: { id: 'unica' } })
    expect(linha.retencaoDiasConversas).toBe(90)
    expect(linha.avisoDePrivacidadePadrao).toBe('')
    expect(linha.avisoDePrivacidadePadraoUrl).toBe('')
  })

  it('retenção nula (sem expurgo) é gravada e lida como nula', async () => {
    await prisma.configuracaoDoWorkspace.create({ data: { id: 'unica', retencaoDiasConversas: null } })
    const linha = await prisma.configuracaoDoWorkspace.findUniqueOrThrow({ where: { id: 'unica' } })
    expect(linha.retencaoDiasConversas).toBeNull()
  })
})
