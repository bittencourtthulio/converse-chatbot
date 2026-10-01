// POST /api/agentes/[id]/fontes/video?nome=<nome>: vídeo ou áudio para a base
// (FT-08, PR-71). O corpo é o arquivo bruto e vai para o disco em stream: nunca
// `request.formData()`, que carregaria tudo em memória. Handler fino: sessão,
// recusa cedo por `Content-Length` e a tradução do serviço.
import { ambiente } from '@/lib/ambiente'
import { adicionarVideo } from '@/servicos/fontes'
import { erroDeTamanho, erroEmJson, exigirSessao, passaDoTeto, semCache } from '../resposta'

export const dynamic = 'force-dynamic'

const TETO_DO_DRENO = 1024 * 1024

/**
 * Depois de uma recusa que não leu o corpo, lê e descarta até 1 MB dele para a
 * conexão keep-alive seguir limpa; corpo maior que isso é cancelado (a conexão
 * cai, que é o certo para um envio que já foi recusado).
 */
async function drenar(corpo: ReadableStream<Uint8Array> | null): Promise<void> {
  if (!corpo || corpo.locked) return
  const leitor = corpo.getReader()
  try {
    let lidos = 0
    while (lidos < TETO_DO_DRENO) {
      const { done, value } = await leitor.read()
      if (done) return
      lidos += value.length
    }
  } catch {
    // corpo já interrompido: nada a drenar
  } finally {
    await leitor.cancel().catch(() => undefined)
  }
}

export async function POST(request: Request, contexto: { params: Promise<{ id: string }> }) {
  try {
    const usuario = await exigirSessao()
    const { id } = await contexto.params
    // Recusa antes de ler um byte do corpo.
    if (passaDoTeto(request, ambiente.maxVideoBytes)) return erroDeTamanho()
    const declarado = Number(request.headers.get('content-length'))
    const fonte = await adicionarVideo(usuario, id, {
      nome: new URL(request.url).searchParams.get('nome') ?? undefined,
      corpo: request.body,
      tamanhoDeclarado: Number.isFinite(declarado) && declarado > 0 ? declarado : null,
    })
    return Response.json({ fonte }, { status: 202, headers: semCache })
  } catch (erro) {
    await drenar(request.body)
    return erroEmJson(erro)
  }
}
