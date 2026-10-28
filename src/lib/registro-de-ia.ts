import { prisma } from '@/lib/prisma'
import { ErroDeAplicacao } from '@/lib/erros'
import { log } from '@/lib/log'

export interface ContextoDaChamada {
  funcao: string
  origem: string
}

type EstadoFinal = 'sucesso' | 'erro' | 'cancelada'
export interface RegistroDeChamada {
  receberDados: (dados: unknown) => void
  receberStatusHttp: (status: number) => void
  concluir: (status: EstadoFinal, erro?: unknown) => Promise<void>
}

const numeroValido = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0
const tokensValidos = (v: unknown): v is number => numeroValido(v) && Number.isSafeInteger(v) && v <= 2147483647

/** Uma linha por tentativa, criada antes da rede e concluída mesmo em cancelamento.
 * Só copia campos permitidos: nunca armazena conteúdo da requisição/resposta.
 * Falha do registro vai ao log operacional e não derruba uma chamada já paga.
 */
export async function iniciarRegistroDeIA(entrada: ContextoDaChamada & {
  caminho: string
  modelo?: string
  semCusto?: boolean
}): Promise<RegistroDeChamada> {
  const iniciadoEm = new Date()
  const inicio = performance.now()
  let id: string | undefined
  let finalizado = false
  const dados: {
    modelo?: string; geracaoId?: string; statusHttp?: number
    tokensEntrada?: number; tokensSaida?: number; tokensTotal?: number; custoUsd?: number
  } = entrada.semCusto ? { custoUsd: 0 } : {}
  try {
    const registro = await prisma.chamadaDeIA.create({ data: {
      iniciadoEm, funcao: entrada.funcao, origem: entrada.origem,
      caminho: entrada.caminho, modeloSolicitado: entrada.modelo, modelo: entrada.modelo,
      custoUsd: dados.custoUsd,
    }, select: { id: true } })
    id = registro.id
  } catch {
    log.erro('registro_de_ia_falhou', { etapa: 'inicio', funcao: entrada.funcao })
  }
  return {
    receberStatusHttp(status) { dados.statusHttp = status },
    receberDados(resposta) {
      if (!resposta || typeof resposta !== 'object') return
      const r = resposta as Record<string, unknown>
      if (typeof r.model === 'string') dados.modelo = r.model.slice(0, 256)
      if (typeof r.id === 'string') dados.geracaoId = r.id.slice(0, 256)
      if (!r.usage || typeof r.usage !== 'object') return
      const uso = r.usage as Record<string, unknown>
      if (tokensValidos(uso.prompt_tokens)) dados.tokensEntrada = uso.prompt_tokens
      if (tokensValidos(uso.completion_tokens)) dados.tokensSaida = uso.completion_tokens
      if (tokensValidos(uso.total_tokens)) dados.tokensTotal = uso.total_tokens
      else if (dados.tokensEntrada !== undefined && dados.tokensSaida !== undefined && tokensValidos(dados.tokensEntrada + dados.tokensSaida)) {
        dados.tokensTotal = dados.tokensEntrada + dados.tokensSaida
      }
      if (numeroValido(uso.cost)) dados.custoUsd = uso.cost
    },
    async concluir(status, erro) {
      if (finalizado) return
      finalizado = true
      if (!id) return
      try {
        await prisma.chamadaDeIA.update({ where: { id }, data: {
          ...dados, status, concluidoEm: new Date(), duracaoMs: Math.round(performance.now() - inicio),
          erroCodigo: erro instanceof ErroDeAplicacao ? erro.codigo : status === 'erro' ? 'erro_inesperado' : null,
        } })
      } catch {
        log.erro('registro_de_ia_falhou', { etapa: 'conclusao', funcao: entrada.funcao, chamadaId: id })
      }
    },
  }
}
