/**
 * GET /api/conversas/[id]/exportar contra o servidor de produção (FT-09, PR-83): sessão no
 * servidor, texto simples como anexo seguro e nome de arquivo sem dado pessoal.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarConversaDeTeste, fonteDeTeste } from './apoio/historico'
import { cookieDe, subirServidor, type Servidor } from './apoio/servidor'

const SENHA = 'senha-de-rota-123'
const VISITANTE = 'visitante-exportar-123456789'
let servidor: Servidor
let cookie: string
let conversaId: string

const exportar = (id: string, c: string | undefined = cookie) =>
  fetch(`${servidor.base}/api/conversas/${id}/exportar`, { headers: c ? { cookie: c } : {} })

beforeAll(async () => {
  await limparBanco()
  const u = await prisma.usuario.create({
    data: { nome: 'Comum', email: 'comum.exportar@teste.local', senhaHash: await hashDeSenha(SENHA), papel: 'usuario' },
  })
  const agente = await criarAgenteDeTeste({ nome: 'Vendas', criadoPorId: u.id })
  const c = await criarConversaDeTeste({
    agenteId: agente.id,
    canal: 'widget',
    identificadorExterno: VISITANTE,
    mensagens: [
      { papel: 'user', conteudo: 'Qual o prazo de entrega?' },
      { papel: 'assistant', conteudo: 'Cinco dias [1].', fontes: [fonteDeTeste('Política de entrega')] },
    ],
  })
  conversaId = c.id
  cookie = await cookieDe('comum.exportar@teste.local', SENHA)
  servidor = await subirServidor(3202)
}, 120_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

describe('exportar (integração)', () => {
  it('sem sessão dá 401 e não devolve o texto', async () => {
    const r = await exportar(conversaId, '')
    expect(r.status).toBe(401)
    expect(await r.text()).not.toContain('Qual o prazo')
  })

  it('com sessão devolve o texto da conversa', async () => {
    const r = await exportar(conversaId)
    expect(r.status).toBe(200)
    const texto = await r.text()
    expect(texto).toContain('Conversa com o agente "Vendas"')
    expect(texto).toContain('Qual o prazo de entrega?')
    expect(texto).toContain('Cinco dias [1].')
  })

  it('id inexistente dá 404 em JSON', async () => {
    const r = await exportar('nao-existe')
    expect(r.status).toBe(404)
    expect(await r.json()).toMatchObject({ codigo: 'nao_encontrado' })
  })
})

describe('exportar (funcional)', () => {
  it('é texto simples em UTF-8, anexo com nome do id, sem cache e sem farejar tipo', async () => {
    const r = await exportar(conversaId)
    expect(r.headers.get('content-type')).toBe('text/plain; charset=utf-8')
    expect(r.headers.get('content-disposition')).toBe(`attachment; filename="conversa-${conversaId}.txt"`)
    expect(r.headers.get('cache-control')).toContain('no-store')
    expect(r.headers.get('x-content-type-options')).toBe('nosniff')
  })

  it('nem o nome do arquivo nem o texto levam o identificador do visitante', async () => {
    const r = await exportar(conversaId)
    const nome = r.headers.get('content-disposition') ?? ''
    const texto = await r.text()
    expect(nome).not.toContain('Visitante')
    expect(nome).not.toContain(VISITANTE)
    expect(texto).not.toContain(VISITANTE)
    expect(texto).toContain('Visitante visita')
    expect(texto).toContain('Fontes: Política de entrega')
  })
})
