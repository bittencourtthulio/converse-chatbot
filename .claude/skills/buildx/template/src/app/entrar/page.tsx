import { redirect } from 'next/navigation'
import { usuarioAtual } from '@/lib/sessao-servidor'
import { autenticar } from '@/app/acoes'
import { Formulario, Campo } from '@/componentes/Formulario'

export default async function Entrar() {
  if (await usuarioAtual()) redirect('/')

  return (
    <main
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 380 }}>
        <h1 className="titulo-da-tela">Entrar</h1>
        <p className="subtitulo-da-tela">Informe suas credenciais para continuar.</p>

        <Formulario acao={autenticar} rotulo="Entrar">
          <Campo nome="email" rotulo="E-mail" tipo="email" />
          <Campo nome="senha" rotulo="Senha" tipo="password" />
        </Formulario>
      </div>
    </main>
  )
}
