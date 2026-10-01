// Armazenamento em disco dos arquivos enviados (PR-11, PR-47): um original por
// fonte em <raiz>/fontes/<agenteId>/<fonteId>/original. Só ids gerados pelo
// servidor entram no caminho, nunca o nome que o usuário enviou (PR-13).
// Sem imports com alias `@/`: a seed também usa este módulo.
import { mkdir, open, readFile, rename, rm, writeFile } from 'node:fs/promises'
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

    async gravarDeStream(agenteId, fonteId, corpo, opcoes) {
      const relativo = `fontes/${conferirId(agenteId)}/${conferirId(fonteId)}/original`
      const destino = dentroDaRaiz(relativo)
      await mkdir(path.dirname(destino), { recursive: true, mode: 0o700 })
      const parcial = `${destino}.parcial`
      const leitor = corpo.getReader()
      const necessarios = opcoes.bytesDeInicio ?? 16
      let inicio = Buffer.alloc(0)
      let conferido = false
      let total = 0
      const arquivo = await open(parcial, 'w', 0o600)
      try {
        for (;;) {
          const { done, value } = await leitor.read()
          if (done) break
          total += value.length
          if (total > opcoes.maxBytes) {
            throw new ErroDeAplicacao(
              `O arquivo passa do limite de ${Math.floor(opcoes.maxBytes / (1024 * 1024))} MB.`,
              413,
              'arquivo_grande_demais',
            )
          }
          if (!conferido) {
            inicio = Buffer.concat([inicio, value.subarray(0, necessarios - inicio.length)])
            if (inicio.length >= necessarios) {
              opcoes.conferirInicio?.(inicio)
              conferido = true
            }
          }
          // Escrita aguardada pedaço a pedaço: o disco dá o ritmo e a memória fica constante.
          await arquivo.write(value)
        }
        if (!conferido) opcoes.conferirInicio?.(inicio)
        await arquivo.close()
        await rename(parcial, destino)
        return { caminho: relativo, tamanhoBytes: total }
      } catch (erro) {
        await leitor.cancel().catch(() => undefined)
        await arquivo.close().catch(() => undefined)
        await rm(parcial, { force: true })
        throw erro
      }
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

// Gravação em stream, para vídeo e áudio de até centenas de megabytes (FT-08,
// PR-71): o corpo nunca é carregado inteiro em memória.
export interface Armazenamento {
  /**
   * Grava o corpo em `original.parcial` por stream, conta os bytes, aborta com
   * 413 acima de `maxBytes`, chama `conferirInicio` uma vez com os primeiros
   * `bytesDeInicio` (padrão 16; menos, se o stream acabar antes) e só então
   * renomeia para `original`. Em qualquer falha apaga o parcial e cancela a leitura.
   */
  gravarDeStream(
    agenteId: string,
    fonteId: string,
    corpo: ReadableStream<Uint8Array>,
    opcoes: { maxBytes: number; bytesDeInicio?: number; conferirInicio?: (primeirosBytes: Uint8Array) => void },
  ): Promise<{ caminho: string; tamanhoBytes: number }>
}
