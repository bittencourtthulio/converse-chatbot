/**
 * T-04.04 (FT-06, PR-59, PR-61): a página /embed/[id] contra o servidor de
 * produção: sem login nem barra lateral, agente inativo e inexistente com a mesma
 * página neutra, prévia só com sessão, e nada de dado interno no HTML.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { salvarConfiguracao } from '@/servicos/chat-publico-config'
import { criarAdmin, limparBanco } from './ajuda'
import { cookieDe, subirServidor, type Servidor } from './apoio/servidor'

let servidor: Servidor
let ativo: string
let restrito: string
let inativo: string
let cookie: string

const SEGREDO = 'PROMO-INTERNO-77'

const pegar = (caminho: string, comCookie = false) =>
  fetch(`${servidor.base}${caminho}`, { redirect: 'manual', headers: comCookie ? { cookie } : {} })

/** O HTML sem os scripts do Next (que variam por requisição). */
const semScripts = (html: string) => html.replace(/<script[\s\S]*?<\/script>/g, '')

beforeAll(async () => {
  await limparBanco()
  const admin = await criarAdmin()
  const criar = async (nome: string) =>
    (
      await prisma.agente.create({
        data: {
          nome,
          modelo: 'modelo-secreto/xyz',
          instrucoes: `Instrução secreta ${SEGREDO}`,
          mensagemInicial: 'Olá! Como posso ajudar?',
          criadoPorId: admin.id,
        },
      })
    ).id
  ativo = await criar('Agente Ativo')
  restrito = await criar('Agente Restrito')
  inativo = await criar('Agente Inativo Secreto')
  await salvarConfiguracao(admin, ativo, {
    ativo: true,
    titulo: 'Fale com a Ana',
    cor: '#2563eb',
    avatar: 'robo',
    avisoDePrivacidade: 'Guardamos a conversa por 90 dias.',
    avisoDePrivacidadeUrl: 'https://exemplo.com/privacidade',
    sugestoes: ['Qual o horário?', 'Como troco um produto?'],
    limiteDiario: 4321,
  })
  await salvarConfiguracao(admin, restrito, { ativo: true, dominiosPermitidos: ['exemplo.com'] })
  await salvarConfiguracao(admin, inativo, { ativo: false, titulo: 'Titulo Interno Secreto' })
  servidor = await subirServidor(3194)
  cookie = await cookieDe(admin.email, admin.senha)
}, 180_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

describe('agente ativo', () => {
  it('abre sem login e sem barra lateral, com título, cor, mensagem inicial, sugestões e aviso', async () => {
    const r = await pegar(`/embed/${ativo}`)
    expect(r.status).toBe(200)
    const html = await r.text()
    expect(html).toContain('lang="pt-BR"')
    expect(html).toMatch(/<h1>Fale com a Ana<\/h1>/)
    expect(html).toContain('--cor-do-agente:#2563eb')
    expect(html).toContain('Olá! Como posso ajudar?')
    expect(html).toContain('Qual o horário?')
    expect(html).toContain('Guardamos a conversa por 90 dias.')
    expect(html).toContain('data-modo="publico"')
    for (const naoDeve of ['barra-lateral', 'casca', 'Sair', 'Agentes', 'Integrações', 'pular-para-o-conteudo']) {
      expect(html, naoDeve).not.toContain(naoDeve)
    }
  })

  it('o HTML nunca traz instruções, modelo, limite nem o nome interno do agente', async () => {
    const html = await (await pegar(`/embed/${ativo}`)).text()
    for (const proibido of [SEGREDO, 'modelo-secreto', '4321', 'Agente Ativo']) {
      expect(html, proibido).not.toContain(proibido)
    }
  })

  it('não é indexável nem guardável em cache compartilhado, e manda o frame-ancestors do agente', async () => {
    const r = await pegar(`/embed/${restrito}`)
    expect(r.status).toBe(200)
    expect(r.headers.get('content-security-policy')).toBe("frame-ancestors 'self' exemplo.com")
    expect(r.headers.get('x-frame-options')).toBeNull()
    expect(r.headers.get('cache-control')).toMatch(/no-store|no-cache|private/)
    expect(await r.text()).toMatch(/<meta name="robots" content="noindex, nofollow"/)
  })

  it('previa=1 sem sessão é ignorada: segue o chat público', async () => {
    const html = await (await pegar(`/embed/${ativo}?previa=1`)).text()
    expect(html).toContain('data-modo="publico"')
    expect(html).not.toContain('>Prévia<')
  })
})

describe('agente inativo e inexistente', () => {
  it('dão o mesmo 404 com a mesma mensagem neutra, sem nome nem instruções', async () => {
    const a = await pegar(`/embed/${inativo}`)
    const b = await pegar('/embed/nao-existe-0123')
    expect(a.status).toBe(404)
    expect(b.status).toBe(404)
    const ta = await a.text()
    const tb = await b.text()
    expect(ta).toContain('Este assistente não está disponível no momento.')
    expect(semScripts(ta)).toBe(semScripts(tb))
    for (const proibido of ['Agente Inativo Secreto', 'Titulo Interno Secreto', SEGREDO, 'modelo-secreto']) {
      expect(ta, proibido).not.toContain(proibido)
    }
  })

  it("o cabeçalho é só 'self' nos dois casos, sem X-Frame-Options", async () => {
    for (const id of [inativo, 'nao-existe-0123']) {
      const r = await pegar(`/embed/${id}`)
      expect(r.headers.get('content-security-policy')).toBe("frame-ancestors 'self'")
      expect(r.headers.get('x-frame-options')).toBeNull()
    }
  })

  it('previa=1 sem sessão não revela o agente inativo', async () => {
    const r = await pegar(`/embed/${inativo}?previa=1`)
    expect(r.status).toBe(404)
    expect(await r.text()).not.toContain('Titulo Interno Secreto')
  })
})

describe('prévia com sessão (aba Publicar)', () => {
  it('mostra o chat mesmo com o agente inativo, com o selo de prévia', async () => {
    const r = await pegar(`/embed/${inativo}?previa=1`, true)
    expect(r.status).toBe(200)
    const html = await r.text()
    expect(html).toContain('data-modo="previa"')
    expect(html).toContain('>Prévia<')
    expect(html).toMatch(/<h1>Titulo Interno Secreto<\/h1>/)
    expect(html).not.toContain(SEGREDO)
  })

  it('agente inexistente continua 404, mesmo com sessão', async () => {
    expect((await pegar('/embed/nao-existe-0123?previa=1', true)).status).toBe(404)
  })

  it('sem o parâmetro, o cookie de sessão não muda nada: agente inativo segue 404', async () => {
    expect((await pegar(`/embed/${inativo}`, true)).status).toBe(404)
  })
})
