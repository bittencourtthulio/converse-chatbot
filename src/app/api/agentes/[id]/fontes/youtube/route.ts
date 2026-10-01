// POST /api/agentes/[id]/fontes/youtube: link do YouTube como fonte (FT-08,
// PR-75, PR-76). Corpo `{ url }` em JSON; a URL só vale se o host for do
// YouTube. A fonte nasce `pendente` e a fila lê as legendas. Handler fino.
import { entradaInvalida } from '@/lib/erros'
import { adicionarYoutube } from '@/servicos/fontes'
import { erroDeTamanho, erroDeTipo, erroEmJson, exigirSessao, passaDoTeto, semCache } from '../resposta'

export const dynamic = 'force-dynamic'

// A URL tem até 300 caracteres; 8 KB sobram para o JSON e o que mais vier junto.
const TETO_DO_CORPO = 8 * 1024

export async function POST(request: Request, contexto: { params: Promise<{ id: string }> }) {
  try {
    const usuario = await exigirSessao()
    const { id } = await contexto.params
    if (!(request.headers.get('content-type') ?? '').toLowerCase().includes('application/json')) {
      return erroDeTipo('application/json')
    }
    if (passaDoTeto(request, TETO_DO_CORPO)) return erroDeTamanho()
    // Sem Content-Length confiável, o tamanho real é conferido depois da leitura.
    const bruto = await request.text()
    if (Buffer.byteLength(bruto) > TETO_DO_CORPO) return erroDeTamanho()
    let corpo: unknown = null
    try {
      corpo = JSON.parse(bruto)
    } catch {
      corpo = null
    }
    if (typeof corpo !== 'object' || corpo === null) throw entradaInvalida('Envie o link do vídeo em JSON.')
    const fonte = await adicionarYoutube(usuario, id, corpo)
    return Response.json({ fonte }, { status: 202, headers: semCache })
  } catch (erro) {
    return erroEmJson(erro)
  }
}
