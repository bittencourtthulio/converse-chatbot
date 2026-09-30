'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AdicionarFontes } from '@/componentes/AdicionarFontes'
import { Alerta } from '@/componentes/Alerta'
import { CartoesDeResumo } from '@/componentes/CartoesDeResumo'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { LinhaDeFonte } from '@/componentes/LinhaDeFonte'
import { TestarBusca } from '@/componentes/TestarBusca'
import { INTERVALO_DO_POLLING_MS, deveContinuarPolling } from '@/componentes/conhecimento-logica'
import { serializarFonte, type FonteDaTela, type ResumoDaTela } from '@/componentes/fonte-da-tela'

/**
 * O corpo da aba Conhecimento: resumo, lista de fontes e, enquanto houver fonte
 * `pendente` ou `processando`, atualização a cada 2 s (pára sozinha quando não
 * houver mais). É o único lugar da tela com `fetch` (PR-49).
 */
export function PainelDeConhecimento({
  agenteId,
  fontesIniciais,
  resumoInicial,
  limiteDeUploadBytes,
}: {
  agenteId: string
  fontesIniciais: FonteDaTela[]
  resumoInicial: ResumoDaTela
  /** Limite de tamanho por arquivo, em bytes, para a área de adicionar. */
  limiteDeUploadBytes: number
}) {
  const [fontes, setFontes] = useState<FonteDaTela[]>(fontesIniciais)
  const [resumo, setResumo] = useState<ResumoDaTela>(resumoInicial)
  const [erroDeAtualizacao, setErroDeAtualizacao] = useState<string | null>(null)
  // Conta cada tentativa de atualização, certa ou errada: é o que reagenda o polling.
  const [tentativas, setTentativas] = useState(0)
  const emVoo = useRef(false)

  const atualizar = useCallback(async () => {
    if (emVoo.current) return
    emVoo.current = true
    try {
      const r = await fetch(`/api/agentes/${agenteId}/fontes`, { cache: 'no-store' })
      if (!r.ok) throw new Error('resposta')
      const corpo = (await r.json()) as { fontes: FonteDaTela[]; resumo: ResumoDaTela }
      setFontes(corpo.fontes.map(serializarFonte))
      setResumo(corpo.resumo)
      setErroDeAtualizacao(null)
    } catch {
      setErroDeAtualizacao('Não foi possível atualizar a lista agora. Vamos tentar de novo.')
    } finally {
      emVoo.current = false
      setTentativas((n) => n + 1)
    }
  }, [agenteId])

  // Polling por temporizador encadeado: a próxima espera só começa depois da resposta.
  const continuar = deveContinuarPolling(fontes)
  useEffect(() => {
    if (!continuar) return
    const espera = setTimeout(() => void atualizar(), INTERVALO_DO_POLLING_MS)
    return () => clearTimeout(espera)
  }, [continuar, tentativas, atualizar])

  const aoMudar = (nova: FonteDaTela) => {
    setFontes((atuais) => atuais.map((f) => (f.id === nova.id ? nova : f)))
    void atualizar()
  }
  const aoExcluir = (id: string) => {
    setFontes((atuais) => atuais.filter((f) => f.id !== id))
    void atualizar()
  }

  const processando = fontes.filter((f) => f.status === 'pendente' || f.status === 'processando').length

  return (
    <div className="pilha">
      <CartoesDeResumo resumo={resumo} />

      <AdicionarFontes agenteId={agenteId} limiteDeUploadBytes={limiteDeUploadBytes} aoAlterar={() => void atualizar()} />

      <TestarBusca agenteId={agenteId} />

      {erroDeAtualizacao && <Alerta variante="erro">{erroDeAtualizacao}</Alerta>}

      <section className="cartao" aria-labelledby="titulo-das-fontes">
        <div className="cartao-corpo">
          <div className="linha linha-entre">
            <h2 className="secao-titulo sem-margem" id="titulo-das-fontes">
              Fontes
            </h2>
            <p className="texto-de-apoio sem-margem" role="status" aria-live="polite">
              {processando > 0
                ? `${processando} ${processando === 1 ? 'fonte em processamento' : 'fontes em processamento'}. A lista atualiza sozinha.`
                : ''}
            </p>
          </div>

          {fontes.length === 0 ? (
            <EstadoVazio
              icone="arquivo"
              titulo="Nenhuma fonte ainda"
              descricao="Envie arquivos ou cole um texto para o agente aprender com o seu conteúdo."
            />
          ) : (
            <ul className="lista-de-fontes" aria-label="Fontes da base">
              {fontes.map((f) => (
                <LinhaDeFonte key={f.id} fonte={f} aoMudar={aoMudar} aoExcluir={aoExcluir} />
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
