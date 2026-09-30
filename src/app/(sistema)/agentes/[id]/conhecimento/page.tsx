import { exigirUsuario } from '@/app/sessao-servidor'
import { carregarAgente } from '@/app/(sistema)/agentes/[id]/carregar-agente'
import { CartoesDeResumo } from '@/componentes/CartoesDeResumo'
import { resumo } from '@/servicos/fontes'

/**
 * Aba Conhecimento do agente (FT-04): o resumo da base no topo; a lista de
 * fontes e a área de adicionar entram nas próximas tasks.
 */
export default async function ConhecimentoDoAgente({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await exigirUsuario()
  const { id } = await params
  const agente = await carregarAgente(usuario, id)
  const resumoDaBase = await resumo(usuario, agente.id)

  return (
    <div className="pilha">
      <CartoesDeResumo resumo={resumoDaBase} />
    </div>
  )
}
