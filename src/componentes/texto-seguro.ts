// Texto do modelo como dado, nunca como HTML (PR-13, PR-15). O analisador
// entende só o mínimo — parágrafos, listas, bloco de código, negrito, código em
// linha e link — e devolve uma árvore que `TextoDoModelo` transforma em
// elementos React. Nada aqui produz HTML em texto: o React escapa tudo.

export type Inline =
  | { tipo: 'texto'; texto: string }
  | { tipo: 'negrito'; filhos: Inline[] }
  | { tipo: 'codigo'; texto: string }
  | { tipo: 'link'; href: string; filhos: Inline[] }

export type Bloco =
  | { tipo: 'paragrafo'; filhos: Inline[] }
  | { tipo: 'lista'; ordenada: boolean; itens: Inline[][] }
  | { tipo: 'bloco-de-codigo'; linguagem: string | null; texto: string }

/** O endereço, se for http ou https; senão `null`. */
export function urlSegura(href: string): string | null {
  try {
    const url = new URL(href)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

const INLINE = /`([^`\n]+)`|\*\*([^*\n]+)\*\*|\[([^\]\n]+)\]\(([^)\s]+)\)/g

export function analisarInline(texto: string): Inline[] {
  const saida: Inline[] = []
  let ultimo = 0
  const acrescentarTexto = (t: string) => {
    if (t === '') return
    const anterior = saida.at(-1)
    if (anterior?.tipo === 'texto') anterior.texto += t
    else saida.push({ tipo: 'texto', texto: t })
  }
  for (const m of texto.matchAll(INLINE)) {
    acrescentarTexto(texto.slice(ultimo, m.index))
    ultimo = m.index + m[0].length
    if (m[1] !== undefined) saida.push({ tipo: 'codigo', texto: m[1] })
    else if (m[2] !== undefined) saida.push({ tipo: 'negrito', filhos: analisarInline(m[2]) })
    else {
      const href = urlSegura(m[4]!)
      // Esquema que não é http nem https não vira link: fica o texto original.
      if (href) saida.push({ tipo: 'link', href, filhos: analisarInline(m[3]!) })
      else acrescentarTexto(m[0])
    }
  }
  acrescentarTexto(texto.slice(ultimo))
  return saida
}

const ITEM_DE_LISTA = /^\s{0,3}(?:([-*+])|(\d{1,9})[.)])\s+(.*)$/
const CERCA = /^\s{0,3}```\s*([\w+-]*)\s*$/
const TITULO = /^\s{0,3}#{1,6}\s+(.*)$/

/** Blocos do texto. Uma cerca de código aberta e não fechada vai até o fim (streaming). */
export function analisarTexto(texto: string): Bloco[] {
  const linhas = texto.replace(/\r\n?/g, '\n').split('\n')
  const blocos: Bloco[] = []
  let paragrafo: string[] = []
  const fecharParagrafo = () => {
    if (paragrafo.length > 0) {
      blocos.push({ tipo: 'paragrafo', filhos: analisarInline(paragrafo.join('\n')) })
      paragrafo = []
    }
  }

  for (let i = 0; i < linhas.length; i += 1) {
    const linha = linhas[i]!
    const cerca = CERCA.exec(linha)
    if (cerca) {
      fecharParagrafo()
      const codigo: string[] = []
      i += 1
      while (i < linhas.length && !CERCA.test(linhas[i]!)) {
        codigo.push(linhas[i]!)
        i += 1
      }
      blocos.push({ tipo: 'bloco-de-codigo', linguagem: cerca[1] || null, texto: codigo.join('\n') })
      continue
    }
    if (linha.trim() === '') {
      fecharParagrafo()
      continue
    }
    const item = ITEM_DE_LISTA.exec(linha)
    if (item) {
      fecharParagrafo()
      const ordenada = item[2] !== undefined
      const itens: Inline[][] = []
      for (; i < linhas.length; i += 1) {
        const proximo = ITEM_DE_LISTA.exec(linhas[i]!)
        if (!proximo || (proximo[2] !== undefined) !== ordenada) break
        itens.push(analisarInline(proximo[3]!))
      }
      i -= 1
      blocos.push({ tipo: 'lista', ordenada, itens })
      continue
    }
    const titulo = TITULO.exec(linha)
    if (titulo) {
      fecharParagrafo()
      blocos.push({ tipo: 'paragrafo', filhos: [{ tipo: 'negrito', filhos: analisarInline(titulo[1]!) }] })
      continue
    }
    paragrafo.push(linha)
  }
  fecharParagrafo()
  return blocos
}
