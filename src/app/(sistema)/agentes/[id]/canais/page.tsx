import { exigirUsuario } from '@/app/sessao-servidor'
import { carregarAgente } from '@/app/(sistema)/agentes/[id]/carregar-agente'
import { Badge } from '@/componentes/Badge'
import { CANAIS_DO_AGENTE } from '@/componentes/canais'
import { dadosDoCanal, visaoDoCartaoTelegram } from '@/componentes/canais-logica'
import { appUrlServeAoTelegram, estado } from '@/servicos/canal-telegram'

/**
 * Aba Canais do agente (FT-07): lista de cartões, um por canal. Hoje só o
 * Telegram. Qualquer usuário autenticado gerencia (PR-12). O estado que chega ao
 * navegador nunca leva token, segredo nem id do bot (PR-14).
 */
export default async function CanaisDoAgente({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await exigirUsuario()
  const { id } = await params
  const agente = await carregarAgente(usuario, id)
  const canal = dadosDoCanal(await estado(usuario, agente.id))
  const visao = visaoDoCartaoTelegram({ canal, appUrlServe: appUrlServeAoTelegram() })

  return (
    <div className="pilha">
      {CANAIS_DO_AGENTE.map((c) => (
        <section className="cartao" key={c.id} aria-labelledby={`titulo-do-canal-${c.id}`}>
          <div className="cartao-corpo pilha pilha-compacta">
            <div className="linha linha-entre">
              <h2 className="secao-titulo sem-margem" id={`titulo-do-canal-${c.id}`}>
                {c.titulo}
              </h2>
              <Badge variante={visao.selo.variante}>{visao.selo.texto}</Badge>
            </div>
            <p className="texto-de-apoio">{c.resumo}</p>
          </div>
        </section>
      ))}
    </div>
  )
}
