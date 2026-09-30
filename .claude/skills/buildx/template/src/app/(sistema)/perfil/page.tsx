import Link from 'next/link'
import { exigirUsuario } from '@/lib/sessao-servidor'
import { salvarPerfil } from '@/app/acoes'
import { Formulario, Campo } from '@/componentes/Formulario'

/** Perfil do usuário logado (P-9, E-3). Papel não se muda aqui: é do admin. */
export default async function Perfil() {
  const usuario = await exigirUsuario()

  return (
    <>
      <h1 className="titulo-da-tela">Meu perfil</h1>
      <p className="subtitulo-da-tela">Seus dados de conta.</p>

      <Formulario acao={salvarPerfil} rotulo="Salvar">
        <Campo nome="nome" rotulo="Nome" padrao={usuario.nome} />
        <Campo nome="email" rotulo="E-mail" tipo="email" padrao={usuario.email} />
      </Formulario>

      <p style={{ marginTop: 24 }}>
        <Link href="/perfil/senha">Trocar minha senha</Link>
      </p>
    </>
  )
}
