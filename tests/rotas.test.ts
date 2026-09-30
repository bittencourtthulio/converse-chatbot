/**
 * Prova de vida das rotas: o servidor de produção sobe, o acesso sem sessão
 * é barrado, e com sessão as quatro telas do P-9 respondem.
 *
 * O login usa o mesmo serviço que a tela usa, e o cookie é montado como o
 * `gravarCookieDeSessao` monta — o que este teste cobre é o roteamento e a
 * proteção das rotas, que os testes de serviço não alcançam.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { entrar } from '@/servicos/autenticacao'
import { COOKIE_SESSAO } from '@/lib/sessao'
import { hashDeSenha } from '@/lib/senha'
import { prisma } from '@/lib/prisma'
import { salvarChaveDoOpenrouter } from '@/servicos/integracoes'
import { limparBanco } from './ajuda'
import { iniciarOpenRouterFalso, type OpenRouterFalso } from './apoio/openrouter-falso'

const PORTA = 3178
const BASE = `http://localhost:${PORTA}`

let servidor: ChildProcess
let falso: OpenRouterFalso

async function esperarDePe(tentativas = 60): Promise<void> {
  for (let i = 0; i < tentativas; i += 1) {
    try {
      await fetch(`${BASE}/entrar`)
      return
    } catch {
      await new Promise((r) => setTimeout(r, 500))
    }
  }
  throw new Error('O servidor não subiu a tempo.')
}

/** Segue a resposta sem redirecionar, para poder afirmar sobre o 307. */
const pedir = (caminho: string, cookie?: string) =>
  fetch(`${BASE}${caminho}`, {
    redirect: 'manual',
    headers: cookie ? { cookie } : {},
  })

beforeAll(async () => {
  await limparBanco()
  await prisma.usuario.createMany({
    data: [
      {
        nome: 'Admin de Rota',
        email: 'admin.rota@teste.local',
        senhaHash: await hashDeSenha('senha-de-rota-123'),
        papel: 'admin',
      },
      {
        nome: 'Comum de Rota',
        email: 'comum.rota@teste.local',
        senhaHash: await hashDeSenha('senha-de-rota-123'),
        papel: 'usuario',
      },
    ],
  })

  // O servidor de produção fala com o OpenRouter simulado, nunca com a rede real.
  falso = await iniciarOpenRouterFalso()
  servidor = spawn('npx', ['next', 'start', '-p', String(PORTA)], {
    env: { ...process.env, NODE_ENV: 'production', OPENROUTER_BASE_URL: falso.url },
    stdio: 'ignore',
  })
  await esperarDePe()
}, 120_000)

afterAll(async () => {
  servidor?.kill()
  await falso?.fechar()
})

async function cookieDe(email: string): Promise<string> {
  const { token } = await entrar({ email, senha: 'senha-de-rota-123' })
  return `${COOKIE_SESSAO}=${token}`
}

describe('sem sessão', () => {
  it.each(['/', '/perfil', '/perfil/senha', '/configuracoes/usuarios', '/configuracoes/integracoes', '/agentes', '/agentes/novo'])(
    'manda %s para o login',
    async (rota) => {
      const r = await pedir(rota)
      expect(r.status).toBe(307)
      expect(r.headers.get('location')).toContain('/entrar')
    },
  )

  it('a tela de login abre', async () => {
    const r = await pedir('/entrar')
    expect(r.status).toBe(200)
    expect(await r.text()).toContain('Entrar')
  })

  it('a tela de login é um cartão com o nome do produto, campos rotulados e sem estilo inline', async () => {
    const html = await (await pedir('/entrar')).text()
    expect(html).toContain('login-cartao')
    expect(html).toContain('Converse')
    expect(html).toContain('E-mail')
    expect(html).toContain('Senha')
    expect(html).toMatch(/autocomplete="username"/i)
    expect(html).toMatch(/autocomplete="current-password"/i)
    expect(html).toContain('>Entrar<')
    expect(html).not.toContain('style="')
  })
})

describe('com sessão de usuário comum', () => {
  it('o painel abre, com título e subtítulo', async () => {
    const r = await pedir('/', await cookieDe('comum.rota@teste.local'))
    const html = await r.text()
    expect(r.status).toBe(200)
    expect(html).toContain('Painel')
    expect(html).toContain('titulo-da-pagina')
    expect(html).toContain('Visão geral da sua conta')
    expect(html).toContain('Ainda não há o que mostrar')
    expect(html).toContain('estado-vazio')
    expect(html).not.toContain('Cadastrar usuário')
  })

  it('o perfil abre', async () => {
    const r = await pedir('/perfil', await cookieDe('comum.rota@teste.local'))
    expect(r.status).toBe(200)
    expect(await r.text()).toContain('Meu perfil')
  })

  it('a troca de senha abre', async () => {
    const r = await pedir('/perfil/senha', await cookieDe('comum.rota@teste.local'))
    expect(r.status).toBe(200)
    expect(await r.text()).toContain('Trocar senha')
  })

  it('o cadastro de usuários é negado no servidor, não só escondido no menu', async () => {
    const r = await pedir(
      '/configuracoes/usuarios',
      await cookieDe('comum.rota@teste.local'),
    )
    expect(r.status).toBe(307)
    expect(r.headers.get('location')).not.toContain('/configuracoes')
  })

  it('o item Usuários não aparece na navegação', async () => {
    const r = await pedir('/', await cookieDe('comum.rota@teste.local'))
    expect(await r.text()).not.toContain('/configuracoes/usuarios')
  })
})

describe('com sessão de admin', () => {
  it('o cadastro de usuários abre e lista quem existe', async () => {
    const r = await pedir(
      '/configuracoes/usuarios',
      await cookieDe('admin.rota@teste.local'),
    )
    const html = await r.text()
    expect(r.status).toBe(200)
    expect(html).toContain('Usuários')
    expect(html).toContain('admin.rota@teste.local')
    expect(html).toContain('comum.rota@teste.local')
    expect(html).toContain('badge-acento')
    expect(html).toContain('Administrador')
    expect(html).toContain('badge-sucesso')
    expect(html).toContain('Novo usuário')
    expect(html).not.toContain('style="')
  })

  it('o painel oferece o atalho para cadastrar usuário', async () => {
    const r = await pedir('/', await cookieDe('admin.rota@teste.local'))
    expect(await r.text()).toContain('Cadastrar usuário')
  })

  it('o item Usuários aparece na navegação', async () => {
    const r = await pedir('/', await cookieDe('admin.rota@teste.local'))
    expect(await r.text()).toContain('/configuracoes/usuarios')
  })
})

describe('Configurações > Integrações', () => {
  const CHAVE = 'sk-or-v1-CHAVE-EM-TESTE-9f8e7d6c-a1b2'

  it('usuário comum é barrado no servidor, e o item não aparece no menu', async () => {
    const cookie = await cookieDe('comum.rota@teste.local')
    const r = await pedir('/configuracoes/integracoes', cookie)
    expect(r.status).toBe(307)
    expect(r.headers.get('location')).not.toContain('/configuracoes')
    expect(await (await pedir('/', cookie)).text()).not.toContain('/configuracoes/integracoes')
  })

  it('admin vê o item no menu e a tela sem chave, com campo de senha vazio', async () => {
    const cookie = await cookieDe('admin.rota@teste.local')
    expect(await (await pedir('/', cookie)).text()).toContain('href="/configuracoes/integracoes"')
    const r = await pedir('/configuracoes/integracoes', cookie)
    const html = await r.text()
    expect(r.status).toBe(200)
    expect(html).toContain('OpenRouter')
    expect(html).toContain('Não configurada')
    expect(html).toContain('Salvar chave')
    expect(html).toMatch(/<input[^>]*type="password"[^>]*name="chave"/)
    expect(html).not.toContain('Testar conexão')
  })

  it('com a chave gravada a resposta traz só a máscara: nem a chave nem o texto cifrado', async () => {
    const admin = await prisma.usuario.findUniqueOrThrow({
      where: { email: 'admin.rota@teste.local' },
    })
    await salvarChaveDoOpenrouter(
      { id: admin.id, nome: admin.nome, email: admin.email, papel: 'admin' },
      { chave: CHAVE },
    )
    const cifrada = (
      await prisma.configuracaoDoWorkspace.findUniqueOrThrow({ where: { id: 'unica' } })
    ).openrouterChaveCifrada!

    const r = await pedir('/configuracoes/integracoes', await cookieDe('admin.rota@teste.local'))
    const html = await r.text()
    expect(r.status).toBe(200)
    expect(html).toContain('Configurada')
    expect(html).toContain('sk-or-…a1b2')
    expect(html).toContain('Testar conexão')
    expect(html).toContain('Remover chave')
    expect(html).not.toContain(CHAVE)
    expect(html).not.toContain('CHAVE-EM-TESTE')
    expect(html).not.toContain(cifrada)
    expect(html).not.toContain(cifrada.split(':')[3]!)
    expect(html).not.toMatch(/<input[^>]*type="password"[^>]*value=/)
  })
})

describe('Agentes: lista e novo agente', () => {
  const chaveDoFalso = 'sk-or-v1-chave-de-teste-0000'

  async function admin() {
    const a = await prisma.usuario.findUniqueOrThrow({ where: { email: 'admin.rota@teste.local' } })
    return { id: a.id, nome: a.nome, email: a.email, papel: 'admin' }
  }

  it('sem agentes mostra o estado vazio com a chamada para criar', async () => {
    await prisma.agente.deleteMany()
    const r = await pedir('/agentes', await cookieDe('comum.rota@teste.local'))
    const html = await r.text()
    expect(r.status).toBe(200)
    expect(html).toContain('Nenhum agente ainda')
    expect(html).toContain('href="/agentes/novo"')
    expect(html).toContain('estado-vazio')
  })

  it('com agentes mostra um cartão por agente, com nome, modelo, data e link', async () => {
    const dono = await prisma.usuario.findUniqueOrThrow({ where: { email: 'comum.rota@teste.local' } })
    const agente = await prisma.agente.create({
      data: { nome: 'Atendimento da Loja', modelo: 'anthropic/claude-sonnet-4', criadoPorId: dono.id },
    })
    const r = await pedir('/agentes', await cookieDe('admin.rota@teste.local'))
    const html = await r.text()
    expect(r.status).toBe(200)
    expect(html).toContain('Atendimento da Loja')
    expect(html).toContain('anthropic/claude-sonnet-4')
    expect(html).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    expect(html).toContain(`href="/agentes/${agente.id}"`)
    expect(html).not.toContain('Nenhum agente ainda')
    expect(html).not.toContain('style="')
  })

  it('o menu leva a Agentes e o item fica marcado na rota', async () => {
    const r = await pedir('/agentes', await cookieDe('comum.rota@teste.local'))
    const html = await r.text()
    const marcadas = (html.match(/<a [^>]*>/g) ?? []).filter((t) => t.includes('aria-current="page"'))
    expect(marcadas).toHaveLength(1)
    expect(marcadas[0]).toContain('href="/agentes"')
  })

  it('novo agente traz o formulário com o modelo padrão e o aviso de chave', async () => {
    await prisma.configuracaoDoWorkspace.deleteMany()
    const r = await pedir('/agentes/novo', await cookieDe('comum.rota@teste.local'))
    const html = await r.text()
    expect(r.status).toBe(200)
    expect(html).toMatch(/<input[^>]*name="modelo"/)
    expect(html).toContain('value="openai/gpt-4o-mini"')
    expect(html).toContain('Criar agente')
    expect(html).toContain('Nenhuma chave do OpenRouter')
    expect(html).not.toContain('/configuracoes/integracoes"') // usuário comum não recebe o link
  })

  it('novo agente para admin sem chave leva o link para Integrações', async () => {
    const r = await pedir('/agentes/novo', await cookieDe('admin.rota@teste.local'))
    const html = await r.text()
    expect(html).toContain('Nenhuma chave do OpenRouter')
    expect(html).toContain('href="/configuracoes/integracoes"')
  })

  it('com chave, o seletor oferece os modelos do OpenRouter simulado', async () => {
    await salvarChaveDoOpenrouter(await admin(), { chave: chaveDoFalso })
    const r = await pedir('/agentes/novo', await cookieDe('comum.rota@teste.local'))
    const html = await r.text()
    expect(html).toContain('<datalist')
    expect(html).toContain('OpenAI: GPT-4o mini')
    expect(html).not.toContain('Nenhuma chave do OpenRouter')
    expect(html).not.toContain(chaveDoFalso)
  })
})

describe('Agentes: página do agente', () => {
  async function criarAgenteDeTeste() {
    const dono = await prisma.usuario.findUniqueOrThrow({ where: { email: 'comum.rota@teste.local' } })
    return prisma.agente.create({
      data: {
        nome: 'Agente de Rota',
        instrucoes: 'Responda sempre em português, com cordialidade.',
        modelo: 'google/gemini-2.0-flash-001',
        temperatura: 1.3,
        mensagemInicial: 'Bem-vindo à loja!',
        criadoPorId: dono.id,
      },
    })
  }

  it('sem sessão manda para o login', async () => {
    const r = await pedir('/agentes/qualquer-id')
    expect(r.status).toBe(307)
    expect(r.headers.get('location')).toContain('/entrar')
  })

  it('mostra o nome, as abas e o formulário preenchido com os valores salvos', async () => {
    const agente = await criarAgenteDeTeste()
    const r = await pedir(`/agentes/${agente.id}`, await cookieDe('admin.rota@teste.local'))
    const html = await r.text()
    expect(r.status).toBe(200)
    expect(html).toContain('Agente de Rota')
    expect(html).toContain('aria-label="Seções do agente"')
    const tags = html.match(/<a [^>]*>/g) ?? []
    const aba = tags.find((t) => t.includes('class="aba"'))
    expect(aba).toContain(`href="/agentes/${agente.id}"`)
    expect(aba).toContain('aria-current="page"')
    expect(html).toContain('value="Agente de Rota"')
    expect(html).toContain('Responda sempre em português, com cordialidade.')
    expect(html).toContain('value="google/gemini-2.0-flash-001"')
    expect(html).toContain('value="1.3"')
    expect(html).toContain('Bem-vindo à loja!')
    expect(html).toContain('Salvar alterações')
    expect(html).toContain('Excluir agente')
    expect(html).not.toContain('Confirmar exclusão')
    expect(html).not.toContain('window.confirm')
    expect(html).not.toContain('style="')
  })

  it('o menu marca Agentes como a seção atual', async () => {
    const agente = await criarAgenteDeTeste()
    const html = await (
      await pedir(`/agentes/${agente.id}`, await cookieDe('comum.rota@teste.local'))
    ).text()
    const marcadas = (html.match(/<a [^>]*>/g) ?? []).filter(
      (t) => t.includes('aria-current="page"') && t.includes('navegacao-item'),
    )
    expect(marcadas).toHaveLength(1)
    expect(marcadas[0]).toContain('href="/agentes"')
  })

  it('id inexistente responde 404', async () => {
    const r = await pedir('/agentes/id-que-nao-existe', await cookieDe('comum.rota@teste.local'))
    expect(r.status).toBe(404)
  })
})

describe('layout raiz', () => {
  it('o título usa o nome do produto e a página é em português do Brasil', async () => {
    const html = await (await pedir('/entrar')).text()
    expect(html).toMatch(/<title>[^<]*Converse[^<]*<\/title>/)
    expect(html).toContain('lang="pt-BR"')
    expect(html).not.toContain('Gerado pelo buildx')
  })

  it('resolve o tema antes da primeira pintura: escolha salva, senão preferência do sistema', async () => {
    const html = await (await pedir('/entrar')).text()
    const script = html.match(/<script[^>]*>([^<]*localStorage[^<]*)<\/script>/)?.[1] ?? ''
    expect(script).toContain("getItem('tema')")
    expect(script).toContain('prefers-color-scheme: dark')
    expect(script).toContain('dataset.theme')
    expect(html.indexOf('localStorage')).toBeLessThan(html.indexOf('</head>'))
  })
})

describe('casca SaaS', () => {
  it('mostra logotipo, menu do usuário, gaveta e alternador de tema ao admin', async () => {
    const r = await pedir('/', await cookieDe('admin.rota@teste.local'))
    const html = await r.text()
    expect(html).toContain('logotipo-nome')
    expect(html).toContain('Converse')
    expect(html).toContain('href="/configuracoes/usuarios"')
    expect(html).toContain('Admin de Rota')
    expect(html).toContain('>AR<')
    expect(html).toContain('aria-label="Abrir menu"')
    expect(html).toContain('aria-label="Alternar tema"')
    expect(html).toContain('Sair')
    expect(html).toContain('Administrador')
  })

  it('o usuário comum não recebe o link de Usuários e vê o próprio papel', async () => {
    const r = await pedir('/', await cookieDe('comum.rota@teste.local'))
    const html = await r.text()
    expect(html).not.toContain('href="/configuracoes/usuarios"')
    expect(html).toContain('>CR<')
    expect(html).toContain('href="/perfil"')
  })

  it('marca o item da rota atual na navegação', async () => {
    const r = await pedir('/perfil', await cookieDe('comum.rota@teste.local'))
    const html = await r.text()
    const tags = html.match(/<a [^>]*>/g) ?? []
    const marcadas = tags.filter((t) => t.includes('aria-current="page"'))
    expect(marcadas).toHaveLength(1)
    expect(marcadas[0]).toContain('href="/perfil"')
  })
})

describe('cabeçalhos de segurança', () => {
  const esperados = {
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'x-frame-options': 'DENY',
  }

  function conferir(r: Response) {
    for (const [nome, valor] of Object.entries(esperados)) {
      expect(r.headers.get(nome), nome).toBe(valor)
    }
    const permissoes = r.headers.get('permissions-policy') ?? ''
    for (const recurso of ['camera', 'microphone', 'geolocation']) {
      expect(permissoes).toContain(`${recurso}=()`)
    }
  }

  it('a tela de login envia os cabeçalhos', async () => {
    conferir(await pedir('/entrar'))
  })

  it('uma tela autenticada envia os cabeçalhos', async () => {
    conferir(await pedir('/', await cookieDe('comum.rota@teste.local')))
  })

  it('o redirecionamento para o login também envia os cabeçalhos', async () => {
    conferir(await pedir('/perfil'))
  })
})

describe('cookie de sessão', () => {
  it('token adulterado não abre o painel', async () => {
    const bom = await cookieDe('admin.rota@teste.local')
    const adulterado = bom.slice(0, -4) + 'xxxx'
    const r = await pedir('/', adulterado)
    expect(r.status).toBe(307)
  })
})
