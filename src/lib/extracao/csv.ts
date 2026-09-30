// CSV (PR-45): a primeira linha é o cabeçalho e cada registro vira uma linha
// "coluna: valor; coluna: valor", que o modelo entende melhor que células
// soltas. Delimitador `,` ou `;`, campos entre aspas (com "" e quebra de linha).
import { decodificarTexto } from './conteudo'

function detectarDelimitador(texto: string): string {
  let aspas = false
  let virgulas = 0
  let pontoEVirgulas = 0
  for (const c of texto) {
    if (c === '"') aspas = !aspas
    else if (!aspas && c === '\n') break
    else if (!aspas && c === ',') virgulas += 1
    else if (!aspas && c === ';') pontoEVirgulas += 1
  }
  return pontoEVirgulas > virgulas ? ';' : ','
}

function lerLinhas(texto: string, delimitador: string): string[][] {
  const linhas: string[][] = []
  let campo = ''
  let linha: string[] = []
  let aspas = false
  const fecharCampo = () => {
    linha.push(campo)
    campo = ''
  }
  const fecharLinha = () => {
    fecharCampo()
    linhas.push(linha)
    linha = []
  }
  for (let i = 0; i < texto.length; i += 1) {
    const c = texto[i]!
    if (aspas) {
      if (c === '"') {
        if (texto[i + 1] === '"') {
          campo += '"'
          i += 1
        } else aspas = false
      } else campo += c
    } else if (c === '"' && campo === '') aspas = true
    else if (c === delimitador) fecharCampo()
    else if (c === '\n') fecharLinha()
    else campo += c
  }
  if (campo !== '' || linha.length > 0) fecharLinha()
  return linhas
}

const limpar = (valor: string) => valor.replace(/\s*\n\s*/g, ' ').trim()

export function extrairCsv(bytes: Uint8Array): string {
  const texto = decodificarTexto(bytes).replace(/\r\n?/g, '\n')
  const linhas = lerLinhas(texto, detectarDelimitador(texto))
    .map((l) => l.map(limpar))
    .filter((l) => l.some((v) => v !== ''))
  if (linhas.length === 0) return ''
  const cabecalho = linhas[0]!
  const saida = [`Colunas: ${cabecalho.join(', ')}`]
  for (const registro of linhas.slice(1)) {
    const pares: string[] = []
    registro.forEach((valor, i) => {
      if (valor === '') return
      const coluna = cabecalho[i] && cabecalho[i] !== '' ? cabecalho[i] : `coluna ${i + 1}`
      pares.push(`${coluna}: ${valor}`)
    })
    if (pares.length > 0) saida.push(pares.join('; '))
  }
  return saida.join('\n')
}
