/**
 * Cliente de teste que envia um corpo em `Transfer-Encoding: chunked`, SEM Content-Length (FT-13, PR-45,
 * PR-106): o caso em que o servidor não sabe o tamanho antes de ler. Respeita a contrapressão do socket e
 * PARA de enviar assim que o servidor responde ou fecha a conexão; devolve o status, o corpo da resposta e
 * quantos bytes conseguiu entregar ao socket, que é a medida de "o servidor parou de ler".
 */
import http from 'node:http'

export interface OpcoesDoEnvioChunked {
  url: string
  /** Total que o cliente se dispõe a enviar. */
  totalBytes: number
  tamanhoDoPedaco?: number
  tipo?: string
  headers?: Record<string, string>
  metodo?: string
}

export interface ResultadoDoEnvioChunked {
  status: number | null
  corpo: string
  bytesEnviados: number
}

export function enviarChunked(o: OpcoesDoEnvioChunked): Promise<ResultadoDoEnvioChunked> {
  const pedaco = Buffer.alloc(o.tamanhoDoPedaco ?? 64 * 1024, 'x')
  return new Promise((resolver) => {
    let enviados = 0
    let status: number | null = null
    let corpo = ''
    let fim = false
    const concluir = () => {
      if (fim) return
      fim = true
      resolver({ status, corpo, bytesEnviados: enviados })
    }
    const req = http.request(
      o.url,
      { method: o.metodo ?? 'POST', headers: { 'transfer-encoding': 'chunked', ...(o.tipo && { 'content-type': o.tipo }), ...o.headers } },
      (res) => {
        status = res.statusCode ?? null
        res.on('data', (p: Buffer) => void (corpo += p.toString('utf8')))
        res.on('end', concluir)
        res.on('close', concluir)
      },
    )
    req.on('error', concluir)
    req.on('close', concluir)
    const escrever = () => {
      while (!fim && status === null && enviados < o.totalBytes) {
        const resto = o.totalBytes - enviados
        const parte = resto >= pedaco.length ? pedaco : pedaco.subarray(0, resto)
        enviados += parte.length
        if (!req.write(parte)) {
          req.once('drain', escrever)
          return
        }
      }
      if (!fim && status === null) req.end()
    }
    escrever()
  })
}
