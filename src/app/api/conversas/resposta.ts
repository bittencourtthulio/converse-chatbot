// Apoio comum às rotas de conversas (FT-09): erro em JSON com o status do erro de
// aplicação, o inesperado com código de correlação e sem pilha (PR-21), e a sessão que
// responde 401 em JSON em vez de redirecionar. Não é uma rota.
import { usuarioAtual } from '@/app/sessao-servidor'
import { ErroDeAplicacao, naoAutenticado } from '@/lib/erros'
import { mensagemParaOperador } from '@/servicos/chat-erros'
import type { UsuarioAutenticado } from '@/servicos/autenticacao'

export const semCache = { 'Cache-Control': 'no-store' }

export function erroEmJson(erro: unknown): Response {
  const { codigo, mensagem, correlacao } = mensagemParaOperador(erro)
  if (!(erro instanceof ErroDeAplicacao)) {
    console.error(JSON.stringify({ evento: 'erro_inesperado', rota: 'conversas', correlacao }))
  }
  const status = erro instanceof ErroDeAplicacao ? erro.status : 500
  return Response.json({ codigo, mensagem }, { status, headers: semCache })
}

/** O usuário da sessão; sem sessão lança 401. Qualquer usuário autenticado acessa tudo (PR-12). */
export async function exigirSessao(): Promise<UsuarioAutenticado> {
  const usuario = await usuarioAtual()
  if (!usuario) throw naoAutenticado()
  return usuario
}
