// Trabalhador da extração isolada (FT-13, PR-107): roda como PROCESSO próprio, iniciado por `isolada.ts` com
// `node --import tsx src/lib/extracao/trabalhador.ts <formato>`. Lê os bytes do arquivo da entrada padrão,
// extrai o texto pela mesma fachada do servidor (`extrairTexto`, que confere o conteúdo, abre o PDF, confere o
// limite de 500 páginas e só então extrai) e escreve UMA linha JSON na saída padrão: `{ ok: true, texto }` ou
// `{ ok: false, codigo, mensagem, status }`. O servidor o encerra com SIGKILL se passar do prazo, então um
// extrator que consome CPU nunca segura o servidor. Só importações relativas: nada de `@/`, `next/*` nem
// serviços; um erro que não seja nosso sai como `extracao_falhou`, sem o texto da biblioteca.
import { ErroDeAplicacao } from '../erros'
import { extrairTexto } from './index'
import { FORMATOS, type Formato } from './formatos'

async function lerEntrada(): Promise<Buffer> {
  const pedacos: Buffer[] = []
  for await (const pedaco of process.stdin) pedacos.push(pedaco as Buffer)
  return Buffer.concat(pedacos)
}

function responder(corpo: unknown): void {
  process.stdout.write(`${JSON.stringify(corpo)}\n`, () => process.exit(0))
}

async function principal(): Promise<void> {
  const formato = process.argv[2] as Formato
  if (!(formato in FORMATOS)) {
    responder({ ok: false, codigo: 'extracao_falhou', mensagem: 'Não foi possível extrair o texto deste arquivo.', status: 422 })
    return
  }
  try {
    const bytes = await lerEntrada()
    const texto = await extrairTexto({ formato, bytes })
    responder({ ok: true, texto })
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao) {
      responder({ ok: false, codigo: erro.codigo, mensagem: erro.message, status: erro.status })
    } else {
      responder({ ok: false, codigo: 'extracao_falhou', mensagem: 'Não foi possível extrair o texto deste arquivo.', status: 422 })
    }
  }
}

void principal()
