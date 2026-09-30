import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { estadoDoOpenrouter } from '@/servicos/integracoes'
import {
  salvarChaveOpenrouter,
  testarConexaoOpenrouter,
  removerChaveOpenrouter,
} from '@/app/acoes'
import { CabecalhoDaPagina } from '@/componentes/CabecalhoDaPagina'
import { PainelDaChaveOpenrouter } from '@/componentes/PainelDaChaveOpenrouter'

const formatarData = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
})

/**
 * Configurações > Integrações (PR-06, PR-14). Só admin: a guarda está no
 * layout da pasta e é repetida aqui. A chave nunca sai do servidor; a tela
 * recebe só a máscara.
 */
export default async function Integracoes() {
  const admin = await exigirUsuarioAdmin()
  const estado = await estadoDoOpenrouter(admin)

  return (
    <div className="pilha">
      <CabecalhoDaPagina
        titulo="Integrações"
        subtitulo="Serviços externos que os agentes usam para responder."
      />
      <PainelDaChaveOpenrouter
        estado={{
          configurada: estado.configurada,
          mascara: estado.mascara,
          atualizadoEm: estado.atualizadoEm ? formatarData.format(estado.atualizadoEm) : null,
          problema: estado.problema,
        }}
        acoes={{
          salvar: salvarChaveOpenrouter,
          testar: testarConexaoOpenrouter,
          remover: removerChaveOpenrouter,
        }}
      />
    </div>
  )
}
