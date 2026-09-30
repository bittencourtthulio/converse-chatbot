import { describe, it, expect } from 'vitest'
import { ErroDeAplicacao, erroDoProvedor, entradaInvalida } from '@/lib/erros'
import {
  MENSAGEM_PARA_VISITANTE,
  erroSemChave,
  gerarCorrelacao,
  mensagemParaOperador,
  mensagemParaVisitante,
} from '@/servicos/chat-erros'

const provedor = [
  erroDoProvedor(401),
  erroDoProvedor(402),
  erroDoProvedor(400),
  erroDoProvedor(429),
  erroDoProvedor(503),
  erroDoProvedor('timeout'),
]

describe('mensagemParaOperador', () => {
  it('cada falha do provedor e a falta de chave têm mensagem distinta em português', () => {
    const mensagens = [...provedor, erroSemChave()].map((e) => mensagemParaOperador(e).mensagem)
    expect(new Set(mensagens).size).toBe(mensagens.length)
    expect(mensagemParaOperador(erroDoProvedor(401)).mensagem).toMatch(/chave/i)
    expect(mensagemParaOperador(erroDoProvedor(402)).mensagem).toMatch(/saldo/i)
    expect(mensagemParaOperador(erroDoProvedor(400)).mensagem).toMatch(/modelo/i)
    expect(mensagemParaOperador(erroDoProvedor(429)).mensagem).toMatch(/limite/i)
    expect(mensagemParaOperador(erroDoProvedor('timeout')).mensagem).toMatch(/demorou/i)
    expect(mensagemParaOperador(erroDoProvedor(503)).mensagem).toMatch(/indispon/i)
  })

  it('sem chave pede a um administrador que cadastre', () => {
    const erro = erroSemChave()
    expect(erro.status).toBe(409)
    expect(erro.codigo).toBe('chat_sem_chave')
    expect(mensagemParaOperador(erro).mensagem).toMatch(/administrador/i)
  })

  it('devolve o código do erro para a tela decidir o que mostrar', () => {
    expect(mensagemParaOperador(erroDoProvedor(401)).codigo).toBe('provedor_chave_invalida')
  })

  it('erro de aplicação comum mantém a própria mensagem segura', () => {
    expect(mensagemParaOperador(entradaInvalida('Mensagem vazia.')).mensagem).toBe('Mensagem vazia.')
  })

  it('erro inesperado vira frase com código de referência, sem a mensagem nem a pilha', () => {
    const inesperado = new Error('SELECT * FROM x -- senha=abc123')
    inesperado.stack = 'Error: x\n    at /Users/alguem/arquivo.ts:10:5'
    const r = mensagemParaOperador(inesperado, 'ab12cd34')
    expect(r.mensagem).toContain('ab12cd34')
    expect(r.mensagem).not.toContain('SELECT')
    expect(r.mensagem).not.toContain('abc123')
    expect(r.mensagem).not.toContain('/Users')
    expect(r.codigo).toBe('erro_inesperado')
    expect(r.correlacao).toBe('ab12cd34')
  })

  it('não repete o que não é seu: valor que não é erro também é tratado', () => {
    expect(mensagemParaOperador('texto solto').codigo).toBe('erro_inesperado')
    expect(mensagemParaOperador(null).mensagem).toMatch(/referência/)
  })
})

describe('mensagemParaVisitante', () => {
  it('é sempre a mesma frase genérica', () => {
    expect(MENSAGEM_PARA_VISITANTE).toBe('Não consegui responder agora. Tente novamente em instantes.')
    for (const erro of [...provedor, erroSemChave(), new Error('x'), entradaInvalida('y'), null]) {
      expect(mensagemParaVisitante(erro)).toBe(MENSAGEM_PARA_VISITANTE)
    }
  })

  it('não cita tela de admin, chave nem detalhe do provedor', () => {
    for (const erro of [...provedor, erroSemChave()]) {
      const texto = mensagemParaVisitante(erro)
      expect(texto).not.toMatch(/Integra|Configura|sk-or|saldo|chave|OpenRouter/i)
    }
  })
})

describe('gerarCorrelacao', () => {
  it('são 8 caracteres hexadecimais, diferentes a cada chamada', () => {
    const a = gerarCorrelacao()
    expect(a).toMatch(/^[0-9a-f]{8}$/)
    expect(gerarCorrelacao()).not.toBe(a)
  })
})

describe('ErroDeAplicacao', () => {
  it('erroSemChave é um ErroDeAplicacao', () => {
    expect(erroSemChave()).toBeInstanceOf(ErroDeAplicacao)
  })
})
