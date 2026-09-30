'use client'

import { useRef, useState } from 'react'
import { copiarTexto, type ResultadoDoCopiar } from '@/componentes/publicar-logica'

const MENSAGENS: Record<ResultadoDoCopiar, string> = {
  copiado: 'Código copiado.',
  selecionado: 'Não foi possível copiar sozinho: o código está selecionado. Copie com Ctrl+C (ou Cmd+C).',
  falhou: 'Não foi possível copiar. Selecione o código e copie com o teclado.',
}

/**
 * O trecho de uma linha que o usuário cola no site (PR-62), com o botão Copiar.
 * Sem `navigator.clipboard` (página sem HTTPS, navegador antigo) ou com a cópia
 * negada, o botão seleciona o texto para copiar com o teclado.
 */
export function CodigoParaIncorporar({ snippet }: { snippet: string }) {
  const bloco = useRef<HTMLPreElement>(null)
  const [resultado, setResultado] = useState<ResultadoDoCopiar | null>(null)

  function selecionar(): boolean {
    const no = bloco.current
    const selecao = typeof window !== 'undefined' ? window.getSelection() : null
    if (!no || !selecao) return false
    const faixa = document.createRange()
    faixa.selectNodeContents(no)
    selecao.removeAllRanges()
    selecao.addRange(faixa)
    return true
  }

  async function copiar() {
    setResultado(await copiarTexto(snippet, typeof navigator === 'undefined' ? null : navigator.clipboard, selecionar))
  }

  return (
    <section className="cartao" aria-labelledby="titulo-do-codigo">
      <div className="cartao-corpo codigo-para-incorporar">
        <h2 className="secao-titulo sem-margem" id="titulo-do-codigo">
          Código para incorporar
        </h2>
        <pre className="codigo-bloco" ref={bloco} tabIndex={0} aria-label="Código para colar no site">
          <code>{snippet}</code>
        </pre>
        <div className="codigo-acoes">
          <button type="button" className="botao secundario" onClick={() => void copiar()}>
            Copiar código
          </button>
          <span role="status" aria-live="polite" className="texto-de-apoio">
            {resultado ? MENSAGENS[resultado] : ''}
          </span>
        </div>
        <ol className="codigo-instrucoes">
          <li>
            Cole o código nas páginas do seu site, logo antes de <code>&lt;/body&gt;</code>.
          </li>
          <li>
            Em produção o site e o endereço acima precisam usar HTTPS; o chat só aparece nos domínios permitidos.
          </li>
          <li>
            Opcional: <code>data-position=&quot;esquerda&quot;</code> e <code>data-color=&quot;#rrggbb&quot;</code> no
            código mudam o botão só naquela página.
          </li>
        </ol>
      </div>
    </section>
  )
}
