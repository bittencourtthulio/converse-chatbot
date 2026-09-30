import { Icone } from '@/componentes/Icones'
import {
  idDoChip,
  idDosTrechos,
  resumoDasConsultadas,
  separarFontes,
} from '@/componentes/fontes-da-resposta-logica'
import type { FonteDaResposta } from '@/componentes/leitor-de-sse'

interface Props {
  fontes: FonteDaResposta[]
  /** Distingue os ids desta resposta dos de outras na mesma página. */
  idBase: string
  /** Ids das fontes com o trecho expandido. */
  abertas: string[]
  aoAlternar: (fonteId: string) => void
}

function ItemDeFonte({ fonte, idBase, aberta, aoAlternar }: { fonte: FonteDaResposta; idBase: string; aberta: boolean; aoAlternar: (fonteId: string) => void }) {
  const idTrechos = idDosTrechos(idBase, fonte.fonteId)
  return (
    <li className="fonte-item">
      <button
        type="button"
        id={idDoChip(idBase, fonte.fonteId)}
        className={fonte.citada ? 'chip-de-fonte chip-de-fonte-citada' : 'chip-de-fonte'}
        aria-expanded={aberta}
        aria-controls={aberta ? idTrechos : undefined}
        onClick={() => aoAlternar(fonte.fonteId)}
      >
        <Icone nome="arquivo" tamanho={14} />
        <span className="chip-de-fonte-titulo">{fonte.titulo}</span>
        {fonte.citada && (
          <>
            <span className="chip-de-fonte-numeros" aria-hidden="true">
              {fonte.trechos.map((t) => `[${t.n}]`).join(' ')}
            </span>
            <span className="somente-leitor"> (citada na resposta)</span>
          </>
        )}
      </button>
      {aberta && (
        <div id={idTrechos} className="fonte-trechos" role="region" aria-label={`Trechos usados de ${fonte.titulo}`}>
          {fonte.trechos.map((t) => (
            <blockquote key={t.n} className="fonte-trecho">
              <p className="fonte-trecho-rotulo">
                Trecho {t.posicao} · [{t.n}]
              </p>
              <p className="fonte-trecho-texto">{t.trechoTexto}</p>
            </blockquote>
          ))}
        </div>
      )}
    </li>
  )
}

/**
 * De onde veio a resposta (FT-05): as fontes citadas como chips em destaque, as
 * apenas consultadas numa seção recolhida, e o trecho usado expansível. Todo
 * texto passa pelo React, que o escapa.
 */
export function FontesDaResposta({ fontes, idBase, abertas, aoAlternar }: Props) {
  if (fontes.length === 0) return null
  const { citadas, consultadas } = separarFontes(fontes)
  const itens = (lista: FonteDaResposta[]) =>
    lista.map((f) => (
      <ItemDeFonte key={f.fonteId} fonte={f} idBase={idBase} aberta={abertas.includes(f.fonteId)} aoAlternar={aoAlternar} />
    ))
  return (
    <section className="fontes-da-resposta" aria-label="Fontes da resposta">
      <p className="fontes-titulo">Fontes</p>
      {citadas.length > 0 && <ul className="fontes-lista">{itens(citadas)}</ul>}
      {consultadas.length > 0 && (
        <details className="fontes-consultadas">
          <summary>{resumoDasConsultadas(consultadas.length)}</summary>
          <ul className="fontes-lista">{itens(consultadas)}</ul>
        </details>
      )}
    </section>
  )
}
