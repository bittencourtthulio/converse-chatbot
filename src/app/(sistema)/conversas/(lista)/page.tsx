import { exigirUsuario } from '@/app/sessao-servidor'
import { Alerta } from '@/componentes/Alerta'
import { CabecalhoDaPagina } from '@/componentes/CabecalhoDaPagina'
import { FiltrosDeConversas } from '@/componentes/FiltrosDeConversas'
import { EstadoVazioDeConversas, ListaDeConversas, PaginacaoDeConversas } from '@/componentes/ListaDeConversas'
import { entradaDeFiltros } from '@/componentes/conversas-logica'
import { ErroDeAplicacao } from '@/lib/erros'
import { listar as listarAgentes } from '@/servicos/agentes'
import { listarConversas, type PaginaDoHistorico } from '@/servicos/historico'

/**
 * O histórico: as conversas de todos os canais (PR-12: qualquer usuário autenticado lê
 * tudo), filtradas pela URL. Carregando é o `loading.tsx` do grupo e erro é o `error.tsx` do
 * sistema; filtro recusado pelo serviço (período invertido) vira aviso na própria tela.
 */
export default async function Conversas({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const usuario = await exigirUsuario()
  const filtros = entradaDeFiltros(await searchParams)
  const agentes = await listarAgentes(usuario)

  let pagina: PaginaDoHistorico | null = null
  let recusa: string | null = null
  try {
    pagina = await listarConversas(filtros)
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao && erro.status === 422) recusa = erro.message
    else throw erro
  }
  const filtrado = Boolean(filtros.agenteId || filtros.canal || filtros.texto || filtros.de || filtros.ate)

  return (
    <div className="pilha">
      <CabecalhoDaPagina titulo="Conversas" subtitulo="O que as pessoas conversaram com os seus agentes, em todos os canais." />
      <FiltrosDeConversas agentes={agentes.map((a) => ({ id: a.id, nome: a.nome }))} filtros={filtros} />
      {recusa && (
        <Alerta variante="aviso">
          <strong>Confira os filtros.</strong>
          <p>{recusa}</p>
        </Alerta>
      )}
      {pagina && pagina.itens.length === 0 && (
        <section className="cartao" aria-label="Conversas">
          <EstadoVazioDeConversas filtrado={filtrado} />
        </section>
      )}
      {pagina && pagina.itens.length > 0 && (
        <>
          <section className="cartao" aria-label="Lista de conversas">
            <ListaDeConversas itens={pagina.itens} />
          </section>
          <PaginacaoDeConversas filtros={filtros} pagina={pagina.pagina} tamanho={pagina.tamanho} total={pagina.total} totalDePaginas={pagina.totalDePaginas} />
        </>
      )}
    </div>
  )
}
