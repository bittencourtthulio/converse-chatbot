'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import type { AcaoDeFormulario } from '@/componentes/Formulario'
import { Alerta } from '@/componentes/Alerta'

const LIMITE = 300

function Botao() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="botao primario" disabled={pending}>
      {pending ? 'Salvando…' : 'Salvar aviso'}
    </button>
  )
}

/**
 * O aviso de privacidade padrão do workspace (FT-10, PR-91): vale no chat embutido de todo
 * agente sem aviso próprio e é anexado ao /start do Telegram.
 */
export function FormularioDoAvisoPadrao({ texto, url, acao }: { texto: string; url: string; acao: AcaoDeFormulario }) {
  const [retorno, salvar] = useActionState(acao, {})
  const [atual, setAtual] = useState(texto)

  return (
    <section className="cartao" aria-labelledby="titulo-aviso-padrao">
      <div className="cartao-corpo pilha pilha-compacta">
        <h2 className="secao-titulo sem-margem" id="titulo-aviso-padrao">
          Aviso de privacidade padrão
        </h2>
        <p className="texto-de-apoio">
          Aparece no rodapé do chat embutido dos agentes que não têm aviso próprio e junto da mensagem de boas-vindas (/start) do Telegram. Deixe em branco para
          não mostrar nenhum.
        </p>
        <form action={salvar} className="formulario">
          {retorno.erro && <Alerta variante="erro">{retorno.erro}</Alerta>}
          {retorno.sucesso && <Alerta variante="sucesso">{retorno.sucesso}</Alerta>}
          <label className="campo">
            <span>Texto do aviso</span>
            <textarea
              name="texto"
              rows={3}
              maxLength={LIMITE}
              value={atual}
              onChange={(e) => setAtual(e.target.value)}
              placeholder="As conversas são guardadas para melhorar o atendimento."
              aria-describedby="ajuda-do-aviso-padrao"
            />
            <span className="campo-ajuda" id="ajuda-do-aviso-padrao">
              Texto curto. {atual.length} de {LIMITE} caracteres.
            </span>
          </label>
          <label className="campo">
            <span>Link da política de privacidade</span>
            <input type="url" name="url" defaultValue={url} maxLength={500} placeholder="https://seusite.com.br/privacidade" autoComplete="off" />
            <span className="campo-ajuda">Opcional, http ou https. Precisa do texto do aviso.</span>
          </label>
          <div>
            <Botao />
          </div>
        </form>
      </div>
    </section>
  )
}
