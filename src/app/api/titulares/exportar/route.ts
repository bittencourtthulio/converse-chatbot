// POST /api/titulares/exportar: a exportação dos dados de um titular (FT-10, PR-90), só para
// admin. Handler fino: sessão no servidor, origem da plataforma, corpo em JSON ou formulário
// (o identificador vai no corpo, nunca na URL, que vai para o log de acesso) e a tradução de
// `exportarTitular`. O nome do arquivo nunca leva o identificador.
import { ErroDeAplicacao, entradaInvalida } from '@/lib/erros'
import { exportarTitular } from '@/servicos/titular'
import { erroEmJson, exigirSessao } from '../../conversas/resposta'
import { origemEDaPlataforma } from '../../publico/resposta'

export const dynamic = 'force-dynamic'

/** O corpo legítimo tem poucas dezenas de bytes. */
const TAMANHO_MAXIMO_DO_CORPO = 4 * 1024

async function lerCorpo(request: Request): Promise<Record<string, unknown>> {
  const declarado = Number(request.headers.get('content-length') ?? 0)
  if (declarado > TAMANHO_MAXIMO_DO_CORPO) throw new ErroDeAplicacao('Pedido grande demais.', 413, 'corpo_grande')
  const tipo = request.headers.get('content-type') ?? ''
  const texto = await request.text()
  if (texto.length > TAMANHO_MAXIMO_DO_CORPO) throw new ErroDeAplicacao('Pedido grande demais.', 413, 'corpo_grande')
  if (tipo.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(texto))
  }
  try {
    const corpo: unknown = JSON.parse(texto)
    if (typeof corpo === 'object' && corpo !== null && !Array.isArray(corpo)) return corpo as Record<string, unknown>
  } catch {
    // cai no erro abaixo
  }
  throw entradaInvalida('Envie o pedido em JSON ou como formulário.')
}

export async function POST(request: Request) {
  try {
    const usuario = await exigirSessao()
    // Um site de fora não pode pedir a exportação em nome do admin logado.
    const origem = request.headers.get('origin')
    if (origem !== null && !origemEDaPlataforma(origem, request)) {
      return Response.json(
        { codigo: 'origem_nao_permitida', mensagem: 'Esta origem não pode fazer este pedido.' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } },
      )
    }
    const corpo = await lerCorpo(request)
    const arquivo = await exportarTitular(usuario, {
      canal: corpo.canal,
      identificador: corpo.identificador,
      formato: corpo.formato,
    })
    return new Response(arquivo.conteudo, {
      headers: {
        'Content-Type': arquivo.tipo,
        'Content-Disposition': `attachment; filename="${arquivo.nomeDoArquivo.replace(/[^A-Za-z0-9._-]/g, '_')}"`,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (erro) {
    return erroEmJson(erro)
  }
}
