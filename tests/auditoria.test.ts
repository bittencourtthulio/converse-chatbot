// T-02.01 (FT-10): registrar e listar a trilha de auditoria contra o banco de teste.
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { aguardarGravacoesPendentes, listar, registrar, registrarMelhorEsforco } from '@/servicos/auditoria'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'
import { criarRegistroDeTeste } from './apoio/privacidade'

beforeEach(limparBanco)
afterAll(limparBanco)

describe('registrar (integração)', () => {
  it('grava a linha com o rótulo "Nome <e-mail>" do usuário e os detalhes em JSON', async () => {
    const admin = await criarAdmin()
    const registro = await registrar({
      ator: admin,
      acao: 'usuario_editado',
      alvoTipo: 'usuario',
      alvoId: 'u1',
      detalhes: { campos: ['papel'], papelAnterior: 'usuario', papelNovo: 'admin' },
    })
    const lido = await prisma.registroDeAuditoria.findUniqueOrThrow({ where: { id: registro.id } })
    expect(lido.usuarioId).toBe(admin.id)
    expect(lido.usuarioRotulo).toBe(`${admin.nome} <${admin.email}>`)
    expect(lido.acao).toBe('usuario_editado')
    expect(lido.alvoTipo).toBe('usuario')
    expect(lido.alvoId).toBe('u1')
    expect(JSON.parse(lido.detalhes)).toEqual({ campos: ['papel'], papelAnterior: 'usuario', papelNovo: 'admin' })
  })

  it('o ator sistema e o visitante gravam sem usuário e com rótulo próprio', async () => {
    const sistema = await registrar({ ator: 'sistema', acao: 'expurgo_automatico', alvoTipo: 'sistema', detalhes: { conversas: 3 } })
    const visitante = await registrar({ ator: 'visitante', acao: 'conversa_apagada', alvoTipo: 'conversa', alvoId: 'c1' })
    const a = await prisma.registroDeAuditoria.findUniqueOrThrow({ where: { id: sistema.id } })
    const b = await prisma.registroDeAuditoria.findUniqueOrThrow({ where: { id: visitante.id } })
    expect(a.usuarioId).toBeNull()
    expect(a.usuarioRotulo).toBe('Sistema')
    expect(b.usuarioId).toBeNull()
    expect(b.usuarioRotulo).toBe('Visitante (chat embutido)')
  })

  it('registrar com cliente de transação participa da transação e some se ela desfaz', async () => {
    const admin = await criarAdmin()
    await expect(
      prisma.$transaction(async (tx) => {
        await registrar({ ator: admin, acao: 'usuario_criado', alvoTipo: 'usuario' }, tx)
        throw new Error('desfaz')
      }),
    ).rejects.toThrow('desfaz')
    expect(await prisma.registroDeAuditoria.count()).toBe(0)
  })
})

describe('registrar (funcional): recusas', () => {
  it('ação fora do conjunto, detalhe não permitido e detalhes grandes dão 422 e nada é gravado', async () => {
    const admin = await criarAdmin()
    await expect(registrar({ ator: admin, acao: 'apagar_tudo' as never, alvoTipo: 'sistema' })).rejects.toMatchObject({ status: 422 })
    await expect(
      registrar({ ator: admin, acao: 'chave_openrouter_alterada', alvoTipo: 'configuracao', detalhes: { chave: 'x' } }),
    ).rejects.toMatchObject({ status: 422 })
    await expect(
      registrar({ ator: admin, acao: 'agente_excluido', alvoTipo: 'agente', detalhes: { nome: 'x'.repeat(2000) } }),
    ).rejects.toMatchObject({ status: 422 })
    expect(await prisma.registroDeAuditoria.count()).toBe(0)
  })

  it('a ação backup_gerado aceita origem, bytes e arquivos e recusa qualquer outra chave (FT-11)', async () => {
    const admin = await criarAdmin()
    const r = await registrar({ ator: admin, acao: 'backup_gerado', alvoTipo: 'sistema', detalhes: { origem: 'tela', bytes: 3145728, arquivos: 12 } })
    expect(r.acao).toBe('backup_gerado')
    expect(r.detalhes).toEqual({ origem: 'tela', bytes: 3145728, arquivos: 12 })
    await expect(
      registrar({ ator: admin, acao: 'backup_gerado', alvoTipo: 'sistema', detalhes: { nome: 'backup-20260505-102030.tar.gz' } }),
    ).rejects.toMatchObject({ status: 422 })
  })

  it('a ação restauracao é aceita (ponto de chamada da FT-11)', async () => {
    const admin = await criarAdmin()
    const r = await registrar({ ator: admin, acao: 'restauracao', alvoTipo: 'sistema', detalhes: { origem: 'arquivo de backup' } })
    expect(r.acao).toBe('restauracao')
  })
})

describe('registrarMelhorEsforco (funcional)', () => {
  it('com o banco falhando só escreve o log e não lança', async () => {
    const admin = await criarAdmin()
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const falha = vi.spyOn(prisma.registroDeAuditoria, 'create').mockRejectedValueOnce(new Error('banco caiu: segredo-do-erro'))
    await expect(registrarMelhorEsforco({ ator: admin, acao: 'retencao_alterada', alvoTipo: 'configuracao' })).resolves.toBeUndefined()
    await aguardarGravacoesPendentes()
    falha.mockRestore()
    expect(log).toHaveBeenCalledTimes(1)
    const linha = String(log.mock.calls[0]?.[0])
    expect(JSON.parse(linha)).toMatchObject({ nivel: 'erro', msg: 'auditoria_falhou', acao: 'retencao_alterada', erro: 'Error' })
    expect(linha).not.toContain('segredo-do-erro')
    log.mockRestore()
    expect(await prisma.registroDeAuditoria.count()).toBe(0)
  })

  it('com o banco bom grava e aguardarGravacoesPendentes espera a gravação', async () => {
    const admin = await criarAdmin()
    void registrarMelhorEsforco({ ator: admin, acao: 'retencao_alterada', alvoTipo: 'configuracao', detalhes: { diasAnterior: 90, diasNovo: 30 } })
    await aguardarGravacoesPendentes()
    expect(await prisma.registroDeAuditoria.count()).toBe(1)
  })
})

describe('listar (integração e funcional)', () => {
  let admin: Awaited<ReturnType<typeof criarAdmin>>
  beforeEach(async () => {
    admin = await criarAdmin()
  })

  it('devolve do mais recente ao mais antigo, com o total e a paginação', async () => {
    for (let i = 0; i < 5; i += 1) {
      await criarRegistroDeTeste({ acao: 'usuario_criado', quando: new Date(Date.UTC(2026, 0, 1 + i)) })
    }
    const pagina1 = await listar(admin, { pagina: 1, tamanho: 2 })
    expect(pagina1.total).toBe(5)
    expect(pagina1.totalDePaginas).toBe(3)
    expect(pagina1.itens.map((i) => i.quando.toISOString().slice(0, 10))).toEqual(['2026-01-05', '2026-01-04'])
    const pagina3 = await listar(admin, { pagina: 3, tamanho: 2 })
    expect(pagina3.itens).toHaveLength(1)
    expect(pagina3.itens[0]?.quando.toISOString().slice(0, 10)).toBe('2026-01-01')
  })

  it('filtra por ação, por usuário e por período', async () => {
    const u1 = await criarUsuario()
    const u2 = await criarUsuario()
    await criarRegistroDeTeste({ acao: 'usuario_criado', usuarioId: u1.id, quando: new Date(2026, 2, 10, 12) })
    await criarRegistroDeTeste({ acao: 'agente_excluido', usuarioId: u1.id, alvoTipo: 'agente', quando: new Date(2026, 2, 11, 12) })
    await criarRegistroDeTeste({ acao: 'agente_excluido', usuarioId: u2.id, alvoTipo: 'agente', quando: new Date(2026, 2, 12, 12) })

    expect((await listar(admin, { acao: 'agente_excluido' })).total).toBe(2)
    expect((await listar(admin, { usuarioId: u1.id })).total).toBe(2)
    expect((await listar(admin, { acao: 'agente_excluido', usuarioId: u2.id })).total).toBe(1)
    expect((await listar(admin, { de: '2026-03-11', ate: '2026-03-11' })).total).toBe(1)
    expect((await listar(admin, { de: '2026-03-11', ate: '2026-03-12' })).total).toBe(2)
  })

  it('recusa ação desconhecida, período invertido e página inválida com 422', async () => {
    await expect(listar(admin, { acao: 'apagar_tudo' })).rejects.toMatchObject({ status: 422 })
    await expect(listar(admin, { de: '2026-03-12', ate: '2026-03-10' })).rejects.toMatchObject({ status: 422 })
    await expect(listar(admin, { pagina: 0 })).rejects.toMatchObject({ status: 422 })
  })

  it('os detalhes voltam como objeto e o usuário removido aparece pelo rótulo gravado', async () => {
    const u = await criarUsuario()
    await criarRegistroDeTeste({ acao: 'usuario_criado', usuarioId: u.id, detalhes: { papel: 'admin' } })
    await prisma.usuario.delete({ where: { id: u.id } })
    const { itens } = await listar(admin, {})
    expect(itens[0]?.detalhes).toEqual({ papel: 'admin' })
    expect(itens[0]?.usuarioId).toBeNull()
    expect(itens[0]?.usuarioRotulo).toContain('<')
  })
})
