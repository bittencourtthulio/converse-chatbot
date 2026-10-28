'use client'

import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { Icone } from '@/componentes/Icones'
import { FormularioDePerguntaResposta } from '@/componentes/FormularioDePerguntaResposta'
import { FormularioDeTexto } from '@/componentes/FormularioDeTexto'
import { PainelDeVideo } from '@/componentes/PainelDeVideo'
import { ZonaDeArquivos } from '@/componentes/ZonaDeArquivos'
import { OPCOES_DE_FONTE } from '@/componentes/opcoes-de-fonte'

interface PropsDoPainel {
  agenteId: string
  limiteDeUploadBytes: number
  /** Vídeo e áudio (FT-08): limites e o modelo que transcreve, para a tela avisar do custo. */
  limiteDeVideoBytes: number
  limiteDeVideoMinutos: number
  modeloDeTranscricao: string
  aoAlterar: () => void
}

// O painel de cada opção de `opcoes-de-fonte.ts`, pelo id.
const PAINEIS: Record<string, (p: PropsDoPainel) => ReactNode> = {
  pergunta_resposta: (p) => <FormularioDePerguntaResposta agenteId={p.agenteId} aoAlterar={p.aoAlterar} />,
  arquivos: (p) => <ZonaDeArquivos agenteId={p.agenteId} limiteDeUploadBytes={p.limiteDeUploadBytes} aoAlterar={p.aoAlterar} />,
  texto: (p) => <FormularioDeTexto agenteId={p.agenteId} aoAlterar={p.aoAlterar} />,
  video: (p) => (
    <PainelDeVideo
      agenteId={p.agenteId}
      limiteDeVideoBytes={p.limiteDeVideoBytes}
      limiteDeVideoMinutos={p.limiteDeVideoMinutos}
      modeloDeTranscricao={p.modeloDeTranscricao}
      aoAlterar={p.aoAlterar}
    />
  ),
}

/** A seção "Adicionar": uma aba por opção de fonte, arquivos primeiro. */
export function AdicionarFontes(props: PropsDoPainel) {
  const [escolhida, setEscolhida] = useState(OPCOES_DE_FONTE[0]!.id)
  const opcoes = OPCOES_DE_FONTE.filter((o) => PAINEIS[o.id])
  const atual = opcoes.find((o) => o.id === escolhida) ?? opcoes[0]!

  function aoTeclar(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const posicao = opcoes.findIndex((o) => o.id === atual.id)
    const proxima = (posicao + (e.key === 'ArrowRight' ? 1 : opcoes.length - 1)) % opcoes.length
    setEscolhida(opcoes[proxima]!.id)
    e.preventDefault()
  }

  return (
    <section className="cartao" aria-labelledby="titulo-adicionar">
      <div className="cartao-corpo pilha">
        <h2 className="secao-titulo sem-margem" id="titulo-adicionar">
          Adicionar ao conhecimento
        </h2>
        <div className="opcoes-de-fonte" role="tablist" aria-label="Como adicionar" onKeyDown={aoTeclar}>
          {opcoes.map((o) => (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={o.id === atual.id}
              aria-controls={`painel-${o.id}`}
              id={`aba-${o.id}`}
              tabIndex={o.id === atual.id ? 0 : -1}
              className="opcao-de-fonte"
              onClick={() => setEscolhida(o.id)}
            >
              <Icone nome={o.icone} tamanho={18} />
              {o.rotulo}
            </button>
          ))}
        </div>
        <p className="texto-de-apoio sem-margem">{atual.descricao}</p>
        <div role="tabpanel" id={`painel-${atual.id}`} aria-labelledby={`aba-${atual.id}`}>
          {PAINEIS[atual.id]!(props)}
        </div>
      </div>
    </section>
  )
}
