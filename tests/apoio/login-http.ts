// Formulários de Server Action enviados sem JavaScript a um servidor de produção (FT-12, T-01.03).
// O React 19 coloca no formulário campos ocultos (`$ACTION_REF_*`, `$ACTION_*:0`, `$ACTION_KEY`, ou
// `$ACTION_ID_*` quando a ação não tem argumentos); o apoio os lê do HTML da página e os reenvia, com os
// campos do teste, como `multipart/form-data` — o mesmo que o navegador faz sem JavaScript.
import { COOKIE_SESSAO } from '../../src/lib/sessao.js'

export interface RespostaHttp {
  status: number
  location: string | null
  /** Cada cabeçalho `Set-Cookie`, inteiro. */
  setCookies: string[]
  corpo: string
}

const desescapar = (valor: string) => valor.replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&amp;', '&')

/** Os campos ocultos do primeiro formulário do HTML cujo texto contém `contendo`. */
export function camposOcultosDoFormulario(html: string, contendo: string): Array<[string, string]> {
  const formularios = [...html.matchAll(/<form[\s\S]*?<\/form>/g)].map((m) => m[0])
  const alvo = formularios.find((f) => f.includes(contendo))
  if (!alvo) throw new Error(`Nenhum formulário contém "${contendo}" na página.`)
  return [...alvo.matchAll(/<input type="hidden" name="([^"]+)"(?: value="([^"]*)")?\/>/g)].map(
    (m) => [m[1]!, desescapar(m[2] ?? '')] as [string, string],
  )
}

/** O par `nome=valor` de `expx_sessao` num `Set-Cookie`, ou `null` se não há. */
export function cookieDeSessaoDe(setCookies: string[]): string | null {
  const linha = setCookies.find((c) => c.startsWith(`${COOKIE_SESSAO}=`))
  return linha ? linha.split(';')[0]! : null
}

/**
 * Abre `caminho` (com o cookie, se houver), acha o formulário que contém `contendo` e o envia com
 * `campos`. Não segue redirecionamento: o teste afirma sobre o 303 e o `Location`.
 */
export async function enviarFormulario(
  base: string,
  caminho: string,
  campos: Record<string, string>,
  opcoes: { contendo: string; cookie?: string },
): Promise<RespostaHttp> {
  const cabecalhos: Record<string, string> = opcoes.cookie ? { cookie: opcoes.cookie } : {}
  const pagina = await fetch(`${base}${caminho}`, { headers: cabecalhos, redirect: 'manual' })
  const html = await pagina.text()
  const corpo = new FormData()
  for (const [nome, valor] of camposOcultosDoFormulario(html, opcoes.contendo)) corpo.set(nome, valor)
  for (const [nome, valor] of Object.entries(campos)) corpo.set(nome, valor)
  const r = await fetch(`${base}${caminho}`, { method: 'POST', body: corpo, headers: cabecalhos, redirect: 'manual' })
  return { status: r.status, location: r.headers.get('location'), setCookies: r.headers.getSetCookie(), corpo: await r.text() }
}

/** O login pelo formulário real de `/entrar`; `cookie` é o par `expx_sessao=...` quando entrou. */
export async function entrarPorFormulario(
  base: string,
  email: string,
  senha: string,
): Promise<RespostaHttp & { cookie: string | null }> {
  const r = await enviarFormulario(base, '/entrar', { email, senha }, { contendo: 'name="senha"' })
  return { ...r, cookie: cookieDeSessaoDe(r.setCookies) }
}
