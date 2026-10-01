// Renovação deslizante da sessão na borda HTTP (FT-12, PR-102). Em requisição autenticada que passou da metade
// da vida do token, o `src/proxy.ts` reemite o cookie de sessão na resposta (mesmo `jti`, nova expiração). É o
// único ponto do Next 16, além de ações e rotas, que pode gravar cookie; componente de servidor não pode.
// Não é fronteira de autenticação: nunca nega nem redireciona, as guardas dos handlers continuam decidindo.
import type { NextRequest, NextResponse } from 'next/server'
import { COOKIE_SESSAO, opcoesDoCookie } from '@/lib/sessao'
import { ErroDeAplicacao } from '@/lib/erros'
import { camposDoErro, log } from '@/lib/log'
import { renovarSessaoSePreciso } from '@/servicos/autenticacao'

/** Rotas que nunca renovam: o chat embutido e a API pública (sem sessão), o webhook do Telegram e a saúde. */
const PREFIXOS_SEM_RENOVACAO = ['/embed', '/api/publico', '/api/telegram', '/api/saude']

const comecaCom = (caminho: string, prefixo: string) => caminho === prefixo || caminho.startsWith(`${prefixo}/`)

/**
 * A requisição renova? Não, se for Server Action (POST a uma página, com ou sem o cabeçalho `next-action`):
 * ela grava o próprio cookie (login, troca de senha) ou o apaga (`sair`), e um `Set-Cookie` do proxy na mesma
 * resposta poderia ressuscitar a sessão que acabou de sair. POST a `/api` (chat, buscas) renova: é uso.
 */
export function requisicaoRenovaSessao(request: NextRequest): boolean {
  const caminho = request.nextUrl.pathname
  if (PREFIXOS_SEM_RENOVACAO.some((p) => comecaCom(caminho, p))) return false
  if (request.headers.has('next-action')) return false
  if (request.method === 'POST' && !comecaCom(caminho, '/api')) return false
  return true
}

/**
 * Se a sessão do cookie está na segunda metade da vida, grava o cookie novo em `resposta`. Falha na renovação
 * nunca derruba a requisição: token inválido ou revogado segue sem renovar, sem barulho, e erro inesperado vai ao
 * log como aviso, só com o nome do erro.
 */
export async function renovarCookieNaResposta(
  request: NextRequest,
  resposta: NextResponse,
  opcoes: { agora?: number } = {},
): Promise<void> {
  const token = request.cookies.get(COOKIE_SESSAO)?.value
  if (!token || !requisicaoRenovaSessao(request)) return
  try {
    const renovada = await renovarSessaoSePreciso(token, opcoes)
    if (renovada) resposta.cookies.set(COOKIE_SESSAO, renovada.token, opcoesDoCookie(renovada.maxAge))
  } catch (erro) {
    if (!(erro instanceof ErroDeAplicacao)) log.aviso('renovacao_falhou', camposDoErro(erro))
  }
}
