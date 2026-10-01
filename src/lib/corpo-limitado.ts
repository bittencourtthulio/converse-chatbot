// Leitura de um corpo de requisição em stream com teto de bytes (FT-13, PR-45, PR-106). O upload de
// documentos não sabe o tamanho antes de ler quando o corpo vem em pedaços (`Transfer-Encoding: chunked`,
// sem `Content-Length`): `request.formData()` guardaria quanto o cliente mandasse. Aqui os bytes são contados
// à medida que chegam e a leitura é CANCELADA ao passar do teto, então a memória nunca passa do teto mais um
// pedaço. Sem `next/*`: é uma função sobre Web Streams.

export class CorpoGrandeDemais extends Error {
  constructor(public readonly teto: number) {
    super(`O corpo da requisição é maior que o limite de ${teto} bytes.`)
    this.name = 'CorpoGrandeDemais'
  }
}

/** Lê o corpo inteiro até `teto` bytes; acima disso cancela o stream e lança `CorpoGrandeDemais`. */
export async function lerCorpoLimitado(corpo: ReadableStream<Uint8Array> | null, teto: number): Promise<Uint8Array> {
  if (!corpo) return new Uint8Array(0)
  const leitor = corpo.getReader()
  const pedacos: Uint8Array[] = []
  let total = 0
  try {
    for (;;) {
      const { done, value } = await leitor.read()
      if (done) break
      total += value.length
      if (total > teto) {
        await leitor.cancel().catch(() => undefined)
        throw new CorpoGrandeDemais(teto)
      }
      pedacos.push(value)
    }
  } finally {
    leitor.releaseLock()
  }
  const saida = new Uint8Array(total)
  let posicao = 0
  for (const p of pedacos) {
    saida.set(p, posicao)
    posicao += p.length
  }
  return saida
}
