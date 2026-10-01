'use client'

import { useState } from 'react'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { FontesDaResposta } from '@/componentes/FontesDaResposta'
import { TextoDoModelo } from '@/componentes/TextoDoModelo'
import { formatarAtividade } from '@/componentes/conversas-logica'
import { abrirFonte, alternarAberta, fonteDoNumero, idDoChip, numerosDeReferencia } from '@/componentes/fontes-da-resposta-logica'
import type { FonteDaResposta } from '@/componentes/leitor-de-sse'

export interface MensagemDaTranscricao {
  id: string
  papel: 'user' | 'assistant'
  conteudo: string
  /** Texto ISO: a data cruza do servidor para o navegador. */
  criadoEm: string
  modelo: string | null
  fontes: FonteDaResposta[]
}

function Mensagem({ mensagem, quemFala }: { mensagem: MensagemDaTranscricao; quemFala: string }) {
  const [abertas, setAbertas] = useState<string[]>([])
  const doUsuario = mensagem.papel === 'user'
  const idBase = `mensagem-${mensagem.id}`
  const aoReferenciar = (n: number) => {
    const fonteId = fonteDoNumero(mensagem.fontes, n)
    if (!fonteId) return
    setAbertas((atuais) => abrirFonte(atuais, fonteId))
    requestAnimationFrame(() => document.getElementById(idDoChip(idBase, fonteId))?.focus())
  }
  return (
    <li className={`transcricao-item ${doUsuario ? 'transcricao-item-usuario' : 'transcricao-item-agente'}`}>
      <div className={`bolha ${doUsuario ? 'bolha-usuario' : 'bolha-agente'}`}>
        <span className="somente-leitor">{`${quemFala}: `}</span>
        {doUsuario ? (
          // Texto de visitante: só texto, com as quebras de linha, nunca HTML.
          <p className="bolha-texto-simples">{mensagem.conteudo}</p>
        ) : (
          <TextoDoModelo texto={mensagem.conteudo} referencias={numerosDeReferencia(mensagem.fontes)} aoReferenciar={aoReferenciar} />
        )}
        {!doUsuario && mensagem.fontes.length > 0 && (
          <FontesDaResposta
            fontes={mensagem.fontes}
            idBase={idBase}
            abertas={abertas}
            aoAlternar={(fonteId) => setAbertas((atuais) => alternarAberta(atuais, fonteId))}
          />
        )}
      </div>
      <p className="horario-da-mensagem">
        <time dateTime={mensagem.criadoEm}>{formatarAtividade(mensagem.criadoEm)}</time>
        {!doUsuario && mensagem.modelo && <span> · {mensagem.modelo}</span>}
      </p>
    </li>
  )
}

/**
 * A transcrição da conversa em bolhas, com o horário de cada mensagem e, nas respostas do
 * agente, as fontes consultadas (componente da FT-05). O conteúdo é de terceiros e não
 * confiável: passa só por React e pelo analisador seguro, nunca como HTML.
 */
export function TranscricaoDaConversa({
  mensagens,
  rotulo,
  agenteNome,
}: {
  mensagens: MensagemDaTranscricao[]
  rotulo: string
  agenteNome: string
}) {
  if (mensagens.length === 0) {
    return (
      <EstadoVazio
        icone="conversa"
        titulo="Esta conversa não tem mensagens"
        descricao="Ela foi aberta, mas nenhuma mensagem foi gravada."
      />
    )
  }
  return (
    <ol className="transcricao" aria-label="Mensagens da conversa">
      {mensagens.map((m) => (
        <Mensagem key={m.id} mensagem={m} quemFala={m.papel === 'user' ? rotulo : agenteNome} />
      ))}
    </ol>
  )
}
