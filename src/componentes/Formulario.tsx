'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import type { EstadoDoFormulario } from '@/app/acoes'
import { Alerta } from '@/componentes/Alerta'

export type AcaoDeFormulario = (
  estado: EstadoDoFormulario,
  form: FormData,
) => Promise<EstadoDoFormulario>

export function BotaoDeEnvio({ rotulo }: { rotulo: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="botao primario" disabled={pending}>
      {pending ? 'Salvando…' : rotulo}
    </button>
  )
}

/**
 * Formulário com estado de envio, erro e sucesso — os três estados que
 * toda tela que grava precisa tratar (L30).
 */
export function Formulario({
  acao,
  rotulo,
  children,
}: {
  acao: AcaoDeFormulario
  rotulo: string
  children: React.ReactNode
}) {
  const [estado, executar] = useActionState(acao, {})

  return (
    <form action={executar} className="formulario">
      {estado.erro && <Alerta variante="erro">{estado.erro}</Alerta>}
      {estado.sucesso && <Alerta variante="sucesso">{estado.sucesso}</Alerta>}
      {children}
      <div>
        <BotaoDeEnvio rotulo={rotulo} />
      </div>
    </form>
  )
}

export function Campo({
  nome,
  rotulo,
  tipo = 'text',
  padrao,
  obrigatorio = true,
  autoComplete,
}: {
  nome: string
  rotulo: string
  tipo?: string
  padrao?: string
  obrigatorio?: boolean
  autoComplete?: string
}) {
  return (
    <label className="campo">
      <span>{rotulo}</span>
      <input
        type={tipo}
        name={nome}
        defaultValue={padrao}
        required={obrigatorio}
        autoComplete={autoComplete ?? (tipo === 'password' ? 'new-password' : 'on')}
      />
    </label>
  )
}
