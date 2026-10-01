import Link from 'next/link'
import { exigirUsuario } from '@/app/sessao-servidor'
import { Alerta } from '@/componentes/Alerta'
import { CabecalhoDaPagina } from '@/componentes/CabecalhoDaPagina'
import { CartoesDoPainel } from '@/componentes/CartoesDoPainel'
import { ConversasRecentes } from '@/componentes/ConversasRecentes'
import { GraficoDeMensagens } from '@/componentes/GraficoDeMensagens'
import { PrimeirosPassos } from '@/componentes/PrimeirosPassos'
import { obterPainel } from '@/servicos/painel'

/**
 * O painel, a tela inicial (P-9, E-1), preenchido na FT-09: o que precisa de atenção (fontes
 * com erro), os primeiros passos (some sozinha), os números, o gráfico dos últimos 14 dias
 * e as conversas recentes. Título e subtítulo próprios. Carregando é o `loading.tsx` do
 * grupo `(painel)` e erro é o `error.tsx` do sistema.
 */
export default async function Painel() {
  const usuario = await exigirUsuario()
  const painel = await obterPainel()

  return (
    <div className="pilha">
      <CabecalhoDaPagina
        titulo="Painel"
        subtitulo="Visão geral da sua conta."
        acoes={
          usuario.papel === 'admin' ? (
            <Link href="/configuracoes/usuarios" className="botao secundario">
              Cadastrar usuário
            </Link>
          ) : undefined
        }
      />

      {painel.fontesComErro.total > 0 && (
        <Alerta variante="aviso">
          <strong>
            {painel.fontesComErro.total === 1 ? '1 fonte com erro' : `${painel.fontesComErro.total} fontes com erro`}
          </strong>
          <p>Estas fontes não foram lidas e não entram nas respostas até você corrigir.</p>
          <ul className="fontes-com-erro-do-painel">
            {painel.fontesComErro.itens.map((f) => (
              <li key={f.id}>
                <Link href={`/agentes/${f.agenteId}/conhecimento`}>{f.titulo}</Link> · {f.agenteNome}
                {f.mensagemErro ? ` · ${f.mensagemErro}` : ''}
              </li>
            ))}
          </ul>
        </Alerta>
      )}

      <PrimeirosPassos passos={painel.passos} ehAdmin={usuario.papel === 'admin'} />
      <CartoesDoPainel numeros={painel.numeros} />
      <section className="cartao cartao-corpo" aria-label="Mensagens por dia">
        <GraficoDeMensagens serie={painel.serie} />
      </section>
      <ConversasRecentes itens={painel.recentes} />
    </div>
  )
}
