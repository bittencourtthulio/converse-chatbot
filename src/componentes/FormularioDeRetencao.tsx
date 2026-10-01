'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import type { AcaoDeFormulario } from '@/componentes/Formulario'
import { Alerta } from '@/componentes/Alerta'
import { Badge } from '@/componentes/Badge'
import {
  RETENCAO_MAXIMA,
  RETENCAO_MINIMA,
  descreverRetencao,
  modoInicialDaRetencao,
  retencaoPodeSalvar,
  type ModoDaRetencao,
} from '@/componentes/privacidade-logica'

function Botao({ habilitado }: { habilitado: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="botao primario" disabled={pending || !habilitado}>
      {pending ? 'Salvando…' : 'Salvar retenção'}
    </button>
  )
}

/**
 * A retenção das conversas (FT-10, PR-89): apagar depois de N dias (padrão 90, de 7 a 3650) ou
 * "sem expurgo automático", escolha explícita que exige marcar que o risco foi entendido. O
 * servidor valida tudo de novo.
 */
export function FormularioDeRetencao({ retencaoDias, acao }: { retencaoDias: number | null; acao: AcaoDeFormulario }) {
  const [retorno, salvar] = useActionState(acao, {})
  const [modo, setModo] = useState<ModoDaRetencao>(modoInicialDaRetencao(retencaoDias))
  const [dias, setDias] = useState(String(retencaoDias ?? 90))
  const [confirmou, setConfirmou] = useState(false)

  return (
    <section className="cartao" aria-labelledby="titulo-retencao">
      <div className="cartao-corpo pilha pilha-compacta">
        <div className="linha linha-entre">
          <h2 className="secao-titulo sem-margem" id="titulo-retencao">
            Retenção das conversas
          </h2>
          <Badge variante={retencaoDias === null ? 'perigo' : 'acento'}>{retencaoDias === null ? 'Sem expurgo' : `${retencaoDias} dias`}</Badge>
        </div>
        <p className="texto-de-apoio">
          Atualmente: {descreverRetencao(retencaoDias)}. As conversas sem atividade depois desse prazo são apagadas de vez, com as mensagens, por uma tarefa
          automática que roda 1 minuto depois de o sistema subir e a cada 6 horas.
        </p>

        <form action={salvar} className="formulario">
          {retorno.erro && <Alerta variante="erro">{retorno.erro}</Alerta>}
          {retorno.sucesso && <Alerta variante="sucesso">{retorno.sucesso}</Alerta>}

          <fieldset className="campo-grupo">
            <legend>O que fazer com as conversas antigas</legend>
            <div className="pilha pilha-compacta">
              <label className="campo-radio">
                <input type="radio" name="modo" value="dias" checked={modo === 'dias'} onChange={() => setModo('dias')} />
                <span>Apagar depois de</span>
                <input
                  type="number"
                  name="dias"
                  min={RETENCAO_MINIMA}
                  max={RETENCAO_MAXIMA}
                  step={1}
                  inputMode="numeric"
                  value={dias}
                  onChange={(e) => setDias(e.target.value)}
                  disabled={modo !== 'dias'}
                  aria-label="Dias de retenção"
                  className="campo-numerico"
                />
                <span>dias sem atividade</span>
              </label>
              <label className="campo-radio">
                <input type="radio" name="modo" value="sem_expurgo" checked={modo === 'sem_expurgo'} onChange={() => setModo('sem_expurgo')} />
                <span>Sem expurgo automático</span>
              </label>
            </div>
            <span className="campo-ajuda">De {RETENCAO_MINIMA} a {RETENCAO_MAXIMA} dias. O padrão é 90.</span>
          </fieldset>

          {modo === 'sem_expurgo' && (
            <div className="pilha pilha-compacta">
              <Alerta variante="aviso">
                <strong>Risco:</strong> sem o expurgo, as conversas, que podem conter dado pessoal, ficam guardadas para sempre, até alguém apagá-las uma a uma.
                Isso aumenta a exposição em caso de vazamento e o que a empresa precisa justificar.
              </Alerta>
              <label className="campo-checkbox">
                <input type="checkbox" name="confirmarRisco" checked={confirmou} onChange={(e) => setConfirmou(e.target.checked)} required />
                <span>Entendo o risco e quero guardar as conversas até alguém apagá-las.</span>
              </label>
            </div>
          )}

          <div>
            <Botao habilitado={retencaoPodeSalvar({ modo, dias, confirmouRisco: confirmou })} />
          </div>
        </form>
      </div>
    </section>
  )
}
