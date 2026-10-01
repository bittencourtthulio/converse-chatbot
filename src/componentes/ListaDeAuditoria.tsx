import Link from 'next/link'
import { Badge } from '@/componentes/Badge'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import {
  CAMINHO_DA_AUDITORIA,
  descreverRegistro,
  descricaoDaPaginaDeAuditoria,
  hrefDaPaginaDeAuditoria,
  rotuloDaAcao,
  type FiltrosDaTela,
} from '@/componentes/auditoria-logica'
import { formatarAtividade, paginasVisiveis } from '@/componentes/conversas-logica'
import type { RegistroListado } from '@/servicos/auditoria'

/** O registro como cruza do servidor para o navegador: a data pode ser texto ISO. */
export type RegistroDaLista = Omit<RegistroListado, 'quando'> & { quando: Date | string }

/**
 * O registro de auditoria, só leitura: tabela em tela larga e cartões abaixo de 768px (o CSS
 * troca; o rótulo de cada célula vem de `data-rotulo`). Não há botão de editar nem de apagar:
 * a trilha é somente-acréscimo. Todo texto passa pelo React, que o escapa.
 */
export function ListaDeAuditoria({ itens }: { itens: RegistroDaLista[] }) {
  return (
    <div className="tabela-envoltorio">
      <table className="tabela-de-auditoria" aria-label="Registro de auditoria">
        <thead>
          <tr>
            <th scope="col">Quando</th>
            <th scope="col">Quem</th>
            <th scope="col">Ação</th>
            <th scope="col">Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((r) => (
            <tr key={r.id}>
              <td data-rotulo="Quando" className="celula-secundaria celula-quando">
                {formatarAtividade(r.quando)}
              </td>
              <td data-rotulo="Quem" className="celula-quem">
                {r.usuarioRotulo}
              </td>
              <td data-rotulo="Ação">
                <Badge variante={r.acao.includes('excluid') || r.acao.includes('removida') ? 'perigo' : 'neutro'}>{rotuloDaAcao(r.acao)}</Badge>
              </td>
              <td data-rotulo="Detalhes" className="celula-detalhe">
                {descreverRegistro(r)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Sem registro: explica o que a trilha guarda; com filtro, diz que nada casou. */
export function EstadoVazioDeAuditoria({ filtrado }: { filtrado: boolean }) {
  if (filtrado) {
    return (
      <EstadoVazio
        icone="relogio"
        titulo="Nenhum registro encontrado"
        descricao="Nenhum registro corresponde a estes filtros. Mude a ação, a pessoa ou o período, ou limpe os filtros."
        acao={
          <Link href={CAMINHO_DA_AUDITORIA} className="botao secundario">
            Limpar filtros
          </Link>
        }
      />
    )
  }
  return (
    <EstadoVazio
      icone="relogio"
      titulo="Nenhum registro ainda"
      descricao="Aqui aparece quem trocou a chave do OpenRouter, criou, editou ou excluiu usuários e agentes, conectou ou desconectou canais, apagou conversas e mudou a retenção."
    />
  )
}

/** Página anterior e próxima, números ao redor da atual e o intervalo mostrado. */
export function PaginacaoDeAuditoria({
  filtros,
  pagina,
  tamanho,
  total,
  totalDePaginas,
}: {
  filtros: FiltrosDaTela
  pagina: number
  tamanho: number
  total: number
  totalDePaginas: number
}) {
  const numeros = paginasVisiveis(pagina, totalDePaginas)
  return (
    <div className="pilha pilha-compacta">
      <p className="texto-de-apoio centralizado" role="status">
        {descricaoDaPaginaDeAuditoria({ pagina, tamanho, total })}
      </p>
      {totalDePaginas > 1 && (
        <nav className="paginacao" aria-label="Paginação da auditoria">
          {pagina > 1 ? (
            <Link href={hrefDaPaginaDeAuditoria(filtros, pagina - 1)} className="botao secundario botao-pequeno" rel="prev">
              Anterior
            </Link>
          ) : (
            <span className="botao secundario botao-pequeno" aria-disabled="true">
              Anterior
            </span>
          )}
          <ul className="paginas-numeradas">
            {numeros.map((n, i) => (
              <li key={n}>
                {i > 0 && n - (numeros[i - 1] as number) > 1 && <span aria-hidden="true">…</span>}
                {n === pagina ? (
                  <span className="botao primario botao-pequeno" aria-current="page">
                    <span className="somente-leitor">Página </span>
                    {n}
                  </span>
                ) : (
                  <Link href={hrefDaPaginaDeAuditoria(filtros, n)} className="botao secundario botao-pequeno" aria-label={`Ir para a página ${n}`}>
                    {n}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          {pagina < totalDePaginas ? (
            <Link href={hrefDaPaginaDeAuditoria(filtros, pagina + 1)} className="botao secundario botao-pequeno" rel="next">
              Próxima
            </Link>
          ) : (
            <span className="botao secundario botao-pequeno" aria-disabled="true">
              Próxima
            </span>
          )}
        </nav>
      )}
    </div>
  )
}
