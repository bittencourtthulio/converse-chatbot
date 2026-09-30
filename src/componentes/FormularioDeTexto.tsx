'use client'

import { useState, type FormEvent } from 'react'
import { Alerta } from '@/componentes/Alerta'
import { formatarCaracteres } from '@/componentes/conhecimento-logica'
import { mensagemDaResposta } from '@/componentes/fonte-da-tela'
import { LIMITES } from '@/lib/extracao/limites'

/** A conferência barata antes de enviar; o servidor confere de novo. `null` = válido. */
export function validarTextoColado({ titulo, conteudo }: { titulo: string; conteudo: string }): string | null {
  if (titulo.trim() === '') return 'Informe o título do texto.'
  if (titulo.trim().length > LIMITES.tituloDoTexto) {
    return `O título pode ter até ${LIMITES.tituloDoTexto} caracteres.`
  }
  if (conteudo.trim() === '') return 'Cole o texto que o agente deve aprender.'
  if (conteudo.length > LIMITES.conteudoDoTexto) {
    return `O texto pode ter até ${formatarCaracteres(LIMITES.conteudoDoTexto)} caracteres.`
  }
  return null
}

/** Colar um texto como fonte: título e conteúdo, com contador de caracteres. */
export function FormularioDeTexto({ agenteId, aoAlterar }: { agenteId: string; aoAlterar: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSucesso(false)
    const problema = validarTextoColado({ titulo, conteudo })
    if (problema) {
      setErro(problema)
      return
    }
    setErro(null)
    setEnviando(true)
    try {
      const r = await fetch(`/api/agentes/${agenteId}/fontes/texto`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ titulo, conteudo }),
      })
      if (r.status === 202) {
        setTitulo('')
        setConteudo('')
        setSucesso(true)
        aoAlterar()
      } else {
        setErro(await mensagemDaResposta(r, 'Não foi possível adicionar o texto.'))
      }
    } catch {
      setErro('Sem conexão. Não foi possível adicionar o texto.')
    } finally {
      setEnviando(false)
    }
  }

  const passou = conteudo.length > LIMITES.conteudoDoTexto

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      {erro && <Alerta variante="erro">{erro}</Alerta>}
      {sucesso && <Alerta variante="sucesso">Texto adicionado. Ele aparece na lista e é processado em instantes.</Alerta>}
      <label className="campo">
        <span>Título</span>
        <input
          name="titulo"
          type="text"
          value={titulo}
          maxLength={LIMITES.tituloDoTexto}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex.: Política de troca"
          autoComplete="off"
        />
      </label>
      <label className="campo">
        <span>Texto</span>
        <textarea
          name="conteudo"
          rows={8}
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder="Cole aqui o conteúdo…"
          aria-describedby="contador-do-texto"
        />
        <span
          className={passou ? 'chat-contador chat-contador-limite' : 'chat-contador'}
          id="contador-do-texto"
          aria-live="polite"
        >
          {formatarCaracteres(conteudo.length)} de {formatarCaracteres(LIMITES.conteudoDoTexto)}
        </span>
      </label>
      <div>
        <button type="submit" className="botao primario" disabled={enviando}>
          {enviando ? 'Adicionando…' : 'Adicionar texto'}
        </button>
      </div>
    </form>
  )
}
