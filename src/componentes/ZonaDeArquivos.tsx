'use client'

import { useId, useReducer, useRef, useState, type DragEvent } from 'react'
import { Icone } from '@/componentes/Icones'
import {
  estadoInicialDosEnvios,
  reducerDosEnvios,
  resumoDosEnvios,
} from '@/componentes/estado-dos-envios'
import { formatarTamanho, validarArquivoNoNavegador } from '@/componentes/conhecimento-logica'
import { enviarArquivo, interpretarRespostaDoEnvio } from '@/componentes/enviar-arquivo'
import { EXTENSOES_ACEITAS } from '@/lib/extracao/formatos'
import { LIMITES } from '@/lib/extracao/limites'

/**
 * Zona de soltar arquivos (arrastar ou clicar), vários de uma vez, com
 * progresso e erro por arquivo. Cada arquivo vai numa requisição própria; a
 * conferência de extensão e tamanho no navegador é conveniência: o servidor
 * confere tudo de novo.
 */
export function ZonaDeArquivos({
  agenteId,
  limiteDeUploadBytes,
  aoAlterar,
}: {
  agenteId: string
  limiteDeUploadBytes: number
  /** Chamado a cada arquivo enviado, para a lista de fontes atualizar já. */
  aoAlterar: () => void
}) {
  const idDoInput = useId()
  const idDaAjuda = useId()
  const [estado, enviar] = useReducer(reducerDosEnvios, estadoInicialDosEnvios)
  const [arrastando, setArrastando] = useState(false)
  const arquivos = useRef(new Map<string, File>())
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
          const r = await enviarArquivo(agenteId, arquivo, (percentual) => enviar({ tipo: 'progresso', id, percentual }))
          const resultado = interpretarRespostaDoEnvio(r.status, r.corpo)
          enviar({ tipo: 'resultado', id, aceito: resultado.aceito, motivo: resultado.aceito ? undefined : resultado.motivo })
        } catch {
          enviar({ tipo: 'falha', id, motivo: 'Sem conexão. O arquivo não foi enviado.' })
        } finally {
          arquivos.current.delete(id)
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
    const novos = escolhidos.map((arquivo, posicao) => {
      contador.current += 1
      const id = `envio-${contador.current}`
      const validacao =
        posicao >= LIMITES.arquivosPorEnvio
          ? { ok: false as const, motivo: `Envie no máximo ${LIMITES.arquivosPorEnvio} arquivos por vez.` }
          : validarArquivoNoNavegador(arquivo.name, arquivo.size, limiteDeUploadBytes)
      if (validacao.ok) {
        arquivos.current.set(id, arquivo)
        fila.current.push(id)
      }
      return {
        id,
        nome: arquivo.name,
        tamanho: arquivo.size,
        recusadoComMotivo: validacao.ok ? undefined : validacao.motivo,
      }
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
  const limiteEmTexto = formatarTamanho(limiteDeUploadBytes)

  return (
    <div className="pilha">
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
          accept={EXTENSOES_ACEITAS.join(',')}
          aria-describedby={idDaAjuda}
          onChange={(e) => {
            if (e.target.files) adicionar(e.target.files)
            e.target.value = '' // permite escolher o mesmo arquivo de novo
          }}
        />
        <label htmlFor={idDoInput} className="zona-de-soltar-rotulo">
          <span className="zona-de-soltar-icone">
            <Icone nome="upload" tamanho={28} />
          </span>
          <span className="zona-de-soltar-titulo">Arraste arquivos aqui ou clique para escolher</span>
        </label>
        <p className="zona-de-soltar-ajuda" id={idDaAjuda}>
          Formatos aceitos: {EXTENSOES_ACEITAS.join(', ')}. Até {limiteEmTexto} por arquivo e até{' '}
          {LIMITES.arquivosPorEnvio} arquivos por vez. PDF escaneado (sem texto selecionável) não é suportado.
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
          <ul className="lista-de-envios" aria-label="Arquivos enviados">
            {estado.itens.map((item) => (
              <li key={item.id} className={`envio-item envio-${item.situacao}`}>
                <div className="envio-linha">
                  <span className="envio-nome">{item.nome}</span>
                  <span className="envio-tamanho">{formatarTamanho(item.tamanho)}</span>
                </div>
                {item.situacao === 'enviando' && (
                  <progress className="envio-progresso" max={100} value={item.percentual} aria-label={`Enviando ${item.nome}`}>
                    {item.percentual}%
                  </progress>
                )}
                {item.situacao === 'aguardando' && <p className="envio-situacao">Aguardando a vez…</p>}
                {item.situacao === 'aceito' && <p className="envio-situacao envio-ok">Enviado. Ele aparece na lista e é processado em instantes.</p>}
                {item.situacao === 'recusado' && (
                  <p className="fonte-erro" role="alert">
                    {item.motivo}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
