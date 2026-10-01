/**
 * T-04.03 (FT-12, PR-12, PR-104, ressalva R-02 do B6): `auditoria.listar` se defende sozinha. Só o admin lê a
 * trilha; a página também confere, mas a defesa em profundidade é do serviço.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { listar } from '@/servicos/auditoria'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'
import { criarRegistroDeTeste } from './apoio/privacidade'

beforeEach(limparBanco)

describe('listar confere o papel (integração)', () => {
  it('usuário comum recebe 403 e ator ausente recebe 401, antes de qualquer consulta', async () => {
    const comum = await criarUsuario()
    await expect(listar(comum, {})).rejects.toMatchObject({ status: 403 })
    await expect(listar(undefined as never, {})).rejects.toMatchObject({ status: 401 })
    await expect(listar(null as never, {})).rejects.toMatchObject({ status: 401 })
  })

  it('o admin recebe a página de registros', async () => {
    const admin = await criarAdmin()
    await criarRegistroDeTeste({ acao: 'usuario_criado', usuarioId: admin.id })
    const pagina = await listar(admin, { pagina: 1, tamanho: 10 })
    expect(pagina.total).toBe(1)
    expect(pagina.itens[0]).toMatchObject({ acao: 'usuario_criado' })
  })
})

describe('a defesa vale mesmo com entrada inválida (funcional)', () => {
  it('o usuário comum com filtro inválido recebe 403, não 422: o papel é conferido primeiro', async () => {
    const comum = await criarUsuario()
    await expect(listar(comum, { acao: 'acao-que-nao-existe' })).rejects.toMatchObject({ status: 403 })
  })

  it('o admin com filtro inválido continua recebendo 422', async () => {
    const admin = await criarAdmin()
    await expect(listar(admin, { acao: 'acao-que-nao-existe' })).rejects.toMatchObject({ status: 422 })
  })
})
