// T-05.04 (FT-10, PR-90): a lógica pura do "Apagar minha conversa" do chat embutido: endereço,
// máquina de confirmação em dois passos, a chamada ao servidor (com o `fetch` injetado) e o
// estado local que o visitante limpa.
import { describe, it, expect, vi } from 'vitest'
import {
  CHAVE_DO_VISITANTE,
  MENSAGEM_DE_SEM_CONEXAO,
  MENSAGEM_GENERICA_DO_EMBED,
  apagarMinhaConversaNoServidor,
  chaveDaConversa,
  criarGuardaDoVisitante,
  enderecosDoEmbed,
  reduzirApagar,
  ESTADO_INICIAL_DO_APAGAR,
} from '@/componentes/embed-logica'

const VISITANTE = 'abcdef0123456789abcdef0123456789'

describe('endereço (funcional)', () => {
  it('o modo público tem o endereço de apagar e a prévia não', () => {
    expect(enderecosDoEmbed('publico', 'ag1').apagar).toBe('/api/publico/agentes/ag1/conversa')
    expect(enderecosDoEmbed('previa', 'ag1').apagar).toBeNull()
  })
})

describe('confirmação em dois passos (funcional)', () => {
  it('o primeiro clique só pede a confirmação; cancelar volta ao início', () => {
    const pedindo = reduzirApagar(ESTADO_INICIAL_DO_APAGAR, { tipo: 'pedir' })
    expect(pedindo).toMatchObject({ confirmando: true, apagando: false, erro: null, apagada: false })
    expect(reduzirApagar(pedindo, { tipo: 'cancelar' })).toEqual(ESTADO_INICIAL_DO_APAGAR)
  })

  it('apagando trava a confirmação, falhou mostra a mensagem e mantém a pergunta aberta', () => {
    const apagando = reduzirApagar(reduzirApagar(ESTADO_INICIAL_DO_APAGAR, { tipo: 'pedir' }), { tipo: 'apagando' })
    expect(apagando).toMatchObject({ confirmando: true, apagando: true })
    const falhou = reduzirApagar(apagando, { tipo: 'falhou', mensagem: 'Tente de novo.' })
    expect(falhou).toMatchObject({ confirmando: true, apagando: false, erro: 'Tente de novo.', apagada: false })
  })

  it('concluído fecha a pergunta e marca a conversa como apagada; uma nova pergunta limpa o aviso', () => {
    const feito = reduzirApagar(reduzirApagar(ESTADO_INICIAL_DO_APAGAR, { tipo: 'apagando' }), { tipo: 'concluido' })
    expect(feito).toEqual({ confirmando: false, apagando: false, erro: null, apagada: true })
    expect(reduzirApagar(feito, { tipo: 'pedir' })).toMatchObject({ confirmando: true, apagada: false })
    expect(reduzirApagar(feito, { tipo: 'limparAviso' })).toEqual(ESTADO_INICIAL_DO_APAGAR)
  })
})

describe('apagarMinhaConversaNoServidor (integração com o fetch injetado)', () => {
  const resposta = (status: number, corpo: unknown) => new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } })

  it('envia DELETE com o visitante no cabeçalho (nunca na URL) e devolve ok', async () => {
    const buscar = vi.fn(async () => resposta(200, { apagadas: 2 }))
    const r = await apagarMinhaConversaNoServidor('/api/publico/agentes/ag1/conversa', VISITANTE, buscar)
    expect(r).toEqual({ ok: true })
    expect(buscar).toHaveBeenCalledTimes(1)
    const [url, init] = buscar.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/publico/agentes/ag1/conversa')
    expect(url).not.toContain(VISITANTE)
    expect(init.method).toBe('DELETE')
    expect((init.headers as Record<string, string>)['X-Visitante-Id']).toBe(VISITANTE)
  })

  it('429 e 404 mostram a mensagem do servidor; outros status, a frase genérica; sem rede, a de conexão', async () => {
    const com = (status: number, corpo: unknown) => apagarMinhaConversaNoServidor('/x', VISITANTE, async () => resposta(status, corpo))
    expect(await com(429, { codigo: 'limite_excedido', mensagem: 'Você enviou muitas mensagens em pouco tempo.' })).toEqual({ ok: false, mensagem: 'Você enviou muitas mensagens em pouco tempo.' })
    expect(await com(404, { codigo: 'nao_encontrado', mensagem: 'Este assistente não está disponível.' })).toEqual({ ok: false, mensagem: 'Este assistente não está disponível.' })
    expect(await com(500, { mensagem: 'Erro interno com pilha em /var/x' })).toEqual({ ok: false, mensagem: MENSAGEM_GENERICA_DO_EMBED })
    expect(await apagarMinhaConversaNoServidor('/x', VISITANTE, async () => { throw new Error('rede') })).toEqual({ ok: false, mensagem: MENSAGEM_DE_SEM_CONEXAO })
  })
})

describe('estado local do visitante (funcional)', () => {
  it('esquecerConversa remove a conversa guardada deste agente e mantém o id do visitante e as de outros agentes', () => {
    const dados = new Map<string, string>()
    const armazenamento = {
      getItem: (k: string) => dados.get(k) ?? null,
      setItem: (k: string, v: string) => void dados.set(k, v),
      removeItem: (k: string) => void dados.delete(k),
    }
    const guarda = criarGuardaDoVisitante(armazenamento, () => VISITANTE)
    const id = guarda.visitanteId()
    guarda.guardarConversa('ag1', 'c1')
    guarda.guardarConversa('ag2', 'c2')
    guarda.esquecerConversa('ag1')
    expect(guarda.conversaId('ag1')).toBeNull()
    expect(dados.has(chaveDaConversa('ag1'))).toBe(false)
    expect(guarda.conversaId('ag2')).toBe('c2')
    expect(dados.get(CHAVE_DO_VISITANTE)).toBe(id)
  })

  it('com o armazenamento negado o esquecer não lança e a memória fica limpa', () => {
    const quebrado = {
      getItem: () => { throw new Error('negado') },
      setItem: () => { throw new Error('negado') },
      removeItem: () => { throw new Error('negado') },
    }
    const guarda = criarGuardaDoVisitante(quebrado, () => VISITANTE)
    guarda.guardarConversa('ag1', 'c1')
    expect(() => guarda.esquecerConversa('ag1')).not.toThrow()
    expect(guarda.conversaId('ag1')).toBeNull()
  })
})
