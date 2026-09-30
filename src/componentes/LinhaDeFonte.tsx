'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '@/componentes/Badge'
import { BotaoExcluirFonte } from '@/componentes/BotaoExcluirFonte'
import { Icone } from '@/componentes/Icones'
import { formatarData, formatarTamanho, iconeDoTipo, rotuloDoStatus } from '@/componentes/conhecimento-logica'
import { mensagemDaResposta, serializarFonte, type FonteDaTela } from '@/componentes/fonte-da-tela'

/** Uma fonte na lista: ícone do tipo, título, tamanho, data, status, motivo do erro e ações. */
export function LinhaDeFonte({
  fonte,
  aoMudar,
  aoExcluir,
}: {
  fonte: FonteDaTela
  aoMudar: (fonte: FonteDaTela) => void
  aoExcluir: (id: string) => void
}) {
  const status = rotuloDoStatus(fonte.status)
  const [reprocessando, setReprocessando] = useState(false)
  const [erroDaAcao, setErroDaAcao] = useState<string | null>(null)

  async function reprocessar() {
    setReprocessando(true)
    setErroDaAcao(null)
    try {
      const r = await fetch(`/api/agentes/${fonte.agenteId}/fontes/${fonte.id}/reprocessar`, { method: 'POST' })
      if (r.status === 202) {
        const { fonte: nova } = (await r.json()) as { fonte: FonteDaTela }
        aoMudar(serializarFonte(nova))
      } else {
        setErroDaAcao(await mensagemDaResposta(r, 'Não foi possível reprocessar a fonte.'))
      }
    } catch {
      setErroDaAcao('Sem conexão. Não foi possível reprocessar a fonte.')
    } finally {
      setReprocessando(false)
    }
  }

  return (
    <li className="fonte-item">
      <span className="fonte-icone">
        <Icone nome={iconeDoTipo(fonte.tipo)} tamanho={20} />
      </span>
      <div className="fonte-texto">
        <p className="fonte-titulo">{fonte.titulo}</p>
        <p className="fonte-meta">
          {formatarTamanho(fonte.tamanhoBytes)} · {formatarData(fonte.criadoEm)}
        </p>
        {fonte.status === 'erro' && fonte.mensagemErro && (
          <p className="fonte-erro">{fonte.mensagemErro}</p>
        )}
        {erroDaAcao && (
          <p className="fonte-erro" role="alert">
            {erroDaAcao}
          </p>
        )}
      </div>
      <div className="fonte-status">
        <Badge variante={status.variante}>
          {status.girando && <span className="spinner" aria-hidden="true" />}
          {status.rotulo}
        </Badge>
      </div>
      <div className="fonte-acoes">
        <Link href={`/agentes/${fonte.agenteId}/conhecimento/${fonte.id}`} className="botao secundario botao-pequeno">
          Ver conteúdo
        </Link>
        {fonte.status === 'erro' && (
          <button type="button" className="botao secundario botao-pequeno" onClick={reprocessar} disabled={reprocessando}>
            <Icone nome="atualizar" tamanho={16} />
            {reprocessando ? 'Reprocessando…' : 'Reprocessar'}
          </button>
        )}
        <BotaoExcluirFonte fonte={fonte} aoExcluir={aoExcluir} />
      </div>
    </li>
  )
}
