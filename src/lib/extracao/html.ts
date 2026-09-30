// HTML (PR-45): texto visível, com títulos, parágrafos e listas. Usa o parse5
// (analisador da especificação WHATWG), que só monta uma árvore: nada é
// executado nem buscado. script, style, nav, noscript, head, template, iframe,
// svg, object, canvas e comentários ficam de fora.
import { parse } from 'parse5'
import { decodificarTexto } from './conteudo'

interface No {
  nodeName: string
  tagName?: string
  value?: string
  childNodes?: No[]
  content?: { childNodes?: No[] }
}

const IGNORADOS = new Set([
  'script', 'style', 'nav', 'noscript', 'head', 'template', 'iframe', 'svg', 'object', 'canvas', 'embed', 'audio', 'video',
])
const BLOCOS = new Set([
  'p', 'div', 'section', 'article', 'main', 'header', 'footer', 'aside', 'blockquote', 'pre', 'ul', 'ol', 'table',
  'figure', 'figcaption', 'form', 'fieldset', 'details', 'summary', 'address', 'dl', 'dt', 'dd',
])
const TITULO = /^h([1-6])$/

class Coletor {
  blocos: string[] = []
  linha = ''

  fechar(): void {
    const texto = this.linha.replace(/[ \t\r\f\v]+/g, ' ').replace(/ ?\n ?/g, '\n').trim()
    if (texto) this.blocos.push(texto)
    this.linha = ''
  }

  percorrer(no: No): void {
    if (no.nodeName === '#text') {
      this.linha += (no.value ?? '').replace(/\s+/g, ' ')
      return
    }
    if (no.nodeName.startsWith('#') && no.nodeName !== '#document') return // comentário, doctype
    const tag = no.tagName?.toLowerCase()
    if (tag && IGNORADOS.has(tag)) return

    if (tag === 'br') {
      this.linha += '\n'
      return
    }
    const titulo = tag ? TITULO.exec(tag) : null
    if (titulo) {
      this.fechar()
      this.linha = `${'#'.repeat(Number(titulo[1]))} `
      this.filhos(no)
      this.fechar()
      return
    }
    if (tag === 'li') {
      this.fechar()
      this.linha = '- '
      this.filhos(no)
      this.fechar()
      return
    }
    if (tag === 'tr') {
      this.fechar()
      const celulas: string[] = []
      for (const filho of no.childNodes ?? []) {
        if (filho.tagName === 'td' || filho.tagName === 'th') {
          const interno = new Coletor()
          interno.filhos(filho)
          interno.fechar()
          const texto = interno.blocos.join(' ').trim()
          if (texto) celulas.push(texto)
        }
      }
      if (celulas.length > 0) this.blocos.push(celulas.join(' | '))
      return
    }
    if (tag === 'td' || tag === 'th') {
      this.filhos(no)
      this.linha += ' '
      return
    }
    const bloco = tag !== undefined && BLOCOS.has(tag)
    if (bloco) this.fechar()
    this.filhos(no)
    if (bloco) this.fechar()
  }

  filhos(no: No): void {
    const lista = no.childNodes ?? no.content?.childNodes ?? []
    for (const filho of lista) this.percorrer(filho)
  }
}

export function extrairHtml(bytes: Uint8Array): string {
  const documento = parse(decodificarTexto(bytes)) as unknown as No
  const coletor = new Coletor()
  coletor.percorrer(documento)
  coletor.fechar()
  // Itens de uma mesma lista ficam juntos, sem linha em branco no meio.
  const saida: string[] = []
  for (const bloco of coletor.blocos) {
    const anterior = saida[saida.length - 1]
    if (bloco.startsWith('- ') && anterior?.startsWith('- ')) saida[saida.length - 1] = `${anterior}\n${bloco}`
    else saida.push(bloco)
  }
  return saida.join('\n\n')
}
