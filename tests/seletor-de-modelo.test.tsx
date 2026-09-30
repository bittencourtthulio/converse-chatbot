import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SeletorDeModelo } from '@/componentes/SeletorDeModelo'

const modelos = [
  { id: 'openai/gpt-4o-mini', nome: 'OpenAI: GPT-4o mini' },
  { id: 'anthropic/claude-sonnet-4', nome: 'Anthropic: Claude Sonnet 4' },
]

const base = { valorInicial: 'openai/gpt-4o-mini', ehAdmin: false }

describe('SeletorDeModelo', () => {
  it('com chave: campo de texto com o valor inicial e uma sugestão por modelo', () => {
    const html = renderToStaticMarkup(
      <SeletorDeModelo {...base} temChave modelos={modelos} reserva={false} />,
    )
    expect(html).toMatch(/<input[^>]*name="modelo"/)
    expect(html).toContain('value="openai/gpt-4o-mini"')
    expect(html).toMatch(/<input[^>]*list="/)
    expect(html.match(/<option /g)).toHaveLength(2)
    expect(html).toContain('OpenAI: GPT-4o mini')
    expect(html).not.toContain('alerta')
  })

  it('o campo aceita texto livre: não é um select fechado', () => {
    const html = renderToStaticMarkup(
      <SeletorDeModelo {...base} temChave modelos={modelos} reserva={false} />,
    )
    expect(html).not.toContain('<select')
    expect(html).toContain('type="text"')
  })

  it('sem chave: sem sugestões e com aviso claro', () => {
    const html = renderToStaticMarkup(
      <SeletorDeModelo {...base} temChave={false} modelos={[]} reserva={false} />,
    )
    expect(html).not.toContain('<datalist')
    expect(html).toContain('alerta')
    expect(html).toMatch(/nenhuma chave do OpenRouter/i)
    expect(html).toMatch(/<input[^>]*name="modelo"/)
  })

  it('sem chave: o link para Integrações só aparece para admin', () => {
    const comum = renderToStaticMarkup(
      <SeletorDeModelo {...base} temChave={false} modelos={[]} reserva={false} />,
    )
    expect(comum).not.toContain('/configuracoes/integracoes')
    expect(comum).toMatch(/administrador/i)

    const admin = renderToStaticMarkup(
      <SeletorDeModelo {...base} ehAdmin temChave={false} modelos={[]} reserva={false} />,
    )
    expect(admin).toContain('href="/configuracoes/integracoes"')
  })

  it('lista de reserva: mostra as sugestões e avisa que a lista é reduzida', () => {
    const html = renderToStaticMarkup(
      <SeletorDeModelo {...base} temChave modelos={modelos} reserva />,
    )
    expect(html.match(/<option /g)).toHaveLength(2)
    expect(html).toMatch(/lista reduzida|modelos comuns/i)
  })

  it('o campo é obrigatório e limita o tamanho', () => {
    const html = renderToStaticMarkup(
      <SeletorDeModelo {...base} temChave modelos={modelos} reserva={false} />,
    )
    expect(html).toContain('required')
    expect(html).toContain('maxLength="200"')
  })
})
