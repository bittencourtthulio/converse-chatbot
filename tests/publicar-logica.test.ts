/**
 * T-06.02 (FT-06, PR-62): a lógica pura da aba Publicar: origem e trecho de
 * código, rascunho do formulário para a prévia, avisos e o "copiar" com reserva.
 */
import { describe, it, expect, vi } from 'vitest'
import {
  ORIGEM_DE_RESERVA,
  avisosDaPublicacao,
  copiarTexto,
  montarSnippet,
  origemDoSnippet,
  rascunhoDoFormulario,
} from '@/componentes/publicar-logica'

describe('origemDoSnippet', () => {
  it('APP_URL vence sempre, mesmo havendo Host', () => {
    expect(
      origemDoSnippet({ appUrlPublica: 'https://converse.exemplo.com.br', host: 'outro.com', confiarNoProxy: false }),
    ).toBe('https://converse.exemplo.com.br')
  })

  it('sem APP_URL usa o host da requisição: localhost em http, o resto em https', () => {
    expect(origemDoSnippet({ host: 'localhost:3000', confiarNoProxy: false })).toBe('http://localhost:3000')
    expect(origemDoSnippet({ host: '127.0.0.1:3000', confiarNoProxy: false })).toBe('http://127.0.0.1:3000')
    expect(origemDoSnippet({ host: 'converse.exemplo.com.br', confiarNoProxy: false })).toBe('https://converse.exemplo.com.br')
  })

  it('o protocolo encaminhado só vale com TRUST_PROXY ligado', () => {
    const base = { host: 'converse.exemplo.com.br', protocoloEncaminhado: 'http' }
    expect(origemDoSnippet({ ...base, confiarNoProxy: true })).toBe('http://converse.exemplo.com.br')
    expect(origemDoSnippet({ ...base, confiarNoProxy: false })).toBe('https://converse.exemplo.com.br')
    expect(origemDoSnippet({ ...base, protocoloEncaminhado: 'javascript', confiarNoProxy: true })).toBe(
      'https://converse.exemplo.com.br',
    )
  })

  it('host ausente ou com caractere estranho cai na origem de reserva, nunca no trecho', () => {
    for (const host of [undefined, null, '', 'a.com"><script>', 'a b.com', 'a.com/x', "x'y"]) {
      expect(origemDoSnippet({ host, confiarNoProxy: false }), String(host)).toBe(ORIGEM_DE_RESERVA)
    }
  })
})

describe('montarSnippet', () => {
  it('é o trecho de uma linha do PR-62', () => {
    expect(montarSnippet('https://converse.exemplo.com.br', 'ag1')).toBe(
      '<script src="https://converse.exemplo.com.br/widget.js" data-agent="ag1" async></script>',
    )
  })
})

describe('rascunhoDoFormulario', () => {
  const dados = (c: Record<string, string>) => new Map(Object.entries(c)) as unknown as FormData

  it('lê os campos do formulário para a prévia', () => {
    expect(
      rascunhoDoFormulario(
        dados({
          titulo: 'Fale com a Ana',
          cor: '#ABC',
          posicao: 'esquerda',
          avatar: 'estrela',
          avisoDePrivacidade: ' Aviso ',
          avisoDePrivacidadeUrl: 'https://x.com/p',
          sugestoes: 'a\n\n b \nc\nd',
        }),
        'Assistente',
      ),
    ).toEqual({
      titulo: 'Fale com a Ana',
      cor: '#aabbcc',
      posicao: 'esquerda',
      avatar: 'estrela',
      avisoDePrivacidade: { texto: 'Aviso', url: 'https://x.com/p' },
      sugestoes: ['a', 'b', 'c'],
    })
  })

  it('título vazio vale o nome do agente; cor e opções inválidas ficam de fora', () => {
    const r = rascunhoDoFormulario(dados({ titulo: '  ', cor: 'azul', posicao: 'centro', avatar: 'foto' }), 'Assistente')
    expect(r.titulo).toBe('Assistente')
    expect('cor' in r).toBe(false)
    expect('posicao' in r).toBe(false)
    expect('avatar' in r).toBe(false)
  })

  it('aviso em branco some da prévia; link que não é http(s) vira sem link', () => {
    expect(rascunhoDoFormulario(dados({ avisoDePrivacidade: '  ' }), 'A').avisoDePrivacidade).toBeNull()
    expect(
      rascunhoDoFormulario(dados({ avisoDePrivacidade: 'Aviso', avisoDePrivacidadeUrl: 'javascript:alert(1)' }), 'A')
        .avisoDePrivacidade,
    ).toEqual({ texto: 'Aviso', url: null })
  })
})

describe('avisosDaPublicacao', () => {
  const tudoCerto = {
    ativo: true,
    temChave: true,
    fontesProntas: 3,
    confiarNoProxy: true,
    origem: 'https://converse.exemplo.com.br',
  }
  const textos = (e: Partial<typeof tudoCerto>) => avisosDaPublicacao({ ...tudoCerto, ...e }).map((a) => a.texto)

  it('tudo certo: nenhum aviso', () => {
    expect(textos({})).toEqual([])
  })

  it('chat desligado avisa que o botão não aparece', () => {
    expect(textos({ ativo: false }).join(' ')).toMatch(/desligado/)
  })

  it('sem chave do OpenRouter avisa da mensagem genérica (PR-22)', () => {
    expect(textos({ temChave: false }).join(' ')).toMatch(/mensagem genérica/)
    expect(textos({ temChave: false }).join(' ')).toMatch(/Integrações/)
  })

  it('sem fonte pronta avisa que o agente responde só com as instruções (PR-52)', () => {
    expect(textos({ fontesProntas: 0 }).join(' ')).toMatch(/só com as instruções/)
  })

  it('sem TRUST_PROXY avisa do limite compartilhado (PR-36, PR-57)', () => {
    const t = textos({ confiarNoProxy: false }).join(' ')
    expect(t).toMatch(/TRUST_PROXY=1/)
    expect(t).toMatch(/10 mensagens por minuto/)
  })

  it('endereço http fora de localhost pede HTTPS; localhost não', () => {
    expect(textos({ origem: 'http://converse.exemplo.com.br' }).join(' ')).toMatch(/HTTPS/)
    expect(textos({ origem: 'http://localhost:3000' })).toEqual([])
    expect(textos({ origem: 'https://converse.exemplo.com.br' })).toEqual([])
  })

  it('os avisos de atenção são do tipo aviso e os informativos, info', () => {
    const r = avisosDaPublicacao({ ...tudoCerto, ativo: false, temChave: false })
    expect(r.find((a) => /desligado/.test(a.texto))?.tipo).toBe('info')
    expect(r.find((a) => /OpenRouter/.test(a.texto))?.tipo).toBe('aviso')
  })
})

describe('copiarTexto', () => {
  it('com clipboard copia e diz copiado', async () => {
    const writeText = vi.fn(async () => undefined)
    const selecionar = vi.fn(() => true)
    expect(await copiarTexto('x', { writeText }, selecionar)).toBe('copiado')
    expect(writeText).toHaveBeenCalledWith('x')
    expect(selecionar).not.toHaveBeenCalled()
  })

  it('sem clipboard seleciona o texto para copiar com o teclado', async () => {
    const selecionar = vi.fn(() => true)
    expect(await copiarTexto('x', undefined, selecionar)).toBe('selecionado')
    expect(await copiarTexto('x', null, selecionar)).toBe('selecionado')
    expect(selecionar).toHaveBeenCalledTimes(2)
  })

  it('clipboard que recusa cai na seleção', async () => {
    const writeText = vi.fn(async () => {
      throw new DOMException('negado', 'NotAllowedError')
    })
    expect(await copiarTexto('x', { writeText }, () => true)).toBe('selecionado')
  })

  it('se nem selecionar der, diz falhou, sem lançar', async () => {
    expect(await copiarTexto('x', undefined, () => false)).toBe('falhou')
    expect(
      await copiarTexto('x', undefined, () => {
        throw new Error('sem seleção')
      }),
    ).toBe('falhou')
  })
})
