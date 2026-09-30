'use client'

import { useActionState } from 'react'
import { autenticar } from '@/app/acoes'
import { Alerta } from '@/componentes/Alerta'
import { BotaoDeEnvio, Campo } from '@/componentes/Formulario'

/**
 * Formulário do login. Mantém o e-mail digitado quando a entrada falha (o
 * React limpa o formulário depois da ação) e mostra a mensagem em destaque.
 */
export function FormularioDeLogin() {
  const [estado, executar] = useActionState(autenticar, {})

  return (
    <form action={executar} className="formulario">
      {estado.erro && <Alerta variante="erro">{estado.erro}</Alerta>}
      <Campo nome="email" rotulo="E-mail" tipo="email" padrao={estado.email} autoComplete="username" />
      <Campo nome="senha" rotulo="Senha" tipo="password" autoComplete="current-password" />
      <BotaoDeEnvio rotulo="Entrar" />
    </form>
  )
}
