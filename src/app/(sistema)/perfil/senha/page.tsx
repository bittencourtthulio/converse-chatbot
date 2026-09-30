import Link from 'next/link'
import { exigirUsuario } from '@/app/sessao-servidor'
import { salvarSenha } from '@/app/acoes'
import { CabecalhoDaPagina } from '@/componentes/CabecalhoDaPagina'
import { Formulario, Campo } from '@/componentes/Formulario'

/**
 * Troca de senha (P-9, E-4). Exige a senha atual — sem isso, uma sessão
 * sequestrada troca a senha e toma a conta.
 */
export default async function TrocarSenha() {
  await exigirUsuario()

  return (
    <div className="pilha">
      <CabecalhoDaPagina
        titulo="Trocar senha"
        subtitulo="Informe a senha atual para confirmar. As outras sessões serão encerradas."
        acoes={
          <Link href="/perfil" className="botao secundario">
            Voltar ao perfil
          </Link>
        }
      />

      <section className="cartao cartao-estreito" aria-label="Troca de senha">
        <div className="cartao-corpo">
          <Formulario acao={salvarSenha} rotulo="Trocar senha">
            <Campo nome="senhaAtual" rotulo="Senha atual" tipo="password" autoComplete="current-password" />
            <Campo nome="senhaNova" rotulo="Nova senha" tipo="password" />
            <Campo nome="confirmacao" rotulo="Confirme a nova senha" tipo="password" />
          </Formulario>
        </div>
      </section>
    </div>
  )
}
