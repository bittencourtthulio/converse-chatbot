/**
 * Trava contra rede real nos testes (FT-13, PR-26, PR-112). Instalada por `tests/setup-rede.ts` em todo
 * arquivo de teste: qualquer conexão de saída para um host que não seja loopback falha com uma mensagem
 * clara. Os simulados de OpenRouter, Telegram e YouTube são servidores HTTP em 127.0.0.1 e continuam
 * funcionando. Cobre `fetch`, `http`, `https`, `tls` e `net.connect`, porque todos terminam em
 * `net.Socket.prototype.connect`. A trava vale para o processo do vitest; o `next start` que alguns
 * testes sobem é outro processo e só fala com os simulados locais.
 */
import net from 'node:net'

/**
 * Hosts liberados além do loopback. VAZIA de propósito: um teste que precise de um serviço externo real
 * contradiz a PR-26. Se um dia for inevitável, o host entra aqui com a justificativa ao lado.
 */
export const HOSTS_PERMITIDOS: readonly string[] = []

const LOOPBACK = /^(localhost|0\.0\.0\.0|::|::1|127(\.\d{1,3}){3}|::ffff:127(\.\d{1,3}){3})$/i

/** O host é a própria máquina (ou está na lista de permissões)? */
export function ehLoopback(host: string): boolean {
  const limpo = host.trim().replace(/^\[(.*)\]$/, '$1').toLowerCase()
  if (limpo === '') return false
  return LOOPBACK.test(limpo) || HOSTS_PERMITIDOS.includes(limpo)
}

export function mensagemDeBloqueio(host: string): string {
  return `Rede real bloqueada nos testes (PR-26): tentativa de conexão com ${host}. Use um servidor simulado local (tests/apoio).`
}

/** O host de destino de uma chamada a `Socket.connect`, ou `null` para socket de domínio Unix. */
function destinoDe(args: unknown[]): string | null {
  let primeiro = args[0]
  if (Array.isArray(primeiro)) primeiro = primeiro[0] // forma normalizada [opções, retorno]
  if (primeiro !== null && typeof primeiro === 'object') {
    const o = primeiro as { host?: string; path?: string }
    if (o.path) return null
    return o.host ?? 'localhost'
  }
  if (typeof primeiro === 'number' || (typeof primeiro === 'string' && /^\d+$/.test(primeiro))) {
    return typeof args[1] === 'string' ? args[1] : 'localhost'
  }
  return null // caminho de socket de domínio Unix
}

const MARCA = Symbol.for('converse.travaDeRedeInstalada')

/** Instala a trava; chamar de novo não faz nada. */
export function instalarTravaDeRede(): void {
  const g = globalThis as unknown as Record<symbol, boolean | undefined>
  if (g[MARCA]) return
  g[MARCA] = true

  const conectar = net.Socket.prototype.connect
  net.Socket.prototype.connect = function (this: net.Socket, ...args: unknown[]) {
    const host = destinoDe(args)
    if (host !== null && !ehLoopback(host)) {
      const erro = new Error(mensagemDeBloqueio(host))
      process.nextTick(() => this.destroy(erro))
      return this
    }
    return (conectar as (...a: unknown[]) => net.Socket).apply(this, args)
  } as typeof net.Socket.prototype.connect

  const buscar = globalThis.fetch
  globalThis.fetch = (async (entrada: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    const texto = typeof entrada === 'string' ? entrada : entrada instanceof URL ? entrada.href : entrada.url
    let host = ''
    try {
      host = new URL(texto).hostname
    } catch {
      // URL relativa ou inválida: deixa o fetch real reclamar.
    }
    if (host !== '' && !ehLoopback(host)) throw new Error(mensagemDeBloqueio(host))
    return buscar(entrada, init)
  }) as typeof fetch
}
