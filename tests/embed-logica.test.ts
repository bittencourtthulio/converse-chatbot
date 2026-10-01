/**
 * T-04.01 (FT-06, PR-61): a lógica pura do chat embutido: visitante no
 * armazenamento (que pode faltar ou lançar), endereços, erro HTTP, retomada e
 * estilo da cor do agente.
 */
import { describe, it, expect } from 'vitest'
import {
  CHAVE_DO_VISITANTE,
  LIMITE_DA_MENSAGEM_DO_EMBED,
  MENSAGEM_GENERICA_DO_EMBED,
  chaveDaConversa,
  corpoDoEnvio,
  criarGuardaDoVisitante,
  enderecosDoEmbed,
  erroDaResposta,
  estiloDoAgente,
  gerarIdDeVisitante,
  lerRetomada,
  podeEnviarNoEmbed,
  reduzirEmbed,
  sugestoesVisiveis,
  type ArmazenamentoSimples,
} from '@/componentes/embed-logica'
import { razaoDeContraste } from '@/lib/cor'
import { estadoInicial, reduzir } from '@/componentes/estado-da-conversa'

function armazenamentoEmMemoria(inicial: Record<string, string> = {}): ArmazenamentoSimples & { dados: Record<string, string> } {
  const dados = { ...inicial }
  return {
    dados,
    getItem: (k) => (k in dados ? (dados[k] as string) : null),
    setItem: (k, v) => {
      dados[k] = v
    },
    removeItem: (k) => {
      delete dados[k]
    },
  }
}

const armazenamentoQueLanca: ArmazenamentoSimples = {
  getItem: () => {
    throw new DOMException('bloqueado', 'SecurityError')
  },
  setItem: () => {
    throw new DOMException('bloqueado', 'SecurityError')
  },
  removeItem: () => {
    throw new DOMException('bloqueado', 'SecurityError')
  },
}

describe('gerarIdDeVisitante', () => {
  it('são 32 hexadecimais, aceitos pela regra do servidor, e dois ids diferem', () => {
    const a = gerarIdDeVisitante()
    expect(a).toMatch(/^[0-9a-f]{32}$/)
    expect(a).toMatch(/^[A-Za-z0-9_-]{16,64}$/)
    expect(gerarIdDeVisitante()).not.toBe(a)
  })
  it('usa o sorteio injetado, byte a byte', () => {
    expect(gerarIdDeVisitante((b) => b.fill(255))).toBe('ff'.repeat(16))
    expect(gerarIdDeVisitante((b) => b.fill(1))).toBe('01'.repeat(16))
  })
})

describe('criarGuardaDoVisitante', () => {
  it('devolve o mesmo id nas chamadas seguintes e o grava', () => {
    const a = armazenamentoEmMemoria()
    const guarda = criarGuardaDoVisitante(a, () => 'a'.repeat(32))
    expect(guarda.visitanteId()).toBe('a'.repeat(32))
    expect(a.dados[CHAVE_DO_VISITANTE]).toBe('a'.repeat(32))
    // uma guarda nova, sobre o mesmo armazenamento, lê o mesmo id
    expect(criarGuardaDoVisitante(a, () => 'b'.repeat(32)).visitanteId()).toBe('a'.repeat(32))
  })

  it('ignora um id guardado que não é válido e gera outro', () => {
    const a = armazenamentoEmMemoria({ [CHAVE_DO_VISITANTE]: 'curto' })
    expect(criarGuardaDoVisitante(a, () => 'c'.repeat(32)).visitanteId()).toBe('c'.repeat(32))
  })

  it('com armazenamento que lança em todo acesso, dá um id efêmero válido e estável na página', () => {
    const guarda = criarGuardaDoVisitante(armazenamentoQueLanca)
    const id = guarda.visitanteId()
    expect(id).toMatch(/^[A-Za-z0-9_-]{16,64}$/)
    expect(guarda.visitanteId()).toBe(id)
  })

  it('sem armazenamento (nulo) também funciona', () => {
    const guarda = criarGuardaDoVisitante(null)
    expect(guarda.visitanteId()).toMatch(/^[0-9a-f]{32}$/)
    guarda.guardarConversa('ag1', 'cv1')
    expect(guarda.conversaId('ag1')).toBe('cv1')
  })

  it('guarda a conversa por agente, esquece e não explode com armazenamento que lança', () => {
    const a = armazenamentoEmMemoria()
    const guarda = criarGuardaDoVisitante(a)
    guarda.guardarConversa('ag1', 'cv1')
    expect(a.dados[chaveDaConversa('ag1')]).toBe('cv1')
    expect(guarda.conversaId('ag2')).toBeNull()
    guarda.esquecerConversa('ag1')
    expect(guarda.conversaId('ag1')).toBeNull()
    expect(a.dados[chaveDaConversa('ag1')]).toBeUndefined()

    const fraca = criarGuardaDoVisitante(armazenamentoQueLanca)
    expect(() => fraca.guardarConversa('ag1', 'cv1')).not.toThrow()
    expect(fraca.conversaId('ag1')).toBe('cv1') // vive na memória
    expect(() => fraca.esquecerConversa('ag1')).not.toThrow()
    expect(fraca.conversaId('ag1')).toBeNull()
  })
})

describe('enderecos e corpo por modo', () => {
  it('público usa a API pública e retoma; prévia usa a do painel e não retoma', () => {
    expect(enderecosDoEmbed('publico', 'ag1')).toEqual({
      conversar: '/api/publico/agentes/ag1/conversar',
      retomar: '/api/publico/agentes/ag1/conversa',
      apagar: '/api/publico/agentes/ag1/conversa',
    })
    expect(enderecosDoEmbed('previa', 'ag1')).toEqual({ conversar: '/api/agentes/ag1/conversar', retomar: null, apagar: null })
  })

  it('o corpo público leva visitanteId; o da prévia não; conversaId só quando há', () => {
    const dados = { visitanteId: 'v'.repeat(20), conversaId: null, mensagem: 'Oi' }
    expect(corpoDoEnvio('publico', dados)).toEqual({ mensagem: 'Oi', visitanteId: 'v'.repeat(20) })
    expect(corpoDoEnvio('previa', dados)).toEqual({ mensagem: 'Oi' })
    expect(corpoDoEnvio('publico', { ...dados, conversaId: 'cv1' })).toEqual({
      mensagem: 'Oi',
      visitanteId: 'v'.repeat(20),
      conversaId: 'cv1',
    })
  })
})

describe('erroDaResposta', () => {
  it('429, 422, 404, 403 e 413 levam a mensagem amigável do servidor público', () => {
    for (const status of [429, 422, 404, 403, 413]) {
      expect(erroDaResposta('publico', status, { codigo: 'x', mensagem: 'Texto amigável.' })).toEqual({
        codigo: 'x',
        mensagem: 'Texto amigável.',
      })
    }
  })

  it('5xx e corpo ilegível viram a frase genérica, nunca o texto do corpo', () => {
    expect(erroDaResposta('publico', 503, { codigo: 'y', mensagem: 'detalhe técnico SELECT' }).mensagem).toBe(
      MENSAGEM_GENERICA_DO_EMBED,
    )
    expect(erroDaResposta('publico', 500, null).mensagem).toBe(MENSAGEM_GENERICA_DO_EMBED)
    expect(erroDaResposta('publico', 429, 'texto solto').mensagem).toBe(MENSAGEM_GENERICA_DO_EMBED)
    expect(erroDaResposta('publico', 422, { mensagem: '   ' }).mensagem).toBe(MENSAGEM_GENERICA_DO_EMBED)
  })

  it('na prévia a mensagem do painel vale, inclusive a de erro do provedor', () => {
    expect(erroDaResposta('previa', 409, { codigo: 'chat_sem_chave', mensagem: 'Cadastre a chave.' })).toEqual({
      codigo: 'chat_sem_chave',
      mensagem: 'Cadastre a chave.',
    })
  })
})

describe('lerRetomada', () => {
  it('lê conversa, mensagens e o indicador de truncada', () => {
    const r = lerRetomada({
      conversa: {
        conversaId: 'cv1',
        truncada: true,
        mensagens: [
          { id: 'm1', papel: 'user', conteudo: 'Oi' },
          {
            id: 'm2',
            papel: 'assistant',
            conteudo: 'Olá [1]',
            fontes: [{ fonteId: 'f1', titulo: 'A', citada: true, trechos: [{ n: 1, posicao: 1, trechoTexto: '' }] }],
          },
        ],
      },
    })
    expect(r?.conversaId).toBe('cv1')
    expect(r?.truncada).toBe(true)
    expect(r?.mensagens.map((m) => m.papel)).toEqual(['user', 'assistant'])
    expect(r?.mensagens[1]?.fontes?.[0]?.titulo).toBe('A')
  })

  it('conversa nula, corpo inesperado e formato errado dão nulo', () => {
    expect(lerRetomada({ conversa: null })).toBeNull()
    expect(lerRetomada(null)).toBeNull()
    expect(lerRetomada('x')).toBeNull()
    expect(lerRetomada({ conversa: { conversaId: 1, mensagens: [] } })).toBeNull()
    expect(lerRetomada({ conversa: { conversaId: 'c', mensagens: 'x' } })).toBeNull()
  })

  it('descarta mensagem malformada e fonte malformada sem descartar as boas', () => {
    const r = lerRetomada({
      conversa: {
        conversaId: 'cv1',
        mensagens: [
          { id: 'm1', papel: 'user', conteudo: 'Oi' },
          { id: 'm2', papel: 'sistema', conteudo: 'x' },
          { papel: 'user', conteudo: 'sem id' },
          { id: 'm3', papel: 'assistant', conteudo: 'Olá', fontes: [{ titulo: 'sem id' }, 7] },
        ],
      },
    })
    expect(r?.mensagens.map((m) => m.id)).toEqual(['m1', 'm3'])
    expect(r?.mensagens[1]?.fontes).toBeUndefined()
    expect(r?.truncada).toBe(false)
  })
})

describe('estiloDoAgente', () => {
  it('cor clara usa o texto escuro e cor escura usa o texto claro, com contraste de 4,5 ou mais', () => {
    const clara = estiloDoAgente('#ffeb3b')
    const escura = estiloDoAgente('#1a237e')
    expect(clara['--cor-do-agente']).toBe('#ffeb3b')
    expect(clara['--cor-do-agente-fg']).toBe('var(--fg-em-cor-clara)')
    expect(escura['--cor-do-agente-fg']).toBe('var(--fg-em-cor-escura)')
    expect(razaoDeContraste('#000000', '#ffeb3b')).toBeGreaterThanOrEqual(4.5)
    expect(razaoDeContraste('#ffffff', '#1a237e')).toBeGreaterThanOrEqual(4.5)
  })

  it('cor inválida cai na cor padrão, nunca vira CSS solto', () => {
    const s = estiloDoAgente('red; background:url(x)')
    expect(s['--cor-do-agente']).toMatch(/^#[0-9a-f]{6}$/)
    expect(JSON.stringify(s)).not.toContain('url(')
  })
})

describe('campo e sugestões', () => {
  it('só envia com texto útil, até o limite e sem resposta em curso', () => {
    expect(podeEnviarNoEmbed('Oi', false)).toBe(true)
    expect(podeEnviarNoEmbed('   ', false)).toBe(false)
    expect(podeEnviarNoEmbed('Oi', true)).toBe(false)
    expect(podeEnviarNoEmbed('x'.repeat(LIMITE_DA_MENSAGEM_DO_EMBED), false)).toBe(true)
    expect(podeEnviarNoEmbed('x'.repeat(LIMITE_DA_MENSAGEM_DO_EMBED + 1), false)).toBe(false)
  })

  it('as sugestões somem quando a conversa começa', () => {
    expect(sugestoesVisiveis(['a', 'b'], 0)).toEqual(['a', 'b'])
    expect(sugestoesVisiveis(['a', 'b'], 1)).toEqual([])
  })
})

describe('reduzirEmbed', () => {
  const retomada = {
    conversaId: 'cv1',
    truncada: false,
    mensagens: [
      { id: 'm1', papel: 'user' as const, conteudo: 'Oi' },
      { id: 'm2', papel: 'assistant' as const, conteudo: 'Olá' },
    ],
  }

  it('retomar troca o estado pela conversa do servidor', () => {
    const e = reduzirEmbed(estadoInicial(), { tipo: 'retomar', retomada })
    expect(e.conversaId).toBe('cv1')
    expect(e.bolhas.map((b) => [b.papel, b.texto, b.estado])).toEqual([
      ['user', 'Oi', 'completa'],
      ['assistant', 'Olá', 'completa'],
    ])
  })

  it('retomar não apaga o que o visitante já escreveu enquanto a conversa carregava', () => {
    const digitando = reduzirEmbed(estadoInicial(), { tipo: 'enviar', texto: 'Nova', idDoUsuario: 'u', idDoAgente: 'a' })
    expect(reduzirEmbed(digitando, { tipo: 'retomar', retomada })).toBe(digitando)
  })

  it('as demais ações seguem o reducer do painel', () => {
    const a = { tipo: 'enviar' as const, texto: 'Oi', idDoUsuario: 'u', idDoAgente: 'a' }
    expect(reduzirEmbed(estadoInicial(), a)).toEqual(reduzir(estadoInicial(), a))
  })
})
