'use client'

import { useReducer, useState, type FormEvent } from 'react'
import { Alerta } from '@/componentes/Alerta'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import {
  LIMITE_DA_PERGUNTA,
  estadoInicialDaBusca,
  formatarPontuacao,
  reduzirBusca,
  validarPergunta,
  type TrechoDaBusca,
} from '@/componentes/busca-logica'
import { mensagemDaResposta } from '@/componentes/fonte-da-tela'

/**
 * Cartão "Testar busca" (FT-05, PR-54): o usuário faz uma pergunta e vê os
 * trechos que o agente enxergaria, com a fonte e a pontuação. Não chama o
 * OpenRouter e funciona sem chave. O `fetch` mora aqui, num componente cliente.
 */
export function TestarBusca({ agenteId }: { agenteId: string }) {
  const [estado, despachar] = useReducer(reduzirBusca, undefined, estadoInicialDaBusca)
  const [pergunta, setPergunta] = useState('')
  const [erroDeCampo, setErroDeCampo] = useState<string | null>(null)
  const carregando = estado.fase === 'carregando'

  async function buscar(e: FormEvent) {
    e.preventDefault()
    if (carregando) return
    const valida = validarPergunta(pergunta)
    if (!valida.ok) {
      setErroDeCampo(valida.erro)
      return
    }
    setErroDeCampo(null)
    despachar({ tipo: 'buscar', pergunta: valida.pergunta })
    try {
      const r = await fetch(`/api/agentes/${agenteId}/buscar`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pergunta: valida.pergunta }),
      })
      if (!r.ok) {
        despachar({ tipo: 'erro', mensagem: await mensagemDaResposta(r, 'Não foi possível buscar agora. Tente de novo.') })
        return
      }
      const corpo = (await r.json()) as { trechos: TrechoDaBusca[] }
      despachar({ tipo: 'resultado', trechos: corpo.trechos })
    } catch {
      despachar({ tipo: 'erro', mensagem: 'Sem conexão. Não foi possível buscar agora.' })
    }
  }

  return (
    <section className="cartao" aria-labelledby="titulo-testar-busca">
      <div className="cartao-corpo pilha">
        <div>
          <h2 className="secao-titulo sem-margem" id="titulo-testar-busca">
            Testar busca
          </h2>
          <p className="texto-de-apoio sem-margem">
            Faça uma pergunta e veja quais trechos da base o agente usaria para responder. Não gasta crédito do OpenRouter.
          </p>
        </div>

        <form className="busca-formulario" onSubmit={buscar} noValidate>
          <label className="campo busca-campo">
            <span>Pergunta</span>
            <input
              name="pergunta"
              type="text"
              value={pergunta}
              maxLength={LIMITE_DA_PERGUNTA}
              onChange={(e) => setPergunta(e.target.value)}
              placeholder="Ex.: Qual o prazo de troca?"
              autoComplete="off"
              aria-invalid={erroDeCampo ? true : undefined}
            />
          </label>
          <button type="submit" className="botao primario" disabled={carregando}>
            {carregando ? 'Buscando…' : 'Buscar'}
          </button>
        </form>
        {erroDeCampo && <Alerta variante="erro">{erroDeCampo}</Alerta>}

        <div className="busca-resultado" aria-live="polite">
          {estado.fase === 'inicial' && (
            <p className="texto-de-apoio sem-margem">Os trechos encontrados aparecem aqui.</p>
          )}
          {estado.fase === 'carregando' && (
            <p className="texto-de-apoio sem-margem" role="status">
              Buscando na base…
            </p>
          )}
          {estado.fase === 'erro' && <Alerta variante="erro">{estado.mensagem}</Alerta>}
          {estado.fase === 'vazio' && (
            <EstadoVazio
              icone="arquivo"
              titulo="Nenhum trecho encontrado"
              descricao="Nada na base combina com essa pergunta. Para uma pergunta assim, o agente responderia que não encontrou a informação."
            />
          )}
          {estado.fase === 'resultado' && (
            <ol className="busca-lista" aria-label={`Trechos encontrados para “${estado.pergunta}”`}>
              {estado.trechos.map((t) => (
                <li key={t.trechoId} className="busca-trecho">
                  <p className="busca-trecho-cabecalho">
                    <strong>{t.titulo}</strong>
                    <span className="busca-trecho-meta">
                      Trecho {t.posicao} · pontuação {formatarPontuacao(t.pontuacao)}
                    </span>
                  </p>
                  <p className="busca-trecho-texto">{t.texto}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  )
}
