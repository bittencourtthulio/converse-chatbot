// Agentes (PR-01, PR-40): instruções, modelo do OpenRouter, temperatura e
// mensagem inicial. Qualquer usuário autenticado lista, cria, edita e exclui
// qualquer agente (PR-12); a verificação de sessão é da camada de apresentação
// (`exigirUsuario`), e o serviço exige um autor para registrar o dono.
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { entradaInvalida, naoAutenticado, naoEncontrado } from '@/lib/erros'
import type { UsuarioAutenticado } from '@/servicos/autenticacao'

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
