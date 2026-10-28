'use client'

import { useState } from 'react'
import { Formulario, type AcaoDeFormulario } from '@/componentes/Formulario'
import { SeletorDeModelo, type ModeloSugerido } from '@/componentes/SeletorDeModelo'
import estilos from './FormularioDeAgente.module.css'

const MODELO_PADRAO = 'openai/gpt-4o-mini'
const TEMPERATURA_PADRAO = 0.7
const LIMITE_DE_INSTRUCOES = 8000
const LIMITE_DE_MENSAGEM = 500

export interface AgenteDoFormulario {
  id: string
  nome: string
  instrucoes: string
  modelo: string
  temperatura: number
  mensagemInicial: string
}

/** Área de texto com contador. Os limites espelham os do serviço de agentes. */
function AreaComContador({
  nome,
  rotulo,
  ajuda,
  limite,
  linhas,
  inicial,
}: {
  nome: string
  rotulo: string
  ajuda: string
  limite: number
  linhas: number
  inicial: string
}) {
  const [texto, setTexto] = useState(inicial)
  const idDoContador = `contador-${nome}`
  return (
    <label className="campo">
      <span>{rotulo}</span>
      <textarea
        name={nome}
        rows={linhas}
        maxLength={limite}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        aria-describedby={idDoContador}
      />
      <span className="campo-ajuda" id={idDoContador}>
        {ajuda} <span aria-live="polite">{texto.length} de {limite} caracteres</span>
      </span>
    </label>
  )
}

/**
 * Formulário do agente, para criar e para editar (PR-01). Sem `agente` é um
 * agente novo, com o modelo e a temperatura padrão; com `agente` vem
 * preenchido e leva o id escondido.
 */
export function FormularioDeAgente({
  acao,
  rotulo,
  agente,
  modelos,
  temChave,
  reserva,
  ehAdmin,
}: {
  acao: AcaoDeFormulario
  rotulo: string
  agente?: AgenteDoFormulario
  modelos: ModeloSugerido[]
  temChave: boolean
  reserva: boolean
  ehAdmin: boolean
}) {
  const [temperatura, setTemperatura] = useState(agente?.temperatura ?? TEMPERATURA_PADRAO)
  const temperaturaFormatada = temperatura.toFixed(1).replace('.', ',')

  return (
    <Formulario acao={acao} rotulo={rotulo}>
      {agente && <input type="hidden" name="id" value={agente.id} />}

      <label className="campo">
        <span>Nome</span>
        <input
          type="text"
          name="nome"
          defaultValue={agente?.nome ?? ''}
          required
          maxLength={80}
          autoComplete="off"
          placeholder="Atendimento da loja"
        />
      </label>

      <AreaComContador
        nome="instrucoes"
        rotulo="Instruções"
        ajuda="Diga quem o agente é, como deve falar e o que não deve fazer."
        limite={LIMITE_DE_INSTRUCOES}
        linhas={8}
        inicial={agente?.instrucoes ?? ''}
      />

      <SeletorDeModelo
        valorInicial={agente?.modelo ?? MODELO_PADRAO}
        modelos={modelos}
        temChave={temChave}
        reserva={reserva}
        ehAdmin={ehAdmin}
      />

      <label className={`campo ${estilos.temperatura}`}>
        <span className={estilos.cabecalho}>
          <span>Temperatura</span>
          <span className={estilos.valor} aria-hidden="true">{temperaturaFormatada}</span>
        </span>
        <input
          type="range"
          name="temperatura"
          value={temperatura}
          onChange={(e) => setTemperatura(e.target.valueAsNumber)}
          aria-valuetext={temperaturaFormatada}
          min={0}
          max={2}
          step={0.1}
        />
        <span className="campo-ajuda">
          De 0 a 2. Valores baixos deixam as respostas mais previsíveis; valores altos, mais variadas.
        </span>
      </label>

      <AreaComContador
        nome="mensagemInicial"
        rotulo="Mensagem inicial"
        ajuda="A primeira mensagem que o agente mostra ao abrir uma conversa. Pode ficar vazia."
        limite={LIMITE_DE_MENSAGEM}
        linhas={3}
        inicial={agente?.mensagemInicial ?? ''}
      />
    </Formulario>
  )
}
