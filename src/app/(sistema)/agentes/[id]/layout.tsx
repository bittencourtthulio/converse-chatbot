import { exigirUsuario } from '@/app/sessao-servidor'
import { carregarAgente } from '@/app/(sistema)/agentes/[id]/carregar-agente'
import { CabecalhoDaPagina } from '@/componentes/CabecalhoDaPagina'
import { AbasDoAgente } from '@/componentes/AbasDoAgente'

/**
 * Layout compartilhado de tudo que mora em `agentes/[id]`: o nome do agente e
 * as abas. Uma feature nova acrescenta a aba em `abas-do-agente.ts` e a
 * subrota ao lado desta pasta; este arquivo não muda.
 */
export default async function LayoutDoAgente({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const usuario = await exigirUsuario()
  const { id } = await params
  const agente = await carregarAgente(usuario, id)

  return (
    <div className="pilha">
      <CabecalhoDaPagina titulo={agente.nome} subtitulo={`Modelo: ${agente.modelo}`} />
      <AbasDoAgente agenteId={agente.id} />
      {children}
    </div>
  )
}
