import { exigirUsuario } from '@/app/sessao-servidor'
import { carregarAgente } from '@/app/(sistema)/agentes/[id]/carregar-agente'
import { modelosParaOSeletor } from '@/servicos/agentes'
import { editarAgente, excluirAgente } from '@/app/acoes'
import { FormularioDeAgente } from '@/componentes/FormularioDeAgente'
import { BotaoExcluirAgente } from '@/componentes/BotaoExcluirAgente'

/** Aba Configurações do agente: editar os campos e excluir o agente. */
export default async function ConfiguracoesDoAgente({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const usuario = await exigirUsuario()
  const { id } = await params
  const agente = await carregarAgente(usuario, id)
  const seletor = await modelosParaOSeletor(usuario)

  return (
    <>
      <section className="cartao cartao-largo" aria-label="Configurações do agente">
        <div className="cartao-corpo">
          <FormularioDeAgente
            acao={editarAgente}
            rotulo="Salvar alterações"
            agente={{
              id: agente.id,
              nome: agente.nome,
              instrucoes: agente.instrucoes,
              modelo: agente.modelo,
              temperatura: agente.temperatura,
              mensagemInicial: agente.mensagemInicial,
            }}
            {...seletor}
            ehAdmin={usuario.papel === 'admin'}
          />
        </div>
      </section>

      <section className="cartao cartao-largo" aria-labelledby="excluir-agente">
        <div className="cartao-corpo pilha pilha-compacta">
          <h2 className="secao-titulo sem-margem" id="excluir-agente">
            Excluir agente
          </h2>
          <p className="texto-de-apoio">
            Apaga o agente, as configurações dele e as conversas de teste. Não dá para desfazer.
          </p>
          <BotaoExcluirAgente agente={{ id: agente.id, nome: agente.nome }} acao={excluirAgente} />
        </div>
      </section>
    </>
  )
}
