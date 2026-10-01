// Configuração de privacidade do workspace (FT-10, PR-18, PR-89, PR-91): por quantos dias as
// conversas ficam guardadas e o aviso de privacidade padrão. Só o admin lê e altera (PR-12);
// as leituras que o expurgo e os canais precisam (`retencaoEfetivaDias`,
// `avisoPadraoDoWorkspace`) não exigem sessão, porque não devolvem nada além do que já é
// público ou do próprio funcionamento.
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { entradaInvalida } from '@/lib/erros'
import { exigirAdmin, type UsuarioAutenticado } from '@/servicos/autenticacao'
import { registrarMelhorEsforco } from '@/servicos/auditoria'

const ID_DA_CONFIGURACAO = 'unica'

// Os mesmos limites do aviso por agente (`chat-publico-config.ts`); repetidos aqui para este
// módulo não importar aquele, que passa a ler o aviso padrão (evita ciclo de importação).
export const LIMITE_DO_AVISO = 300
export const LIMITE_DA_URL_DO_AVISO = 500

export const RETENCAO_PADRAO_DIAS = 90
export const RETENCAO_MINIMA_DIAS = 7
export const RETENCAO_MAXIMA_DIAS = 3650

export interface ConfiguracaoDePrivacidade {
  /** Dias de guarda das conversas; `null` é "sem expurgo automático". */
  retencaoDias: number | null
  avisoPadrao: string
  avisoPadraoUrl: string
}

export interface AvisoPadrao {
  texto: string
  url: string | null
}

const MENSAGEM_DOS_DIAS = `A retenção precisa ser um número inteiro de ${RETENCAO_MINIMA_DIAS} a ${RETENCAO_MAXIMA_DIAS} dias.`

const booleano = z.preprocess((v) => {
  if (v === 'on' || v === 'true' || v === '1') return true
  if (v === 'false' || v === '0' || v === '' || v === undefined || v === null) return false
  return v
}, z.boolean({ message: 'Confirmação inválida.' }))

const entradaDaRetencao = z.discriminatedUnion(
  'modo',
  [
    z.object({
      modo: z.literal('dias'),
      dias: z.preprocess(
        (v) => (typeof v === 'string' ? (/^\d+$/.test(v.trim()) ? Number(v.trim()) : Number.NaN) : v),
        z
          .number({ message: MENSAGEM_DOS_DIAS })
          .int(MENSAGEM_DOS_DIAS)
          .min(RETENCAO_MINIMA_DIAS, MENSAGEM_DOS_DIAS)
          .max(RETENCAO_MAXIMA_DIAS, MENSAGEM_DOS_DIAS),
      ),
    }),
    z.object({ modo: z.literal('sem_expurgo'), confirmarRisco: booleano }),
  ],
  { message: 'Escolha a retenção em dias ou sem expurgo automático.' },
)

const MENSAGEM_DO_LINK = 'O link do aviso precisa ser um endereço http ou https.'

const entradaDoAviso = z.object({
  texto: z
    .string({ message: 'O aviso de privacidade precisa ser um texto.' })
    .trim()
    .max(LIMITE_DO_AVISO, `O aviso de privacidade pode ter até ${LIMITE_DO_AVISO} caracteres.`),
  url: z
    .string({ message: MENSAGEM_DO_LINK })
    .trim()
    .max(LIMITE_DA_URL_DO_AVISO, `O link do aviso pode ter até ${LIMITE_DA_URL_DO_AVISO} caracteres.`)
    .refine((v) => {
      if (v === '') return true
      try {
        const u = new URL(v)
        return u.protocol === 'http:' || u.protocol === 'https:'
      } catch {
        return false
      }
    }, MENSAGEM_DO_LINK),
})

async function lerLinha() {
  return prisma.configuracaoDoWorkspace.findUnique({
    where: { id: ID_DA_CONFIGURACAO },
    select: {
      retencaoDiasConversas: true,
      avisoDePrivacidadePadrao: true,
      avisoDePrivacidadePadraoUrl: true,
    },
  })
}

function paraConfiguracao(linha: Awaited<ReturnType<typeof lerLinha>>): ConfiguracaoDePrivacidade {
  // Sem linha, valem os padrões (90 dias, sem aviso); com linha, `null` é "sem expurgo".
  return {
    retencaoDias: linha ? linha.retencaoDiasConversas : RETENCAO_PADRAO_DIAS,
    avisoPadrao: linha?.avisoDePrivacidadePadrao ?? '',
    avisoPadraoUrl: linha?.avisoDePrivacidadePadraoUrl ?? '',
  }
}

/** A configuração para a tela de Privacidade. Só admin. */
export async function obterConfiguracaoDePrivacidade(autor: UsuarioAutenticado): Promise<ConfiguracaoDePrivacidade> {
  exigirAdmin(autor)
  return paraConfiguracao(await lerLinha())
}

/** A retenção que o expurgo aplica: 90 sem configuração, o valor salvo, ou `null` (sem expurgo). */
export async function retencaoEfetivaDias(): Promise<number | null> {
  return paraConfiguracao(await lerLinha()).retencaoDias
}

/** O aviso padrão do workspace para os canais, ou `null` se não há texto. */
export async function avisoPadraoDoWorkspace(): Promise<AvisoPadrao | null> {
  const c = paraConfiguracao(await lerLinha())
  if (c.avisoPadrao === '') return null
  return { texto: c.avisoPadrao, url: c.avisoPadraoUrl === '' ? null : c.avisoPadraoUrl }
}

/**
 * Salva a retenção das conversas (só admin). "Sem expurgo automático" é escolha explícita e
 * exige a confirmação do risco. Grava `retencao_alterada` quando o valor muda.
 */
export async function salvarRetencao(autor: UsuarioAutenticado, entrada: unknown): Promise<ConfiguracaoDePrivacidade> {
  exigirAdmin(autor)
  const dados = entradaDaRetencao.safeParse(entrada)
  if (!dados.success) throw entradaInvalida(dados.error.issues[0]?.message ?? 'Entrada inválida.')
  if (dados.data.modo === 'sem_expurgo' && !dados.data.confirmarRisco) {
    throw entradaInvalida(
      'Sem expurgo automático, as conversas ficam guardadas para sempre. Confirme que você entende esse risco para continuar.',
    )
  }
  const novo = dados.data.modo === 'dias' ? dados.data.dias : null
  const anterior = paraConfiguracao(await lerLinha()).retencaoDias
  await prisma.configuracaoDoWorkspace.upsert({
    where: { id: ID_DA_CONFIGURACAO },
    create: { id: ID_DA_CONFIGURACAO, retencaoDiasConversas: novo, atualizadoPor: autor.id },
    update: { retencaoDiasConversas: novo, atualizadoPor: autor.id },
  })
  if (anterior !== novo) {
    void registrarMelhorEsforco({
      ator: autor,
      acao: 'retencao_alterada',
      alvoTipo: 'configuracao',
      alvoId: ID_DA_CONFIGURACAO,
      detalhes: { diasAnterior: anterior, diasNovo: novo },
    })
  }
  return paraConfiguracao(await lerLinha())
}

/** Salva o aviso de privacidade padrão (só admin). Texto vazio o remove; o link exige texto. */
export async function salvarAvisoPadrao(autor: UsuarioAutenticado, entrada: unknown): Promise<ConfiguracaoDePrivacidade> {
  exigirAdmin(autor)
  const dados = entradaDoAviso.safeParse(entrada)
  if (!dados.success) throw entradaInvalida(dados.error.issues[0]?.message ?? 'Entrada inválida.')
  const { texto, url } = dados.data
  if (url !== '' && texto === '') throw entradaInvalida('Escreva o aviso de privacidade para usar o link.')
  await prisma.configuracaoDoWorkspace.upsert({
    where: { id: ID_DA_CONFIGURACAO },
    create: { id: ID_DA_CONFIGURACAO, avisoDePrivacidadePadrao: texto, avisoDePrivacidadePadraoUrl: url, atualizadoPor: autor.id },
    update: { avisoDePrivacidadePadrao: texto, avisoDePrivacidadePadraoUrl: url, atualizadoPor: autor.id },
  })
  return paraConfiguracao(await lerLinha())
}
