/**
 * FT-12, sprint 05: a sessão endurecida provada de ponta a ponta contra o servidor de produção (`next start`,
 * porta 3252), sem JavaScript no navegador: login e troca de senha pelos formulários reais das Server Actions.
 * O relógio do servidor não é injetável de fora, então a prova usa `JWT_TTL_SEGUNDOS=8` (a metade da vida é
 * 4 s) e esperas reais curtas; o limite absoluto de 12 horas é provado no serviço, com relógio injetado
 * (`tests/sessao-renovacao.test.ts`). Exige `npm run build` antes.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { criarUsuario, limparBanco, SENHA_PADRAO } from './ajuda'
import { enviarFormulario, entrarPorFormulario, cookieDeSessaoDe } from './apoio/login-http'
import { subirServidor, type Servidor } from './apoio/servidor'

let servidor: Servidor

beforeAll(async () => {
  await limparBanco()
  servidor = await subirServidor(3252, { JWT_TTL_SEGUNDOS: '8' })
}, 180_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

const NOVA = 'senha-nova-456'
const pedir = (caminho: string, cookie: string) => fetch(`${servidor.base}${caminho}`, { headers: { cookie }, redirect: 'manual' })
const entrar = async (email: string, senha: string): Promise<string> => {
  const r = await entrarPorFormulario(servidor.base, email, senha)
  expect(r.status, `login de ${email}`).toBe(303)
  return r.cookie as string
}

describe('o cookie do login real (integração)', () => {
  it('o Set-Cookie traz HttpOnly, SameSite=Lax, Path=/, Secure (produção) e Max-Age igual ao TTL', async () => {
    const u = await criarUsuario()
    const r = await entrarPorFormulario(servidor.base, u.email, SENHA_PADRAO)
    expect(r.status).toBe(303)
    expect(r.location).toBe('/')
    const linha = r.setCookies.find((c) => c.startsWith('expx_sessao='))!
    expect(linha).toMatch(/;\s*HttpOnly/i)
    expect(linha).toMatch(/;\s*SameSite=Lax/i)
    expect(linha).toMatch(/;\s*Path=\//)
    expect(linha).toMatch(/;\s*Secure/i)
    expect(linha).toMatch(/;\s*Max-Age=8(;|$)/)
  })
})

describe('login logo depois da troca de senha (funcional)', () => {
  it('o login feito logo depois da troca abre o sistema, o cookie da troca vale e o anterior cai', async () => {
    const u = await criarUsuario()
    const antigo = await entrar(u.email, SENHA_PADRAO)

    const troca = await enviarFormulario(
      servidor.base,
      '/perfil/senha',
      { senhaAtual: SENHA_PADRAO, senhaNova: NOVA, confirmacao: NOVA },
      { contendo: 'name="senhaAtual"', cookie: antigo },
    )
    expect(troca.status).toBe(200)
    expect(troca.corpo).toContain('Senha alterada')
    const daTroca = cookieDeSessaoDe(troca.setCookies)
    expect(daTroca, 'a ação grava o cookie novo').not.toBeNull()

    // Logo em seguida, no mesmo segundo: o caso que o corte por relógio derrubava (achado A-1 do B6).
    const novoLogin = await entrar(u.email, NOVA)

    expect((await pedir('/perfil', novoLogin)).status).toBe(200)
    expect((await pedir('/perfil', daTroca!)).status).toBe(200)
    const aposTroca = await pedir('/perfil', antigo)
    expect(aposTroca.status).toBe(307)
    expect(aposTroca.headers.get('location')).toContain('/entrar')
  })
})

describe('sair revoga de verdade (integração)', () => {
  it('o cookie copiado antes do logout é barrado depois (página 307, API 401) e a outra sessão do usuário continua', async () => {
    const u = await criarUsuario()
    const roubado = await entrar(u.email, SENHA_PADRAO)
    const doOutroAparelho = await entrar(u.email, SENHA_PADRAO)
    expect((await pedir('/perfil', roubado)).status).toBe(200)

    // O Sair logo após o login, antes da metade da vida do token: a prova é a revogação, não o Set-Cookie.
    const saida = await enviarFormulario(servidor.base, '/', {}, { contendo: 'Sair', cookie: roubado })
    expect(saida.status).toBe(303)
    expect(saida.location).toContain('/entrar')
    const apagado = saida.setCookies.find((c) => c.startsWith('expx_sessao='))
    expect(apagado, 'a resposta apaga o cookie').toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i)

    const pagina = await pedir('/perfil', roubado)
    expect(pagina.status).toBe(307)
    expect(pagina.headers.get('location')).toContain('/entrar')
    expect((await pedir('/api/conversas/qualquer-id/exportar', roubado)).status).toBe(401)

    expect((await pedir('/perfil', doOutroAparelho)).status).toBe(200)
    expect((await pedir('/api/conversas/qualquer-id/exportar', doOutroAparelho)).status).toBe(404)
  })
})
