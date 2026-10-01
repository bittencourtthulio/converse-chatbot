// Apoio comum às rotas de fontes (PR-49): resposta de erro em JSON com o status
// do erro de aplicação, e o erro inesperado com código de correlação e sem
// pilha (PR-21, PR-42). Não é uma rota.
import { usuarioAtual } from '@/app/sessao-servidor'
import { respostaDeErro } from '@/app/api/resposta-de-erro'
import { naoAutenticado } from '@/lib/erros'
import type { UsuarioAutenticado } from '@/servicos/autenticacao'

export const semCache = { 'Cache-Control': 'no-store' }

export function erroEmJson(erro: unknown): Promise<Response> {
  return respostaDeErro(erro, 'fontes')
}

/** O usuário da sessão; sem sessão lança 401 (JSON, sem redirecionar). */
export async function exigirSessao(): Promise<UsuarioAutenticado> {
  const usuario = await usuarioAtual()
  if (!usuario) throw naoAutenticado()
  return usuario
}

export function erroDeTipo(esperado: string): Response {
  return Response.json(
    { codigo: 'tipo_nao_suportado', mensagem: `Envie o conteúdo como ${esperado}.` },
    { status: 415, headers: semCache },
  )
}

export function erroDeTamanho(): Response {
  return Response.json(
    { codigo: 'corpo_grande_demais', mensagem: 'O envio é maior que o limite permitido.' },
    { status: 413, headers: semCache },
  )
}

/** `true` se o Content-Length declarado já passa do teto (recusa antes de ler o corpo). */
export function passaDoTeto(request: Request, teto: number): boolean {
  const declarado = Number(request.headers.get('content-length'))
  return Number.isFinite(declarado) && declarado > teto
}
