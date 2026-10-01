import Link from 'next/link'
import { carregarConversa } from '@/app/(sistema)/conversas/[id]/carregar-conversa'
import { AcoesDaConversa } from '@/componentes/AcoesDaConversa'
import { BadgeDeCanal } from '@/componentes/BadgeDeCanal'
import { CabecalhoDaPagina } from '@/componentes/CabecalhoDaPagina'
import { TranscricaoDaConversa } from '@/componentes/TranscricaoDaConversa'
import { formatarAtividade } from '@/componentes/conversas-logica'

/**
 * O detalhe da conversa (FT-09): metadados do canal, a transcrição com as fontes de cada
 * resposta, Exportar e Apagar. Sessão e 404 são do layout; carregando é o `loading.tsx`.
 */
export default async function DetalheDaConversa({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const c = await carregarConversa(id)
  const mensagens = c.mensagens.map((m) => ({ ...m, criadoEm: m.criadoEm.toISOString() }))

  return (
    <div className="pilha">
      <Link href="/conversas" className="link-de-voltar">
        ← Voltar para as conversas
      </Link>
      <CabecalhoDaPagina titulo={c.rotulo} subtitulo={`Conversa com o agente ${c.agenteNome}`} />
      <AcoesDaConversa conversaId={c.id} />

      <section className="cartao cartao-corpo" aria-label="Dados da conversa">
        <dl className="metadados-da-conversa">
          <div>
            <dt>Agente</dt>
            <dd>
              <Link href={`/agentes/${c.agenteId}`}>{c.agenteNome}</Link>
            </dd>
          </div>
          <div>
            <dt>Canal</dt>
            <dd>
              <BadgeDeCanal canal={c.canal} />
            </dd>
          </div>
          <div>
            <dt>Interlocutor</dt>
            <dd>{c.rotulo}</dd>
          </div>
          <div>
            <dt>Início</dt>
            <dd>{formatarAtividade(c.criadoEm)}</dd>
          </div>
          <div>
            <dt>Última atividade</dt>
            <dd>{formatarAtividade(c.atualizadoEm)}</dd>
          </div>
          <div>
            <dt>Mensagens</dt>
            <dd>{c.totalDeMensagens}</dd>
          </div>
        </dl>
      </section>

      <TranscricaoDaConversa mensagens={mensagens} rotulo={c.rotulo} agenteNome={c.agenteNome} />
    </div>
  )
}
