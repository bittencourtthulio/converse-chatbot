// T-02.01 (FT-10): o conjunto fechado de ações da auditoria e a validação dos detalhes
// (sem segredo, sem conteúdo de conversa, sem identificador de visitante).
import { describe, it, expect } from 'vitest'
import { ACOES, TIPOS_DE_ALVO, LIMITE_DOS_DETALHES, validarDetalhes, validarAcao } from '@/servicos/auditoria-acoes'

describe('conjunto fechado de ações (funcional)', () => {
  it('tem as 18 ações do plano, incluindo restauracao para a FT-11', () => {
    expect(ACOES).toHaveLength(18)
    expect(ACOES).toEqual(
      expect.arrayContaining([
        'chave_openrouter_alterada',
        'chave_openrouter_removida',
        'modelo_transcricao_alterado',
        'usuario_criado',
        'usuario_editado',
        'usuario_excluido',
        'agente_excluido',
        'canal_conectado',
        'canal_desconectado',
        'canal_pausado',
        'canal_retomado',
        'canal_limite_alterado',
        'conversa_apagada',
        'retencao_alterada',
        'dados_do_titular_apagados',
        'dados_do_titular_exportados',
        'expurgo_automatico',
        'restauracao',
      ]),
    )
    expect(new Set(ACOES).size).toBe(ACOES.length)
  })

  it('validarAcao aceita uma ação conhecida e recusa o resto com 422', () => {
    expect(validarAcao('restauracao')).toBe('restauracao')
    expect(() => validarAcao('apagar_tudo')).toThrowError(expect.objectContaining({ status: 422 }))
    expect(() => validarAcao(undefined)).toThrowError(expect.objectContaining({ status: 422 }))
  })

  it('os tipos de alvo são um conjunto fechado', () => {
    expect(TIPOS_DE_ALVO).toEqual(expect.arrayContaining(['configuracao', 'usuario', 'agente', 'conversa', 'canal', 'titular', 'sistema']))
  })
})

describe('validação dos detalhes (integração com o conjunto)', () => {
  it('aceita só as chaves permitidas da ação e devolve o JSON', () => {
    expect(validarDetalhes('usuario_editado', { campos: ['papel'], papelAnterior: 'usuario', papelNovo: 'admin' })).toBe(
      '{"campos":["papel"],"papelAnterior":"usuario","papelNovo":"admin"}',
    )
    expect(validarDetalhes('chave_openrouter_alterada', undefined)).toBe('{}')
  })

  it('recusa chave de detalhe que a ação não permite', () => {
    expect(() => validarDetalhes('chave_openrouter_alterada', { chave: 'x' })).toThrowError(expect.objectContaining({ status: 422 }))
    expect(() => validarDetalhes('conversa_apagada', { texto: 'oi' })).toThrowError(expect.objectContaining({ status: 422 }))
    expect(() => validarDetalhes('conversa_apagada', { visitanteId: 'abc' })).toThrowError(expect.objectContaining({ status: 422 }))
  })

  it('recusa detalhes acima do limite e valor que não é simples', () => {
    expect(() => validarDetalhes('agente_excluido', { nome: 'a'.repeat(LIMITE_DOS_DETALHES + 10) })).toThrowError(expect.objectContaining({ status: 422 }))
    expect(() => validarDetalhes('agente_excluido', { nome: { aninhado: true } })).toThrowError(expect.objectContaining({ status: 422 }))
  })

  it('recusa valor que parece segredo (chave do OpenRouter, texto cifrado, token do Telegram)', () => {
    for (const valor of ['sk-or-v1-abcdefghijklmnop', 'v1:AAAA:BBBB:CCCC', '123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw']) {
      expect(() => validarDetalhes('modelo_transcricao_alterado', { modelo: valor })).toThrowError(expect.objectContaining({ status: 422 }))
    }
  })
})
