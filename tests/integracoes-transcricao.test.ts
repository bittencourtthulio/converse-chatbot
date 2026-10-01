/**
 * T-04.02 (FT-08): o modelo de transcrição efetivo (banco, depois ambiente,
 * depois constante), salvo só pelo admin; qualquer usuário lê o modelo em uso
 * (PR-73, PR-12).
 */
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { MODELO_DE_TRANSCRICAO_PADRAO } from '@/lib/ambiente'
import {
  estadoDoModeloDeTranscricao,
  modeloDeTranscricaoEfetivo,
  salvarChaveDoOpenrouter,
  salvarModeloDeTranscricao,
  obterChaveDoOpenrouter,
} from '@/servicos/integracoes'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

const original = process.env.OPENROUTER_MODELO_TRANSCRICAO
beforeEach(async () => {
  await limparBanco()
  delete process.env.OPENROUTER_MODELO_TRANSCRICAO
})
afterEach(() => {
  if (original === undefined) delete process.env.OPENROUTER_MODELO_TRANSCRICAO
  else process.env.OPENROUTER_MODELO_TRANSCRICAO = original
})
afterAll(limparBanco)

describe('modelo de transcrição efetivo', () => {
  it('com banco vazio e sem variável é a constante; com a variável é a dela; com o banco é o do banco', async () => {
    expect(await modeloDeTranscricaoEfetivo()).toBe(MODELO_DE_TRANSCRICAO_PADRAO)
    process.env.OPENROUTER_MODELO_TRANSCRICAO = 'openai/gpt-4o-audio-preview'
    expect(await modeloDeTranscricaoEfetivo()).toBe('openai/gpt-4o-audio-preview')
    const admin = await criarAdmin()
    await salvarModeloDeTranscricao(admin, { modelo: 'google/gemini-2.0-flash-001' })
    expect(await modeloDeTranscricaoEfetivo()).toBe('google/gemini-2.0-flash-001')
  })

  it('o estado traz o efetivo, o salvo e o padrão do ambiente, e vale para usuário comum', async () => {
    const admin = await criarAdmin()
    const comum = await criarUsuario()
    await salvarModeloDeTranscricao(admin, { modelo: ' vendor/modelo-x:free ' })
    process.env.OPENROUTER_MODELO_TRANSCRICAO = 'outro/modelo'
    expect(await estadoDoModeloDeTranscricao(comum)).toEqual({
      efetivo: 'vendor/modelo-x:free',
      salvo: 'vendor/modelo-x:free',
      padrao: 'outro/modelo',
    })
  })
})

describe('salvarModeloDeTranscricao', () => {
  it('usuário comum não salva (403) e nada muda', async () => {
    const comum = await criarUsuario()
    await expect(salvarModeloDeTranscricao(comum, { modelo: 'a/b' })).rejects.toMatchObject({ status: 403 })
    expect(await prisma.configuracaoDoWorkspace.count()).toBe(0)
  })

  it('modelo com espaço, caractere estranho ou acima de 100 caracteres dá 422', async () => {
    const admin = await criarAdmin()
    for (const ruim of ['a b', 'modelo;rm -rf', 'x'.repeat(101), 'ação/modelo', 7, null]) {
      await expect(salvarModeloDeTranscricao(admin, { modelo: ruim }), String(ruim)).rejects.toMatchObject({ status: 422 })
    }
    await expect(salvarModeloDeTranscricao(admin, undefined)).rejects.toMatchObject({ status: 422 })
    expect(await prisma.configuracaoDoWorkspace.count()).toBe(0)
  })

  it('vazio restaura o padrão, e salvar o modelo não mexe na chave do OpenRouter', async () => {
    const admin = await criarAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: 'sk-or-v1-chave-de-teste-0000' })
    await salvarModeloDeTranscricao(admin, { modelo: 'a/b' })
    expect(await obterChaveDoOpenrouter()).toBe('sk-or-v1-chave-de-teste-0000')
    const depois = await salvarModeloDeTranscricao(admin, { modelo: '   ' })
    expect(depois.salvo).toBeNull()
    expect(depois.efetivo).toBe(MODELO_DE_TRANSCRICAO_PADRAO)
    const linha = await prisma.configuracaoDoWorkspace.findUniqueOrThrow({ where: { id: 'unica' } })
    expect(linha.modeloDeTranscricao).toBeNull()
    expect(linha.atualizadoPor).toBe(admin.id)
    expect(await obterChaveDoOpenrouter()).toBe('sk-or-v1-chave-de-teste-0000')
  })
})
