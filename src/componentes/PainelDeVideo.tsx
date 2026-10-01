'use client'

import { useState, type KeyboardEvent } from 'react'
import { FormularioDoYoutube } from '@/componentes/FormularioDoYoutube'
import { ZonaDeVideo } from '@/componentes/ZonaDeVideo'

const ABAS = [
  { id: 'arquivo', rotulo: 'Enviar arquivo' },
  { id: 'youtube', rotulo: 'Link do YouTube' },
] as const

/** O painel da opção Vídeo: duas abas internas, enviar arquivo (vídeo ou áudio) e colar um link do YouTube. */
export function PainelDeVideo({
  agenteId,
  limiteDeVideoBytes,
  limiteDeVideoMinutos,
  modeloDeTranscricao,
  aoAlterar,
}: {
  agenteId: string
  limiteDeVideoBytes: number
  limiteDeVideoMinutos: number
  modeloDeTranscricao: string
  aoAlterar: () => void
}) {
  const [aba, setAba] = useState<(typeof ABAS)[number]['id']>('arquivo')

  function aoTeclar(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    setAba(aba === 'arquivo' ? 'youtube' : 'arquivo')
    e.preventDefault()
  }

  return (
    <div className="pilha">
      <div className="opcoes-de-fonte" role="tablist" aria-label="Como adicionar o vídeo" onKeyDown={aoTeclar}>
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={a.id === aba}
            aria-controls={`painel-video-${a.id}`}
            id={`aba-video-${a.id}`}
            tabIndex={a.id === aba ? 0 : -1}
            className="opcao-de-fonte"
            onClick={() => setAba(a.id)}
          >
            {a.rotulo}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`painel-video-${aba}`} aria-labelledby={`aba-video-${aba}`}>
        {aba === 'arquivo' ? (
          <ZonaDeVideo
            agenteId={agenteId}
            limiteDeVideoBytes={limiteDeVideoBytes}
            limiteDeVideoMinutos={limiteDeVideoMinutos}
            modeloDeTranscricao={modeloDeTranscricao}
            aoAlterar={aoAlterar}
          />
        ) : (
          <FormularioDoYoutube agenteId={agenteId} aoAlterar={aoAlterar} />
        )}
      </div>
    </div>
  )
}
