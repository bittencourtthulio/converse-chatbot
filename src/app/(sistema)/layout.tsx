import { exigirUsuario } from '@/app/sessao-servidor'
import { ambiente } from '@/lib/ambiente'
import { CascaDoSistema } from '@/componentes/CascaDoSistema'

/** Toda tela autenticada mora dentro da casca. A sessão é conferida aqui. */
export default async function LayoutDoSistema({
  children,
}: {
  children: React.ReactNode
}) {
  const usuario = await exigirUsuario()

  return (
    <CascaDoSistema
      nomeDoProduto={ambiente.nomeDoProduto}
      usuario={{ nome: usuario.nome, email: usuario.email, papel: usuario.papel }}
    >
      {children}
    </CascaDoSistema>
  )
}
