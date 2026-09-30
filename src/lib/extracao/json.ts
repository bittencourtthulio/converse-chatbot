// JSON (PR-45): achatado em uma linha "caminho: valor" por folha, com caminhos
// como a.b[0].c. Vazios (texto, lista, objeto e null) não geram linha.
import { ErroDeAplicacao } from '../erros'
import { decodificarTexto } from './conteudo'

const CHAVE_SIMPLES = /^[A-Za-z_][A-Za-z0-9_]*$/
const PROFUNDIDADE_MAXIMA = 200

function achatar(valor: unknown, caminho: string, saida: string[], profundidade: number): void {
  if (profundidade > PROFUNDIDADE_MAXIMA || valor === null || valor === undefined) return
  if (Array.isArray(valor)) {
    valor.forEach((item, i) => achatar(item, `${caminho}[${i}]`, saida, profundidade + 1))
    return
  }
  if (typeof valor === 'object') {
    for (const [chave, item] of Object.entries(valor as Record<string, unknown>)) {
      const parte = CHAVE_SIMPLES.test(chave) ? (caminho === '' ? chave : `.${chave}`) : `[${JSON.stringify(chave)}]`
      achatar(item, caminho + parte, saida, profundidade + 1)
    }
    return
  }
  const texto = String(valor).replace(/\s*\n\s*/g, ' ').trim()
  if (texto === '') return
  saida.push(caminho === '' ? texto : `${caminho}: ${texto}`)
}

export function extrairJson(bytes: Uint8Array): string {
  let raiz: unknown
  try {
    raiz = JSON.parse(decodificarTexto(bytes))
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao) throw erro
    throw new ErroDeAplicacao('O arquivo JSON é inválido: não foi possível ler a estrutura.', 422, 'conteudo_invalido')
  }
  const saida: string[] = []
  achatar(raiz, '', saida, 0)
  return saida.join('\n')
}
