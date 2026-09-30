import { headers } from 'next/headers'
import { exigirUsuario } from '@/app/sessao-servidor'
import { carregarAgente } from '@/app/(sistema)/agentes/[id]/carregar-agente'
import { salvarChat } from '@/app/acoes'
import { PainelDePublicacao } from '@/componentes/PainelDePublicacao'
import { avisosDaPublicacao, montarSnippet, origemDoSnippet } from '@/componentes/publicar-logica'
import { ambiente } from '@/lib/ambiente'
import { obterConfiguracao } from '@/servicos/chat-publico-config'
import { resumo } from '@/servicos/fontes'
import { chaveDoOpenrouterConfigurada } from '@/servicos/integracoes'

/**
 * Aba Publicar do agente (FT-06): liga o chat embutido, configura aparência,
 * aviso de privacidade, domínios e limite diário (PR-55), mostra a prévia ao vivo
 * e o código para incorporar (PR-62). Qualquer usuário autenticado edita (PR-12).
 */
export default async function PublicarAgente({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await exigirUsuario()
  const { id } = await params
  const agente = await carregarAgente(usuario, id)
  const [c, temChave, base, cabecalhos] = await Promise.all([
    obterConfiguracao(usuario, agente.id),
    chaveDoOpenrouterConfigurada(),
    resumo(usuario, agente.id),
    headers(),
  ])

  const origem = origemDoSnippet({
    appUrlPublica: ambiente.appUrlPublica,
    host: cabecalhos.get('host'),
    protocoloEncaminhado: cabecalhos.get('x-forwarded-proto'),
    confiarNoProxy: ambiente.confiarNoProxy,
  })

  return (
    <PainelDePublicacao
      acao={salvarChat}
      agente={{ id: agente.id, nome: agente.nome }}
      versao={c.atualizadoEm?.toISOString() ?? 'novo'}
      snippet={montarSnippet(origem, agente.id)}
      avisos={avisosDaPublicacao({
        ativo: c.ativo,
        temChave,
        fontesProntas: base.prontas,
        confiarNoProxy: ambiente.confiarNoProxy,
        origem,
      })}
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
  )
}
