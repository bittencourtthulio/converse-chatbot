import { notFound } from 'next/navigation'
import { exigirUsuario } from '@/app/sessao-servidor'
import { ListaDeTrechos } from '@/componentes/ListaDeTrechos'
import { ErroDeAplicacao } from '@/lib/erros'
import { trechosDaFonte } from '@/servicos/fontes'

/** "Ver conteúdo": os trechos extraídos de uma fonte, de 20 em 20 (`?pagina=N`). */
export default async function VerConteudoDaFonte({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; fonteId: string }>
  searchParams: Promise<{ pagina?: string | string[] }>
}) {
  const usuario = await exigirUsuario()
  const { id, fonteId } = await params
  const { pagina } = await searchParams
  let dados
  try {
    dados = await trechosDaFonte(usuario, id, fonteId, { pagina: Number(Array.isArray(pagina) ? pagina[0] : pagina) })
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao && erro.status === 404) notFound()
    throw erro
  }
  return (
    <ListaDeTrechos
      dados={dados}
      voltarPara={`/agentes/${id}/conhecimento`}
      caminhoDaPagina={`/agentes/${id}/conhecimento/${fonteId}`}
    />
  )
}
