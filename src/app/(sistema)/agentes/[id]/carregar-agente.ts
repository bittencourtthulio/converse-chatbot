import { notFound } from 'next/navigation'
import { obter, type AgenteVisivel } from '@/servicos/agentes'
import { ErroDeAplicacao } from '@/lib/erros'
import type { UsuarioAutenticado } from '@/servicos/autenticacao'

/** O agente da rota, ou a página 404 se o id não existe. */
export async function carregarAgente(
  usuario: UsuarioAutenticado,
  id: string,
): Promise<AgenteVisivel> {
  try {
    return await obter(usuario, id)
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao && erro.status === 404) notFound()
    throw erro
  }
}
