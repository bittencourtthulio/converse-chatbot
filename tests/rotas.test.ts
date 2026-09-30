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

const PORTA = 3178
const BASE = `http://localhost:${PORTA}`

let servidor: ChildProcess

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
  await prisma.usuario.deleteMany()
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

  servidor = spawn('npx', ['next', 'start', '-p', String(PORTA)], {
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: 'ignore',
  })
  await esperarDePe()
}, 120_000)

afterAll(() => {
  servidor?.kill()
})

async function cookieDe(email: string): Promise<string> {
  const { token } = await entrar({ email, senha: 'senha-de-rota-123' })
  return `${COOKIE_SESSAO}=${token}`
}

describe('sem sessão', () => {
  it.each(['/', '/perfil', '/perfil/senha', '/configuracoes/usuarios'])(
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
    expect(html).toContain('Esta é a tela inicial do sistema')
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
  })

  it('o item Usuários aparece na navegação', async () => {
    const r = await pedir('/', await cookieDe('admin.rota@teste.local'))
    expect(await r.text()).toContain('/configuracoes/usuarios')
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
