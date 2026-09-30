import Link from 'next/link'
import { exigirUsuario } from '@/app/sessao-servidor'
import { listar } from '@/servicos/agentes'
import { CabecalhoDaPagina } from '@/componentes/CabecalhoDaPagina'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { iniciaisDe } from '@/componentes/iniciais'

const formatarData = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeZone: 'America/Sao_Paulo',
})

/**
 * Lista de agentes (PR-01). Qualquer usuário autenticado vê todos. Carregando
 * é o `loading.tsx` da pasta e erro é o `error.tsx` do sistema.
 */
export default async function Agentes() {
  const usuario = await exigirUsuario()
  const agentes = await listar(usuario)

  return (
    <div className="pilha">
      <CabecalhoDaPagina
        titulo="Agentes"
        subtitulo="Cada agente tem as próprias instruções e o próprio modelo."
        acoes={
          <Link href="/agentes/novo" className="botao primario">
            Novo agente
          </Link>
        }
      />

      {agentes.length === 0 ? (
        <section className="cartao" aria-label="Agentes">
          <EstadoVazio
            icone="agentes"
            titulo="Nenhum agente ainda"
            descricao="Crie o primeiro agente: escreva as instruções, escolha o modelo e ajuste a temperatura."
            acao={
              <Link href="/agentes/novo" className="botao primario">
                Criar agente
              </Link>
            }
          />
        </section>
      ) : (
        <ul className="grade-de-agentes" aria-label="Agentes">
          {agentes.map((agente) => (
            <li key={agente.id}>
              <Link href={`/agentes/${agente.id}`} className="cartao-de-agente">
                <span className="avatar-do-agente" aria-hidden="true">
                  {iniciaisDe(agente.nome)}
                </span>
                <span className="cartao-de-agente-nome">{agente.nome}</span>
                <code className="chave-mascarada">{agente.modelo}</code>
                <span className="texto-de-apoio">Criado em {formatarData.format(agente.criadoEm)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
