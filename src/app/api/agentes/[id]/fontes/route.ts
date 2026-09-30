// GET /api/agentes/[id]/fontes: a lista e o resumo da base, para o polling da
// tela. POST: envio de arquivos em multipart (vários por vez), com resposta por
// arquivo (PR-49). Handler fino: sessão, leitura do corpo e tradução do serviço.
import { ambiente } from '@/lib/ambiente'
import { LIMITES } from '@/lib/extracao/limites'
import { entradaInvalida } from '@/lib/erros'
import { adicionarArquivos, listar, resumo } from '@/servicos/fontes'
import { erroDeTamanho, erroDeTipo, erroEmJson, exigirSessao, passaDoTeto, semCache } from './resposta'

export const dynamic = 'force-dynamic'

type Contexto = { params: Promise<{ id: string }> }

export async function GET(_request: Request, contexto: Contexto) {
  try {
    const usuario = await exigirSessao()
    const { id } = await contexto.params
    const [fontes, resumoDaBase] = await Promise.all([listar(usuario, id), resumo(usuario, id)])
    return Response.json({ fontes, resumo: resumoDaBase }, { headers: semCache })
  } catch (erro) {
    return erroEmJson(erro)
  }
}

// O corpo inteiro cabe em `arquivosPorEnvio` arquivos do tamanho máximo, mais a folga do multipart.
const tetoDoCorpo = () => ambiente.maxUploadBytes * LIMITES.arquivosPorEnvio + 1024 * 1024

export async function POST(request: Request, contexto: Contexto) {
  try {
    const usuario = await exigirSessao()
    const { id } = await contexto.params
    if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('multipart/form-data')) {
      return erroDeTipo('multipart/form-data')
    }
    if (passaDoTeto(request, tetoDoCorpo())) return erroDeTamanho()

    const formulario = await request.formData().catch(() => {
      throw entradaInvalida('Não foi possível ler os arquivos enviados.')
    })
    const enviados = [...formulario.getAll('arquivos'), ...formulario.getAll('arquivo')].filter(
      (v): v is File => typeof v !== 'string',
    )
    // Content-Length pode faltar (transferência em pedaços): confere o tamanho real.
    if (enviados.reduce((soma, f) => soma + f.size, 0) > tetoDoCorpo()) return erroDeTamanho()

    const arquivos = await Promise.all(
      enviados.map(async (f) => ({ nome: f.name, bytes: new Uint8Array(await f.arrayBuffer()) })),
    )
    const resultados = await adicionarArquivos(usuario, id, arquivos)
    const algumAceito = resultados.some((r) => r.aceito)
    return Response.json({ resultados }, { status: algumAceito ? 202 : 422, headers: semCache })
  } catch (erro) {
    return erroEmJson(erro)
  }
}
