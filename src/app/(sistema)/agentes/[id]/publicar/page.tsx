import { exigirUsuario } from '@/app/sessao-servidor'
import { carregarAgente } from '@/app/(sistema)/agentes/[id]/carregar-agente'
import { salvarChat } from '@/app/acoes'
import { FormularioDoChat } from '@/componentes/FormularioDoChat'
import { obterConfiguracao } from '@/servicos/chat-publico-config'

/**
 * Aba Publicar do agente (FT-06): liga o chat embutido e configura a aparência, o
 * aviso de privacidade, os domínios e o limite diário (PR-55). Qualquer usuário
 * autenticado edita (PR-12). A prévia e o código para incorporar entram na T-06.02.
 */
export default async function PublicarAgente({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await exigirUsuario()
  const { id } = await params
  const agente = await carregarAgente(usuario, id)
  const c = await obterConfiguracao(usuario, agente.id)

  return (
    <section className="cartao cartao-largo" aria-label="Configuração do chat embutido">
      <div className="cartao-corpo">
        <FormularioDoChat
          acao={salvarChat}
          agente={{ id: agente.id, nome: agente.nome }}
          configuracao={{
            ativo: c.ativo,
            titulo: c.titulo,
            cor: c.cor,
            posicao: c.posicao,
            avatar: c.avatar,
            avisoDePrivacidade: c.avisoDePrivacidade,
            avisoDePrivacidadeUrl: c.avisoDePrivacidadeUrl,
            dominiosPermitidos: c.dominiosPermitidos,
            limiteDiario: c.limiteDiario,
            sugestoes: c.sugestoes,
          }}
        />
      </div>
    </section>
  )
}
