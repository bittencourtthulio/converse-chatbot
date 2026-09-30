// Divisão do texto extraído em trechos (PR-46): função pura e determinística.
// Cada trecho tem até `alvo` caracteres (1000), com sobreposição de cerca de
// `sobreposicao` (150) com o anterior, e corta de preferência em quebra de
// parágrafo, depois de frase, entre palavras e, só por último, no meio de uma
// palavra. Sem imports com alias `@/`: a seed também usa este módulo.

export interface OpcoesDeTrechos {
  alvo?: number
  sobreposicao?: number
}

export interface TrechoComPosicao {
  texto: string
  /** Posição no texto normalizado (`normalizarTexto`), fim exclusivo. */
  inicio: number
  fim: number
}

export const ALVO_DO_TRECHO = 1000
export const SOBREPOSICAO_DO_TRECHO = 150

/** CRLF viram LF, três quebras ou mais viram duas, e as pontas são aparadas. */
export function normalizarTexto(texto: string): string {
  return texto.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

const ESPACO = /\s/

function melhorCorte(texto: string, inicio: number, limite: number, minimo: number): number {
  // 1. Quebra de parágrafo.
  // (Só dentro da janela: lastIndexOf sobre o texto todo varreria até o começo.)
  const naJanela = texto.slice(minimo, limite).lastIndexOf('\n\n')
  if (naJanela >= 0 && minimo + naJanela > inicio) return minimo + naJanela
  // 2. Depois de uma frase: pontuação final seguida de espaço.
  for (let i = limite - 1; i >= minimo; i -= 1) {
    const c = texto[i]!
    if (ESPACO.test(c) && i > inicio) {
      let j = i - 1
      while (j > inicio && /["')\]]/.test(texto[j]!)) j -= 1
      if (/[.!?…]/.test(texto[j]!)) return i
    }
  }
  // 3. Entre palavras: o último espaço da janela.
  for (let i = limite - 1; i > inicio; i -= 1) {
    if (ESPACO.test(texto[i]!)) return i
  }
  // 4. Palavra maior que a janela: corta onde der.
  return limite
}

export function dividirComPosicoes(bruto: string, opcoes: OpcoesDeTrechos = {}): TrechoComPosicao[] {
  const alvo = opcoes.alvo ?? ALVO_DO_TRECHO
  const sobreposicao = Math.min(opcoes.sobreposicao ?? SOBREPOSICAO_DO_TRECHO, Math.floor(alvo / 2))
  const texto = normalizarTexto(bruto)
  const saida: TrechoComPosicao[] = []
  let inicio = 0

  const cortarEm = (de: number): number => {
    const limite = Math.min(de + alvo, texto.length)
    return limite === texto.length ? limite : melhorCorte(texto, de, limite, de + Math.floor(alvo / 2))
  }

  while (inicio < texto.length) {
    const corte = cortarEm(inicio)
    // Apara o espaço nas duas pontas sem tirar o trecho da janela.
    let a = inicio
    let b = corte
    while (a < b && ESPACO.test(texto[a]!)) a += 1
    while (b > a && ESPACO.test(texto[b - 1]!)) b -= 1
    if (b > a) saida.push({ texto: texto.slice(a, b), inicio: a, fim: b })
    if (corte >= texto.length) break

    // Próximo início: volta `sobreposicao` e avança até o começo de uma palavra.
    let proximo = corte - sobreposicao
    if (proximo <= inicio) proximo = corte
    else {
      let k = proximo
      while (k < corte && !ESPACO.test(texto[k]!)) k += 1
      // Achou fim de palavra: começa depois do espaço. Sem espaço até o corte
      // (palavra gigante), mantém a sobreposição exata.
      if (k < corte) {
        while (k < corte && ESPACO.test(texto[k]!)) k += 1
        proximo = k
      }
    }
    // Uma sobreposição que não leva a nada novo (o próximo corte cai no mesmo
    // lugar, como antes de uma palavra gigante) seria um trecho repetido.
    if (proximo !== corte && cortarEm(proximo) <= corte) proximo = corte
    // Garante avanço mesmo em casos degenerados.
    inicio = proximo > inicio ? proximo : corte
  }
  return saida
}

export function dividirEmTrechos(texto: string, opcoes?: OpcoesDeTrechos): string[] {
  return dividirComPosicoes(texto, opcoes).map((t) => t.texto)
}
