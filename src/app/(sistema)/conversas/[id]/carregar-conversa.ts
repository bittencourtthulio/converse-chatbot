import { cache } from 'react'
import { notFound } from 'next/navigation'
import { ErroDeAplicacao } from '@/lib/erros'
import { obterConversa, type ConversaDoHistorico } from '@/servicos/historico'

/**
 * A conversa da rota, ou a página 404 se o id não existe. Com `cache`, o layout (que decide o
 * 404 antes do `loading.tsx`) e a página leem a conversa uma vez só por requisição.
 */
export const carregarConversa = cache(async (id: string): Promise<ConversaDoHistorico> => {
  try {
    return await obterConversa(id)
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao && erro.status === 404) notFound()
    throw erro
  }
})
