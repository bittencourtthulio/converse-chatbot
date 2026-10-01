import { redirect } from 'next/navigation'
import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { Alerta } from '@/componentes/Alerta'
import { CabecalhoDaPagina } from '@/componentes/CabecalhoDaPagina'
import { FiltrosDeAuditoria } from '@/componentes/FiltrosDeAuditoria'
import { EstadoVazioDeAuditoria, ListaDeAuditoria, PaginacaoDeAuditoria } from '@/componentes/ListaDeAuditoria'
import { entradaDosFiltrosDaAuditoria, hrefDaPaginaDeAuditoria } from '@/componentes/auditoria-logica'
import { ErroDeAplicacao } from '@/lib/erros'
import { listar as listarRegistros, type PaginaDaAuditoria } from '@/servicos/auditoria'
import { listar as listarUsuarios } from '@/servicos/usuarios'

/**
 * O registro de auditoria (FT-10, PR-19): quem alterou chave, usuários, agentes e canais, só
 * leitura. Só admin chega aqui: `exigirUsuarioAdmin` no layout da pasta e de novo aqui.
 * Carregando é o `loading.tsx` da pasta e erro inesperado é o `error.tsx` do sistema; filtro
 * recusado pelo serviço (período invertido) vira aviso na própria tela.
 */
export default async function Auditoria({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const admin = await exigirUsuarioAdmin()
  const { pagina: paginaPedida, ...filtros } = entradaDosFiltrosDaAuditoria(await searchParams)
  const usuarios = await listarUsuarios(admin)

  let pagina: PaginaDaAuditoria | null = null
  let recusa: string | null = null
  try {
    pagina = await listarRegistros({ ...filtros, pagina: paginaPedida })
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao && erro.status === 422) recusa = erro.message
    else throw erro
  }
  // A página pedida passou do fim da lista: vai para a última.
  if (pagina && pagina.itens.length === 0 && pagina.total > 0 && pagina.pagina > 1) {
    redirect(hrefDaPaginaDeAuditoria(filtros, pagina.totalDePaginas))
  }
  const filtrado = Boolean(filtros.acao || filtros.usuarioId || filtros.de || filtros.ate)

  return (
    <div className="pilha">
      <CabecalhoDaPagina titulo="Auditoria" subtitulo="Quem alterou a chave, os usuários, os agentes e os canais, e quando. Só leitura." />
      <FiltrosDeAuditoria usuarios={usuarios.map((u) => ({ id: u.id, nome: u.nome, email: u.email }))} filtros={filtros} />
      {recusa && (
        <Alerta variante="aviso">
          <strong>Confira os filtros.</strong>
          <p>{recusa}</p>
        </Alerta>
      )}
      {pagina && pagina.itens.length === 0 && (
        <section className="cartao" aria-label="Registro de auditoria">
          <EstadoVazioDeAuditoria filtrado={filtrado} />
        </section>
      )}
      {pagina && pagina.itens.length > 0 && (
        <>
          <ListaDeAuditoria itens={pagina.itens.map((i) => ({ ...i, quando: i.quando.toISOString() }))} />
          <PaginacaoDeAuditoria filtros={filtros} pagina={pagina.pagina} tamanho={pagina.tamanho} total={pagina.total} totalDePaginas={pagina.totalDePaginas} />
        </>
      )}
    </div>
  )
}
