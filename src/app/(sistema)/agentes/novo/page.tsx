import { exigirUsuario } from '@/app/sessao-servidor'
import { modelosParaOSeletor } from '@/servicos/agentes'
import { criarAgente } from '@/app/acoes'
import { CabecalhoDaPagina } from '@/componentes/CabecalhoDaPagina'
import { FormularioDeAgente } from '@/componentes/FormularioDeAgente'

/** Novo agente: formulário com o modelo e a temperatura padrão (PR-40). */
export default async function NovoAgente() {
  const usuario = await exigirUsuario()
  const seletor = await modelosParaOSeletor(usuario)

  return (
    <div className="pilha">
      <CabecalhoDaPagina
        titulo="Novo agente"
        subtitulo="Defina como o agente se comporta. Você pode mudar tudo depois."
      />
      <section className="cartao cartao-largo" aria-label="Configurações do novo agente">
        <div className="cartao-corpo">
          <FormularioDeAgente
            acao={criarAgente}
            rotulo="Criar agente"
            {...seletor}
            ehAdmin={usuario.papel === 'admin'}
          />
        </div>
      </section>
    </div>
  )
}
