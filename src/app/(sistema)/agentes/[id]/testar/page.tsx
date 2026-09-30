import { exigirUsuario } from '@/app/sessao-servidor'
import { carregarAgente } from '@/app/(sistema)/agentes/[id]/carregar-agente'
import { ChatDeTeste } from '@/componentes/ChatDeTeste'
import { retomarDoPainel } from '@/servicos/conversas'
import { chaveDoOpenrouterConfigurada } from '@/servicos/integracoes'

/**
 * Aba Testar do agente (FT-03): a conversa do painel. A página carrega, no
 * servidor, a última conversa deste usuário com o agente (PR-44); o resto é do
 * componente de chat.
 */
export default async function TestarAgente({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await exigirUsuario()
  const { id } = await params
  const agente = await carregarAgente(usuario, id)
  const [retomada, temChave] = await Promise.all([
    retomarDoPainel(agente.id, usuario.id),
    chaveDoOpenrouterConfigurada(),
  ])

  return (
    <ChatDeTeste
      agente={{ id: agente.id, nome: agente.nome, mensagemInicial: agente.mensagemInicial }}
      retomada={retomada ?? undefined}
      temChave={temChave}
      ehAdmin={usuario.papel === 'admin'}
    />
  )
}
