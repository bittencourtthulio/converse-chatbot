// Envio de um arquivo para a base (PR-49). Uma requisição por arquivo dá
// progresso e erro por arquivo sem protocolo novo. `fetch` não expõe o
// progresso do envio; por isso o XMLHttpRequest, que só o componente cliente
// chama. `interpretarRespostaDoEnvio` é pura e tem teste próprio.

export type ResultadoDoEnvio = { aceito: true } | { aceito: false; motivo: string }

export function interpretarRespostaDoEnvio(status: number, corpo: string): ResultadoDoEnvio {
  let json: unknown = null
  try {
    json = JSON.parse(corpo)
  } catch {
    json = null
  }
  const objeto = (json ?? {}) as { resultados?: Array<{ aceito?: boolean; motivo?: string }>; mensagem?: unknown }
  const primeiro = objeto.resultados?.[0]
  if (primeiro) {
    return primeiro.aceito
      ? { aceito: true }
      : { aceito: false, motivo: primeiro.motivo || 'O arquivo foi recusado.' }
  }
  if (status >= 200 && status < 300) return { aceito: true }
  const mensagem = typeof objeto.mensagem === 'string' && objeto.mensagem ? objeto.mensagem : null
  return { aceito: false, motivo: mensagem ?? `Não foi possível enviar o arquivo (erro ${status}).` }
}

/** Envia um arquivo em multipart e devolve o status e o corpo da resposta. */
export function enviarArquivo(
  agenteId: string,
  arquivo: File,
  aoProgredir: (percentual: number) => void,
): Promise<{ status: number; corpo: string }> {
  return new Promise((resolver, rejeitar) => {
    const pedido = new XMLHttpRequest()
    pedido.open('POST', `/api/agentes/${agenteId}/fontes`)
    pedido.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) aoProgredir((e.loaded / e.total) * 100)
    }
    pedido.onload = () => resolver({ status: pedido.status, corpo: pedido.responseText })
    pedido.onerror = () => rejeitar(new Error('rede'))
    pedido.onabort = () => rejeitar(new Error('cancelado'))
    const formulario = new FormData()
    formulario.append('arquivos', arquivo, arquivo.name)
    pedido.send(formulario)
  })
}
