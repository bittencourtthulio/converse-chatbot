'use client'

import { useId, useReducer, useRef, useState, type DragEvent } from 'react'
import { Alerta } from '@/componentes/Alerta'
import { Icone } from '@/componentes/Icones'
import { formatarTamanho } from '@/componentes/conhecimento-logica'
import { enviarVideo } from '@/componentes/enviar-video'
import {
  estadoInicialDosEnvios,
  reducerDosEnvios,
  resumoDosEnvios,
  type ItemDeEnvio,
} from '@/componentes/estado-dos-envios'
import {
  avisoDeCreditos,
  descreverLimitesDeVideo,
  interpretarRespostaDaFonte,
  validarVideoNoNavegador,
} from '@/componentes/video-logica'
import { EXTENSOES_DE_MIDIA } from '@/lib/midia-formatos'

/** A lista de envios de vídeo: barra de progresso real do envio, situação em texto e cancelar. */
export function ListaDeEnviosDeVideo({ itens, aoCancelar }: { itens: ItemDeEnvio[]; aoCancelar: (id: string) => void }) {
  return (
    <ul className="lista-de-envios" aria-label="Vídeos enviados">
      {itens.map((item) => (
        <li key={item.id} className={`envio-item envio-${item.situacao}`}>
          <div className="envio-linha">
            <span className="envio-nome">{item.nome}</span>
            <span className="envio-tamanho">{formatarTamanho(item.tamanho)}</span>
          </div>
          {item.situacao === 'enviando' && (
            <>
              <div className="envio-barra">
                <progress className="envio-progresso" max={100} value={item.percentual} aria-label={`Enviando ${item.nome}`}>
                  {item.percentual}%
                </progress>
                <span className="envio-percentual" aria-hidden="true">
                  {item.percentual}%
                </span>
              </div>
              <div>
                <button type="button" className="botao secundario botao-pequeno" onClick={() => aoCancelar(item.id)}>
                  Cancelar envio
                </button>
              </div>
            </>
          )}
          {item.situacao === 'aguardando' && <p className="envio-situacao">Aguardando a vez…</p>}
          {item.situacao === 'aceito' && (
            <p className="envio-situacao envio-ok">Enviado. Ele aparece na lista e a transcrição começa em instantes.</p>
          )}
          {item.situacao === 'recusado' && (
            <p className="fonte-erro" role="alert">
              {item.motivo}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

/**
 * Zona de soltar vídeo e áudio: um arquivo por vez, na ordem, cada um por
 * requisição de corpo bruto com progresso real do envio. A conferência de
 * extensão e tamanho no navegador é conveniência: o servidor confere a
 * assinatura e o limite de novo.
 */
export function ZonaDeVideo({
  agenteId,
  limiteDeVideoBytes,
  limiteDeVideoMinutos,
  modeloDeTranscricao,
  aoAlterar,
}: {
  agenteId: string
  limiteDeVideoBytes: number
  limiteDeVideoMinutos: number
  modeloDeTranscricao: string
  /** Chamado a cada arquivo enviado, para a lista de fontes atualizar já. */
  aoAlterar: () => void
}) {
  const idDoInput = useId()
  const idDaAjuda = useId()
  const [estado, enviar] = useReducer(reducerDosEnvios, estadoInicialDosEnvios)
  const [arrastando, setArrastando] = useState(false)
  const arquivos = useRef(new Map<string, File>())
  const cancelamentos = useRef(new Map<string, () => void>())
  const contador = useRef(0)
  const fila = useRef<string[]>([])
  const rodando = useRef(false)

  async function drenar() {
    if (rodando.current) return
    rodando.current = true
    try {
      for (let id = fila.current.shift(); id; id = fila.current.shift()) {
        const arquivo = arquivos.current.get(id)
        if (!arquivo) continue
        enviar({ tipo: 'iniciar', id })
        try {
          const envio = enviarVideo(agenteId, arquivo, (percentual) => enviar({ tipo: 'progresso', id, percentual }))
          cancelamentos.current.set(id, envio.cancelar)
          const r = await envio.resposta
          const resultado = interpretarRespostaDaFonte(r.status, r.corpo)
          enviar({ tipo: 'resultado', id, aceito: resultado.aceito, motivo: resultado.aceito ? undefined : resultado.motivo })
        } catch (erro) {
          const cancelado = erro instanceof Error && erro.message === 'cancelado'
          enviar({ tipo: 'falha', id, motivo: cancelado ? 'Envio cancelado.' : 'Sem conexão. O arquivo não foi enviado.' })
        } finally {
          arquivos.current.delete(id)
          cancelamentos.current.delete(id)
          aoAlterar()
        }
      }
    } finally {
      rodando.current = false
    }
  }

  function adicionar(lista: FileList | File[]) {
    const escolhidos = Array.from(lista)
    if (escolhidos.length === 0) return
    const novos = escolhidos.map((arquivo) => {
      contador.current += 1
      const id = `video-${contador.current}`
      const validacao = validarVideoNoNavegador(arquivo.name, arquivo.size, limiteDeVideoBytes)
      if (validacao.ok) {
        arquivos.current.set(id, arquivo)
        fila.current.push(id)
      }
      return { id, nome: arquivo.name, tamanho: arquivo.size, recusadoComMotivo: validacao.ok ? undefined : validacao.motivo }
    })
    enviar({ tipo: 'adicionar', arquivos: novos })
    void drenar()
  }

  function aoSoltar(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setArrastando(false)
    adicionar(e.dataTransfer.files)
  }

  const resumo = resumoDosEnvios(estado)

  return (
    <div className="pilha">
      <Alerta variante="aviso">{avisoDeCreditos(modeloDeTranscricao)}</Alerta>
      <div
        className={arrastando ? 'zona-de-soltar zona-de-soltar-ativa' : 'zona-de-soltar'}
        onDragOver={(e) => {
          e.preventDefault()
          setArrastando(true)
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={aoSoltar}
      >
        <input
          id={idDoInput}
          className="zona-de-soltar-input"
          type="file"
          multiple
          accept={EXTENSOES_DE_MIDIA.join(',')}
          aria-describedby={idDaAjuda}
          onChange={(e) => {
            if (e.target.files) adicionar(e.target.files)
            e.target.value = '' // permite escolher o mesmo arquivo de novo
          }}
        />
        <label htmlFor={idDoInput} className="zona-de-soltar-rotulo">
          <span className="zona-de-soltar-icone">
            <Icone nome="video" tamanho={28} />
          </span>
          <span className="zona-de-soltar-titulo">Arraste vídeos ou áudios aqui ou clique para escolher</span>
        </label>
        <p className="zona-de-soltar-ajuda" id={idDaAjuda}>
          Formatos aceitos: {EXTENSOES_DE_MIDIA.join(', ')}. {descreverLimitesDeVideo(limiteDeVideoBytes, limiteDeVideoMinutos)} Os arquivos
          são enviados um de cada vez e a transcrição leva alguns minutos.
        </p>
      </div>

      {estado.itens.length > 0 && (
        <div className="pilha pilha-compacta">
          <div className="linha linha-entre">
            <p className="texto-de-apoio sem-margem" role="status" aria-live="polite">
              {resumo.emAndamento
                ? `Enviando… ${resumo.aceitos + resumo.recusados} de ${resumo.total} concluídos.`
                : `${resumo.aceitos} ${resumo.aceitos === 1 ? 'arquivo enviado' : 'arquivos enviados'}${resumo.recusados > 0 ? `, ${resumo.recusados} recusado${resumo.recusados === 1 ? '' : 's'}` : ''}.`}
            </p>
            {!resumo.emAndamento && (
              <button type="button" className="botao secundario botao-pequeno" onClick={() => enviar({ tipo: 'limpar_terminados' })}>
                Limpar lista
              </button>
            )}
          </div>
          <ListaDeEnviosDeVideo itens={estado.itens} aoCancelar={(id) => cancelamentos.current.get(id)?.()} />
        </div>
      )}
    </div>
  )
}
