import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { salvarAvisoPadraoDoWorkspace, salvarRetencaoDasConversas } from '@/app/acoes'
import { CabecalhoDaPagina } from '@/componentes/CabecalhoDaPagina'
import { FormularioDeRetencao } from '@/componentes/FormularioDeRetencao'
import { FormularioDoAvisoPadrao } from '@/componentes/FormularioDoAvisoPadrao'
import { PainelDeDadosPessoais } from '@/componentes/PainelDeDadosPessoais'
import { obterConfiguracaoDePrivacidade } from '@/servicos/privacidade'

/**
 * Configurações > Privacidade (FT-10, PR-18, PR-89, PR-91): retenção das conversas, aviso de
 * privacidade padrão e o painel dos dados pessoais tratados. Só admin: a guarda está no layout
 * da pasta e é repetida aqui.
 */
export default async function Privacidade() {
  const admin = await exigirUsuarioAdmin()
  const c = await obterConfiguracaoDePrivacidade(admin)

  return (
    <div className="pilha">
      <CabecalhoDaPagina
        titulo="Privacidade"
        subtitulo="Por quanto tempo as conversas ficam guardadas, o aviso que as pessoas veem e o que o sistema guarda delas."
      />
      <FormularioDeRetencao retencaoDias={c.retencaoDias} acao={salvarRetencaoDasConversas} />
      <FormularioDoAvisoPadrao texto={c.avisoPadrao} url={c.avisoPadraoUrl} acao={salvarAvisoPadraoDoWorkspace} />
      <PainelDeDadosPessoais retencaoDias={c.retencaoDias} />
    </div>
  )
}
