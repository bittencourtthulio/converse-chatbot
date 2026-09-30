'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import type { EstadoDoFormulario } from '@/app/acoes'

function BotaoDeEnvio({ rotulo }: { rotulo: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="primario" disabled={pending}>
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
  acao: (
    estado: EstadoDoFormulario,
    form: FormData,
  ) => Promise<EstadoDoFormulario>
  rotulo: string
  children: React.ReactNode
}) {
  const [estado, executar] = useActionState(acao, {})

  return (
    <form action={executar}>
      {estado.erro && (
        <p className="aviso erro" role="alert">
          {estado.erro}
        </p>
      )}
      {estado.sucesso && (
        <p className="aviso sucesso" role="status">
          {estado.sucesso}
        </p>
      )}
      {children}
      <BotaoDeEnvio rotulo={rotulo} />
    </form>
  )
}

export function Campo({
  nome,
  rotulo,
  tipo = 'text',
  padrao,
  obrigatorio = true,
}: {
  nome: string
  rotulo: string
  tipo?: string
  padrao?: string
  obrigatorio?: boolean
}) {
  return (
    <label className="campo">
      <span>{rotulo}</span>
      <input
        type={tipo}
        name={nome}
        defaultValue={padrao}
        required={obrigatorio}
        autoComplete={tipo === 'password' ? 'new-password' : 'on'}
      />
    </label>
  )
}
