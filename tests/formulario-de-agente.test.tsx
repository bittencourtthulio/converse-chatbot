import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import { FormularioDeAgente } from '@/componentes/FormularioDeAgente'
import { BotaoExcluirAgente, proximoEstadoDaExclusao } from '@/componentes/BotaoExcluirAgente'

const acao = async () => ({})
const seletor = {
  modelos: [{ id: 'openai/gpt-4o-mini', nome: 'OpenAI: GPT-4o mini' }],
  temChave: true,
  reserva: false,
  ehAdmin: false,
}

describe('FormularioDeAgente: novo agente', () => {
  const html = renderToStaticMarkup(
    <FormularioDeAgente acao={acao} rotulo="Criar agente" {...seletor} />,
  )

  it('traz os cinco campos, com o modelo e a temperatura padrão', () => {
    expect(html).toMatch(/<input(?=[^>]*name="nome")(?=[^>]*required)/)
    expect(html).toMatch(/<textarea[^>]*name="instrucoes"/)
    expect(html).toMatch(/<input[^>]*name="modelo"/)
    expect(html).toContain('value="openai/gpt-4o-mini"')
    expect(html).toMatch(/<input[^>]*name="temperatura"/)
    expect(html).toContain('value="0.7"')
    expect(html).toMatch(/<textarea[^>]*name="mensagemInicial"/)
  })

  it('limita o tamanho dos campos como o serviço', () => {
    expect(html).toContain('maxLength="80"')
    expect(html).toContain('maxLength="8000"')
    expect(html).toContain('maxLength="500"')
  })

  it('a temperatura vai de 0 a 2 em passos de 0,1', () => {
    expect(html).toMatch(/<input[^>]*type="range"[^>]*name="temperatura"/)
    expect(html).toContain('min="0"')
    expect(html).toContain('max="2"')
    expect(html).toContain('step="0.1"')
  })

  it('mostra o contador de instruções zerado e o botão de criar', () => {
    expect(html).toContain('0 de 8000 caracteres')
    expect(html).toContain('Criar agente')
    expect(html).not.toContain('name="id"')
  })
})

describe('FormularioDeAgente: edição', () => {
  const agente = {
    id: 'ck123',
    nome: 'Atendimento',
    instrucoes: 'Responda em português.',
    modelo: 'anthropic/claude-sonnet-4',
    temperatura: 1.2,
    mensagemInicial: 'Olá!',
  }
  const html = renderToStaticMarkup(
    <FormularioDeAgente acao={acao} rotulo="Salvar alterações" agente={agente} {...seletor} />,
  )

  it('vem preenchido com os valores do agente e o id escondido', () => {
    expect(html).toContain('value="Atendimento"')
    expect(html).toContain('Responda em português.')
    expect(html).toContain('value="anthropic/claude-sonnet-4"')
    expect(html).toContain('value="1.2"')
    expect(html).toContain('Olá!')
    expect(html).toMatch(/<input[^>]*type="hidden"[^>]*name="id"[^>]*value="ck123"/)
  })

  it('o contador mostra o tamanho atual das instruções', () => {
    expect(html).toContain(`${agente.instrucoes.length} de 8000 caracteres`)
    expect(html).toContain('Salvar alterações')
  })
})


describe('BotaoExcluirAgente', () => {
  const agente = { id: 'ck123', nome: 'Atendimento' }
  const acao = async () => ({})

  it('o estado inicial mostra só o botão Excluir agente', () => {
    const html = renderToStaticMarkup(<BotaoExcluirAgente agente={agente} acao={acao} />)
    expect(html).toContain('Excluir agente')
    expect(html).not.toContain('Confirmar exclusão')
    expect(html).not.toContain('Cancelar')
  })

  it('confirmando: mostra o nome do agente, Cancelar e Confirmar exclusão, com o id escondido', () => {
    const html = renderToStaticMarkup(
      <BotaoExcluirAgente agente={agente} acao={acao} confirmandoInicial />,
    )
    expect(html).toContain('Atendimento')
    expect(html).toContain('Cancelar')
    expect(html).toContain('Confirmar exclusão')
    expect(html).toMatch(/<input[^>]*type="hidden"[^>]*name="id"[^>]*value="ck123"/)
    expect(html).toContain('role="alertdialog"')
  })

  it('Excluir abre a confirmação e Cancelar volta ao estado inicial', () => {
    expect(proximoEstadoDaExclusao('inicial', 'excluir')).toBe('confirmando')
    expect(proximoEstadoDaExclusao('confirmando', 'cancelar')).toBe('inicial')
    expect(proximoEstadoDaExclusao('inicial', 'cancelar')).toBe('inicial')
  })

  it('a confirmação é da tela: o código não usa window.confirm', () => {
    const fonte = readFileSync('src/componentes/BotaoExcluirAgente.tsx', 'utf8')
    expect(fonte).not.toContain('window.confirm')
    expect(fonte).not.toMatch(/\bconfirm\(/)
  })
})
