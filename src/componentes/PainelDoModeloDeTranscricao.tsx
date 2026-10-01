'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import type { AcaoDeFormulario } from '@/componentes/Formulario'
import { Alerta } from '@/componentes/Alerta'
import { Badge } from '@/componentes/Badge'

export interface EstadoVisivelDoModelo {
  /** O modelo que a próxima transcrição vai usar. */
  efetivo: string
  /** O que o admin salvou; `null` se vale o padrão. */
  salvo: string | null
  /** O padrão do ambiente. */
  padrao: string
}

function Botao({ rotulo, ocupado, variante, nome, valor }: { rotulo: string; ocupado: string; variante: 'primario' | 'secundario'; nome?: string; valor?: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={`botao ${variante}`} disabled={pending} name={nome} value={valor}>
      {pending ? ocupado : rotulo}
    </button>
  )
}

/**
 * Modelo de transcrição (PR-73): o modelo do OpenRouter que transforma o áudio
 * de vídeos em texto. Só o admin altera; a ação confere o papel no servidor.
 */
export function PainelDoModeloDeTranscricao({ estado, acao }: { estado: EstadoVisivelDoModelo; acao: AcaoDeFormulario }) {
  const [retorno, salvar] = useActionState(acao, {})

  return (
    <section className="cartao" aria-labelledby="titulo-transcricao">
      <div className="cartao-corpo pilha pilha-compacta">
        <div className="linha linha-entre">
          <h2 className="secao-titulo sem-margem" id="titulo-transcricao">
            Modelo de transcrição
          </h2>
          <Badge variante={estado.salvo ? 'acento' : 'neutro'}>{estado.salvo ? 'Personalizado' : 'Padrão'}</Badge>
        </div>

        <p className="texto-de-apoio">
          Modelo do OpenRouter que transcreve o áudio de vídeos e áudios enviados à base de conhecimento. Precisa aceitar entrada de áudio.
          Cada transcrição consome créditos do OpenRouter da chave cadastrada acima.
        </p>

        <div className="linha">
          <span className="texto-de-apoio">Em uso:</span>
          <code className="chave-mascarada">{estado.efetivo}</code>
          <span className="texto-de-apoio">· padrão: {estado.padrao}</span>
        </div>

        <form action={salvar} className="formulario">
          {retorno.erro && <Alerta variante="erro">{retorno.erro}</Alerta>}
          {retorno.sucesso && <Alerta variante="sucesso">{retorno.sucesso}</Alerta>}
          <label className="campo">
            <span>Modelo</span>
            <input
              type="text"
              name="modelo"
              defaultValue={estado.salvo ?? ''}
              placeholder={estado.padrao}
              autoComplete="off"
              spellCheck={false}
              maxLength={100}
            />
          </label>
          <div className="linha">
            <Botao rotulo="Salvar modelo" ocupado="Salvando…" variante="primario" />
            {estado.salvo && <Botao rotulo="Restaurar o padrão" ocupado="Restaurando…" variante="secundario" nome="restaurar" valor="1" />}
          </div>
        </form>
      </div>
    </section>
  )
}
