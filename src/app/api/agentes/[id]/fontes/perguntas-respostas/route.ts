// POST /api/agentes/[id]/fontes/perguntas-respostas: par de pergunta e resposta.
import { entradaInvalida } from '@/lib/erros'
import { adicionarPerguntaResposta } from '@/servicos/fontes'
import { erroDeTamanho, erroDeTipo, erroEmJson, exigirSessao, passaDoTeto, semCache } from '../resposta'

export const dynamic = 'force-dynamic'

// 200.000 caracteres chegam a 800 KB em UTF-8 (4 bytes por caractere, no pior caso); 1 MB de folga.
const TETO_DO_CORPO = 1024 * 1024 + 800_000

export async function POST(request: Request, contexto: { params: Promise<{ id: string }> }) {
  try {
    const usuario = await exigirSessao()
    const { id } = await contexto.params
    if (!(request.headers.get('content-type') ?? '').toLowerCase().includes('application/json')) {
      return erroDeTipo('application/json')
    }
    if (passaDoTeto(request, TETO_DO_CORPO)) return erroDeTamanho()
    const corpo: unknown = await request.json().catch(() => null)
    if (typeof corpo !== 'object' || corpo === null) throw entradaInvalida('Envie a pergunta e a resposta em JSON.')
    const fonte = await adicionarPerguntaResposta(usuario, id, corpo)
    return Response.json({ fonte }, { status: 202, headers: semCache })
  } catch (erro) {
    return erroEmJson(erro)
  }
}
