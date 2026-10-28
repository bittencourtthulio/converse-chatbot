import Link from 'next/link'
import { Alerta } from '@/componentes/Alerta'
import { Badge } from '@/componentes/Badge'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { PERIODOS_DE_CONSUMO, type ConsumoDeIA } from '@/servicos/consumo-ia'
import estilos from './PainelDeConsumoDeIA.module.css'

const inteiro = (n: number) => n.toLocaleString('pt-BR')
const moeda = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 8 }).format(n)
const data = (d: Date) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'America/Sao_Paulo' }).format(d)
const origens: Record<string, string> = { painel: 'Chat de teste', widget: 'Chat público', telegram: 'Telegram', conhecimento: 'Base de conhecimento', integracoes: 'Integrações', chat: 'Chat' }
const estados: Record<string, { rotulo: string; variante: 'sucesso' | 'perigo' | 'aviso' | 'neutro' }> = {
  sucesso: { rotulo: 'Sucesso', variante: 'sucesso' }, erro: { rotulo: 'Erro', variante: 'perigo' },
  cancelada: { rotulo: 'Cancelada', variante: 'neutro' }, em_andamento: { rotulo: 'Em andamento', variante: 'aviso' },
}
const href = (dias: number, pagina = 1) => `/configuracoes/consumo-ia?dias=${dias}${pagina > 1 ? `&pagina=${pagina}` : ''}`

function Distribuicao({ titulo, itens }: { titulo: string; itens: Array<{ nome: string; chamadas: number; custoUsd: number; custosNaoInformados: number }> }) {
  const maior = Math.max(...itens.map(i => i.custoUsd), 0)
  return (
    <section className={`cartao ${estilos.distribuicao}`}>
      <h2 className="secao-titulo">{titulo}</h2>
      <ul className={estilos.quebra}>
        {itens.map(i => (
          <li key={i.nome}>
            <div className={estilos.linhaDistribuicao}>
              <span className={estilos.nome}>{i.nome}</span>
              <strong>{i.custosNaoInformados === i.chamadas ? 'Não informado' : moeda(i.custoUsd)}</strong>
            </div>
            <div className={estilos.trilho} aria-hidden="true"><span style={{ width: `${maior > 0 ? i.custoUsd / maior * 100 : 0}%` }} /></div>
            <p className="texto-de-apoio">{inteiro(i.chamadas)} chamadas{i.custosNaoInformados > 0 && ` · ${inteiro(i.custosNaoInformados)} sem custo informado`}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function PainelDeConsumoDeIA({ consumo: c }: { consumo: ConsumoDeIA }) {
  const semCustoConhecido = c.total > 0 && c.custosNaoInformados === c.total
  return (
    <>
      <div className={estilos.filtros}>
        <div>
          <p className={estilos.rotuloPeriodo}>Período de consumo</p>
          <p className="texto-de-apoio">{data(c.de)} até {data(c.ate)} · Brasília</p>
        </div>
        <nav className={estilos.periodos} aria-label="Filtrar período de consumo">
          {PERIODOS_DE_CONSUMO.map(dias => <Link key={dias} href={href(dias)} aria-current={dias === c.dias ? 'page' : undefined}>{dias} dias</Link>)}
        </nav>
      </div>
      <section className={`cartoes-de-resumo ${estilos.indicadores}`} aria-label={`Indicadores dos últimos ${c.dias} dias`}>
        <div className={`cartao cartao-resumo ${estilos.custo}`}>
          <span className="cartao-resumo-rotulo">Custo total no período</span>
          <strong className="cartao-resumo-valor">{semCustoConhecido ? 'Não informado' : moeda(c.custoTotalUsd)}</strong>
          <span className="cartao-resumo-apoio">{c.custosNaoInformados > 0 ? 'Parcial · valores informados pelo provedor' : 'USD · informado pelo OpenRouter'}</span>
        </div>
        <div className="cartao cartao-resumo">
          <span className="cartao-resumo-rotulo">Chamadas ao OpenRouter</span>
          <strong className="cartao-resumo-valor">{inteiro(c.total)}</strong>
          <span className="cartao-resumo-apoio">{inteiro(c.canceladas)} canceladas · {inteiro(c.emAndamento)} em andamento</span>
        </div>
        <div className="cartao cartao-resumo">
          <span className="cartao-resumo-rotulo">Tokens informados</span>
          <strong className="cartao-resumo-valor">{inteiro(c.tokensTotal)}</strong>
          <span className="cartao-resumo-apoio">{inteiro(c.tokensEntrada)} entrada · {inteiro(c.tokensSaida)} saída</span>
        </div>
        <div className="cartao cartao-resumo">
          <span className="cartao-resumo-rotulo">Custo médio por geração</span>
          <strong className="cartao-resumo-valor">{c.custoMedioUsd === null ? '—' : moeda(c.custoMedioUsd)}</strong>
          <span className="cartao-resumo-apoio">Somente gerações com custo informado</span>
        </div>
        <div className="cartao cartao-resumo">
          <span className="cartao-resumo-rotulo">Chamadas com erro</span>
          <strong className="cartao-resumo-valor">{inteiro(c.erros)}</strong>
          <span className="cartao-resumo-apoio">{c.total > 0 ? (c.erros / c.total * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : '0'}% das chamadas no período</span>
        </div>
      </section>
      {c.custosNaoInformados > 0 && <Alerta variante="aviso"><strong>{inteiro(c.custosNaoInformados)} chamadas sem custo informado.</strong><p>O total soma os valores recebidos do OpenRouter. Chamadas sem valor, incluindo streams interrompidos, podem ter gerado cobrança e ficam fora dessa soma.</p></Alerta>}
      <p className="texto-de-apoio">O histórico começa com a ativação deste registro. Consultas de modelos e testes da chave são registrados sem custo. Os valores cobrem as chamadas desta plataforma, em dólares, sem conversão cambial ou taxas de compra de créditos.</p>
      {c.total === 0 ? (
        <section className="cartao"><EstadoVazio icone="relogio" titulo="Nenhuma chamada neste período" descricao="As próximas chamadas ao OpenRouter aparecerão aqui com modelo, função, tokens, custo e resultado. Selecione um período maior para consultar outros registros." /></section>
      ) : (
        <>
          <div className={estilos.distribuicoes}>
            <Distribuicao titulo="Custo por modelo" itens={c.porModelo.map(m => ({ ...m, nome: m.modelo ?? 'Sem modelo · consultas da API' }))} />
            <Distribuicao titulo="Custo por função" itens={c.porFuncao.map(f => ({ ...f, nome: f.funcao }))} />
          </div>
          <section className={`cartao ${estilos.historico}`} aria-labelledby="titulo-chamadas-ia">
            <div className={estilos.cabecalhoHistorico}><h2 className="secao-titulo sem-margem" id="titulo-chamadas-ia">Histórico de chamadas</h2><span className="texto-de-apoio">Mais recentes primeiro</span></div>
            <div className="tabela-envoltorio">
              <table className={estilos.tabela} aria-label="Chamadas ao OpenRouter">
                <thead><tr>{['Quando', 'Modelo', 'Função / origem', 'Tokens entrada / saída', 'Custo (USD)', 'Duração', 'Resultado'].map(t => <th key={t} scope="col">{t}</th>)}</tr></thead>
                <tbody>{c.itens.map(r => {
                  const estado = estados[r.status] ?? { rotulo: r.status, variante: 'neutro' as const }
                  return <tr key={r.id}>
                    <td data-rotulo="Quando"><time dateTime={r.iniciadoEm.toISOString()}>{data(r.iniciadoEm)}</time></td>
                    <td data-rotulo="Modelo"><span className={estilos.modelo}>{r.modelo ?? 'Não se aplica'}</span>{r.modeloSolicitado && r.modeloSolicitado !== r.modelo && <small className="texto-de-apoio">Solicitado: {r.modeloSolicitado}</small>}{r.geracaoId && <small className="texto-de-apoio">{r.geracaoId}</small>}</td>
                    <td data-rotulo="Função / origem"><code>{r.funcao}</code><small className="texto-de-apoio">{origens[r.origem] ?? r.origem} · {r.caminho}</small></td>
                    <td data-rotulo="Tokens entrada / saída">{r.tokensEntrada === null ? '—' : inteiro(r.tokensEntrada)} / {r.tokensSaida === null ? '—' : inteiro(r.tokensSaida)}</td>
                    <td data-rotulo="Custo (USD)">{r.custoUsd === null ? <span className="texto-de-apoio">Não informado</span> : moeda(r.custoUsd)}</td>
                    <td data-rotulo="Duração">{r.duracaoMs === null ? '—' : `${(r.duracaoMs / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} s`}</td>
                    <td data-rotulo="Resultado"><Badge variante={estado.variante}>{estado.rotulo}</Badge>{r.erroCodigo && <small className="texto-de-apoio">{r.erroCodigo}</small>}{r.statusHttp !== null && <small className="texto-de-apoio">HTTP {r.statusHttp}</small>}</td>
                  </tr>
                })}</tbody>
              </table>
            </div>
          </section>
          <div className={estilos.paginacao}>
            <p className="texto-de-apoio" role="status">{inteiro((c.pagina - 1) * c.tamanho + 1)}–{inteiro(Math.min(c.pagina * c.tamanho, c.total))} de {inteiro(c.total)} chamadas · Página {c.pagina} de {c.totalDePaginas}</p>
            {c.totalDePaginas > 1 && <nav className="linha" aria-label="Paginação de chamadas">
              {c.pagina > 1 && <Link className="botao secundario botao-pequeno" href={href(c.dias, c.pagina - 1)} rel="prev">Anterior</Link>}
              {c.pagina < c.totalDePaginas && <Link className="botao secundario botao-pequeno" href={href(c.dias, c.pagina + 1)} rel="next">Próxima</Link>}
            </nav>}
          </div>
        </>
      )}
    </>
  )
}
