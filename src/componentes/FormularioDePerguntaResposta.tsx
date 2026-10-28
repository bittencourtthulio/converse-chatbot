'use client'

import { useState, type FormEvent } from 'react'
import { Alerta } from '@/componentes/Alerta'
import { formatarCaracteres } from '@/componentes/conhecimento-logica'
import { mensagemDaResposta } from '@/componentes/fonte-da-tela'
import { LIMITES } from '@/lib/extracao/limites'

/** Cada par entra na base como uma fonte, identificada pela pergunta. */
export function FormularioDePerguntaResposta({ agenteId, aoAlterar }: { agenteId: string; aoAlterar: () => void }) {
  const [pergunta, setPergunta] = useState('')
  const [resposta, setResposta] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSucesso(false)
    const problema = pergunta.trim() === '' ? 'Informe a pergunta.'
      : pergunta.trim().length > LIMITES.pergunta ? `A pergunta pode ter até ${LIMITES.pergunta} caracteres.`
      : resposta.trim() === '' ? 'Informe a resposta.'
      : resposta.length > LIMITES.conteudoDoTexto ? 'A resposta pode ter até 200.000 caracteres.'
      : null
    if (problema) {
      setErro(problema)
      return
    }
    setErro(null)
    setEnviando(true)
    try {
      const r = await fetch(`/api/agentes/${agenteId}/fontes/perguntas-respostas`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pergunta, resposta }),
      })
      if (r.status === 202) {
        setPergunta('')
        setResposta('')
        setSucesso(true)
        aoAlterar()
      } else {
        setErro(await mensagemDaResposta(r, 'Não foi possível adicionar a pergunta e a resposta.'))
      }
    } catch {
      setErro('Sem conexão. Não foi possível adicionar a pergunta e a resposta.')
    } finally {
      setEnviando(false)
    }
  }

  const passou = resposta.length > LIMITES.conteudoDoTexto

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      {erro && <Alerta variante="erro">{erro}</Alerta>}
      {sucesso && <Alerta variante="sucesso">Pergunta e resposta adicionadas. O conteúdo aparece na lista e é processado em instantes.</Alerta>}
      <label className="campo">
        <span>Pergunta</span>
        <input
          name="pergunta"
          type="text"
          value={pergunta}
          maxLength={LIMITES.pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          placeholder="Ex.: Qual é o prazo para solicitar uma troca?"
          disabled={enviando}
          autoComplete="off"
        />
      </label>
      <label className="campo">
        <span>Resposta</span>
        <textarea
          name="resposta"
          rows={8}
          disabled={enviando}
          value={resposta}
          onChange={(e) => setResposta(e.target.value)}
          placeholder="Digite a resposta que o agente deve usar como referência…"
          aria-describedby="contador-da-resposta"
        />
        <span
          className={passou ? 'chat-contador chat-contador-limite' : 'chat-contador'}
          id="contador-da-resposta"
          aria-live="polite"
        >
          {formatarCaracteres(resposta.length)} de {formatarCaracteres(LIMITES.conteudoDoTexto)}
        </span>
      </label>
      <div>
        <button type="submit" className="botao primario" disabled={enviando}>
          {enviando ? 'Adicionando…' : 'Adicionar pergunta e resposta'}
        </button>
      </div>
    </form>
  )
}
