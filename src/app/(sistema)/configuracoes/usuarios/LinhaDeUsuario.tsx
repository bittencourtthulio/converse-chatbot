'use client'

import { useActionState } from 'react'
import { desativarUsuario } from '@/app/acoes'
import { Badge } from '@/componentes/Badge'

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
        <span className="linha">
          {usuario.nome}
          {usuario.ehVoce && <Badge>Você</Badge>}
        </span>
      </td>
      <td className="celula-secundaria">{usuario.email}</td>
      <td>
        <Badge variante={usuario.papel === 'admin' ? 'acento' : 'neutro'}>
          {usuario.papel === 'admin' ? 'Administrador' : 'Usuário'}
        </Badge>
      </td>
      <td>
        <Badge variante={usuario.ativo ? 'sucesso' : 'neutro'}>
          {usuario.ativo ? 'Ativo' : 'Desativado'}
        </Badge>
      </td>
      <td className="coluna-acoes">
        {estado.erro && (
          <span role="alert">
            <Badge variante="perigo">{estado.erro}</Badge>{' '}
          </span>
        )}
        {usuario.ativo && (
          <form action={executar} className="linha">
            <input type="hidden" name="id" value={usuario.id} />
            <button type="submit" className="botao secundario botao-pequeno">
              Desativar
            </button>
          </form>
        )}
      </td>
    </tr>
  )
}
