import { Alerta } from '@/componentes/Alerta'
import { Badge } from '@/componentes/Badge'
import type { AcaoDeFormulario } from '@/componentes/Formulario'
import { GeradorDeBackup } from '@/componentes/GeradorDeBackup'
import { ListaDeBackups, type BackupDaLista } from '@/componentes/ListaDeBackups'
import {
  descreverArquivos,
  descreverChaveDeCriptografia,
  descreverFila,
  formatarAtividade,
  formatarBytes,
  formatarDataHora,
  rotuloDoItemDeSaude,
  simOuNao,
  situacaoEmTexto,
} from '@/componentes/sistema-logica'
import type { DadosDoSistema } from '@/servicos/sistema'

function Cartao({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section className="cartao sistema-cartao" aria-labelledby={id}>
      <div className="cartao-corpo">
        <h2 className="secao-titulo" id={id}>
          {titulo}
        </h2>
        {children}
      </div>
    </section>
  )
}

function Linhas({ itens }: { itens: Array<[string, React.ReactNode]> }) {
  return (
    <dl className="sistema-lista">
      {itens.map(([rotulo, valor]) => (
        <div key={rotulo}>
          <dt>{rotulo}</dt>
          <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * O detalhe da tela Configurações > Sistema (FT-11, PR-95): o estado geral e os cartões por
 * assunto. Só leitura. A configuração aparece como sim ou não, nunca o valor: o componente nem
 * recebe um valor de segredo.
 */
export function PainelDoSistema({
  sistema,
  backups = [],
  acaoGerarBackup,
}: {
  sistema: DadosDoSistema
  /** Os backups de BACKUP_DIR, do mais novo ao mais antigo. */
  backups?: BackupDaLista[]
  /** A ação do botão "Gerar backup agora"; sem ela o cartão é só de leitura. */
  acaoGerarBackup?: AcaoDeFormulario
}) {
  const estado = situacaoEmTexto(sistema.saude.status)
  const { aplicacao, esquema, dados, midia, fila, expurgo, configuracao, ultimoBackup } = sistema
  return (
    <div className="sistema-grade">
      <Cartao id="sistema-estado" titulo="Estado geral">
        <div className="linha">
          <Badge variante={estado.variante}>{estado.rotulo}</Badge>
        </div>
        <ul className="sistema-itens-de-saude">
          {sistema.saude.itens.map((item) => {
            const s = situacaoEmTexto(item.situacao)
            return (
              <li key={item.nome}>
                <span className="sistema-item-rotulo">{rotuloDoItemDeSaude(item.nome)}</span>
                <Badge variante={s.variante}>{s.rotulo}</Badge>
                <span className="texto-de-apoio sistema-item-detalhe">{item.detalhe}</span>
              </li>
            )
          })}
        </ul>
      </Cartao>

      <Cartao id="sistema-aplicacao" titulo="Aplicação">
        <Linhas
          itens={[
            ['Versão do app', aplicacao.versao],
            ['Esquema do banco', `${esquema.aplicadas} de ${esquema.esperadas} migrations aplicadas`],
            ['Última migration', esquema.ultima ?? 'Nenhuma'],
            ['Tempo de atividade', formatarAtividade(aplicacao.atividadeSegundos)],
            ['Node', aplicacao.node],
            ['Fuso horário', aplicacao.fuso],
          ]}
        />
      </Cartao>

      <Cartao id="sistema-dados" titulo="Dados">
        <Linhas
          itens={[
            ['Banco de dados', formatarBytes(dados.bancoBytes)],
            ['Arquivos enviados', `${formatarBytes(dados.storageBytes)} em ${descreverArquivos(dados.storageArquivos, dados.storageParcial)}`],
          ]}
        />
      </Cartao>

      <Cartao id="sistema-midia" titulo="Vídeo e áudio">
        <Linhas
          itens={[
            ['ffmpeg', midia.ffmpeg ? 'Disponível' : 'Não encontrado'],
            ['ffprobe', midia.ffprobe ? 'Disponível' : 'Não encontrado'],
            ['Versão', midia.versao ?? 'Indisponível'],
          ]}
        />
      </Cartao>

      <Cartao id="sistema-segundo-plano" titulo="Segundo plano">
        <Linhas
          itens={[
            ['Fila de fontes', descreverFila(fila)],
            ['Expurgo automático', expurgo.ativo ? 'Ativo' : 'Parado'],
            ['Última rodada do expurgo', formatarDataHora(expurgo.ultimaExecucaoEm, 'Ainda não rodou desde que o servidor subiu')],
          ]}
        />
      </Cartao>

      <Cartao id="sistema-configuracao" titulo="Configuração">
        <Linhas
          itens={[
            ['Chave de criptografia (ENCRYPTION_KEY)', descreverChaveDeCriptografia(configuracao.chaveDeCriptografiaDefinida, configuracao.chaveDeCriptografiaValida)],
            ['Endereço público com HTTPS (APP_URL)', configuracao.appUrlDefinida ? simOuNao(configuracao.appUrlHttps) : 'Não (APP_URL não definida)'],
            ['Chave do OpenRouter configurada', simOuNao(configuracao.openrouterConfigurado)],
          ]}
        />
      </Cartao>

      <Cartao id="sistema-backup" titulo="Backup">
        <div className="pilha pilha-compacta">
          <Alerta variante="aviso">
            <strong>O backup não contém a ENCRYPTION_KEY.</strong>
            <p>
              Ele leva dado pessoal e as chaves cifradas do OpenRouter e do Telegram, mas NÃO contém a ENCRYPTION_KEY: sem a mesma chave, elas não decifram
              depois de restaurar. Guarde a ENCRYPTION_KEY em local separado do backup.
            </p>
          </Alerta>
          {acaoGerarBackup && <GeradorDeBackup acao={acaoGerarBackup} />}
          {ultimoBackup && backups.length === 0 && (
            <Linhas
              itens={[
                ['Último backup', ultimoBackup.nome],
                ['Gerado em', formatarDataHora(ultimoBackup.criadoEm, '')],
                ['Tamanho', formatarBytes(ultimoBackup.bytes)],
              ]}
            />
          )}
          {(backups.length > 0 || !ultimoBackup) && <ListaDeBackups backups={backups} />}
          <p className="texto-de-apoio">
            A restauração é só por linha de comando (<code>npm run restore -- &lt;arquivo&gt;</code>), com o servidor parado: ela troca o banco e os
            arquivos de uma vez e não é oferecida pelo navegador.
          </p>
        </div>
      </Cartao>
    </div>
  )
}
