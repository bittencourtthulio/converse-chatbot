/**
 * T-06.04 (FT-10, PR-18, PR-89, PR-91): a tela de Privacidade. Componentes por renderização
 * estática e a página contra o servidor de produção do teste, só para admin.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { FormularioDeRetencao } from '@/componentes/FormularioDeRetencao'
import { FormularioDoAvisoPadrao } from '@/componentes/FormularioDoAvisoPadrao'
import { PainelDeDadosPessoais } from '@/componentes/PainelDeDadosPessoais'
import { limparBanco } from './ajuda'
import { cookieDe, subirServidor, type Servidor } from './apoio/servidor'

const acao = async () => ({})

/** As etiquetas `<input ...>` do HTML, para conferir atributos sem depender da ordem deles. */
const inputs = (html: string) => [...html.matchAll(/<input[^>]*>/g)].map((m) => m[0])
const achar = (html: string, ...atributos: string[]) =>
  inputs(html).find((tag) => atributos.every((a) => tag.includes(a)))

describe('formulário de retenção (componente)', () => {
  it('com 90 dias marca "apagar depois de N dias", com o campo numérico de 7 a 3650', () => {
    const html = renderToStaticMarkup(<FormularioDeRetencao retencaoDias={90} acao={acao} />)
    expect(achar(html, 'type="radio"', 'name="modo"', 'value="dias"', 'checked=""')).toBeDefined()
    const dias = achar(html, 'type="number"', 'name="dias"')
    expect(dias).toBeDefined()
    expect(dias).toContain('min="7"')
    expect(dias).toContain('max="3650"')
    expect(dias).toContain('value="90"')
    expect(html).toContain('Salvar retenção')
    expect(html).toContain('a cada 6 horas')
  })

  it('sem expurgo marca a segunda opção e mostra o aviso de risco com a caixa de confirmação obrigatória', () => {
    const html = renderToStaticMarkup(<FormularioDeRetencao retencaoDias={null} acao={acao} />)
    expect(achar(html, 'type="radio"', 'name="modo"', 'value="sem_expurgo"', 'checked=""')).toBeDefined()
    expect(html).toContain('Sem expurgo automático')
    expect(achar(html, 'type="checkbox"', 'name="confirmarRisco"', 'required=""')).toBeDefined()
    expect(html).toMatch(/para sempre|até alguém apagar/)
  })
})

describe('formulário do aviso padrão (componente)', () => {
  it('texto de até 300 caracteres e link http ou https, com os valores atuais', () => {
    const html = renderToStaticMarkup(<FormularioDoAvisoPadrao texto="Seus dados são usados só para atendimento." url="https://exemplo.com.br/p" acao={acao} />)
    const area = html.match(/<textarea[^>]*>/)?.[0] ?? ''
    expect(area).toContain('name="texto"')
    expect(area).toMatch(/maxLength="300"|maxlength="300"/)
    expect(html).toContain('Seus dados são usados só para atendimento.')
    const link = achar(html, 'type="url"', 'name="url"')
    expect(link).toBeDefined()
    expect(link).toContain('value="https://exemplo.com.br/p"')
    expect(html).toContain('Salvar aviso')
  })
})

describe('painel de dados pessoais (componente)', () => {
  it('é somente leitura: sem campo nem botão, com os canais, a retenção atual e a base legal provisória', () => {
    const html = renderToStaticMarkup(<PainelDeDadosPessoais retencaoDias={45} />)
    expect(html).not.toMatch(/<input|<textarea|<button|<form/)
    for (const t of ['Dados pessoais tratados', 'Chat embutido', 'Telegram', 'Painel', 'Finalidade', 'Retenção', '45 dias', 'Onde ficam', 'Quem acessa', 'Legítimo interesse, a confirmar pela empresa.']) {
      expect(html, t).toContain(t)
    }
    expect(html.toLowerCase()).not.toContain('parecer')
  })
})

describe('página de privacidade (integração com o servidor de produção)', () => {
  const SENHA = 'senha-de-rota-123'
  let servidor: Servidor
  let cookie: string
  const pagina = async () => {
    const r = await fetch(`${servidor.base}/configuracoes/privacidade`, { headers: { cookie } })
    return { status: r.status, html: await r.text() }
  }
  beforeAll(async () => {
    await limparBanco()
    const senhaHash = await hashDeSenha(SENHA)
    await prisma.usuario.create({ data: { nome: 'Ana Admin', email: 'admin.privacidade@teste.local', senhaHash, papel: 'admin' } })
    await prisma.configuracaoDoWorkspace.create({
      data: { id: 'unica', retencaoDiasConversas: 45, avisoDePrivacidadePadrao: 'Aviso da empresa', avisoDePrivacidadePadraoUrl: 'https://exemplo.com.br/p' },
    })
    cookie = await cookieDe('admin.privacidade@teste.local', SENHA)
    servidor = await subirServidor(3209)
  }, 180_000)
  afterAll(async () => {
    servidor?.parar()
    await limparBanco()
  })

  it('abre para o admin com a retenção e o aviso salvos e o painel de dados', async () => {
    const { status, html } = await pagina()
    expect(status).toBe(200)
    expect(html).toContain('Privacidade')
    expect(html).toContain('value="45"')
    expect(html).toContain('Aviso da empresa')
    expect(html).toContain('https://exemplo.com.br/p')
    expect(html).toContain('Dados pessoais tratados')
    expect(html).toContain('45 dias')
    expect(html).toContain('Legítimo interesse, a confirmar pela empresa.')
    expect(html).not.toContain('style="')
  })

  it('sem sessão manda para o login', async () => {
    const r = await fetch(`${servidor.base}/configuracoes/privacidade`, { redirect: 'manual' })
    expect(r.status).toBe(307)
    expect(r.headers.get('location')).toContain('/entrar')
  })
})
