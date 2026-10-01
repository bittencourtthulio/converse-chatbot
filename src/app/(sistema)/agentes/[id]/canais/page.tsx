import { exigirUsuario } from '@/app/sessao-servidor'
import { carregarAgente } from '@/app/(sistema)/agentes/[id]/carregar-agente'
import { CartaoTelegram } from '@/componentes/CartaoTelegram'
import { CANAIS_DO_AGENTE } from '@/componentes/canais'
import { dadosDoCanal, visaoDoCartaoTelegram } from '@/componentes/canais-logica'
import {
  conectarTelegram,
  desconectarTelegram,
  pausarTelegram,
  retomarTelegram,
  salvarLimiteTelegram,
  verificarTelegram,
} from '@/app/acoes'
import { appUrlServeAoTelegram, estado } from '@/servicos/canal-telegram'

const ACOES_DO_TELEGRAM = {
  conectar: conectarTelegram,
  desconectar: desconectarTelegram,
  pausar: pausarTelegram,
  retomar: retomarTelegram,
  verificar: verificarTelegram,
  salvarLimite: salvarLimiteTelegram,
}

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
      {CANAIS_DO_AGENTE.map((c) => {
        // Canal novo: uma entrada em `canais.ts` e o cartão dele aqui.
        if (c.id === 'telegram') {
          return (
            <CartaoTelegram
              key={c.id}
              agenteId={agente.id}
              titulo={c.titulo}
              resumo={c.resumo}
              canal={canal}
              visao={visao}
              acoes={ACOES_DO_TELEGRAM}
            />
          )
        }
        return null
      })}
    </div>
  )
}
