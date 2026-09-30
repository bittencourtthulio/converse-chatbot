import { redirect } from 'next/navigation'
import { usuarioAtual } from '@/app/sessao-servidor'
import { ambiente } from '@/lib/ambiente'
import { FormularioDeLogin } from '@/componentes/FormularioDeLogin'
import { Logotipo } from '@/componentes/Logotipo'

export default async function Entrar() {
  if (await usuarioAtual()) redirect('/')

  return (
    <main className="login">
      <div className="login-cartao">
        <div className="login-marca">
          <Logotipo nome={ambiente.nomeDoProduto} href={null} />
        </div>
        <h1 className="login-titulo">Entrar</h1>
        <p className="login-subtitulo">Use o e-mail e a senha da sua conta.</p>
        <FormularioDeLogin />
      </div>
    </main>
  )
}
