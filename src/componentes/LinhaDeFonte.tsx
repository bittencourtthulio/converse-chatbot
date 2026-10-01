'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '@/componentes/Badge'
import { BotaoExcluirFonte } from '@/componentes/BotaoExcluirFonte'
import { Icone } from '@/componentes/Icones'
import { formatarData, formatarTamanho, iconeDoTipo, rotuloDoStatus } from '@/componentes/conhecimento-logica'
import { mensagemDaResposta, serializarFonte, type FonteDaTela } from '@/componentes/fonte-da-tela'
import { ehLinkDoYoutube, formatarDuracao, textoDaEtapa } from '@/componentes/video-logica'

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
  const duracao = formatarDuracao(fonte.duracaoSegundos)
  const etapa = fonte.status === 'processando' ? textoDaEtapa(fonte.etapa, fonte.progresso) : null
  const comBarra = fonte.status === 'processando' && typeof fonte.progresso === 'number'
  // Fonte do YouTube não tem arquivo: mostrar "0 B" não diz nada.
  const tamanho = fonte.tipo === 'youtube' && fonte.tamanhoBytes === 0 ? 'YouTube' : formatarTamanho(fonte.tamanhoBytes)
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
          {tamanho} · {formatarData(fonte.criadoEm)}
          {duracao && ` · ${duracao}`}
          {ehLinkDoYoutube(fonte.urlOrigem) && (
            <>
              {' · '}
              <a className="fonte-origem" href={fonte.urlOrigem} target="_blank" rel="noopener noreferrer">
                Abrir no YouTube
              </a>
            </>
          )}
        </p>
        {comBarra && (
          <progress className="fonte-progresso" max={100} value={fonte.progresso ?? 0} aria-label={`Processando ${fonte.titulo}`}>
            {fonte.progresso}%
          </progress>
        )}
        {etapa && <p className="fonte-etapa">{etapa}</p>}
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
