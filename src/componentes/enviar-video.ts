// Envio de um vídeo ou áudio para a base (FT-08, PR-71, PR-76): o arquivo vai
// como corpo bruto, sem multipart, para o servidor gravá-lo em disco por stream.
// `fetch` não expõe o progresso do envio; por isso o XMLHttpRequest, que só o
// componente cliente chama. A interpretação da resposta é pura e fica em
// `video-logica.ts`.

export interface EnvioDeVideo {
  resposta: Promise<{ status: number; corpo: string }>
  cancelar: () => void
}

export function enviarVideo(agenteId: string, arquivo: File, aoProgredir: (percentual: number) => void): EnvioDeVideo {
  const pedido = new XMLHttpRequest()
  const resposta = new Promise<{ status: number; corpo: string }>((resolver, rejeitar) => {
    pedido.open('POST', `/api/agentes/${agenteId}/fontes/video?nome=${encodeURIComponent(arquivo.name)}`)
    pedido.setRequestHeader('Content-Type', 'application/octet-stream')
    pedido.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) aoProgredir((e.loaded / e.total) * 100)
    }
    pedido.onload = () => resolver({ status: pedido.status, corpo: pedido.responseText })
    pedido.onerror = () => rejeitar(new Error('rede'))
    pedido.onabort = () => rejeitar(new Error('cancelado'))
    pedido.send(arquivo)
  })
  return { resposta, cancelar: () => pedido.abort() }
}
