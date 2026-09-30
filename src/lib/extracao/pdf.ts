// PDF (PR-10, PR-45): extrai o texto com o unpdf (PDF.js, sem worker externo).
// PDF escaneado, sem camada de texto, é recusado com mensagem clara: OCR não é
// suportado. Qualquer exceção da biblioteca vira frase nossa, sem o texto dela.
import { extractText, getDocumentProxy } from 'unpdf'
import { ErroDeAplicacao } from '../erros'
import { conferirPdf } from './conteudo'
import { LIMITES } from './limites'

export interface OpcoesDePdf {
  maxPaginas?: number
}

export async function extrairPdf(bytes: Uint8Array, opcoes: OpcoesDePdf = {}): Promise<string> {
  conferirPdf(bytes)
  const maximo = opcoes.maxPaginas ?? LIMITES.paginasDoPdf
  // O PDF.js toma posse do buffer; passa uma cópia.
  const copia = new Uint8Array(bytes)
  let pdf: Awaited<ReturnType<typeof getDocumentProxy>> | undefined
  try {
    pdf = await getDocumentProxy(copia)
    if (pdf.numPages > maximo) {
      throw new ErroDeAplicacao(
        `Este PDF tem ${pdf.numPages} páginas e o limite é de ${maximo} páginas.`,
        422,
        'pdf_paginas_demais',
      )
    }
    const { text } = await extractText(pdf, { mergePages: true })
    if (text.trim() === '') {
      throw new ErroDeAplicacao(
        'Este PDF não tem texto selecionável (parece escaneado). OCR não é suportado.',
        422,
        'pdf_sem_texto',
      )
    }
    return text
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao) throw erro
    const nome = (erro as { name?: string }).name
    if (nome === 'PasswordException') {
      throw new ErroDeAplicacao(
        'Este PDF está protegido por senha e não pode ser lido.',
        422,
        'conteudo_invalido',
      )
    }
    throw new ErroDeAplicacao(
      'Não foi possível ler este PDF. O arquivo pode estar corrompido.',
      422,
      'conteudo_invalido',
    )
  } finally {
    // Libera a memória do documento quando a versão do PDF.js oferece `destroy`.
    const liberar = (pdf as unknown as { destroy?: () => Promise<void> } | undefined)?.destroy
    await liberar?.call(pdf)?.catch(() => undefined)
  }
}
