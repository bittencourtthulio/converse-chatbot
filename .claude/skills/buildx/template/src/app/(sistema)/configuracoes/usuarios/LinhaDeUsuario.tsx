'use client'

import { useActionState } from 'react'
import { desativarUsuario } from '@/app/acoes'

interface Props {
  usuario: {
    id: string
    nome: string
    email: string
    papel: string
    ativo: boolean
    ehVoce: boolean
  }
}

export function LinhaDeUsuario({ usuario }: Props) {
  const [estado, executar] = useActionState(desativarUsuario, {})

  return (
    <tr>
      <td>
        {usuario.nome}
        {usuario.ehVoce && <span style={{ opacity: 0.6 }}> (você)</span>}
      </td>
      <td>{usuario.email}</td>
      <td>{usuario.papel === 'admin' ? 'Administrador' : 'Usuário'}</td>
      <td>{usuario.ativo ? 'Ativo' : 'Desativado'}</td>
      <td style={{ textAlign: 'right' }}>
        {usuario.ativo && (
          <form action={executar} style={{ display: 'inline' }}>
            <input type="hidden" name="id" value={usuario.id} />
            <button type="submit" className="secundario">
              Desativar
            </button>
          </form>
        )}
        {estado.erro && (
          <span className="aviso erro" role="alert" style={{ marginLeft: 8 }}>
            {estado.erro}
          </span>
        )}
      </td>
    </tr>
  )
}
