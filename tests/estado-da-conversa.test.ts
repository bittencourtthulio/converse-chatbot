import { describe, it, expect } from 'vitest'
import {
  LIMITE_DA_MENSAGEM,
  LIMITE_PARA_AVISO,
  contadorVisivel,
  decidirTecla,
  estadoInicial,
  podeEnviar,
  reduzir,
  type AcaoDaConversa,
  type EstadoDaConversa,
} from '@/componentes/estado-da-conversa'
import { LIMITE_DA_MENSAGEM as LIMITE_DO_SERVICO } from '@/servicos/chat'

const aplicar = (acoes: AcaoDaConversa[], inicial: EstadoDaConversa = estadoInicial()) =>
  acoes.reduce(reduzir, inicial)

const enviar: AcaoDaConversa = { tipo: 'enviar', texto: 'Oi', idDoUsuario: 'u1', idDoAgente: 'a1' }

describe('reduzir', () => {
  it('enviar adiciona a bolha do usuário e abre a do agente vazia, em digitação', () => {
    const e = aplicar([enviar])
    expect(e.transmitindo).toBe(true)
    expect(e.bolhas).toEqual([
      { id: 'u1', papel: 'user', texto: 'Oi', estado: 'completa' },
      { id: 'a1', papel: 'assistant', texto: '', estado: 'digitando' },
    ])
  })

  it('os trechos se acumulam na bolha do agente', () => {
    const e = aplicar([enviar, { tipo: 'trecho', texto: 'Olá' }, { tipo: 'trecho', texto: ', mundo' }])
    expect(e.bolhas.at(-1)).toMatchObject({ texto: 'Olá, mundo', estado: 'digitando' })
  })

  it('trecho fora de uma transmissão é ignorado', () => {
    const e = aplicar([{ tipo: 'trecho', texto: 'solto' }])
    expect(e.bolhas).toEqual([])
  })

  it('fim fixa o id da conversa, troca o id da bolha e encerra a digitação', () => {
    const e = aplicar([
      enviar,
      { tipo: 'trecho', texto: 'Olá' },
      { tipo: 'fim', conversaId: 'c1', mensagemId: 'm1' },
    ])
    expect(e.conversaId).toBe('c1')
    expect(e.transmitindo).toBe(false)
    expect(e.bolhas.at(-1)).toEqual({ id: 'm1', papel: 'assistant', texto: 'Olá', estado: 'completa' })
  })

  it('o id da conversa vindo do cabeçalho vale mesmo sem chegar o fim', () => {
    const e = aplicar([enviar, { tipo: 'conversa', conversaId: 'c7' }, { tipo: 'parar' }])
    expect(e.conversaId).toBe('c7')
  })

  it('erro com texto parcial mantém o texto marcado e mostra a mensagem', () => {
    const e = aplicar([
      enviar,
      { tipo: 'trecho', texto: 'Olá, tu' },
      { tipo: 'erro', erro: { codigo: 'provedor_sem_saldo', mensagem: 'Sem saldo.' } },
    ])
    expect(e.transmitindo).toBe(false)
    expect(e.erro).toEqual({ codigo: 'provedor_sem_saldo', mensagem: 'Sem saldo.' })
    expect(e.bolhas.at(-1)).toMatchObject({ texto: 'Olá, tu', estado: 'erro' })
  })

  it('erro antes de qualquer trecho remove a bolha vazia do agente', () => {
    const e = aplicar([enviar, { tipo: 'erro', erro: { codigo: 'x', mensagem: 'Falhou.' } }])
    expect(e.bolhas).toHaveLength(1)
    expect(e.bolhas[0]).toMatchObject({ papel: 'user' })
    expect(e.erro?.mensagem).toBe('Falhou.')
  })

  it('envio recusado antes do stream desfaz as duas bolhas e mostra o erro', () => {
    const e = aplicar([
      { tipo: 'enviar', texto: 'Primeira', idDoUsuario: 'u0', idDoAgente: 'a0' },
      { tipo: 'fim', conversaId: 'c1', mensagemId: 'm0' },
      enviar,
      { tipo: 'recusada', erro: { codigo: 'entrada_invalida', mensagem: 'Escreva uma mensagem.' } },
    ])
    expect(e.bolhas.map((b) => b.id)).toEqual(['u0', 'm0'])
    expect(e.transmitindo).toBe(false)
    expect(e.erro).toEqual({ codigo: 'entrada_invalida', mensagem: 'Escreva uma mensagem.' })
    expect(e.conversaId).toBe('c1')
  })

  it('parar encerra sem erro e marca o texto parcial como interrompido', () => {
    const e = aplicar([enviar, { tipo: 'trecho', texto: 'Olá' }, { tipo: 'parar' }])
    expect(e.transmitindo).toBe(false)
    expect(e.erro).toBeNull()
    expect(e.bolhas.at(-1)).toMatchObject({ texto: 'Olá', estado: 'interrompida' })
  })

  it('parar antes do primeiro trecho remove a bolha vazia', () => {
    expect(aplicar([enviar, { tipo: 'parar' }]).bolhas).toHaveLength(1)
  })

  it('enviar de novo limpa o erro anterior', () => {
    const e = aplicar([
      enviar,
      { tipo: 'erro', erro: { codigo: 'x', mensagem: 'Falhou.' } },
      { ...enviar, idDoUsuario: 'u2', idDoAgente: 'a2' },
    ])
    expect(e.erro).toBeNull()
  })

  it('nova conversa zera mensagens, id, erro e transmissão', () => {
    const e = aplicar([
      enviar,
      { tipo: 'fim', conversaId: 'c1', mensagemId: 'm1' },
      { tipo: 'nova' },
    ])
    expect(e).toEqual({ conversaId: null, bolhas: [], transmitindo: false, erro: null })
  })

  it('estadoInicial retoma a conversa gravada', () => {
    const e = estadoInicial({
      conversaId: 'c1',
      mensagens: [
        { id: 'm1', papel: 'user', conteudo: 'Oi' },
        { id: 'm2', papel: 'assistant', conteudo: 'Olá!' },
      ],
    })
    expect(e.conversaId).toBe('c1')
    expect(e.bolhas.map((b) => [b.papel, b.texto, b.estado])).toEqual([
      ['user', 'Oi', 'completa'],
      ['assistant', 'Olá!', 'completa'],
    ])
  })
})

describe('campo de texto', () => {
  it('Enter envia; Shift+Enter não; Enter na composição de IME não', () => {
    expect(decidirTecla({ key: 'Enter', shiftKey: false })).toBe('enviar')
    expect(decidirTecla({ key: 'Enter', shiftKey: true })).toBe('nada')
    expect(decidirTecla({ key: 'Enter', shiftKey: false, isComposing: true })).toBe('nada')
    expect(decidirTecla({ key: 'Enter', shiftKey: false, ctrlKey: true })).toBe('nada')
    expect(decidirTecla({ key: 'a', shiftKey: false })).toBe('nada')
  })

  it('o contador só aparece a partir de 3500 de 4000', () => {
    expect(LIMITE_DA_MENSAGEM).toBe(4000)
    expect(LIMITE_PARA_AVISO).toBe(3500)
    expect(contadorVisivel(3499)).toBe(false)
    expect(contadorVisivel(3500)).toBe(true)
  })

  it('o limite do cliente é o mesmo do serviço', () => {
    expect(LIMITE_DA_MENSAGEM).toBe(LIMITE_DO_SERVICO)
  })

  it('só envia com texto, dentro do limite e sem resposta em curso', () => {
    expect(podeEnviar('Oi', false)).toBe(true)
    expect(podeEnviar('   \n', false)).toBe(false)
    expect(podeEnviar('Oi', true)).toBe(false)
    expect(podeEnviar('a'.repeat(4000), false)).toBe(true)
    expect(podeEnviar('a'.repeat(4001), false)).toBe(false)
  })
})
