import Link from 'next/link'
import { Badge } from '@/componentes/Badge'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { Alerta } from '@/componentes/Alerta'
import { Icone } from '@/componentes/Icones'
import {
  formatarCaracteres,
  formatarData,
  formatarTamanho,
  iconeDoTipo,
  rotuloDoStatus,
} from '@/componentes/conhecimento-logica'
import { ehLinkDoYoutube, formatarDuracao, separarMarcador } from '@/componentes/video-logica'
import type { PaginaDeTrechos } from '@/servicos/fontes'

/**
 * "Ver conteúdo" de uma fonte: os trechos extraídos, de 20 em 20. O texto do
 * trecho vem de arquivo de terceiros e entra na tela só como texto (o React o
 * escapa): nunca como HTML.
 */
export function ListaDeTrechos({
  dados,
  voltarPara,
  caminhoDaPagina,
}: {
  dados: PaginaDeTrechos
  voltarPara: string
  /** Caminho desta página, base dos links de paginação. */
  caminhoDaPagina?: string
}) {
  const { fonte, trechos, pagina, porPagina, totalPaginas, totalTrechos } = dados
  const status = rotuloDoStatus(fonte.status)
  const primeiroNumero = (pagina - 1) * porPagina
  const duracao = formatarDuracao(fonte.duracaoSegundos)

  return (
    <div className="pilha">
      <div>
        <Link href={voltarPara} className="link-de-voltar">
          <Icone nome="voltar" tamanho={16} />
          Voltar para o conhecimento
        </Link>
      </div>

      <section className="cartao" aria-labelledby="titulo-da-fonte">
        <div className="cartao-corpo fonte-cabecalho">
          <span className="fonte-icone">
            <Icone nome={iconeDoTipo(fonte.tipo)} tamanho={22} />
          </span>
          <div className="fonte-cabecalho-texto">
            <h2 className="secao-titulo sem-margem" id="titulo-da-fonte">
              {fonte.titulo}
            </h2>
            <p className="texto-de-apoio sem-margem">
              {formatarTamanho(fonte.tamanhoBytes)} · {formatarCaracteres(fonte.caracteres)} caracteres ·{' '}
              {totalTrechos} {totalTrechos === 1 ? 'trecho' : 'trechos'} · enviada em {formatarData(fonte.criadoEm)}
              {duracao && ` · duração ${duracao}`}
              {ehLinkDoYoutube(fonte.urlOrigem) && (
                <>
                  {' · '}
                  <a className="fonte-origem" href={fonte.urlOrigem} target="_blank" rel="noopener noreferrer">
                    Abrir no YouTube
                  </a>
                </>
              )}
            </p>
          </div>
          <Badge variante={status.variante}>{status.rotulo}</Badge>
        </div>
      </section>

      {fonte.status === 'erro' && fonte.mensagemErro && <Alerta variante="erro">{fonte.mensagemErro}</Alerta>}

      {trechos.length === 0 ? (
        <EstadoVazio
          icone="caixa-vazia"
          titulo="Nenhum trecho"
          descricao={
            fonte.status === 'pendente' || fonte.status === 'processando'
              ? 'Esta fonte ainda está sendo processada. Os trechos aparecem aqui quando ela ficar pronta.'
              : fonte.status === 'erro'
                ? 'O processamento falhou, então não há trechos. Volte e use Reprocessar depois de corrigir o arquivo.'
                : 'O processamento terminou sem gerar trechos.'
          }
        />
      ) : (
        <ol className="trechos" start={primeiroNumero + 1}>
          {trechos.map((t) => (
            <li key={t.id} className="cartao trecho">
              <div className="trecho-cabecalho">
                <strong>Trecho {t.indice + 1}</strong>
                <span className="texto-de-apoio">{formatarCaracteres(t.caracteres)} caracteres</span>
              </div>
              <TextoDoTrecho texto={t.texto} />
            </li>
          ))}
        </ol>
      )}

      {totalPaginas > 1 && (
        <nav className="paginacao" aria-label="Paginação dos trechos">
          {pagina > 1 ? (
            <Link href={`${caminhoDaPagina ?? ''}?pagina=${pagina - 1}`} className="botao secundario botao-pequeno">
              Anterior
            </Link>
          ) : (
            <span className="botao secundario botao-pequeno" aria-disabled="true">
              Anterior
            </span>
          )}
          <span className="texto-de-apoio">
            Página {pagina} de {totalPaginas}
          </span>
          {pagina < totalPaginas ? (
            <Link href={`${caminhoDaPagina ?? ''}?pagina=${pagina + 1}`} className="botao secundario botao-pequeno">
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

/** O texto do trecho como texto; o marcador de tempo que o abre (vídeo e YouTube) ganha destaque. */
function TextoDoTrecho({ texto }: { texto: string }) {
  const { marcador, resto } = separarMarcador(texto)
  return (
    <pre className="trecho-texto">
      {marcador && <strong className="trecho-marcador">{marcador}</strong>}
      {resto}
    </pre>
  )
}
