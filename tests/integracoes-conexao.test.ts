import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  salvarChaveDoOpenrouter,
  testarConexaoDoOpenrouter,
  obterChaveDoOpenrouter,
  estadoDoOpenrouter,
} from '@/servicos/integracoes'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'
import {
  iniciarOpenRouterFalso,
  CHAVE_VALIDA,
  type OpenRouterFalso,
} from './apoio/openrouter-falso'

let falso: OpenRouterFalso
const baseOriginal = process.env.OPENROUTER_BASE_URL
const chaveDeTeste = process.env.ENCRYPTION_KEY

beforeEach(async () => {
  await limparBanco()
  falso = await iniciarOpenRouterFalso()
  process.env.OPENROUTER_BASE_URL = falso.url
})
afterEach(async () => {
  vi.restoreAllMocks()
  await falso.fechar()
  process.env.ENCRYPTION_KEY = chaveDeTeste
  if (baseOriginal === undefined) delete process.env.OPENROUTER_BASE_URL
  else process.env.OPENROUTER_BASE_URL = baseOriginal
})

describe('testarConexaoDoOpenrouter', () => {
  it('com chave válida devolve sucesso e chamou /key com a chave gravada', async () => {
    const admin = await criarAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: CHAVE_VALIDA })
    const resultado = await testarConexaoDoOpenrouter(admin)
    expect(resultado.ok).toBe(true)
    const chamada = falso.requisicoes.find((r) => r.caminho.endsWith('/key'))
    expect(chamada?.cabecalhos.authorization).toBe(`Bearer ${CHAVE_VALIDA}`)
  })

  it('com chave recusada pelo provedor lança provedor_chave_invalida', async () => {
    const admin = await criarAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: 'sk-or-v1-recusada-1234' })
    await expect(testarConexaoDoOpenrouter(admin)).rejects.toMatchObject({
      codigo: 'provedor_chave_invalida',
    })
  })

  it('sem chave cadastrada avisa que não há chave, sem chamar o provedor', async () => {
    const admin = await criarAdmin()
    await expect(testarConexaoDoOpenrouter(admin)).rejects.toMatchObject({
      codigo: 'chave_nao_configurada',
    })
    expect(falso.requisicoes).toHaveLength(0)
  })

  it('usuário comum recebe 403', async () => {
    const comum = await criarUsuario()
    await expect(testarConexaoDoOpenrouter(comum)).rejects.toMatchObject({ status: 403 })
  })
})

describe('obterChaveDoOpenrouter', () => {
  it('devolve a chave original ou null', async () => {
    expect(await obterChaveDoOpenrouter()).toBeNull()
    const admin = await criarAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: CHAVE_VALIDA })
    expect(await obterChaveDoOpenrouter()).toBe(CHAVE_VALIDA)
  })

  it('chave gravada com outra ENCRYPTION_KEY dá erro claro sem derrubar o estado', async () => {
    const admin = await criarAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: CHAVE_VALIDA })
    process.env.ENCRYPTION_KEY = 'ab'.repeat(32)
    await expect(obterChaveDoOpenrouter()).rejects.toThrow(/não foi possível ler/i)
    expect((await estadoDoOpenrouter(admin)).problema).toBeTruthy()
  })
})

describe('a chave nunca vai para log nem para mensagem de erro', () => {
  it('nenhuma chamada de console recebe a chave, nem em caso de erro', async () => {
    const espioes = [
      vi.spyOn(console, 'error').mockImplementation(() => undefined),
      vi.spyOn(console, 'log').mockImplementation(() => undefined),
      vi.spyOn(console, 'warn').mockImplementation(() => undefined),
    ]
    const admin = await criarAdmin()
    const chaveRuim = 'sk-or-v1-vazamento-em-log-5555'
    await salvarChaveDoOpenrouter(admin, { chave: chaveRuim })
    let mensagem = ''
    try {
      await testarConexaoDoOpenrouter(admin)
    } catch (erro) {
      mensagem = (erro as Error).message
    }
    expect(mensagem).not.toBe('')
    expect(mensagem).not.toContain('vazamento-em-log')
    for (const espiao of espioes) {
      expect(JSON.stringify(espiao.mock.calls)).not.toContain('vazamento-em-log')
    }
  })
})
