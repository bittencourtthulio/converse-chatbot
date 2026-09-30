import Link from 'next/link'
import { exigirUsuario } from '@/app/sessao-servidor'
import { salvarPerfil } from '@/app/acoes'
import { Badge } from '@/componentes/Badge'
import { CabecalhoDaPagina } from '@/componentes/CabecalhoDaPagina'
import { Formulario, Campo } from '@/componentes/Formulario'

/** Perfil do usuário logado (P-9, E-3). Papel não se muda aqui: é do admin. */
export default async function Perfil() {
  const usuario = await exigirUsuario()

  return (
    <div className="pilha">
      <CabecalhoDaPagina
        titulo="Meu perfil"
        subtitulo="Seus dados de conta."
        acoes={
          <Link href="/perfil/senha" className="botao secundario">
            Trocar minha senha
          </Link>
        }
      />

      <section className="cartao cartao-estreito" aria-label="Dados da conta">
        <div className="cartao-corpo">
          <p className="linha texto-suave">
            Papel na conta:{' '}
            <Badge variante={usuario.papel === 'admin' ? 'acento' : 'neutro'}>
              {usuario.papel === 'admin' ? 'Administrador' : 'Usuário'}
            </Badge>
          </p>
          <Formulario acao={salvarPerfil} rotulo="Salvar alterações">
            <Campo nome="nome" rotulo="Nome" padrao={usuario.nome} autoComplete="name" />
            <Campo nome="email" rotulo="E-mail" tipo="email" padrao={usuario.email} autoComplete="email" />
          </Formulario>
        </div>
      </section>
    </div>
  )
}
