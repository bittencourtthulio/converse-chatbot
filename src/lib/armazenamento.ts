// Armazenamento em disco dos arquivos enviados (PR-11, PR-47): um original por
// fonte em <raiz>/fontes/<agenteId>/<fonteId>/original. Só ids gerados pelo
// servidor entram no caminho, nunca o nome que o usuário enviou (PR-13).
// Sem imports com alias `@/`: a seed também usa este módulo.
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { ErroDeAplicacao } from './erros'

const ID_VALIDO = /^[A-Za-z0-9_-]{1,64}$/
const CAMINHO_RELATIVO = /^fontes\/([A-Za-z0-9_-]{1,64})\/([A-Za-z0-9_-]{1,64})\/original$/

function idInvalido(): ErroDeAplicacao {
  return new ErroDeAplicacao('Identificador inválido para o armazenamento.', 500, 'armazenamento_invalido')
}

function conferirId(id: string): string {
  if (typeof id !== 'string' || !ID_VALIDO.test(id)) throw idInvalido()
  return id
}

export interface Armazenamento {
  /** Grava o original e devolve o caminho relativo à raiz, para guardar no banco. */
  gravar(agenteId: string, fonteId: string, bytes: Uint8Array): Promise<string>
  ler(caminhoRelativo: string): Promise<Buffer>
  apagarFonte(agenteId: string, fonteId: string): Promise<void>
  apagarAgente(agenteId: string): Promise<void>
}

/** `raiz` é injetável: os testes passam um diretório temporário. */
export function criarArmazenamento(raiz: string): Armazenamento {
  const base = path.resolve(raiz)

  // Segunda barreira, além do alfabeto dos ids: o caminho final tem de ficar dentro da raiz.
  const dentroDaRaiz = (alvo: string): string => {
    const resolvido = path.resolve(base, alvo)
    if (resolvido !== base && !resolvido.startsWith(base + path.sep)) throw idInvalido()
    return resolvido
  }

  return {
    async gravar(agenteId, fonteId, bytes) {
      const relativo = `fontes/${conferirId(agenteId)}/${conferirId(fonteId)}/original`
      const destino = dentroDaRaiz(relativo)
      const diretorio = path.dirname(destino)
      await mkdir(diretorio, { recursive: true, mode: 0o700 })
      // Arquivo temporário e renomeação: quem lê nunca vê o original pela metade.
      const temporario = `${destino}.parcial`
      await writeFile(temporario, bytes, { mode: 0o600 })
      await rename(temporario, destino)
      return relativo
    },

    async ler(caminhoRelativo) {
      if (typeof caminhoRelativo !== 'string' || !CAMINHO_RELATIVO.test(caminhoRelativo)) {
        throw idInvalido()
      }
      try {
        return await readFile(dentroDaRaiz(caminhoRelativo))
      } catch (erro) {
        if (erro instanceof ErroDeAplicacao) throw erro
        throw new ErroDeAplicacao(
          'O arquivo original desta fonte não foi encontrado no armazenamento.',
          404,
          'arquivo_ausente',
        )
      }
    },

    async apagarFonte(agenteId, fonteId) {
      const alvo = dentroDaRaiz(`fontes/${conferirId(agenteId)}/${conferirId(fonteId)}`)
      await rm(alvo, { recursive: true, force: true })
    },

    async apagarAgente(agenteId) {
      const alvo = dentroDaRaiz(`fontes/${conferirId(agenteId)}`)
      await rm(alvo, { recursive: true, force: true })
    },
  }
}
