import Link from 'next/link'
import { exigirUsuario } from '@/app/sessao-servidor'
import { CabecalhoDaPagina } from '@/componentes/CabecalhoDaPagina'
import { EstadoVazio } from '@/componentes/EstadoVazio'

/**
 * O painel — a tela inicial (P-9, E-1). Título e subtítulo próprios, corpo em
 * estado vazio de propósito: são as features do projeto que o preenchem.
 */
export default async function Painel() {
  const usuario = await exigirUsuario()

  return (
    <>
      <CabecalhoDaPagina titulo="Painel" subtitulo="Visão geral da sua conta." />

      <section className="cartao" aria-label="Resumo da conta">
        <EstadoVazio
          icone="painel"
          titulo="Ainda não há o que mostrar"
          descricao="Quando houver atividade na sua conta, o resumo aparece nesta tela."
          acao={
            usuario.papel === 'admin' ? (
              <Link href="/configuracoes/usuarios" className="botao secundario">
                Cadastrar usuário
              </Link>
            ) : undefined
          }
        />
      </section>
    </>
  )
}
