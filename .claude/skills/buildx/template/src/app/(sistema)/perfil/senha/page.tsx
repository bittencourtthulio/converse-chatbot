import Link from 'next/link'
import { exigirUsuario } from '@/lib/sessao-servidor'
import { salvarSenha } from '@/app/acoes'
import { Formulario, Campo } from '@/componentes/Formulario'

/**
 * Troca de senha (P-9, E-4). Exige a senha atual — sem isso, uma sessão
 * sequestrada troca a senha e toma a conta.
 */
export default async function TrocarSenha() {
  await exigirUsuario()

  return (
    <>
      <h1 className="titulo-da-tela">Trocar senha</h1>
      <p className="subtitulo-da-tela">
        Informe a senha atual para confirmar. As outras sessões serão encerradas.
      </p>

      <Formulario acao={salvarSenha} rotulo="Trocar senha">
        <Campo nome="senhaAtual" rotulo="Senha atual" tipo="password" />
        <Campo nome="senhaNova" rotulo="Nova senha" tipo="password" />
        <Campo nome="confirmacao" rotulo="Confirme a nova senha" tipo="password" />
      </Formulario>

      <p style={{ marginTop: 24 }}>
        <Link href="/perfil">Voltar ao perfil</Link>
      </p>
    </>
  )
}
