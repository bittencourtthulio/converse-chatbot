import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { modelosParaOSeletor } from '@/servicos/agentes'
import { salvarChaveDoOpenrouter } from '@/servicos/integracoes'
import { limparCacheDeModelos } from '@/lib/openrouter'
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
  limparCacheDeModelos()
  falso = await iniciarOpenRouterFalso()
  process.env.OPENROUTER_BASE_URL = falso.url
})
afterEach(async () => {
  await falso.fechar()
  process.env.ENCRYPTION_KEY = chaveDeTeste
  if (baseOriginal === undefined) delete process.env.OPENROUTER_BASE_URL
  else process.env.OPENROUTER_BASE_URL = baseOriginal
})

describe('modelosParaOSeletor', () => {
  it('sem chave configurada não chama o provedor e diz que não há chave', async () => {
    const usuario = await criarUsuario()
    expect(await modelosParaOSeletor(usuario)).toEqual({
      modelos: [],
      temChave: false,
      reserva: false,
    })
    expect(falso.requisicoes).toHaveLength(0)
  })

  it('com chave devolve id e nome dos modelos, sem a chave', async () => {
    const admin = await criarAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: CHAVE_VALIDA })
    const comum = await criarUsuario()
    const resultado = await modelosParaOSeletor(comum)
    expect(resultado.temChave).toBe(true)
    expect(resultado.reserva).toBe(false)
    expect(resultado.modelos).toContainEqual({
      id: 'openai/gpt-4o-mini',
      nome: 'OpenAI: GPT-4o mini',
    })
    expect(JSON.stringify(resultado)).not.toContain(CHAVE_VALIDA)
  })

  it('com o provedor fora do ar devolve a lista de reserva marcada', async () => {
    const admin = await criarAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: CHAVE_VALIDA })
    falso.configurar({ modelosFalham: true })
    const resultado = await modelosParaOSeletor(admin)
    expect(resultado.temChave).toBe(true)
    expect(resultado.reserva).toBe(true)
    expect(resultado.modelos.length).toBeGreaterThan(0)
  })

  it('chave ilegível (ENCRYPTION_KEY trocada) age como sem chave, sem falhar', async () => {
    const admin = await criarAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: CHAVE_VALIDA })
    process.env.ENCRYPTION_KEY = 'cd'.repeat(32)
    const resultado = await modelosParaOSeletor(admin)
    expect(resultado.temChave).toBe(false)
    expect(resultado.modelos).toEqual([])
  })
})
