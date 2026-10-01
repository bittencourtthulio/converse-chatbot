// Extração em processo filho encerrável (FT-13, PR-45, PR-107). `extrairTexto` corre contra um temporizador
// com `Promise.race`, que não interrompe um extrator que consome CPU: o laço de eventos nem chega a disparar o
// prazo e o trabalho segue depois da recusa. Aqui o PDF, o DOCX e o HTML (os formatos pesados) rodam num
// processo próprio (`trabalhador.ts`), que recebe os bytes pela entrada padrão e é morto com SIGKILL ao passar
// do prazo; a memória dele é limitada. O limite de 500 páginas é conferido pelo filho ao abrir o PDF, antes de
// extrair o texto. Sem `next/*`. Se o filho não puder ser iniciado a fonte falha com `extracao_falhou`: não há
// volta silenciosa para o processo do servidor (PR-107).
import { spawn } from 'node:child_process'
import path from 'node:path'
import { ErroDeAplicacao } from '../erros'
import type { Formato } from './formatos'
import { LIMITES } from './limites'
import { extrairTexto, type EntradaDeExtracao } from './index'

/** Liga e desliga o isolamento na fila. Fica `true`; vira `false` só se o filho se mostrar inviável (PEND-27). */
export const EXTRACAO_ISOLADA_ATIVA = true

/** Os formatos que a fila extrai em processo filho; o resto (texto, CSV, JSON, legendas) é leve. */
export const FORMATOS_ISOLADOS: ReadonlySet<Formato> = new Set<Formato>(['pdf', 'docx', 'html'])

/** Teto da saída do filho: o texto extraído chega a 5 milhões de caracteres (até 4 bytes cada, com o JSON). */
const TETO_DA_SAIDA_BYTES = 32 * 1024 * 1024
const MEMORIA_DO_FILHO_MB = 1024

export interface ComandoDoTrabalhador {
  executavel: string
  args: string[]
}

export interface OpcoesDeIsolamento {
  /** Padrão: `LIMITES.prazoDaExtracaoMs` (120 s). */
  prazoMs?: number
  /** Só para teste: troca o processo (por exemplo, um trabalhador que trava). */
  comando?: (formato: Formato) => ComandoDoTrabalhador
}

const erroFalhou = () => new ErroDeAplicacao('Não foi possível extrair o texto deste arquivo.', 422, 'extracao_falhou')
const erroDemorou = () =>
  new ErroDeAplicacao('A leitura do arquivo demorou demais e foi interrompida.', 422, 'extracao_demorou')

function comandoPadrao(formato: Formato): ComandoDoTrabalhador {
  // O caminho é de tempo de execução, não de build: o Turbopack não deve incluir o projeto no pacote.
  const trabalhador = path.join(/*turbopackIgnore: true*/ process.cwd(), 'src', 'lib', 'extracao', 'trabalhador.ts')
  return { executavel: process.execPath, args: [`--max-old-space-size=${MEMORIA_DO_FILHO_MB}`, '--import', 'tsx', trabalhador, formato] }
}

/** Extrai o texto num processo filho; ao passar do prazo o filho é morto e a extração falha com clareza. */
export function extrairTextoIsolado(entrada: EntradaDeExtracao, opcoes: OpcoesDeIsolamento = {}): Promise<string> {
  const prazo = opcoes.prazoMs ?? LIMITES.prazoDaExtracaoMs
  const { executavel, args } = (opcoes.comando ?? comandoPadrao)(entrada.formato)
  return new Promise<string>((resolver, rejeitar) => {
    let terminou = false
    const concluir = (acao: () => void) => {
      if (terminou) return
      terminou = true
      clearTimeout(relogio)
      acao()
    }
    const filho = spawn(executavel, args, {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'ignore'],
      shell: false,
    })
    const saida: Buffer[] = []
    let tamanho = 0
    const relogio = setTimeout(() => {
      filho.kill('SIGKILL')
      concluir(() => rejeitar(erroDemorou()))
    }, prazo)
    filho.stdout.on('data', (parte: Buffer) => {
      tamanho += parte.length
      if (tamanho > TETO_DA_SAIDA_BYTES) {
        filho.kill('SIGKILL')
        concluir(() => rejeitar(erroFalhou()))
        return
      }
      saida.push(parte)
    })
    filho.on('error', () => concluir(() => rejeitar(erroFalhou())))
    filho.stdin.on('error', () => undefined) // o filho pode sair antes de ler tudo (EPIPE): o código de saída decide
    filho.on('close', () => {
      concluir(() => {
        try {
          const linhas = Buffer.concat(saida).toString('utf8').trim().split('\n')
          const resposta = JSON.parse(linhas[linhas.length - 1] ?? '') as
            | { ok: true; texto: string }
            | { ok: false; codigo: string; mensagem: string; status: number }
          if (resposta.ok) resolver(resposta.texto)
          else rejeitar(new ErroDeAplicacao(resposta.mensagem, resposta.status, resposta.codigo))
        } catch {
          rejeitar(erroFalhou())
        }
      })
    })
    filho.stdin.end(Buffer.from(entrada.bytes))
  })
}

/**
 * O extrator padrão da fila: os formatos pesados no processo filho, o resto no próprio servidor. Com o
 * isolamento desligado (`EXTRACAO_ISOLADA_ATIVA`) tudo volta a `extrairTexto`.
 */
export function extrairParaFila(
  entrada: EntradaDeExtracao,
  isolado: typeof extrairTextoIsolado = extrairTextoIsolado,
): Promise<string> {
  if (EXTRACAO_ISOLADA_ATIVA && FORMATOS_ISOLADOS.has(entrada.formato)) return isolado(entrada)
  return extrairTexto(entrada)
}
