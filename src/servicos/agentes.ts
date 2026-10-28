// Agentes (PR-01, PR-40): instruções, modelo do OpenRouter, temperatura e
// mensagem inicial. Qualquer usuário autenticado lista, cria, edita e exclui
// qualquer agente (PR-12); a verificação de sessão é da camada de apresentação
// (`exigirUsuario`), e o serviço exige um autor para registrar o dono.
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ambiente } from '@/lib/ambiente'
import { criarArmazenamento } from '@/lib/armazenamento'
import { entradaInvalida, naoAutenticado, naoEncontrado } from '@/lib/erros'
import { listarModelos } from '@/lib/openrouter'
import { obterChaveDoOpenrouter } from '@/servicos/integracoes'
import type { UsuarioAutenticado } from '@/servicos/autenticacao'
import { registrar } from '@/servicos/auditoria'
import { log } from '@/lib/log'

export const MODELO_PADRAO = 'openai/gpt-4o-mini'
export const TEMPERATURA_PADRAO = 0.7
export const LIMITE_DE_NOME = 80
export const LIMITE_DE_INSTRUCOES = 8000
export const LIMITE_DE_MENSAGEM_INICIAL = 500
const LIMITE_DE_MODELO = 200

const nome = z
  .string({ message: 'Informe o nome do agente.' })
  .trim()
  .min(1, 'Informe o nome do agente.')
  .max(LIMITE_DE_NOME, `O nome pode ter até ${LIMITE_DE_NOME} caracteres.`)

const instrucoes = z
  .string({ message: 'As instruções precisam ser um texto.' })
  .max(LIMITE_DE_INSTRUCOES, `As instruções podem ter até ${LIMITE_DE_INSTRUCOES} caracteres.`)

const modelo = z
  .string({ message: 'Informe o modelo do agente.' })
  .trim()
  .min(1, 'Informe o modelo do agente.')
  .max(LIMITE_DE_MODELO, `O modelo pode ter até ${LIMITE_DE_MODELO} caracteres.`)

// O formulário manda texto, e o brasileiro digita "0,7".
const temperatura = z.preprocess(
  (v) => {
    if (typeof v !== 'string') return v
    return v.trim() === '' ? undefined : Number(v.trim().replace(',', '.'))
  },
  z
    .number({ message: 'A temperatura precisa ser um número entre 0 e 2.' })
    .min(0, 'A temperatura precisa estar entre 0 e 2.')
    .max(2, 'A temperatura precisa estar entre 0 e 2.'),
)

const mensagemInicial = z
  .string({ message: 'A mensagem inicial precisa ser um texto.' })
  .max(
    LIMITE_DE_MENSAGEM_INICIAL,
    `A mensagem inicial pode ter até ${LIMITE_DE_MENSAGEM_INICIAL} caracteres.`,
  )

const entradaDeCriacao = z.object({
  nome,
  modelo,
  instrucoes: instrucoes.optional(),
  temperatura: temperatura.optional(),
  mensagemInicial: mensagemInicial.optional(),
})

const entradaDeEdicao = z.object({
  nome: nome.optional(),
  modelo: modelo.optional(),
  instrucoes: instrucoes.optional(),
  temperatura: temperatura.optional(),
  mensagemInicial: mensagemInicial.optional(),
})

export interface AgenteVisivel {
  id: string
  nome: string
  instrucoes: string
  modelo: string
  temperatura: number
  mensagemInicial: string
  criadoPorId: string
  criadoEm: Date
  atualizadoEm: Date
}

function exigirAutor(autor: UsuarioAutenticado | null | undefined): asserts autor {
  if (!autor?.id) throw naoAutenticado()
}

function validar<T>(esquema: z.ZodType<T>, entrada: unknown): T {
  const dados = esquema.safeParse(entrada)
  if (!dados.success) {
    throw entradaInvalida(dados.error.issues[0]?.message ?? 'Entrada inválida.')
  }
  return dados.data
}

export async function listar(autor: UsuarioAutenticado): Promise<AgenteVisivel[]> {
  exigirAutor(autor)
  return prisma.agente.findMany({ orderBy: { criadoEm: 'desc' } })
}

export async function obter(autor: UsuarioAutenticado, id: string): Promise<AgenteVisivel> {
  exigirAutor(autor)
  const agente = await prisma.agente.findUnique({ where: { id } })
  if (!agente) throw naoEncontrado('Agente não encontrado.')
  return agente
}

export async function criar(
  autor: UsuarioAutenticado,
  entrada: unknown,
): Promise<AgenteVisivel> {
  exigirAutor(autor)
  const dados = validar(entradaDeCriacao, entrada)
  return prisma.agente.create({
    data: {
      nome: dados.nome,
      modelo: dados.modelo,
      instrucoes: dados.instrucoes ?? '',
      temperatura: dados.temperatura ?? TEMPERATURA_PADRAO,
      mensagemInicial: dados.mensagemInicial ?? '',
      criadoPorId: autor.id,
    },
  })
}

export async function editar(
  autor: UsuarioAutenticado,
  id: string,
  entrada: unknown,
): Promise<AgenteVisivel> {
  exigirAutor(autor)
  const dados = validar(entradaDeEdicao, entrada)
  if (!(await prisma.agente.findUnique({ where: { id }, select: { id: true } }))) {
    throw naoEncontrado('Agente não encontrado.')
  }
  return prisma.agente.update({
    where: { id },
    data: {
      ...(dados.nome !== undefined && { nome: dados.nome }),
      ...(dados.modelo !== undefined && { modelo: dados.modelo }),
      ...(dados.instrucoes !== undefined && { instrucoes: dados.instrucoes }),
      ...(dados.temperatura !== undefined && { temperatura: dados.temperatura }),
      ...(dados.mensagemInicial !== undefined && { mensagemInicial: dados.mensagemInicial }),
    },
  })
}

/** Exclusão definitiva (PR-40). A confirmação é da tela. */
export async function excluir(autor: UsuarioAutenticado, id: string): Promise<void> {
  exigirAutor(autor)
  // A auditoria entra na mesma transação (PR-87): sem registro, o agente não é excluído. O
  // nome e as contagens são lidos antes, porque depois da exclusão já não existem.
  await prisma.$transaction(async (tx) => {
    const agente = await tx.agente.findUnique({
      where: { id },
      select: { nome: true, _count: { select: { conversas: true, fontes: true } } },
    })
    if (!agente) throw naoEncontrado('Agente não encontrado.')
    await tx.agente.delete({ where: { id } })
    await registrar(
      {
        ator: autor,
        acao: 'agente_excluido',
        alvoTipo: 'agente',
        alvoId: id,
        detalhes: { nome: agente.nome.slice(0, 100), conversas: agente._count.conversas, fontes: agente._count.fontes },
      },
      tx,
    )
  })
  // As fontes saem em cascata; os arquivos delas, daqui (PR-47). Falha ao
  // apagar o diretório vai para o log e não desfaz a exclusão no banco.
  try {
    await criarArmazenamento(ambiente.storageDir).apagarAgente(id)
  } catch {
    log.erro('armazenamento_falhou', { agenteId: id })
  }
}

export interface ModelosParaOSeletor {
  modelos: Array<{ id: string; nome: string }>
  /** Há chave do OpenRouter legível para as conversas do agente. */
  temChave: boolean
  /** A lista veio da reserva embutida porque o OpenRouter não respondeu. */
  reserva: boolean
}

/**
 * Catálogo público de modelos de texto para criar e editar agentes. Só id e
 * nome saem daqui; a consulta independe da chave usada nas conversas.
 */
export async function modelosParaOSeletor(
  autor: UsuarioAutenticado,
): Promise<ModelosParaOSeletor> {
  exigirAutor(autor)
  let chave: string | null = null
  try {
    chave = await obterChaveDoOpenrouter()
  } catch {
    chave = null
  }
  const lista = await listarModelos()
  return {
    modelos: lista.modelos.map(({ id, nome }) => ({ id, nome })),
    temChave: Boolean(chave),
    reserva: lista.reserva,
  }
}
