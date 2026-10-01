// Bordas do Next simuladas para os testes de ação (FT-12, T-01.02): `cookies()` e `headers()` de
// `next/headers` e `redirect` de `next/navigation`. Só o framework é trocado: o `sessao-servidor`, os
// serviços e o banco são os reais, então o que o teste lê no jar é exatamente o que a ação gravou.
//
// Uso (as fábricas de `vi.mock` são içadas, por isso importam o apoio dentro delas):
//   vi.mock('next/headers', async () => (await import('./apoio/next-falso')).moduloNextHeaders())
//   vi.mock('next/navigation', async () => (await import('./apoio/next-falso')).moduloNextNavigation())
export interface CookieGravado {
  nome: string
  valor: string
  opcoes: Record<string, unknown> | undefined
}

const jar = new Map<string, string>()
const cabecalhos = new Map<string, string>()
export const gravados: CookieGravado[] = []
export const apagados: string[] = []

const lojaDeCookies = {
  get: (nome: string) => (jar.has(nome) ? { name: nome, value: jar.get(nome) as string } : undefined),
  has: (nome: string) => jar.has(nome),
  set: (nome: string, valor: string, opcoes?: Record<string, unknown>) => {
    jar.set(nome, valor)
    gravados.push({ nome, valor, opcoes })
  },
  delete: (nome: string) => {
    jar.delete(nome)
    apagados.push(nome)
  },
}

/** O cookie que o navegador "já tem" quando a ação roda (o jar de entrada). */
export function definirCookie(nome: string, valor: string): void {
  jar.set(nome, valor)
}

export function valorDoCookie(nome: string): string | undefined {
  return jar.get(nome)
}

/** Um cabeçalho da requisição simulada (o nome é guardado em minúsculas). */
export function definirCabecalho(nome: string, valor: string): void {
  cabecalhos.set(nome.toLowerCase(), valor)
}

/** Limpa jar, cabeçalhos e registros: chame no `beforeEach`. */
export function reiniciarNextFalso(): void {
  jar.clear()
  cabecalhos.clear()
  gravados.length = 0
  apagados.length = 0
}

export function moduloNextHeaders() {
  return {
    cookies: async () => lojaDeCookies,
    headers: async () => ({ get: (nome: string) => cabecalhos.get(nome.toLowerCase()) ?? null }),
  }
}

/** O erro que `redirect` lança no teste: leva o destino, como o sinal do Next leva o seu. */
export class RedirecionamentoFalso extends Error {
  constructor(readonly destino: string) {
    super('NEXT_REDIRECT')
  }
}

export function moduloNextNavigation() {
  return {
    redirect: (destino: string): never => {
      throw new RedirecionamentoFalso(destino)
    },
  }
}

/** O destino do redirecionamento que a ação lançou, ou `null` se ela terminou sem redirecionar. */
export async function destinoDoRedirecionamento(acao: () => Promise<unknown>): Promise<string | null> {
  try {
    await acao()
    return null
  } catch (erro) {
    if (erro instanceof RedirecionamentoFalso) return erro.destino
    throw erro
  }
}
