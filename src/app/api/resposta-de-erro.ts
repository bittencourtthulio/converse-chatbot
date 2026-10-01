// A resposta JSON de erro das rotas de API autenticadas (FT-11, PR-93). Erro de aplicação leva o
// status e a mensagem segura dele; qualquer outro vira 500 com a mensagem genérica e o "Código de
// referência", que é a correlação da requisição (a mesma do cabeçalho `X-Correlacao` e do log). A
// linha de log leva só o nome do erro: nunca a mensagem, a pilha nem o objeto. Não é uma rota.
import { correlacaoDaRequisicao } from '@/app/correlacao-servidor'
import { ErroDeAplicacao } from '@/lib/erros'
import { camposDoErro, log } from '@/lib/log'
import { mensagemParaOperador } from '@/servicos/chat-erros'

export async function respostaDeErro(erro: unknown, rota: string): Promise<Response> {
  const correlacao = await correlacaoDaRequisicao()
  const { codigo, mensagem } = mensagemParaOperador(erro, correlacao)
  if (!(erro instanceof ErroDeAplicacao)) {
    log.erro('erro_inesperado', { rota, correlacao, ...camposDoErro(erro) })
  }
  const status = erro instanceof ErroDeAplicacao ? erro.status : 500
  return Response.json({ codigo, mensagem }, { status, headers: { 'Cache-Control': 'no-store', 'X-Correlacao': correlacao } })
}
