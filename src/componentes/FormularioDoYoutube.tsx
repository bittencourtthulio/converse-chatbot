'use client'

import { useId, useState, type FormEvent } from 'react'
import { Alerta } from '@/componentes/Alerta'
import { mensagemDaResposta } from '@/componentes/fonte-da-tela'
import { validarLinkDoYoutube } from '@/componentes/video-logica'

/**
 * Link do YouTube como fonte: a fila busca legendas e, se necessário, transcreve o áudio.
 */
export function FormularioDoYoutube({
  agenteId,
  aoAlterar,
  urlInicial = '',
}: {
  agenteId: string
  aoAlterar: () => void
  /** Só para teste de renderização: já abre com um link digitado. */
  urlInicial?: string
}) {
  const idDoCampo = useId()
  const idDaAjuda = useId()
  const idDoErro = useId()
  const [url, setUrl] = useState(urlInicial)
  const [tocado, setTocado] = useState(urlInicial !== '')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  const validacao = validarLinkDoYoutube(url)
  const motivo = tocado && !validacao.ok ? validacao.motivo : null

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSucesso(false)
    setTocado(true)
    if (!validacao.ok) {
      setErro(null)
      return
    }
    setErro(null)
    setEnviando(true)
    try {
      const r = await fetch(`/api/agentes/${agenteId}/fontes/youtube`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      if (r.status === 202) {
        setUrl('')
        setTocado(false)
        setSucesso(true)
        aoAlterar()
      } else {
        setErro(await mensagemDaResposta(r, 'Não foi possível adicionar o vídeo.'))
      }
    } catch {
      setErro('Sem conexão. Não foi possível adicionar o vídeo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      {erro && <Alerta variante="erro">{erro}</Alerta>}
      {sucesso && <Alerta variante="sucesso">Vídeo adicionado. Ele aparece na lista e o conteúdo será processado em segundo plano.</Alerta>}
      <label className="campo" htmlFor={idDoCampo}>
        <span>Link do vídeo</span>
        <input
          id={idDoCampo}
          name="url"
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            setTocado(true)
          }}
          placeholder="https://www.youtube.com/watch?v=…"
          autoComplete="off"
          inputMode="url"
          aria-describedby={motivo ? `${idDaAjuda} ${idDoErro}` : idDaAjuda}
          aria-invalid={motivo ? true : undefined}
        />
      </label>
      {motivo && (
        <p className="fonte-erro" id={idDoErro} role="alert">
          {motivo}
        </p>
      )}
      <p className="texto-de-apoio sem-margem" id={idDaAjuda}>
        Usa as legendas disponíveis sem consumir créditos. Se não conseguir obtê-las, baixa o áudio e transcreve com o modelo
        configurado, consumindo créditos do OpenRouter. Aceita links de youtube.com e youtu.be.
      </p>
      <div>
        <button type="submit" className="botao primario" disabled={enviando}>
          {enviando ? 'Adicionando…' : 'Adicionar vídeo'}
        </button>
      </div>
    </form>
  )
}
