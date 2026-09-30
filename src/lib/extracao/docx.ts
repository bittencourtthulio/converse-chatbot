// DOCX (PR-10, PR-45): texto bruto com o mammoth, depois de conferir o ZIP
// (zip bomb, entrada cifrada). Só texto: imagens, tabelas e estilos não entram.
import mammoth from 'mammoth'
import { ErroDeAplicacao } from '../erros'
import { conferirDocx } from './zip'

export async function extrairDocx(bytes: Uint8Array): Promise<string> {
  conferirDocx(bytes)
  let texto: string
  try {
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(bytes) })
    texto = value
  } catch {
    throw new ErroDeAplicacao(
      'Não foi possível ler este documento Word. O arquivo pode estar corrompido.',
      422,
      'conteudo_invalido',
    )
  }
  if (texto.trim() === '') {
    throw new ErroDeAplicacao('Este documento Word não tem texto.', 422, 'docx_sem_texto')
  }
  return texto
}
