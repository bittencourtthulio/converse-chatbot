/**
 * T-06.04 (FT-08): o campo Modelo de transcrição em Configurações > Integrações
 * (só admin): a ação de servidor salva e restaura o padrão contra o banco de
 * teste, e o painel mostra o modelo em uso, o padrão e o aviso de créditos
 * (PR-73, PR-12). Só as bordas do framework são trocadas.
 */
import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { prisma } from '@/lib/prisma'
import { MODELO_DE_TRANSCRICAO_PADRAO } from '@/lib/ambiente'
import { PainelDoModeloDeTranscricao } from '@/componentes/PainelDoModeloDeTranscricao'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

let usuarioDaSessao: Awaited<ReturnType<typeof criarUsuario>> | null = null
const revalidatePath = vi.fn()

vi.mock('@/app/sessao-servidor', () => ({
  exigirUsuario: async () => usuarioDaSessao,
  exigirUsuarioAdmin: async () => {
    if (!usuarioDaSessao) throw new Error('sem sessão')
    return usuarioDaSessao
  },
  gravarCookieDeSessao: async () => undefined,
  apagarCookieDeSessao: async () => undefined,
}))
vi.mock('next/navigation', () => ({
  redirect: (destino: string) => {
    throw Object.assign(new Error('NEXT_REDIRECT'), { destino })
  },
}))
vi.mock('next/cache', () => ({ revalidatePath: (caminho: string) => revalidatePath(caminho) }))

const { salvarModeloTranscricao } = await import('@/app/acoes')

const formulario = (campos: Record<string, string>) => {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) f.set(k, v)
  return f
}
const salvo = async () => (await prisma.configuracaoDoWorkspace.findUnique({ where: { id: 'unica' } }))?.modeloDeTranscricao ?? null
const original = process.env.OPENROUTER_MODELO_TRANSCRICAO

beforeEach(async () => {
  revalidatePath.mockClear()
  await limparBanco()
  delete process.env.OPENROUTER_MODELO_TRANSCRICAO
  usuarioDaSessao = await criarAdmin()
})
afterEach(() => {
  if (original === undefined) delete process.env.OPENROUTER_MODELO_TRANSCRICAO
  else process.env.OPENROUTER_MODELO_TRANSCRICAO = original
})
afterAll(limparBanco)

describe('ação salvarModeloTranscricao', () => {
  it('o admin salva o modelo informado, a tela é revalidada e o valor fica no banco', async () => {
    const r = await salvarModeloTranscricao({}, formulario({ modelo: ' openai/gpt-4o-audio-preview ' }))
    expect(r).toEqual({ sucesso: 'Modelo de transcrição salvo.' })
    expect(await salvo()).toBe('openai/gpt-4o-audio-preview')
    expect(revalidatePath).toHaveBeenCalledWith('/configuracoes/integracoes')
  })

  it('salvar vazio ou pedir para restaurar volta ao padrão', async () => {
    await salvarModeloTranscricao({}, formulario({ modelo: 'a/b' }))
    const vazio = await salvarModeloTranscricao({}, formulario({ modelo: '   ' }))
    expect(vazio.sucesso).toMatch(/padrão/)
    expect(await salvo()).toBeNull()
    await salvarModeloTranscricao({}, formulario({ modelo: 'a/b' }))
    const restaurado = await salvarModeloTranscricao({}, formulario({ modelo: 'a/b', restaurar: '1' }))
    expect(restaurado.sucesso).toMatch(/padrão/)
    expect(await salvo()).toBeNull()
  })

  it('modelo com espaço mostra erro de validação em português e não grava nada', async () => {
    const r = await salvarModeloTranscricao({}, formulario({ modelo: 'modelo com espaço' }))
    expect(r.sucesso).toBeUndefined()
    expect(r.erro).toMatch(/só pode ter letras/)
    expect(await salvo()).toBeNull()
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('usuário comum é recusado pelo servidor, mesmo que a guarda da página falhe', async () => {
    usuarioDaSessao = await criarUsuario()
    const r = await salvarModeloTranscricao({}, formulario({ modelo: 'a/b' }))
    expect(r.erro).toMatch(/não tem acesso/i)
    expect(await salvo()).toBeNull()
  })
})

describe('PainelDoModeloDeTranscricao', () => {
  const acao = async () => ({})
  const render = (estado: { efetivo: string; salvo: string | null; padrao: string }) =>
    renderToStaticMarkup(<PainelDoModeloDeTranscricao estado={estado} acao={acao} />)

  it('mostra o modelo em uso, o padrão, o campo e o aviso de que a transcrição consome créditos', () => {
    const html = render({ efetivo: MODELO_DE_TRANSCRICAO_PADRAO, salvo: null, padrao: MODELO_DE_TRANSCRICAO_PADRAO })
    expect(html).toContain('Modelo de transcrição')
    expect(html).toContain(MODELO_DE_TRANSCRICAO_PADRAO)
    expect(html).toMatch(/<input[^>]*name="modelo"/)
    expect(html).toMatch(/créditos do OpenRouter/)
    expect(html).toMatch(/entrada de áudio/)
    expect(html).toContain('Salvar modelo')
    expect(html).not.toContain('Restaurar o padrão')
  })

  it('com um modelo salvo o campo vem preenchido e aparece o botão para restaurar o padrão', () => {
    const html = render({ efetivo: 'vendor/modelo-x', salvo: 'vendor/modelo-x', padrao: MODELO_DE_TRANSCRICAO_PADRAO })
    expect(html).toMatch(/<input[^>]*name="modelo"[^>]*value="vendor\/modelo-x"/)
    expect(html).toContain('Restaurar o padrão')
    expect(html).toContain(MODELO_DE_TRANSCRICAO_PADRAO)
  })
})
