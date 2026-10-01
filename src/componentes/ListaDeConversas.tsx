import Link from 'next/link'
import { BadgeDeCanal } from '@/componentes/BadgeDeCanal'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import {
  descricaoDaPagina,
  formatarAtividade,
  hrefDaPagina,
  paginasVisiveis,
  type FiltrosDaTela,
} from '@/componentes/conversas-logica'
import type { ItemDoHistorico } from '@/servicos/historico'

/** O item como cruza do servidor para o navegador: a data pode ser texto ISO. */
export type ItemDaLista = Omit<ItemDoHistorico, 'atualizadoEm'> & { atualizadoEm: Date | string }

interface Props {
  itens: ItemDaLista[]
  /** Com `selecionadas`, a lista ganha as caixas de seleção. */
  selecionadas?: string[]
  aoAlternar?: (id: string) => void
  aoAlternarTodas?: (marcar: boolean, ids: string[]) => void
}

/**
 * A lista de conversas: tabela em tela larga e cartões abaixo de 768px (o CSS troca; os
 * rótulos de cada célula vêm de `data-rotulo`). A linha inteira leva à conversa por um link
 * esticado sobre o rótulo do interlocutor. Todo texto passa pelo React, que o escapa.
 */
export function ListaDeConversas({ itens, selecionadas, aoAlternar, aoAlternarTodas }: Props) {
  const selecionavel = selecionadas !== undefined
  const ids = itens.map((i) => i.id)
  const todas = selecionavel && ids.length > 0 && ids.every((id) => selecionadas.includes(id))
  return (
    <div className="tabela-envoltorio">
      <table className="tabela-de-conversas" aria-label="Conversas">
        <thead>
          <tr>
            {selecionavel && (
              <th scope="col" className="coluna-selecao">
                <input
                  type="checkbox"
                  aria-label="Selecionar todas as conversas desta página"
                  checked={todas}
                  onChange={(e) => aoAlternarTodas?.(e.target.checked, ids)}
                />
              </th>
            )}
            <th scope="col">Interlocutor</th>
            <th scope="col">Agente</th>
            <th scope="col">Canal</th>
            <th scope="col">Mensagens</th>
            <th scope="col">Última atividade</th>
            <th scope="col">Última mensagem</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((c) => {
            const marcada = selecionavel && selecionadas.includes(c.id)
            return (
              <tr key={c.id} className={marcada ? 'linha-selecionada' : undefined}>
                {selecionavel && (
                  <td className="coluna-selecao">
                    <input
                      type="checkbox"
                      aria-label={`Selecionar a conversa com ${c.rotulo}`}
                      checked={marcada}
                      onChange={() => aoAlternar?.(c.id)}
                    />
                  </td>
                )}
                <td data-rotulo="Interlocutor" className="celula-principal">
                  <Link href={`/conversas/${c.id}`} className="link-da-conversa">
                    {c.rotulo}
                  </Link>
                </td>
                <td data-rotulo="Agente">{c.agenteNome}</td>
                <td data-rotulo="Canal">
                  <BadgeDeCanal canal={c.canal} />
                </td>
                <td data-rotulo="Mensagens" className="celula-numero">
                  {c.totalDeMensagens}
                </td>
                <td data-rotulo="Última atividade" className="celula-secundaria">
                  {formatarAtividade(c.atualizadoEm)}
                </td>
                <td data-rotulo="Última mensagem" className="celula-previa">
                  {c.previa || <span className="texto-de-apoio">Sem mensagens</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** Sem conversa: explica como gerar as primeiras; com filtro, diz que nada casou. */
export function EstadoVazioDeConversas({ filtrado }: { filtrado: boolean }) {
  if (filtrado) {
    return (
      <EstadoVazio
        icone="conversa"
        titulo="Nenhuma conversa encontrada"
        descricao="Nenhuma conversa corresponde a estes filtros. Mude a busca ou o período, ou limpe os filtros."
        acao={
          <Link href="/conversas" className="botao secundario">
            Limpar filtros
          </Link>
        }
      />
    )
  }
  return (
    <EstadoVazio
      icone="conversa"
      titulo="Nenhuma conversa ainda"
      descricao="As conversas aparecem aqui assim que alguém falar com um agente. Para gerar a primeira: converse com um agente na aba Testar, publique o chat embutido na aba Publicar ou conecte um bot do Telegram na aba Canais."
      acao={
        <Link href="/agentes" className="botao primario">
          Ir para os agentes
        </Link>
      }
    />
  )
}

/** Página anterior e próxima, números ao redor da atual e o intervalo mostrado. */
export function PaginacaoDeConversas({
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
        {descricaoDaPagina({ pagina, tamanho, total })}
      </p>
      {totalDePaginas > 1 && (
        <nav className="paginacao" aria-label="Paginação das conversas">
          {pagina > 1 ? (
            <Link href={hrefDaPagina(filtros, pagina - 1)} className="botao secundario botao-pequeno" rel="prev">
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
                  <Link href={hrefDaPagina(filtros, n)} className="botao secundario botao-pequeno" aria-label={`Ir para a página ${n}`}>
                    {n}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          {pagina < totalDePaginas ? (
            <Link href={hrefDaPagina(filtros, pagina + 1)} className="botao secundario botao-pequeno" rel="next">
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
