// Conferência do ZIP de um DOCX antes de entregá-lo ao `mammoth` (PR-45): lê o
// diretório central, exige `word/document.xml`, recusa entrada cifrada e
// descompacta cada entrada de verdade com teto, sem confiar no tamanho
// declarado no cabeçalho (zip bomb). Sem dependência: só `node:zlib`.
import { inflateRawSync } from 'node:zlib'
import { ErroDeAplicacao } from '../erros'
import { LIMITES } from './limites'

const invalido = () =>
  new ErroDeAplicacao('Este arquivo não é um documento Word (.docx) válido.', 422, 'conteudo_invalido')
const cifrado = () =>
  new ErroDeAplicacao(
    'Este documento Word está protegido por senha ou cifrado e não pode ser lido.',
    422,
    'conteudo_invalido',
  )
const comprimidoDemais = () =>
  new ErroDeAplicacao(
    'Este documento Word contém dados comprimidos demais e foi recusado por segurança.',
    422,
    'arquivo_comprimido_demais',
  )

export interface LimitesDoZip {
  descompactadoBytes?: number
  razao?: number
}

const MAX_ENTRADAS = 5000

export function conferirDocx(bytes: Uint8Array, limites: LimitesDoZip = {}): void {
  const teto = limites.descompactadoBytes ?? LIMITES.descompactadoDoDocxBytes
  const razaoMaxima = limites.razao ?? LIMITES.razaoDeCompressao
  const buf = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)

  // Fim do diretório central: nos últimos 64 KB + 22 bytes.
  let fim = -1
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 65535); i -= 1) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      fim = i
      break
    }
  }
  if (fim < 0) throw invalido()
  const total = buf.readUInt16LE(fim + 10)
  const tamanhoCentral = buf.readUInt32LE(fim + 12)
  let cursor = buf.readUInt32LE(fim + 16)
  if (total === 0 || total > MAX_ENTRADAS || cursor === 0xffffffff || cursor + tamanhoCentral > buf.length) {
    throw invalido()
  }

  let temDocumento = false
  let somaReal = 0
  let somaComprimida = 0

  for (let n = 0; n < total; n += 1) {
    if (cursor + 46 > buf.length || buf.readUInt32LE(cursor) !== 0x02014b50) throw invalido()
    const flag = buf.readUInt16LE(cursor + 8)
    const metodo = buf.readUInt16LE(cursor + 10)
    const comprimido = buf.readUInt32LE(cursor + 20)
    const declarado = buf.readUInt32LE(cursor + 24)
    const tamNome = buf.readUInt16LE(cursor + 28)
    const tamExtra = buf.readUInt16LE(cursor + 30)
    const tamComentario = buf.readUInt16LE(cursor + 32)
    const local = buf.readUInt32LE(cursor + 42)
    const nome = buf.subarray(cursor + 46, cursor + 46 + tamNome).toString('utf8')
    cursor += 46 + tamNome + tamExtra + tamComentario

    if (flag & 1) throw cifrado()
    if (metodo !== 0 && metodo !== 8) throw invalido()
    if (nome === 'word/document.xml') temDocumento = true
    if (declarado > teto) throw comprimidoDemais()

    if (local + 30 > buf.length || buf.readUInt32LE(local) !== 0x04034b50) throw invalido()
    const inicio = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28)
    if (inicio + comprimido > buf.length) throw invalido()
    const dados = buf.subarray(inicio, inicio + comprimido)

    let real: number
    if (metodo === 0) {
      real = dados.length
    } else {
      try {
        // O teto restante vale para a entrada: passou dele, é bomba.
        real = inflateRawSync(dados, { maxOutputLength: teto - somaReal + 1 }).length
      } catch (erro) {
        if ((erro as { code?: string }).code === 'ERR_BUFFER_TOO_LARGE') throw comprimidoDemais()
        throw invalido()
      }
    }
    if (real !== declarado) throw invalido() // cabeçalho adulterado
    somaReal += real
    somaComprimida += comprimido
    if (somaReal > teto) throw comprimidoDemais()
  }

  if (!temDocumento) throw invalido()
  if (somaComprimida > 0 && somaReal / somaComprimida > razaoMaxima) throw comprimidoDemais()
}
