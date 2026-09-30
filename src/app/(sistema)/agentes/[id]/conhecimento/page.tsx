import { exigirUsuario } from '@/app/sessao-servidor'
import { carregarAgente } from '@/app/(sistema)/agentes/[id]/carregar-agente'
import { PainelDeConhecimento } from '@/componentes/PainelDeConhecimento'
import { serializarFonte } from '@/componentes/fonte-da-tela'
import { ambiente } from '@/lib/ambiente'
import { listar, resumo } from '@/servicos/fontes'

/**
 * Aba Conhecimento do agente (FT-04): resumo, adicionar e lista de fontes. A
 * página carrega o estado inicial no servidor; o painel cliente o atualiza
 * enquanto houver fonte em processamento.
 */
export default async function ConhecimentoDoAgente({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await exigirUsuario()
  const { id } = await params
  const agente = await carregarAgente(usuario, id)
  const [fontes, resumoDaBase] = await Promise.all([listar(usuario, agente.id), resumo(usuario, agente.id)])

  return (
    <PainelDeConhecimento
      agenteId={agente.id}
      fontesIniciais={fontes.map(serializarFonte)}
      resumoInicial={resumoDaBase}
      limiteDeUploadBytes={ambiente.maxUploadBytes}
    />
  )
}
