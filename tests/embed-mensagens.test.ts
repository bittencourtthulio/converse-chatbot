/**
 * T-04.03 (FT-06, PR-60, PR-61): o protocolo de postMessage do chat embutido:
 * o que o iframe manda ao pai e a prévia que o painel manda ao iframe.
 */
import { describe, it, expect, vi } from 'vitest'
import {
  avisarOPai,
  lerMensagemDePrevia,
  mensagemDeFechar,
  mensagemDePrevia,
  mensagemDeRedimensionar,
} from '@/componentes/embed-mensagens'

const ORIGEM = 'https://converse.exemplo.test'
const previa = (configuracao: unknown, origin = ORIGEM) => ({
  origin,
  data: { origem: 'converse', tipo: 'previa', configuracao },
})

describe('mensagens do iframe para o pai', () => {
  it('montam o formato do protocolo', () => {
    expect(mensagemDeFechar()).toEqual({ origem: 'converse', tipo: 'fechar' })
    expect(mensagemDeRedimensionar(true)).toEqual({ origem: 'converse', tipo: 'redimensionar', expandido: true })
    expect(mensagemDeRedimensionar(false)).toEqual({ origem: 'converse', tipo: 'redimensionar', expandido: false })
  })

  it('sem moldura (a janela é o próprio pai) não envia nada', () => {
    const janela = { parent: null as unknown, location: {} } as never
    ;(janela as { parent: unknown }).parent = janela
    expect(avisarOPai(mensagemDeFechar(), janela)).toBe(false)
  })

  it('com moldura envia ao pai, para a origem de quem emoldura quando o navegador a informa', () => {
    const postMessage = vi.fn()
    const janela = { parent: { postMessage }, location: { ancestorOrigins: { 0: 'https://cliente.com', length: 1 } } }
    expect(avisarOPai(mensagemDeFechar(), janela as never)).toBe(true)
    expect(postMessage).toHaveBeenCalledWith({ origem: 'converse', tipo: 'fechar' }, 'https://cliente.com')
  })

  it('sem ancestorOrigins o destino é * (a mensagem não leva dado)', () => {
    const postMessage = vi.fn()
    avisarOPai(mensagemDeRedimensionar(true), { parent: { postMessage }, location: {} } as never)
    expect(postMessage).toHaveBeenCalledWith({ origem: 'converse', tipo: 'redimensionar', expandido: true }, '*')
  })

  it('ancestorOrigins que não é http(s) é ignorado', () => {
    const postMessage = vi.fn()
    avisarOPai(mensagemDeFechar(), {
      parent: { postMessage },
      location: { ancestorOrigins: { 0: 'file://', length: 1 } },
    } as never)
    expect(postMessage).toHaveBeenCalledWith(expect.anything(), '*')
  })
})

describe('prévia do painel para o iframe', () => {
  it('só aceita a mesma origem', () => {
    expect(lerMensagemDePrevia(previa({ titulo: 'Novo' }), ORIGEM)).toEqual({ titulo: 'Novo' })
    expect(lerMensagemDePrevia(previa({ titulo: 'Novo' }, 'https://atacante.com'), ORIGEM)).toBeNull()
    expect(lerMensagemDePrevia(previa({ titulo: 'Novo' }, 'null'), ORIGEM)).toBeNull()
  })

  it('ignora mensagem que não é do protocolo', () => {
    for (const data of [null, 'texto', 42, {}, { origem: 'outro', tipo: 'previa', configuracao: {} }, { origem: 'converse', tipo: 'fechar' }, { origem: 'converse', tipo: 'previa', configuracao: null }]) {
      expect(lerMensagemDePrevia({ origin: ORIGEM, data }, ORIGEM)).toBeNull()
    }
  })

  it('cor válida atualiza (normalizada) e cor inválida é descartada', () => {
    expect(lerMensagemDePrevia(previa({ cor: '#ABC' }), ORIGEM)).toEqual({ cor: '#aabbcc' })
    expect(lerMensagemDePrevia(previa({ cor: 'red;x' }), ORIGEM)).toEqual({})
  })

  it('valida cada campo: posição, avatar, título, sugestões e aviso', () => {
    const r = lerMensagemDePrevia(
      previa({
        posicao: 'esquerda',
        avatar: 'estrela',
        titulo: 'Fale com a Ana',
        sugestoes: ['a', '', 7, 'b', 'c', 'd'],
        avisoDePrivacidade: { texto: 'Aviso', url: 'https://x.com/p' },
      }),
      ORIGEM,
    )
    expect(r).toEqual({
      posicao: 'esquerda',
      avatar: 'estrela',
      titulo: 'Fale com a Ana',
      sugestoes: ['a', 'b', 'c'],
      avisoDePrivacidade: { texto: 'Aviso', url: 'https://x.com/p' },
    })
    expect(lerMensagemDePrevia(previa({ posicao: 'centro', avatar: 'foto', titulo: '', sugestoes: 'x' }), ORIGEM)).toEqual({})
  })

  it('link do aviso que não é http(s) vira sem link; aviso nulo remove o aviso', () => {
    expect(lerMensagemDePrevia(previa({ avisoDePrivacidade: { texto: 'Aviso', url: 'javascript:alert(1)' } }), ORIGEM)).toEqual({
      avisoDePrivacidade: { texto: 'Aviso', url: null },
    })
    expect(lerMensagemDePrevia(previa({ avisoDePrivacidade: null }), ORIGEM)).toEqual({ avisoDePrivacidade: null })
  })

  it('montarMensagemDePrevia produz o que o leitor aceita', () => {
    const m = mensagemDePrevia({ cor: '#2563eb', titulo: 'X' })
    expect(lerMensagemDePrevia({ origin: ORIGEM, data: m }, ORIGEM)).toEqual({ cor: '#2563eb', titulo: 'X' })
  })
})
