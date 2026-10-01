// Apoio comum às rotas de conversas (FT-09): erro em JSON com o status do erro de
// aplicação, o inesperado com código de correlação e sem pilha (PR-21), e a sessão que
// responde 401 em JSON em vez de redirecionar. Não é uma rota.
import { usuarioAtual } from '@/app/sessao-servidor'
import { respostaDeErro } from '@/app/api/resposta-de-erro'
import { naoAutenticado } from '@/lib/erros'
import type { UsuarioAutenticado } from '@/servicos/autenticacao'

export const semCache = { 'Cache-Control': 'no-store' }

export function erroEmJson(erro: unknown): Promise<Response> {
  return respostaDeErro(erro, 'conversas')
}

/** O usuário da sessão; sem sessão lança 401. Qualquer usuário autenticado acessa tudo (PR-12). */
export async function exigirSessao(): Promise<UsuarioAutenticado> {
  const usuario = await usuarioAtual()
  if (!usuario) throw naoAutenticado()
  return usuario
}
