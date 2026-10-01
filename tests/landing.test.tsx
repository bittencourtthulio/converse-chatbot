/**
 * Landing pública (FT-14): renderiza o componente de servidor e confere o que a página afirma
 * e o que ela nunca pode afirmar. O teste de produção em `rotas.test.ts` prova o roteamento de `/`.
 */
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PaginaInicial } from '@/componentes/PaginaInicial'

const html = renderToStaticMarkup(<PaginaInicial nome="Converse" />)
const texto = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

describe('landing: estrutura', () => {
  it('tem um único h1 e uma hierarquia de títulos sem saltos', () => {
    expect(html.match(/<h1[ >]/g)).toHaveLength(1)
    const niveis = [...html.matchAll(/<h([1-6])[ >]/g)].map((m) => Number(m[1]))
    for (let i = 1; i < niveis.length; i += 1) expect(niveis[i]! - niveis[i - 1]!).toBeLessThanOrEqual(1)
  })

  it('tem os pontos de ancoragem e cada âncora do menu aponta para uma seção que existe', () => {
    const ids = ['canais', 'conhecimento', 'como-funciona', 'seguranca', 'perguntas', 'topo']
    for (const id of ids) expect(html).toContain(`id="${id}"`)
    for (const [, alvo] of html.matchAll(/href="#([^"]+)"/g)) expect(ids, `âncora #${alvo}`).toContain(alvo)
  })

  it('o botão Entrar leva a /entrar e Como funciona leva à âncora', () => {
    expect(html).toMatch(/<a [^>]*href="\/entrar"[^>]*>Entrar<\/a>/)
    expect(html).toMatch(/<a [^>]*href="#como-funciona"[^>]*>Como funciona<\/a>/)
    expect(html).toMatch(/class="botao primario lp-botao"/)
  })

  it('o título tem duas tintas e uma única expressão em serifa itálica', () => {
    expect(html.match(/lp-tinta-suave/g)!.length).toBeGreaterThanOrEqual(1)
    expect(html.match(/<em class="lp-editorial">/g)).toHaveLength(1)
    expect(html.match(/<em[ >]/g)).toHaveLength(1)
  })

  it('o cartão de conversa mostra pergunta, resposta e fontes citadas, e se diz ilustrativo', () => {
    expect(html).toContain('lp-bolha-visitante')
    expect(html).toContain('lp-bolha-agente')
    expect(html).toContain('Fontes citadas')
    expect(texto).toContain('Exemplo ilustrativo')
  })

  it('o FAQ é <details> e a página não carrega script nem estilo inline', () => {
    expect(html.match(/<details[ >]/g)!.length).toBeGreaterThanOrEqual(4)
    expect(html).not.toContain('<script')
    expect(html).not.toContain('style="')
    expect(html).not.toMatch(/ on[a-z]+=/i)
  })

  it('as ilustrações são decorativas (aria-hidden) e não há imagem sem alternativa', () => {
    for (const svg of html.match(/<svg[^>]*>/g) ?? []) expect(svg).toContain('aria-hidden="true"')
    for (const img of html.match(/<img[^>]*>/g) ?? []) expect(img).toMatch(/ alt="/)
  })

  it('numera só a sequência real: três passos em lista ordenada', () => {
    const lista = html.match(/<ol class="lp-passos">([\s\S]*?)<\/ol>/)![1]!
    expect(lista.match(/<li /g)).toHaveLength(3)
    expect(html.match(/<ol[ >]/g)).toHaveLength(1)
  })
})

describe('landing: o que ela não pode afirmar', () => {
  const proibidas = [
    'depoimento', 'confiam', 'confiado', 'confiada', 'estrela', 'avaliação', 'avaliacao', 'nota ', '4,8', '5 estrelas',
    'milhares', 'milhões', 'usuários ativos', 'clientes que', 'nossos clientes', 'case de sucesso',
    'grátis', 'gratuito', 'gratuita', 'plano', 'planos', 'preço', 'preços', 'assine', 'comece agora', 'cadastre-se', 'crie sua conta', 'teste grátis',
    'revolucion', 'o melhor', 'líder', 'número 1', 'garantimos', 'conformidade com a lgpd', '100%',
  ]

  it.each(proibidas)('não contém "%s"', (palavra) => {
    expect(texto.toLowerCase()).not.toContain(palavra)
  })

  it('não oferece cadastro público (PR-02): o único caminho é Entrar', () => {
    expect(html).not.toMatch(/href="\/(cadastr|registr|criar-conta|signup)/i)
    expect(texto).toContain('Não há cadastro aberto')
  })

  it('não chama host nenhum: nenhum endereço absoluto nos atributos', () => {
    expect(html).not.toMatch(/(?:src|href|action)="(?:https?:)?\/\//i)
    expect(html).not.toMatch(/url\(/i)
  })
})

describe('landing: estilos', () => {
  const css = readFileSync(path.join(process.cwd(), 'src/estilos/landing.css'), 'utf8')

  it('respeita prefers-reduced-motion e só tem uma animação, a do cartão do hero', () => {
    expect(css).toContain('prefers-reduced-motion: reduce')
    expect(css.match(/@keyframes/g)).toHaveLength(1)
    expect(css).toMatch(/\.lp-cartao \{ animation: none; \}/)
  })

  it('usa a coluna de 1120px com bordas verticais e o divisor em losango', () => {
    expect(css).toContain('var(--largura-conteudo)')
    expect(css).toContain('border-left: 1px solid var(--border)')
    expect(css).toContain('.lp-divisor-losango')
    expect(css).toContain('rotate(45deg)')
  })

  it('os "+" da grade só existem nas grades de canais e de conteúdo', () => {
    const regras = css.match(/\.lp-celulas-\d \.lp-celula:not\(:last-child\)::before/g) ?? []
    expect(regras.length).toBe(2)
  })

  it('a landing entra pelo global.css, que é onde os dois temas são carregados', () => {
    const global = readFileSync(path.join(process.cwd(), 'src/estilos/global.css'), 'utf8')
    expect(global).toContain("@import './landing.css'")
  })
})
